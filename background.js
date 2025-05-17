// background.js (Gemini & ChatGPT API Support)

async function imageUrlToBase64(url) {
  if (!url) return null;
  if (url.startsWith('data:image')) {
    const parts = url.split(',');
    if (parts.length === 2) {
      return { base64: parts[1], mimeType: parts[0].split(':')[1].split(';')[0] };
    } else {
      console.error("Background.js: Invalid data URL format:", url);
      return null;
    }
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Background.js: Failed to fetch image from URL ${url}: ${response.status} ${response.statusText}`);
      return null;
    }
    const blob = await response.blob();
    const mimeType = blob.type;
    if (!mimeType.startsWith('image/')) {
        console.warn(`Background.js: Fetched content from ${url} is not an image (MIME: ${mimeType}). Skipping conversion.`);
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
        console.error("Background.js: FileReader error:", error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Background.js: Error fetching or converting image URL ${url} to base64:`, error);
    return null;
  }
}

async function callGeminiApi(question, apiKey) {
    let promptText = `Question: ${question.text}\n`;
    const apiParts = [{ text: "" }];

    if (question.options && question.options.length > 0) {
        promptText += "Options:\n";
        question.options.forEach((opt, i) => {
        promptText += `${i + 1}. ${opt}\n`;
        });
        if (question.type === "radio" || question.type === "dropdown") {
        promptText += "\nBased on the question, image (if any), and options, what is the single most likely answer? Please return ONLY the full text of the correct option.";
        } else if (question.type === "checkbox") {
        promptText += "\nBased on the question, image (if any), and options, which options are correct? Please return ONLY the full text of each correct option, each on a new line if multiple are correct.";
        }
    } else {
        promptText += "\nBased on the question and image (if any), what is the most likely answer? Provide a concise answer.";
    }
    
    apiParts[0].text = promptText;

    if (question.imageSrc) {
        const imageData = await imageUrlToBase64(question.imageSrc);
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

    if (question.type === "radio" || question.type === "dropdown") {
        geminiRequestBody.generationConfig.temperature = 0.2;
        geminiRequestBody.generationConfig.maxOutputTokens = 100;
    } else if (question.type === "checkbox") {
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
        let errorMessage = `Gemini Error: API request failed (${response.status}). `;
        if (responseData && responseData.error && responseData.error.message) {
            errorMessage += `Details: ${responseData.error.message}`;
        } else {
            errorMessage += 'Unknown API error.';
        }
        return { answer: errorMessage, error: true };
    }

    let answerText = "Could not extract answer from Gemini.";
    if (responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content && responseData.candidates[0].content.parts && responseData.candidates[0].content.parts.length > 0) {
        answerText = responseData.candidates[0].content.parts.map(part => part.text || "").join(" ").trim();
    } else if (responseData.promptFeedback && responseData.promptFeedback.blockReason) {
        answerText = `Gemini Blocked: ${responseData.promptFeedback.blockReason} - ${responseData.promptFeedback.blockReasonMessage || ''}`;
    }
    return { answer: answerText, error: responseData.promptFeedback?.blockReason ? true : false };
}

async function callChatGptApi(question, apiKey) {
    // Choose a model that supports vision, e.g., "gpt-4-vision-preview" or "gpt-4o"
    const model = "gpt-4o"; // Or "gpt-4-vision-preview" - check latest OpenAI models
    const messages = [];
    const contentParts = [];

    let promptText = `Question: ${question.text}\n`;
    if (question.options && question.options.length > 0) {
        promptText += "Options:\n";
        question.options.forEach((opt, i) => {
            promptText += `${i + 1}. ${opt}\n`;
        });
        if (question.type === "radio" || question.type === "dropdown") {
            promptText += "\nBased on the question, image (if any), and options, what is the single most likely answer? Please return ONLY the full text of the correct option. Do not add any other explanatory text.";
        } else if (question.type === "checkbox") {
            promptText += "\nBased on the question, image (if any), and options, which options are correct? Please return ONLY the full text of each correct option, each on a new line if multiple are correct. Do not add any other explanatory text.";
        }
    } else {
        promptText += "\nBased on the question and image (if any), what is the most likely answer? Provide a concise answer. Do not add any other explanatory text.";
    }
    contentParts.push({ type: "text", text: promptText });

    if (question.imageSrc) {
        const imageData = await imageUrlToBase64(question.imageSrc);
        if (imageData && imageData.base64 && imageData.mimeType) {
            contentParts.push({
                type: "image_url",
                image_url: {
                    url: `data:${imageData.mimeType};base64,${imageData.base64}`
                }
            });
        } else {
           // If image processing fails, prepend a note to the text part
           contentParts[0].text = `Note: An image was associated with this question but could not be processed. ${contentParts[0].text}`;
        }
    }
    
    messages.push({ role: "user", content: contentParts });

    const chatGptRequestBody = {
        model: model,
        messages: messages,
        max_tokens: (question.type === "checkbox") ? 250 : 150, // Allow more for checkboxes
        temperature: (question.type === "radio" || question.type === "dropdown") ? 0.2 : 0.5,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(chatGptRequestBody)
    });

    const responseData = await response.json();

    if (!response.ok) {
        let errorMessage = `ChatGPT Error: API request failed (${response.status}). `;
        if (responseData && responseData.error && responseData.error.message) {
            errorMessage += `Details: ${responseData.error.message}`;
        } else {
            errorMessage += 'Unknown API error.';
        }
        return { answer: errorMessage, error: true };
    }

    let answerText = "Could not extract answer from ChatGPT.";
    if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message && responseData.choices[0].message.content) {
        answerText = responseData.choices[0].message.content.trim();
    }
    return { answer: answerText, error: false };
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "solveQuestions") {
    // Retrieve selected API provider and API keys
    chrome.storage.local.get(['geminiApiKey', 'chatGptApiKey', 'selectedApiProvider'], async (storageResult) => {
      try {
        const selectedProvider = storageResult.selectedApiProvider || 'gemini'; // Default to Gemini
        let apiKey;

        if (selectedProvider === 'gemini') {
          apiKey = storageResult.geminiApiKey;
          if (!apiKey) {
            sendResponse({ error: "Gemini API Key not found. Please set it in the extension popup." });
            return;
          }
        } else if (selectedProvider === 'chatgpt') {
          apiKey = storageResult.chatGptApiKey;
          if (!apiKey) {
            sendResponse({ error: "ChatGPT API Key not found. Please set it in the extension popup." });
            return;
          }
        } else {
            sendResponse({ error: "Invalid API provider selected." });
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

        console.log(`Background.js: Processing questions with ${selectedProvider.toUpperCase()} API:`, questionsToSolve);
        const allAnswers = [];

        for (const q of questionsToSolve) {
          let apiResponse;
          try {
            if (selectedProvider === 'gemini') {
              apiResponse = await callGeminiApi(q, apiKey);
            } else if (selectedProvider === 'chatgpt') {
              apiResponse = await callChatGptApi(q, apiKey);
            }
            allAnswers.push({ id: q.id, type: q.type, answer: apiResponse.answer, error: apiResponse.error });
          } catch (questionError) { 
            console.error(`Background.js: Error processing question Q_ID ${q.id} with ${selectedProvider.toUpperCase()}:`, questionError);
            allAnswers.push({ id: q.id, type: q.type, answer: `Error: Client-side exception during processing of question ${q.id} - ${questionError.message}`, error: true });
          }
        } 
        sendResponse({ answers: allAnswers });
      } catch (e) { 
        console.error("Background.js: Unhandled error in solveQuestions handler:", e);
        sendResponse({ error: `Internal error in background script: ${e.message}`, answers: [] });
      }
    });
    return true; 
  }
});

console.log("Background service worker (Multi-API Support) started.");
