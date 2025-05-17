// js/popup.js (Final Version)
document.addEventListener('DOMContentLoaded', function() {
  const geminiApiKeyInput = document.getElementById('geminiApiKey');
  const chatGptApiKeyInput = document.getElementById('chatGptApiKey');
  const apiProviderSelect = document.getElementById('apiProvider');
  
  const geminiApiKeySection = document.getElementById('geminiApiKeySection');
  const chatGptApiKeySection = document.getElementById('chatGptApiKeySection');

  const saveKeysButton = document.getElementById('saveKeys');
  const startSolvingButton = document.getElementById('startSolving');
  const statusDiv = document.getElementById('status');

  const statusTypeStyles = {
    info:    'status-info',    
    success: 'status-success', 
    error:   'status-error'    
  };

  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = 'status-message'; // Reset to base class
    statusDiv.classList.add(statusTypeStyles[type] || statusTypeStyles.info);
    
    statusDiv.classList.add('status-visible');
    statusDiv.classList.remove('status-hidden'); // Ensure hidden class is removed if present
  }

  function hideStatus() {
    statusDiv.classList.add('status-hidden'); // Add class to trigger fade out animation
    statusDiv.classList.remove('status-visible');
    // Text content can be cleared after animation if desired, or when showStatus is called next
    setTimeout(() => {
        if (statusDiv.classList.contains('status-hidden')) { 
            statusDiv.textContent = ''; 
        }
    }, 300); // Match CSS transition duration
  }

  function toggleApiKeySections(provider) {
    if (provider === 'gemini') {
        geminiApiKeySection.classList.remove('hidden-by-default');
        chatGptApiKeySection.classList.add('hidden-by-default');
    } else if (provider === 'chatgpt') {
        geminiApiKeySection.classList.add('hidden-by-default');
        chatGptApiKeySection.classList.remove('hidden-by-default');
    }
  }

  apiProviderSelect.addEventListener('change', function() {
    toggleApiKeySections(this.value);
  });

  chrome.storage.local.get(['geminiApiKey', 'chatGptApiKey', 'selectedApiProvider'], function(result) {
    if (chrome.runtime.lastError) {
        showStatus("Error loading settings.", "error");
        setTimeout(hideStatus, 3000);
        return;
    }
    if (result.geminiApiKey) {
      geminiApiKeyInput.value = result.geminiApiKey;
    }
    if (result.chatGptApiKey) {
      chatGptApiKeyInput.value = result.chatGptApiKey;
    }
    if (result.selectedApiProvider) {
      apiProviderSelect.value = result.selectedApiProvider;
    } else {
      apiProviderSelect.value = 'gemini'; // Default to Gemini
    }
    toggleApiKeySections(apiProviderSelect.value); 
    
    if (result.geminiApiKey || result.chatGptApiKey || result.selectedApiProvider) {
        showStatus('Settings loaded.', 'info');
        setTimeout(hideStatus, 2000);
    } else {
        // Ensure status is hidden if nothing was loaded to show "Settings loaded"
        statusDiv.classList.add('status-hidden');
        statusDiv.classList.remove('status-visible');
    }
  });

  saveKeysButton.addEventListener('click', function() {
    const geminiKey = geminiApiKeyInput.value.trim();
    const chatGptKey = chatGptApiKeyInput.value.trim();
    const selectedProvider = apiProviderSelect.value;

    const settingsToSave = {
        selectedApiProvider: selectedProvider,
        geminiApiKey: geminiKey, // Save even if empty to allow clearing
        chatGptApiKey: chatGptKey // Save even if empty to allow clearing
    };

    chrome.storage.local.set(settingsToSave, function() {
      if (chrome.runtime.lastError) {
        showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
      } else {
        showStatus('API Keys & Settings saved successfully!', 'success');
        console.log('API Keys & Settings saved.');
      }
      setTimeout(hideStatus, 2500);
    });
  });

  startSolvingButton.addEventListener('click', async function() {
    showStatus('Initializing...', 'info');
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        showStatus('Cannot find active tab.', 'error');
        setTimeout(hideStatus, 3000);
        return;
      }
      const tab = tabs[0];

      if (tab && tab.id && tab.url && tab.url.includes('docs.google.com/forms')) {
        const selectedProvider = apiProviderSelect.value;
        chrome.storage.local.get([selectedProvider === 'gemini' ? 'geminiApiKey' : 'chatGptApiKey'], function(keyResult) {
            if(chrome.runtime.lastError){
                showStatus('Error fetching API key for solving.', 'error');
                setTimeout(hideStatus, 3000); return;
            }
            const currentApiKey = keyResult[selectedProvider === 'gemini' ? 'geminiApiKey' : 'chatGptApiKey'];
            if (!currentApiKey) {
                showStatus(`API Key for ${selectedProvider.toUpperCase()} not set. Please save it first.`, 'error');
                setTimeout(hideStatus, 3500); return;
            }

            showStatus(`Processing form with ${selectedProvider.toUpperCase()}... Please wait.`, 'info');
            chrome.tabs.sendMessage(tab.id, 
                { 
                    action: "startSolvingForm",
                }, 
                function(response) {
              if (chrome.runtime.lastError) {
                showStatus('Error: ' + chrome.runtime.lastError.message + '. Ensure form is loaded.', 'error');
              } else if (response && response.status) {
                const type = response.status.toLowerCase().includes('error') ? 'error' : 
                             response.status.toLowerCase().includes('success') || response.status.toLowerCase().includes('attempted') ? 'success' : 'info';
                showStatus(response.status, type);
                if (type === 'info' && !response.status.toLowerCase().includes('attempted')) {
                    setTimeout(hideStatus, 4000);
                }
              } else {
                showStatus("Processing started. Check consoles.", "info");
              }
            });
        });
      } else {
        showStatus('Not a Google Form. Please open one to solve.', 'error');
        setTimeout(hideStatus, 3000);
      }
    } catch (error) {
      showStatus('Error: ' + error.message, 'error');
      setTimeout(hideStatus, 3000);
    }
  });
  
   // Ensure status is initially hidden if no keys/provider are loaded to show "Settings loaded"
   if (!geminiApiKeyInput.value && !chatGptApiKeyInput.value && !apiProviderSelect.value) { 
       statusDiv.classList.add('status-hidden'); 
       statusDiv.classList.remove('status-visible');
   }
});
