const prayerNames = ["Subuh", "Dhuhr", "Asr", "Maghrib", "Isha"]; // names shown to the user

// The API calls Subuh "Fajr", so we convert our display name to the API key.
function getTime(name) {
  const apiKey = (name === "Subuh") ? "Fajr" : name;
  return prayerTimes[apiKey];
}

let prayerTimes = {};        
let latestSuggestion = "";   

//navigation

const navButtons = document.querySelectorAll(".nav-button");
navButtons.forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".page").forEach(page => page.classList.add("hidden"));
    document.getElementById(button.dataset.page).classList.remove("hidden");

    navButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
  });
});

// retrieve prayer time

document.getElementById("searchPrayerBtn").addEventListener("click", getPrayerTimes);

async function getPrayerTimes() {
  const city = document.getElementById("cityInput").value.trim();
  const country = document.getElementById("countryInput").value.trim();
  const message = document.getElementById("apiMessage");
  const list = document.getElementById("prayerList");

  if (city === "" || country === "") {
    message.textContent = "Please enter city and country.";
    return; 
  }

  message.textContent = "Loading prayer times...";
  list.innerHTML = "";

  try {
    //prayer time API and display
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=17`;
    const response = await fetch(url); // send the request

    if (!response.ok) {
      throw new Error("The API request was unsuccessful.");
    }

    const result = await response.json(); // convert 

    if (result.code !== 200 || !result.data) {
      throw new Error("No prayer time data was returned.");
    }

    prayerTimes = result.data.timings; 

    const hijri = result.data.date.hijri;
    document.getElementById("hijriDate").textContent =
      `Hijri date: ${hijri.day} ${hijri.month.en} ${hijri.year}H`;

    prayerNames.forEach(name => {
      const card = document.createElement("div");
      card.className = "prayer-card";
      card.innerHTML = `<strong>${name}</strong><span>${getTime(name)}</span>`;
      list.appendChild(card);
    });

    message.textContent = `Prayer times loaded for ${city}, ${country}.`;
    updateNextPrayer();
  } catch (error) {
    //if error accured
    message.textContent = "Unable to retrieve prayer times. Check your internet connection or city name.";
    document.getElementById("hijriDate").textContent = "";
    document.getElementById("nextPrayer").textContent = "Prayer times are unavailable.";
    document.getElementById("countdown").textContent = "Remaining time: --:--:--";
    document.getElementById("suggestion").textContent = "No suggestion is available.";
    console.error(error);
  }
}

// calculation for between prayer time

function getPrayerDate(timeText) {
  const cleanTime = timeText.split(" ")[0]; 
  const parts = cleanTime.split(":");
  const date = new Date();
  date.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
  return date;
}

function updateNextPrayer() {
  if (Object.keys(prayerTimes).length === 0) return;

  for (const name of prayerNames) {
    const t = getTime(name);
    if (!t || !/^\d{2}:\d{2}/.test(t)) {
      document.getElementById("countdown").textContent =
        "Remaining time: unavailable (invalid prayer time).";
      return; 
    }
  }

  const now = new Date();
  let next = null;

  // Find the first prayer of the day
  for (const name of prayerNames) {
    const prayerDate = getPrayerDate(getTime(name));
    if (prayerDate > now) {
      next = { name: name, date: prayerDate };
      break;
    }
  }

  //first prayer for next day if the user ask it for after isyak
  if (next === null) {
    const fajrTomorrow = getPrayerDate(prayerTimes.Fajr);
    fajrTomorrow.setDate(fajrTomorrow.getDate() + 1);
    next = { name: "Subuh", date: fajrTomorrow };
  }

  // Subtract: the result is in milliseconds
  const difference = next.date - now;
  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  document.getElementById("nextPrayer").textContent =
    `Next prayer: ${next.name} at ${getTime(next.name)}`;
  document.getElementById("countdown").textContent =
    `Remaining time: ${hours}h ${minutes}m ${seconds}s`;

  //send next prayer countdown
  showSuggestion(next.name, hours * 60 + minutes);
}

// suggestion

function showSuggestion(nextPrayerName, minutesLeft) {
  let suggestion = "";

  if (!nextPrayerName || isNaN(minutesLeft)) {
    // Fallback: the data is missing or not a number
    suggestion = "No suitable activity suggestion is available at this time.";
  } else if (minutesLeft <= 15) {
    // Condition 1: the prayer is very near
    suggestion = `Prepare for ${nextPrayerName} prayer.`;
  } else if (nextPrayerName === "Subuh") {
    suggestion = "You have time to tahajud and prepare for Subuh prayer.";
  } else if (nextPrayerName === "Dhuhr" || nextPrayerName === "Asr") {
    suggestion = "You can take a short break(Qailulah), zikir, or read Quran.";
  } else if (nextPrayerName === "Maghrib") {
    suggestion = "You can prepare for Maghrib and read Quran.";
  } else if (nextPrayerName === "Isha") {
    suggestion = "You can perform evening dhikr and recite al-Mulk.";
  } else {
    suggestion = "No suitable activity suggestion is available at this time.";
  }

  latestSuggestion = suggestion;                                  
  document.getElementById("suggestion").textContent = suggestion;  
  document.getElementById("saveSuggestionBtn").disabled = false;   
}

// 5. crud and storage /reminders

document.getElementById("saveSuggestionBtn").addEventListener("click", () => {
  if (latestSuggestion === "") return;

  const reminders = getReminders();
  reminders.push({
    id: Date.now(), // for current time
    title: "Prayer Activity Suggestion",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
    notes: latestSuggestion
  });
  localStorage.setItem("solatReminders", JSON.stringify(reminders)); // array -> JSON text
  renderReminders();
  alert("Suggestion saved to My Reminders.");
});

function getReminders() {
  return JSON.parse(localStorage.getItem("solatReminders")) || [];
}

function renderReminders() {
  const reminders = getReminders();
  const list = document.getElementById("reminderList");
  list.innerHTML = "";

//no reminder
  if (reminders.length === 0) {
    list.textContent = "No reminders saved yet.";
    return;
  }

  reminders.forEach(reminder => {
    const item = document.createElement("div");
    item.className = "reminder-item";

    const title = document.createElement("strong");
    title.textContent = `${reminder.title} - ${reminder.time}`;

    const notes = document.createElement("p");
    notes.textContent = reminder.notes || "No notes";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editReminder(reminder.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteReminder(reminder.id));

    item.append(title, notes, editButton, deleteButton);
    list.appendChild(item);
  });
}

document.getElementById("reminderForm").addEventListener("submit", event => {
  event.preventDefault(); // stop the page from reloading

  const title = document.getElementById("reminderTitle").value.trim();
  const time = document.getElementById("reminderTime").value;
  const notes = document.getElementById("reminderNotes").value.trim();
  const editId = document.getElementById("editId").value; // empty = new record
  const message = document.getElementById("formMessage");

  if (title === "" || time === "") {
    message.textContent = "Please enter a title and time.";
    return;
  }

  const reminders = getReminders();

  if (editId) {
    //find the record
    const index = reminders.findIndex(item => item.id === Number(editId));
    if (index !== -1) {
      reminders[index].title = title;
      reminders[index].time = time;
      reminders[index].notes = notes;
    }
    message.textContent = "Reminder updated successfully.";
  } else {
    // create new record
    reminders.push({ id: Date.now(), title, time, notes });
    message.textContent = "Reminder added successfully.";
  }

  localStorage.setItem("solatReminders", JSON.stringify(reminders));
  document.getElementById("reminderForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("submitReminderBtn").textContent = "Add Reminder";
  document.getElementById("cancelEditBtn").classList.add("hidden");
  document.getElementById("reminderTitle").focus(); // let the user start typing the next reminder right away
  renderReminders();
});

//update
function editReminder(id) {
  const reminder = getReminders().find(item => item.id === id);
  if (!reminder) return;

  document.getElementById("editId").value = reminder.id;
  document.getElementById("reminderTitle").value = reminder.title;
  document.getElementById("reminderTime").value = reminder.time;
  document.getElementById("reminderNotes").value = reminder.notes || "";
  document.getElementById("submitReminderBtn").textContent = "Update Reminder";
  document.getElementById("cancelEditBtn").classList.remove("hidden");
  document.getElementById("formMessage").textContent = "Edit the details and press Update Reminder.";
}

// delete reminder
function deleteReminder(id) {
  const confirmDelete = confirm("Are you sure you want to delete this reminder?");
  if (!confirmDelete) return;

  const reminders = getReminders().filter(item => item.id !== id);
  localStorage.setItem("solatReminders", JSON.stringify(reminders));
  renderReminders();
  document.getElementById("formMessage").textContent = "Reminder deleted successfully.";
}

document.getElementById("cancelEditBtn").addEventListener("click", () => {
  document.getElementById("reminderForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("submitReminderBtn").textContent = "Add Reminder";
  document.getElementById("cancelEditBtn").classList.add("hidden");
  document.getElementById("formMessage").textContent = "Editing cancelled.";
});



setInterval(updateNextPrayer, 1000); // countdown
renderReminders(); // show saved reminders
