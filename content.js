console.log("Content script loaded for Google Form Solver (Final).");

const EXCLUDED_FIELD_KEYWORDS = [
    "student number", "name", "id", "email", 
    "roll number", "matric number", "student id", "your name"
];

function getFormQuestions() {
    const questions = [];
    const questionBlocks = document.querySelectorAll(
        'div[role="listitem"], ' +
        'div.m2, ' +
        'div.Qr7Oae, ' +
        'div.freebirdFormviewerComponentsQuestionBaseRoot'
    );

    questionBlocks.forEach((block, index) => {
        try {
            let questionText = "";
            let questionType = "unknown"; 
            const options = [];
            let imageSrc = null;

            let questionTextElement = block.querySelector(
                'div.freebirdFormviewerComponentsQuestionBaseHeader div.M7eMe, ' +
                '.freebirdFormviewerComponentsQuestionBaseTitle, ' +
                'div[role="heading"] span:not([aria-hidden="true"]), ' +
                'div.geS5n .M7eMe, ' +
                'div.M4DNMd'
            );
            
            if (questionTextElement) {
                questionText = questionTextElement.textContent.trim();
            } else {
                const textElements = block.querySelectorAll(
                    'div[jsname="jOfkMb"] span, ' +
                    'div.lLfZXe span, ' +
                    'div.Dk2qse span, ' +
                    'div.SajZGc'
                );
                if (textElements.length > 0) {
                    for (let el of textElements) {
                        const potentialText = el.textContent.trim();
                        if (potentialText.length > 3 && 
                            !el.closest('button') && 
                            !el.closest('div[role="radiogroup"]') && 
                            !el.closest('div[role="group"]') && 
                            !el.closest('.freebirdFormviewerComponentsQuestionRadioChoice') && 
                            !el.closest('.freebirdFormviewerComponentsQuestionCheckboxChoice') &&
                            !el.closest('div[role="radio"]') && 
                            !el.closest('div[role="checkbox"]')) {
                            questionText = potentialText;
                            break; 
                        }
                    }
                }
            }
            
            if (!questionText && block.getAttribute('aria-label')) {
                questionText = block.getAttribute('aria-label').trim();
            }

            const imageElement = block.querySelector(
                'div.freebirdFormviewerComponentsQuestionBaseImageContainer img, ' +
                'img.freebirdFormviewerComponentsQuestionBaseImage, ' +
                'div.W4Alyb img, ' +
                'div.Y5sE8d img, ' +
                'div[jsname="UzWXSb"] img, ' +
                'img.FNFY6c, ' +
                'div[aria-live="polite"] img'
            );
            if (imageElement && imageElement.src) {
                imageSrc = imageElement.src;
            }

            if (!questionText && imageSrc) {
                if (imageElement.alt && imageElement.alt.trim().length > 3) {
                    questionText = imageElement.alt.trim();
                } else if (imageElement.title && imageElement.title.trim().length > 3) {
                    questionText = imageElement.title.trim();
                } else {
                    questionText = "Analyze the image provided.";
                }
            }
            
            if (!questionText) {
                if (block.innerText && block.innerText.trim().length > 0) {
                    const lines = block.innerText.split('\n')
                                      .map(l => l.trim())
                                      .filter(l => l.length > 3 && !EXCLUDED_FIELD_KEYWORDS.some(k => l.toLowerCase().includes(k)));
                    if (lines.length > 0) {
                        let potentialQ = "";
                        for (const line of lines) {
                            if (line.includes('?') || line.length > 10) { 
                                potentialQ = line;
                                break;
                            }
                        }
                        questionText = potentialQ || lines[0]; 
                    }
                }

                if (!questionText) { 
                    return; 
                }
            }

            const isExcluded = EXCLUDED_FIELD_KEYWORDS.some(keyword => questionText.toLowerCase().includes(keyword));
            if (isExcluded) {
                return; 
            }

            const radioGroup = block.querySelector('div[role="radiogroup"]');
            if (radioGroup) {
                questionType = "radio";
                const radioOptionElements = radioGroup.querySelectorAll('div[role="radio"]');
                radioOptionElements.forEach(optEl => {
                    let optionText = optEl.getAttribute('aria-label'); 
                    
                    if (!optionText || optionText.trim() === "") {
                        const parentLabel = optEl.closest('label.docssharedWizToggleLabeledContainer');
                        if (parentLabel) {
                            const textSpan = parentLabel.querySelector('div.YEVVod span.aDTYNe');
                            if (textSpan && textSpan.textContent) {
                                optionText = textSpan.textContent.trim();
                            }
                        }
                    }
                    if ((!optionText || optionText.trim() === "") && optEl.closest('label')?.innerText) {
                        optionText = optEl.closest('label').innerText.trim();
                    }

                    if (optionText && optionText.trim()) {
                        options.push(optionText.trim());
                    }
                });
            }

            let checkboxGroup = block.querySelector('div[role="list"][aria-labelledby], div[role="group"][aria-label]');
            if (!checkboxGroup) { 
                checkboxGroup = block.querySelector('div[jsname="TedXGb"], div.freebirdFormviewerComponentsQuestionCheckboxGroup');
            }
            if (checkboxGroup && checkboxGroup.querySelectorAll('div[role="checkbox"]').length > 0) {
                questionType = "checkbox";
                const checkboxOptionElements = checkboxGroup.querySelectorAll('div[role="checkbox"]');
                checkboxOptionElements.forEach(optEl => {
                    let optionText = optEl.getAttribute('aria-label');

                    if (!optionText || optionText.trim() === "") {
                        const parentLabel = optEl.closest('label.docssharedWizToggleLabeledContainer');
                        if (parentLabel) {
                            const textSpan = parentLabel.querySelector('div.YEVVod span.aDTYNe');
                            if (textSpan && textSpan.textContent) {
                                optionText = textSpan.textContent.trim();
                            }
                        }
                    }
                    if ((!optionText || optionText.trim() === "") && optEl.closest('label')?.innerText) {
                        optionText = optEl.closest('label').innerText.trim();
                    }

                    if (optionText && optionText.trim()) {
                        options.push(optionText.trim());
                    }
                });
            }

            const textInput = block.querySelector('input[type="text"].whsOnd.zHQkBf, textarea.KHxj8b.tL9Q4c');
            if (textInput && (questionType === "unknown" || (options.length === 0 && !radioGroup && !checkboxGroup))) {
                questionType = textInput.tagName.toLowerCase() === 'textarea' ? "textarea" : "text";
            }
            
            const dropdownTrigger = block.querySelector('div[role="listbox"]:not([aria-disabled="true"])');
            if (dropdownTrigger && questionType === "unknown") {
                questionType = "dropdown";
                const visibleOptionElements = dropdownTrigger.querySelectorAll(
                    'span.vRMGwf, ' + 
                    'div[jscontroller][data-value] span, ' + 
                    '.quantumWizMenuPaperselectOption.appsMaterialWizMenuPaperselectOption[data-value]'
                );
                visibleOptionElements.forEach(optEl => {
                    if (optEl.textContent && optEl.textContent.trim()) {
                        options.push(optEl.textContent.trim());
                    }
                });
            }

            if (questionText) {
                questions.push({
                    id: `q_${index}`,
                    text: questionText,
                    type: questionType,
                    options: options, 
                    imageSrc: imageSrc,
                    element: block 
                });
                if ((questionType === "radio" || questionType === "checkbox" || questionType === "dropdown") && options.length === 0) {
                    console.warn(`Content.js: Question (index ${index}, type ${questionType}, text "${questionText}") identified as choice, but NO options scraped. HTML:`, radioGroup?.innerHTML || checkboxGroup?.innerHTML || "Choice group not found.");
                }
            }
        } catch (e) {
            console.error(`Content.js: Error processing block (index ${index}):`, block, e);
        }
    });
    console.log("Content.js: Scraped Questions (Final):", questions);
    return questions;
}

