<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Future's Google Form Solver - Chrome Extension</title>
    <style>
        body {
            font-family: sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1, h2, h3 {
            color: #333;
        }
        h1 {
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        h2 {
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        code {
            background-color: #eee;
            padding: 2px 4px;
            border-radius: 4px;
            font-family: monospace;
        }
        pre {
            background-color: #eee;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        .lang-switcher {
            text-align: right;
            margin-bottom: 20px;
        }
        .lang-switcher a {
            text-decoration: none;
            padding: 5px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-left: 5px;
            color: #337ab7;
            cursor: pointer;
        }
        .lang-switcher a.active {
            background-color: #337ab7;
            color: white;
            border-color: #337ab7;
        }
        .hidden {
            display: none;
        }
        strong {
            font-weight: bold;
        }
        ul {
            padding-left: 20px;
        }
        .disclaimer-box {
            border: 1px solid #ffcc00;
            background-color: #fff9e6;
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
        }
        .disclaimer-box strong {
            color: #d9534f;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lang-switcher">
            <a id="lang-en" class="active" onclick="switchLang('en')">English</a>
            <a id="lang-th" onclick="switchLang('th')">ไทย (Thai)</a>
        </div>

        <div id="content-en" class="content-lang">
            <h1>Future's Google Form Solver - Chrome Extension</h1>

            <h2>Project Overview</h2>
            <p>The Google Form Solver is a Chrome extension designed to automatically answer questions within Google Forms. It utilizes text and image scraping from the form, sends the extracted information to the Google Gemini API for processing, and then attempts to fill in the answers on the user's behalf.</p>
            <p><strong>Disclaimer:</strong> This extension is intended for educational and experimental purposes to demonstrate web scraping, Chrome extension development, and API integration. Automating form submissions, especially for quizzes or tests, may violate Google's Terms of Service and academic integrity policies. Please use this extension responsibly and ethically.</p>

            <h2>Features</h2>
            <ul>
                <li><strong>API Key Input:</strong> Securely store your Google Gemini API key within the extension.</li>
                <li><strong>Google Form Detection:</strong> Activates when a Google Form is the active tab.</li>
                <li><strong>Question Scraping:</strong> Extracts question text, multiple-choice options, and associated images from the form.</li>
                <li><strong>Exclusion Keywords:</strong> Skips questions containing specific keywords (e.g., "name", "student number") to avoid filling personal information.</li>
                <li><strong>Gemini API Integration:</strong> Sends scraped question data (including images if present) to the Gemini API (specifically <code>gemini-1.5-flash-latest</code>) to generate answers.</li>
                <li><strong>Automated Filling:</strong> Attempts to fill in radio buttons, checkboxes, and text fields based on the API's responses.</li>
            </ul>

            <h2>Setup Instructions</h2>

            <h3>1. Obtain a Google Gemini API Key</h3>
            <ol>
                <li>Go to <a href="https://aistudio.google.com/" target="_blank">Google AI Studio</a> (or the Google Cloud Console if you prefer managing keys there).</li>
                <li>Sign in with your Google account.</li>
                <li>Create a new API key.
                    <ul>
                        <li>In AI Studio, you can usually find an option like "Get API key" or "Create API key in new project."</li>
                    </ul>
                </li>
                <li><strong>Important:</strong> Ensure that the "Generative Language API" (which provides access to Gemini models like <code>gemini-1.5-flash-latest</code>) is enabled for the project associated with your API key.</li>
                <li>Copy the generated API key. You will need this for the extension.</li>
                <li><strong>Security:</strong> Keep your API key confidential. Do not share it publicly or commit it to version control if you are managing this project with Git.</li>
            </ol>

            <h3>2. Prepare the Extens