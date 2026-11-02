# SolatTime

A simple Electron desktop application for the CSC2923 OOP final assignment.

## Features
- Two pages: Prayer Times and My Reminders
- Retrieves prayer times from the Aladhan API
- Processes the API JSON response using JavaScript
- Suggests activities using student-written if/else statements
- Calculates the time remaining until the next prayer
- CRUD reminders saved in Local Storage
- Basic input validation and API error messages

## Requirements
- Node.js and npm

## Run the project
1. Open this folder in VS Code.
2. Open the terminal in this folder.
3. Run `npm install`.
4. Run `npm start`.

## API
Aladhan Prayer Times API:
https://api.aladhan.com/v1/timingsByCity

The example uses method 3. Prayer calculation methods can differ by country and local authority. Check the returned times against the official prayer-time authority for the selected location before relying on them.

## Important
This is a beginner-level starter project. Test the API, all reminder operations, and persistence on your own computer. Understand and customise the code before submitting it.