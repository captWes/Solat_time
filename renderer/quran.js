// QURAN 

let currentPage = 1;

async function loadQuranPage(pageNum) {
  if (pageNum < 1) pageNum = 1;
  if (pageNum > 604) pageNum = 604;
  currentPage = pageNum;

  const textContainer = document.getElementById("quranTextContent");
  const surahDisplay = document.getElementById("surahNameDisplay");
  const juzDisplay = document.getElementById("juzDisplay");
  const pageDisplay = document.getElementById("pageNumberDisplay");
  const pageJumpInput = document.getElementById("pageJumpInput");

  textContainer.textContent = "Loading page...";

  try {
    const response = await fetch(`https://api.alquran.cloud/v1/page/${currentPage}/quran-uthmani`);
    const data = await response.json();

    if (data.code === 200 && data.data && data.data.ayahs) {
      const ayahs = data.data.ayahs;

      let htmlContent = "";
      let currentSurahName = "";
      let currentJuz = "";

      ayahs.forEach(ayah => {
        currentSurahName = ayah.surah.englishName + " (" + ayah.surah.name + ")";
        currentJuz = "Juz' " + ayah.juz;

        // Show the verse number in Arabic digits
        const arabicNumber = ayah.numberInSurah.toLocaleString("ar-EG");
        htmlContent += `${ayah.text} <span style="color: #285b46; font-size: 0.85em;">\u06DD${arabicNumber}</span> `;
      });

      textContainer.innerHTML = htmlContent;
      surahDisplay.textContent = currentSurahName;
      juzDisplay.textContent = currentJuz;
      pageDisplay.textContent = currentPage;
      pageJumpInput.value = currentPage;
    } else {
      textContainer.textContent = "Failed to load Quran page text.";
    }
  } catch (error) {
    textContainer.textContent = "Network error loading Quran page. Please check your internet connection.";
    console.error(error);
  }
}

document.getElementById("prevPageBtn").addEventListener("click", () => {
  if (currentPage > 1) loadQuranPage(currentPage - 1);
});

document.getElementById("nextPageBtn").addEventListener("click", () => {
  if (currentPage < 604) loadQuranPage(currentPage + 1);
});

document.getElementById("jumpPageBtn").addEventListener("click", () => {
  const pageNum = parseInt(document.getElementById("pageJumpInput").value);
  if (pageNum >= 1 && pageNum <= 604) {
    loadQuranPage(pageNum);
  } else {
    alert("Please enter a valid page number between 1 and 604.");
  }
});


// Load the first Quran page when the reader opens.
loadQuranPage(1);
