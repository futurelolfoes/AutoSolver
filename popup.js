document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveKeyButton = document.getElementById('saveKey');
  const startSolvingButton = document.getElementById('startSolving');
  const statusDiv = document.getElementById('status');

  // Load saved API key
  chrome.storage.local.get(['geminiApiKey'], function(result) {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
      statusDiv.textContent = 'API Key loaded.';
    } else {
      statusDiv.textContent = 'API Key not set.';
    }
  });

  saveKeyButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.local.set({geminiApiKey: apiKey}, function() {
        statusDiv.textContent = 'API Key saved!';
        console.log('API Key saved.');
      });
    } else {
      statusDiv.textContent = 'Please enter an API Key.';
    }
  });

  startSolvingButton.addEventListener('click', async function() {
    statusDiv.textContent = 'Starting to solve...';
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('docs.google.com/forms')) {
        // Send a message to the content script to start the process
        chrome.tabs.sendMessage(tab.id, { action: "startSolvingForm" }, function(response) {
          if (chrome.runtime.lastError) {
            statusDiv.textContent = 'Error communicating with content script. Refresh the form page and try again.';
            console.error(chrome.runtime.lastError.message);
          } else if (response && response.status) {
            statusDiv.textContent = response.status;
          } else {
            statusDiv.textContent = "Processing started. Check the form.";
          }
        });
      } else {
        statusDiv.textContent = 'Please open a Google Form to solve.';
      }
    } catch (error) {
      statusDiv.textContent = 'Error: ' + error.message;
      console.error('Error starting solving process:', error);
    }
  });
});