function fillFormAnswers(answers) {
    if (!answers || answers.length === 0) {
        return;
    }

    const formQuestions = getFormQuestions(); 

    answers.forEach(ans => {
        if (ans.error) {
            return;
        }

        const questionToFill = formQuestions.find(q => q.id === ans.id);
        if (!questionToFill) {
            return;
        }

        if ((questionToFill.type === "radio" || questionToFill.type === "checkbox" || questionToFill.type === "dropdown") && 
            (!questionToFill.options || questionToFill.options.length === 0)) {
            return;
        }

        const questionBlock = questionToFill.element;
        const rawGeminiAnswer = ans.answer;

        try {
            if (questionToFill.type === "radio") {
                const radioOptionsElements = questionBlock.querySelectorAll('div[role="radio"]');
                let matched = false;
                for (let i = 0; i < questionToFill.options.length; i++) {
                    const scrapedOptionText = questionToFill.options[i];
                    if (rawGeminiAnswer.trim().toLowerCase() === scrapedOptionText.toLowerCase()) {
                        if (radioOptionsElements[i] && radioOptionsElements[i].getAttribute('aria-checked') !== 'true') {
                            const clickableTarget = radioOptionsElements[i].closest('label.docssharedWizToggleLabeledContainer') || 
                                                  radioOptionsElements[i].querySelector('div.docssharedWizToggleLabeledContainer, div.AB7Lab') || 
                                                  radioOptionsElements[i];
                            if (clickableTarget) {
                                clickableTarget.click();
                                matched = true;
                            }
                        } else if (radioOptionsElements[i]) {
                            matched = true;
                        }
                        if (matched) break; 
                    }
                }
            } else if (questionToFill.type === "checkbox") {
                const checkboxOptionsElements = questionBlock.querySelectorAll('div[role="checkbox"]');
                const geminiSelectedOptions = rawGeminiAnswer.split(/\n|,/)
                                                .map(s => s.trim().toLowerCase())
                                                .filter(s => s.length > 0);
                
                for (let i = 0; i < questionToFill.options.length; i++) {
                    const scrapedOptionText = questionToFill.options[i].toLowerCase();
                    if (geminiSelectedOptions.includes(scrapedOptionText)) {
                        if (checkboxOptionsElements[i] && checkboxOptionsElements[i].getAttribute('aria-checked') !== 'true') {
                            const clickableTarget = checkboxOptionsElements[i].closest('label.docssharedWizToggleLabeledContainer') || 
                                                  checkboxOptionsElements[i].querySelector('div.docssharedWizToggleLabeledContainer, div.uVccjd') || 
                                                  checkboxOptionsElements[i];
                             if (clickableTarget) {
                                clickableTarget.click();
                            }
                        }
                    }
                }
            } else if (questionToFill.type === "text" || questionToFill.type === "textarea") {
                const inputElement = questionBlock.querySelector('input[type="text"].whsOnd.zHQkBf, textarea.KHxj8b.tL9Q4c');
                if (inputElement) {
                    inputElement.value = rawGeminiAnswer;
                    inputElement.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                    inputElement.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
                }
            } else if (questionToFill.type === "dropdown") {
                const mainDropdownElement = questionBlock.querySelector('div[role="listbox"]');
                if (mainDropdownElement) {
                    const clickableDropdownPart = mainDropdownElement.querySelector('.exportLabel, .quantumWizMenuPaperselectOptionText, div[jsaction*="click"][role="button"]'); 
                    
                    if (clickableDropdownPart) {
                        clickableDropdownPart.click();
                    } else {
                        mainDropdownElement.click(); 
                    }

                    setTimeout(() => {
                        const optionsInMenu = document.querySelectorAll(
                            'div[role="option"][data-value], ' +
                            'div.exportOption[role="option"], ' +
                            'div[jsaction*="click"][role="option"]. μεταξύ.JGcpL'
                        );
                        let matched = false;
                        optionsInMenu.forEach(optionEl => {
                            if (optionEl.offsetParent === null) return; 

                            const optionText = optionEl.textContent.trim();
                            if (optionText.toLowerCase() === rawGeminiAnswer.trim().toLowerCase()) {
                                optionEl.click();
                                matched = true;
                            }
                        });
                    }, 1000); 
                }
            }
        } catch (e) {
            console.error(`Content.js: Error filling answer for Q_ID ${ans.id} ("${rawGeminiAnswer}"):`, e);
        }
    });
    alert("Form filling attempt complete (Final). Review answers.");
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startSolvingForm") {
        const questions = getFormQuestions();

        if (questions && questions.length > 0) {
            chrome.runtime.sendMessage(
                {
                    action: "solveQuestions",
                    questions: questions.map(q => ({ 
                        id: q.id,
                        text: q.text,
                        type: q.type,
                        options: q.options,
                        imageSrc: q.imageSrc
                    }))
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        sendResponse({ status: `Error communicating with background: ${chrome.runtime.lastError.message}` });
                        return; 
                    }

                    if (response && response.error) {
                        alert(`Error from background: ${response.error}`); 
                        sendResponse({ status: `Error: ${response.error}` });
                    } else if (response && response.answers) {
                        fillFormAnswers(response.answers);
                        sendResponse({ status: "Attempted to fill form (Final). " + (response.message || "") });
                    } else {
                        sendResponse({ status: "Received an unexpected response from background."});
                    }
                }
            );
        } else {
            alert("No questions found or all excluded.");
            sendResponse({ status: "No questions found or all excluded." });
        }
        return true; 
    }
});
