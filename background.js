async function imageUrlToBase64(url) {
  if (!url) return null;
  if (url.startsWith('data:image')) {
    const parts = url.split(',');
    if (parts.length === 2) {
      return { base64: parts[1], mimeType: parts[0].split(':')[1].split(';')[0] };
    } else {
      return null;
    }
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const blob = await response.blob();
    const mimeType = blob.type;
    if (!mimeType.startsWith('image/')) {
        return null;
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve({ base64: reader.result.split(',')[1], mimeType: mimeType });
        } else {
            reject(new Error("FileReader did not return a string."));
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "solveQuestions") {
    chrome.storage.local.get(['geminiApiKey'], async (result) => {
      try {
        const apiKey = result.geminiApiKey;
        if (!apiKey) {
          sendResponse({ error: "API Key not found. Please set it in the extension popup." });
          return; 
        }

        const questionsData = request.questions;
        const excludedKeywords = ["student number", "name", "id", "email", "roll number", "matric number", "student id"];
        const questionsToSolve = questionsData.filter(q =>
          q.text && !excludedKeywords.some(keyword => q.text.toLowerCase().includes(keyword))
        );

        if (questionsToSolve.length === 0) {
          sendResponse({ answers: [], message: "No questions to solve after filtering (or no question text found)." });
          return; 
        }

        const geminiAnswers = [];

        for (const q of questionsToSolve) {
          try {
            let promptText = `Question: ${q.text}\n`;
            const apiParts = [{ text: "" }];

            if (q.options && q.options.length > 0) {
              promptText += "Options:\n";
              q.options.forEach((opt, i) => {
                promptText += `${i + 1}. ${opt}\n`;
              });
              if (q.type === "radio" || q.type === "dropdown") {
                promptText += "\nBased on the question, image (if any), and options, what is the single most likely answer? Please return ONLY the full text of the correct option.";
              } else if (q.type === "checkbox") {
                promptText += "\nBased on the question, image (if any), and options, which options are correct? Please return ONLY the full text of each correct option, each on a new line if multiple are correct.";
              }
            } else {
              promptText += "\nBased on the question and image (if any), what is the most likely answer? Provide a concise answer.";
            }
            
            apiParts[0].text = promptText;

            if (q.imageSrc) {
              const imageData = await imageUrlToBase64(q.imageSrc);
              if (imageData && imageData.base64 && imageData.mimeType) {
                apiParts.push({
                  inline_data: {
                    mime_type: imageData.mimeType,
                    data: imageData.base64,
                  },
                });
                apiParts[0].text = `Considering the following image and text:\n${apiParts[0].text}`;
              } else {
                apiParts[0].text = `Note: An image was associated with this question but could not be processed. ${apiParts[0].text}`;
              }
            }

            const geminiRequestBody = {
              contents: [{ parts: apiParts }],
              generationConfig: {} 
            };

            if (q.type === "radio" || q.type === "dropdown") {
                geminiRequestBody.generationConfig.temperature = 0.2;
                geminiRequestBody.generationConfig.maxOutputTokens = 100;
            } else if (q.type === "checkbox") {
                geminiRequestBody.generationConfig.temperature = 0.5;
                geminiRequestBody.generationConfig.maxOutputTokens = 250;
            } else {
                geminiRequestBody.generationConfig.temperature = 0.7;
                geminiRequestBody.generationConfig.maxOutputTokens = 150;
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(geminiRequestBody),
            });

            const responseData = await response.json();

            if (!response.ok) {
              let errorMessage = `Error: API request failed (${response.status}). `;
              if (responseData && responseData.error && responseData.error.message) {
                  errorMessage += `Details: ${responseData.error.message}`;
              } else {
                  errorMessage += 'Unknown API error.';
              }
              geminiAnswers.push({ id: q.id, type: q.type, answer: errorMessage, error: true });
              continue; 
            }

            let answerText = "Could not extract answer.";
            if (responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content && responseData.candidates[0].content.parts && responseData.candidates[0].content.parts.length > 0) {
              answerText = responseData.candidates[0].content.parts.map(part => part.text || "").join(" ").trim();
            } else if (responseData.promptFeedback && responseData.promptFeedback.blockReason) {
               answerText = `Blocked: ${responseData.promptFeedback.blockReason} - ${responseData.promptFeedback.blockReasonMessage || ''}`;
            }
            
            geminiAnswers.push({ id: q.id, type: q.type, answer: answerText });

          } catch (questionError) { 
            geminiAnswers.push({ id: q.id, type: q.type, answer: `Error: Client-side exception during processing of question ${q.id} - ${questionError.message}`, error: true });
          }
        } 
        sendResponse({ answers: geminiAnswers });
      } catch (e) { 
        sendResponse({ error: `Internal error in background script: ${e.message}`, answers: [] });
      }
    });
    return true; 
  }
});

console.log("Background service worker (Final) started.");
