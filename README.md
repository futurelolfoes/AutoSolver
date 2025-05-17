# Future's Google Form Solver

## Project Overview

The Google Form Solver is a Chrome extension designed to automatically answer questions within Google Forms. It utilizes text and image scraping from the form, sends the extracted information to the Google Gemini API for processing, and then attempts to fill in the answers on the user's behalf.

**Disclaimer:** This extension is intended for educational and experimental purposes to demonstrate web scraping, Chrome extension development, and API integration. Automating form submissions, especially for quizzes or tests, may violate Google's Terms of Service and academic integrity policies. Please use this extension responsibly and ethically.

## Features

* **API Key Input:** Securely store your Google Gemini API key within the extension.
* **Google Form Detection:** Activates when a Google Form is the active tab.
* **Question Scraping:** Extracts question text, multiple-choice options, and associated images from the form.
* **Exclusion Keywords:** Skips questions containing specific keywords (e.g., "name", "student number") to avoid filling personal information.
* **Gemini API Integration:** Sends scraped question data (including images if present) to the Gemini API (specifically `gemini-1.5-flash-latest`) to generate answers.
* **Automated Filling:** Attempts to fill in radio buttons, checkboxes, and text fields based on the API's responses.

## Setup Instructions

### 1. Obtain a Google Gemini API Key

1.  Go to [Google AI Studio](https://aistudio.google.com/) (or the Google Cloud Console if you prefer managing keys there).
2.  Sign in with your Google account.
3.  Create a new API key.
    * In AI Studio, you can usually find an option like "Get API key" or "Create API key in new project."
4.  **Important:** Ensure that the "Generative Language API" (which provides access to Gemini models like `gemini-1.5-flash-latest`) is enabled for the project associated with your API key.
5.  Copy the generated API key. You will need this for the extension.
6.  **Security:** Keep your API key confidential. Do not share it publicly or commit it to version control if you are managing this project with Git.

### 2. Load the Extension in Chrome

1.  Open Google Chrome.
2.  Navigate to `chrome://extensions/` in the address bar.
3.  Enable **Developer mode** using the toggle switch (usually in the top-right corner).
4.  Click the **"Load unpacked"** button (usually in the top-left corner).
5.  In the file dialog that appears, select the **folder** where you saved all the extension files (`manifest.json`, `popup.html`, etc.).
6.  The "Google Form Solver" extension should now appear in your list of extensions and its icon should be visible in the Chrome toolbar.
OR
Download from Google Chrome Webstore

## How to Use

1.  **Enter API Key:**
    * Click on the Google Form Solver extension icon in your Chrome toolbar.
    * A popup will appear. Paste your Google Gemini API key into the "Gemini API Key:" input field.
    * Click the "Save API Key" button. You should see a confirmation message. This key is stored locally using `chrome.storage.local`.

2.  **Navigate to a Google Form:**
    * Open any Google Form in a Chrome tab that you wish to use the extension on.

3.  **Start Solving:**
    * With the Google Form open and active, click the extension icon again.
    * Click the "Start Solving" button.
    * The extension will:
        * Scrape questions and options from the current Google Form (visible in the `content.js` console logs).
        * Send this data to the `background.js` script.
        * `background.js` will make requests to the Gemini API (visible in the `background.js` service worker console logs).
        * Once answers are received, `content.js` will attempt to fill them into the form.
    * An alert will notify you when the filling attempt is complete.

4.  **Review Answers:**
    * **Crucially, always review the answers filled by the extension.** AI-generated answers may not always be accurate or appropriate.
    * Check the browser's developer console (for both the content script on the form page and the background service worker) for any errors or detailed logs.

## File Structure

* **`manifest.json`**: The core configuration file for the Chrome extension. It defines permissions, scripts, popup, icons, etc.
* **`popup.html`**: The HTML structure for the small window that appears when you click the extension icon. It contains the API key input and control buttons.
* **`popup.js`**: The JavaScript logic for `popup.html`. It handles saving the API key and initiating the form-solving process by communicating with `content.js`.
* **`content.js`**: This script is injected directly into Google Form pages. It is responsible for:
    * Scraping the question text, options, and images from the form's HTML.
    * Sending this scraped data to `background.js`.
    * Receiving processed answers from `background.js` and attempting to fill them into the form elements (radio buttons, checkboxes, text fields).
* **`background.js` (Service Worker)**: Runs in the background independently of any web page. It is responsible for:
    * Receiving scraped question data from `content.js`.
    * Handling image data conversion (fetching URLs to base64).
    * Constructing prompts and making API calls to the Google Gemini API.
    * Sending the generated answers back to `content.js`.
* **`icons/` folder**: Contains the extension's icons for different sizes displayed in the Chrome UI.

## DISCLAIMER

I am NOT entitled for what the extension is used for. I do not condone cheating in any way. I am also not responsible for any bad scores or inaccuracies made by the extension as that is because of google gemini NOT ME.