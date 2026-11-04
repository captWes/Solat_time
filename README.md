# SolatTime

A simple Electron desktop application for the CSC2923 OOP final assignment.

## Project structure

- `main.js` - starts the Electron application and opens the Prayer Times page.
- `data/prayertime.json` - local JSON file reserved for prayer-time data.
- `renderer/prayer.html` - Prayer Times and My Reminders interface.
- `renderer/prayer.js` - prayer-time API, countdown, activity suggestions, and reminder CRUD.
- `renderer/quran.html` - separate Quran Mushaf reader interface.
- `renderer/quran.js` - Quran page loading and page navigation.
- `renderer/style.css` - styles shared by both renderer pages.

## Features
- Prayer Times page retrieves prayer times from the Aladhan API.
- Processes the API JSON response using JavaScript.
- Suggests activities using student-written if/else statements.
- Calculates the time remaining until the next prayer.
- My Reminders supports create, read, update, and delete using Local Storage.
- Quran Mushaf reader is on a separate page and supports page navigation.

## Requirements
- Node.js and npm

## Run the project
1. Open the SolatTime project folder in VS Code.
2. Open the terminal in this folder (the folder containing `package.json`).
3. Run `npm install`.
4. Run `npm start`.

## APIs
Aladhan Prayer Times API:
https://api.aladhan.com/v1/timingsByCity

Quran API:
https://api.alquran.cloud/v1/page

The prayer-time example uses method 17. Prayer calculation methods can differ by country and local authority. Check the returned times against the official prayer-time authority for the selected location before relying on them.

## Note about prayertime.json
The file `data/prayertime.json` is currently an empty starter data structure. The existing Prayer Times page continues to retrieve live data from the Aladhan API; it does not yet read from or write to this local JSON file.
