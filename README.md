# Future's Google Form Solver - Chrome Extension / ส่วนขยาย Chrome

**Table of Contents**
* [English Version](#futures-google-form-solver---chrome-extension)
* [Thai Version (ฉบับภาษาไทย)](#futures-google-form-solver---ส่วนขยาย-chrome-ฉบับภาษาไทย)

---

# Future's Google Form Solver - Chrome Extension

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

### 2. Prepare the Extension Files

You should have the following files in a single project folder:

* `manifest.json` (Configures the extension)
* `popup.html` (The UI for the extension's popup)
* `popup.js` (Handles logic for the popup)
* `content.js` (Injects into Google Form pages to scrape and fill)
* `background.js` (Handles API calls and communication)
* An `icons` folder containing:
    * `icon_16.png`
    * `icon_48.png`
    * `icon_128.png`

*(Ensure you have the latest versions of `content.js` and `background.js`.)*

### 3. Load the Extension in Chrome

1.  Open Google Chrome.
2.  Navigate to `chrome://extensions/` in the address bar.
3.  Enable **Developer mode** using the toggle switch (usually in the top-right corner).
4.  Click the **"Load unpacked"** button (usually in the top-left corner).
5.  In the file dialog that appears, select the **folder** where you saved all the extension files (`manifest.json`, `popup.html`, etc.).
6.  The "Future's Google Form Solver" extension should now appear in your list of extensions and its icon should be visible in the Chrome toolbar. **OR** Download from Google Chrome Webstore

## How to Use

1.  **ป้อน API Key:**
    * Click on the Google Form Solver extension icon in your Chrome toolbar.
    * A popup will appear. Paste your Google Gemini API key into the "Gemini API Key:" input field.
    * Click the "Save API Key" button. You should see a confirmation message. This key is stored locally using `chrome.storage.local`
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

## Important Considerations & Limitations

* **Ethical Use:** As stated before, use this tool responsibly. Do not use it for academic dishonesty or to violate terms of service.
* **Google Forms Structure:** Google Forms' HTML structure can change without notice. If this happens, the CSS selectors in `content.js` used for scraping will likely break, and the extension may stop working correctly or at all. This is the most common point of failure and requires manual updates to the selectors.
* **API Costs & Quotas:** Using the Google Gemini API may incur costs depending on your usage and the current pricing model. Be mindful of API quotas and limits.
* **Selector Robustness:** The accuracy of scraping depends heavily on the CSS selectors in `content.js`. These have been refined but may still need adjustments for different form layouts or future Google Forms updates.
* **Answer Accuracy:** The quality and accuracy of the answers depend entirely on the Gemini API and the clarity of the scraped information. AI is not infallible.
* **Dynamic Content:** The extension is designed for forms where content is mostly loaded. Highly dynamic forms or forms that load questions incrementally might pose challenges.
* **Complex Question Types:** While it attempts to handle common types (radio, checkbox, text, dropdown, images), very complex or custom question types within Google Forms might not be supported.

## Troubleshooting

* **"API Key not found"**: Ensure you have saved your API key correctly via the extension popup.
* **"Error communicating with background: The message port closed..."**: This can happen if `background.js` encounters an unhandled error or doesn't respond. Check the background service worker console for errors.
* **Questions/Options Not Scraped Correctly**:
    * Open the Developer Tools on the Google Form page (Right-click -> Inspect -> Console).
    * Look for logs from `content.js`, especially warnings about "Could not extract question text" or "no options were scraped."
    * The console will often log the HTML of the problematic block, which you can use to update the selectors in `content.js`.
* **No Answers Filled / Incorrect Answers**:
    * Check the background service worker console for API errors or unexpected responses from Gemini.
    * Verify the prompts being sent to the API.
    * The logic in `content.js` for matching Gemini's answer text to the form options might need refinement if Gemini's phrasing is slightly different from the option text.

By understanding these aspects, you can better use, maintain, and troubleshoot the Google Form Solver extension.

---

### DISCLAIMER

**I am NOT entitled for what the extension is used for. I do not condone cheating in any way. I am also not responsible for any bad scores or inaccuracies made by the extension as that is because of google gemini NOT ME.**

---
---

# Future's Google Form Solver - ส่วนขยาย Chrome (ฉบับภาษาไทย)

## ภาพรวมโครงการ

Google Form Solver เป็นส่วนขยายของ Chrome ที่ออกแบบมาเพื่อตอบคำถามภายใน Google Forms โดยอัตโนมัติ โดยใช้การดึงข้อความและรูปภาพจากฟอร์ม ส่งข้อมูลที่ดึงออกมาไปยัง Google Gemini API เพื่อประมวลผล จากนั้นจึงพยายามกรอกคำตอบในนามของผู้ใช้

**ข้อจำกัดความรับผิดชอบ:** ส่วนขยายนี้มีไว้เพื่อการศึกษาและการทดลอง เพื่อสาธิตการดึงข้อมูลจากเว็บ (web scraping) การพัฒนาส่วนขยาย Chrome และการรวม API การส่งฟอร์มอัตโนมัติ โดยเฉพาะอย่างยิ่งสำหรับแบบทดสอบหรือการสอบ อาจละเมิดข้อกำหนดในการให้บริการของ Google และนโยบายความซื่อสัตย์ทางวิชาการ โปรดใช้ส่วนขยายนี้อย่างมีความรับผิดชอบและมีจริยธรรม

## คุณสมบัติ

* **การป้อน API Key:** จัดเก็บ Google Gemini API key ของคุณอย่างปลอดภัยภายในส่วนขยาย
* **การตรวจจับ Google Form:** เปิดใช้งานเมื่อ Google Form เป็นแท็บที่ใช้งานอยู่
* **การดึงข้อมูลคำถาม:** ดึงข้อความคำถาม ตัวเลือกปรนัย และรูปภาพที่เกี่ยวข้องจากฟอร์ม
* **คำหลักที่ยกเว้น:** ข้ามคำถามที่มีคำหลักเฉพาะ (เช่น "ชื่อ", "เลขประจำตัวนักเรียน") เพื่อหลีกเลี่ยงการกรอกข้อมูลส่วนบุคคล
* **การรวม Gemini API:** ส่งข้อมูลคำถามที่ดึงมา (รวมถึงรูปภาพ หากมี) ไปยัง Gemini API (โดยเฉพาะ `gemini-1.5-flash-latest`) เพื่อสร้างคำตอบ
* **การกรอกอัตโนมัติ:** พยายามกรอกปุ่มตัวเลือก (radio buttons) ช่องทำเครื่องหมาย (checkboxes) และช่องข้อความตามการตอบสนองของ API

## คำแนะนำในการตั้งค่า

### 1. การรับ Google Gemini API Key

1.  ไปที่ [Google AI Studio](https://aistudio.google.com/) (หรือ Google Cloud Console หากคุณต้องการจัดการคีย์ที่นั่น)
2.  ลงชื่อเข้าใช้ด้วยบัญชี Google ของคุณ
3.  สร้าง API key ใหม่
    * ใน AI Studio โดยทั่วไปคุณจะพบตัวเลือกเช่น "Get API key" หรือ "Create API key in new project"
4.  **สำคัญ:** ตรวจสอบให้แน่ใจว่า "Generative Language API" (ซึ่งให้การเข้าถึงโมเดล Gemini เช่น `gemini-1.5-flash-latest`) เปิดใช้งานสำหรับโปรเจ็กต์ที่เชื่อมโยงกับ API key ของคุณ
5.  คัดลอก API key ที่สร้างขึ้น คุณจะต้องใช้สิ่งนี้สำหรับส่วนขยาย
6.  **ความปลอดภัย:** เก็บ API key ของคุณเป็นความลับ อย่าเปิดเผยต่อสาธารณะหรือคอมมิตเข้าสู่ระบบควบคุมเวอร์ชันหากคุณจัดการโปรเจ็กต์นี้ด้วย Git

### 2. เตรียมไฟล์ส่วนขยาย

คุณควรมีไฟล์ต่อไปนี้ในโฟลเดอร์โปรเจ็กต์เดียว:

* `manifest.json` (กำหนดค่าส่วนขยาย)
* `popup.html` (UI สำหรับป๊อปอัปของส่วนขยาย)
* `popup.js` (จัดการตรรกะสำหรับป๊อปอัป)
* `content.js` (แทรกเข้าไปในหน้า Google Form เพื่อดึงข้อมูลและกรอก)
* `background.js` (จัดการการเรียก API และการสื่อสาร)
* โฟลเดอร์ `icons` ที่มี:
    * `icon_16.png`
    * `icon_48.png`
    * `icon_128.png`

*(ตรวจสอบให้แน่ใจว่าคุณมีเวอร์ชันล่าสุดของ `content.js` และ `background.js`)*

### 3. โหลดส่วนขยายใน Chrome

1.  เปิด Google Chrome
2.  ไปที่ `chrome://extensions/` ในแถบที่อยู่
3.  เปิดใช้งาน **โหมดนักพัฒนา (Developer mode)** โดยใช้สวิตช์ (โดยทั่วไปจะอยู่ที่มุมบนขวา)
4.  คลิกปุ่ม **"โหลดส่วนขยายที่คลายการแพ็ก (Load unpacked)"** (โดยทั่วไปจะอยู่ที่มุมบนซ้าย)
5.  ในกล่องโต้ตอบไฟล์ที่ปรากฏขึ้น ให้เลือก **โฟลเดอร์** ที่คุณบันทึกไฟล์ส่วนขยายทั้งหมด (`manifest.json`, `popup.html` ฯลฯ)
6.  ส่วนขยาย "Future's Google Form Solver" ควรปรากฏในรายการส่วนขยายของคุณและไอคอนควรปรากฏในแถบเครื่องมือ Chrome **หรือ** ดาวน์โหลดจาก Google Chrome Webstore

## วิธีใช้

1.  **ป้อน API Key:**
    * คลิกที่ไอคอนส่วนขยาย Google Form Solver ในแถบเครื่องมือ Chrome ของคุณ
    * ป๊อปอัปจะปรากฏขึ้น วาง Google Gemini API key ของคุณลงในช่องป้อนข้อมูล "Gemini API Key:"
    * คลิกปุ่ม "Save API Key" คุณควรเห็นข้อความยืนยัน คีย์นี้ถูกจัดเก็บไว้ในเครื่องโดยใช้ `chrome.storage.local`
2.  **ไปที่ Google Form:**
    * เปิด Google Form ใดก็ได้ในแท็บ Chrome ที่คุณต้องการใช้ส่วนขยาย
3.  **เริ่มการแก้ปัญหา:**
    * เมื่อ Google Form เปิดและใช้งานอยู่ ให้คลิกไอคอนส่วนขยายอีกครั้ง
    * คลิกปุ่ม "Start Solving"
    * ส่วนขยายจะ:
        * ดึงคำถามและตัวเลือกจาก Google Form ปัจจุบัน (มองเห็นได้ในบันทึกคอนโซลของ `content.js`)
        * ส่งข้อมูลนี้ไปยังสคริปต์ `background.js`
        * `background.js` จะทำการร้องขอไปยัง Gemini API (มองเห็นได้ในบันทึกคอนโซล service worker ของ `background.js`)
        * เมื่อได้รับคำตอบ `content.js` จะพยายามกรอกคำตอบลงในฟอร์ม
    * การแจ้งเตือนจะปรากฏขึ้นเมื่อการพยายามกรอกข้อมูลเสร็จสมบูรณ์
4.  **ตรวจสอบคำตอบ:**
    * **สำคัญอย่างยิ่ง: ตรวจสอบคำตอบที่ส่วนขยายกรอกเสมอ** คำตอบที่สร้างโดย AI อาจไม่ถูกต้องหรือเหมาะสมเสมอไป
    * ตรวจสอบคอนโซลของนักพัฒนาเบราว์เซอร์ (สำหรับทั้งสคริปต์เนื้อหาในหน้าฟอร์มและ service worker พื้นหลัง) เพื่อหาข้อผิดพลาดหรือบันทึกโดยละเอียด

## โครงสร้างไฟล์

* **`manifest.json`**: ไฟล์กำหนดค่าหลักสำหรับส่วนขยาย Chrome กำหนดสิทธิ์ สคริปต์ ป๊อปอัป ไอคอน ฯลฯ
* **`popup.html`**: โครงสร้าง HTML สำหรับหน้าต่างเล็กๆ ที่ปรากฏขึ้นเมื่อคุณคลิกไอคอนส่วนขยาย ประกอบด้วยช่องป้อน API key และปุ่มควบคุม
* **`popup.js`**: ตรรกะ JavaScript สำหรับ `popup.html` จัดการการบันทึก API key และเริ่มต้นกระบวนการแก้ฟอร์มโดยสื่อสารกับ `content.js`
* **`content.js`**: สคริปต์นี้ถูกแทรกเข้าไปในหน้า Google Form โดยตรง มีหน้าที่:
    * ดึงข้อความคำถาม ตัวเลือก และรูปภาพจาก HTML ของฟอร์ม
    * ส่งข้อมูลที่ดึงมานี้ไปยัง `background.js`
    * รับคำตอบที่ประมวลผลแล้วจาก `background.js` และพยายามกรอกลงในองค์ประกอบฟอร์ม (ปุ่มตัวเลือก, ช่องทำเครื่องหมาย, ช่องข้อความ)
* **`background.js` (Service Worker)**: ทำงานในพื้นหลังโดยไม่ขึ้นกับหน้าเว็บใดๆ มีหน้าที่:
    * รับข้อมูลคำถามที่ดึงมาจาก `content.js`
    * จัดการการแปลงข้อมูลรูปภาพ (ดึง URL เป็น base64)
    * สร้างพรอมต์และทำการเรียก API ไปยัง Google Gemini API
    * ส่งคำตอบที่สร้างขึ้นกลับไปยัง `content.js`
* **โฟลเดอร์ `icons/`**: ประกอบด้วยไอคอนของส่วนขยายสำหรับขนาดต่างๆ ที่แสดงใน UI ของ Chrome

## ข้อควรพิจารณาและข้อจำกัดที่สำคัญ

* **การใช้งานอย่างมีจริยธรรม:** ดังที่กล่าวไว้ข้างต้น โปรดใช้เครื่องมือนี้อย่างมีความรับผิดชอบ อย่าใช้เพื่อการทุจริตทางวิชาการหรือละเมิดข้อกำหนดในการให้บริการ
* **โครงสร้าง Google Forms:** โครงสร้าง HTML ของ Google Forms สามารถเปลี่ยนแปลงได้โดยไม่ต้องแจ้งให้ทราบล่วงหน้า หากเกิดเหตุการณ์นี้ขึ้น ตัวเลือก CSS ใน `content.js` ที่ใช้สำหรับการดึงข้อมูลมีแนวโน้มที่จะใช้งานไม่ได้ และส่วนขยายอาจหยุดทำงานอย่างถูกต้องหรือทั้งหมด นี่คือจุดที่พบบ่อยที่สุดของความล้มเหลวและต้องการการอัปเดตตัวเลือกด้วยตนเอง
* **ค่าใช้จ่ายและโควต้า API:** การใช้ Google Gemini API อาจมีค่าใช้จ่ายขึ้นอยู่กับการใช้งานของคุณและรูปแบบราคาปัจจุบัน โปรดระมัดระวังโควต้าและขีดจำกัดของ API
* **ความทนทานของตัวเลือก (Selector Robustness):** ความแม่นยำในการดึงข้อมูลขึ้นอยู่กับตัวเลือก CSS ใน `content.js` เป็นอย่างมาก สิ่งเหล่านี้ได้รับการปรับปรุงแล้ว แต่อาจยังต้องมีการปรับเปลี่ยนสำหรับรูปแบบฟอร์มที่แตกต่างกันหรือการอัปเดต Google Forms ในอนาคต
* **ความแม่นยำของคำตอบ:** คุณภาพและความแม่นยำของคำตอบขึ้นอยู่กับ Gemini API และความชัดเจนของข้อมูลที่ดึงมาทั้งหมด AI ไม่ได้ถูกต้องเสมอไป
* **เนื้อหาแบบไดนามิก:** ส่วนขยายนี้ออกแบบมาสำหรับฟอร์มที่เนื้อหาส่วนใหญ่โหลดแล้ว ฟอร์มแบบไดนามิกสูงหรือฟอร์มที่โหลดคำถามทีละน้อยอาจเป็นเรื่องท้าทาย
* **ประเภทคำถามที่ซับซ้อน:** แม้ว่าจะพยายามจัดการกับประเภททั่วไป (ปุ่มตัวเลือก, ช่องทำเครื่องหมาย, ข้อความ, ดรอปดาวน์, รูปภาพ) แต่ประเภทคำถามที่ซับซ้อนมากหรือกำหนดเองภายใน Google Forms อาจไม่ได้รับการสนับสนุน

## การแก้ไขปัญหา

* **"ไม่พบ API Key"**: ตรวจสอบให้แน่ใจว่าคุณได้บันทึก API key ของคุณอย่างถูกต้องผ่านป๊อปอัปของส่วนขยาย
* **"เกิดข้อผิดพลาดในการสื่อสารกับพื้นหลัง: พอร์ตข้อความปิดก่อนที่จะได้รับการตอบกลับ..."**: สิ่งนี้สามารถเกิดขึ้นได้หาก `background.js` พบข้อผิดพลาดที่ไม่ได้รับการจัดการหรือไม่ตอบกลับ ตรวจสอบคอนโซล service worker พื้นหลังเพื่อหาข้อผิดพลาด
* **คำถาม/ตัวเลือก ไม่ได้ถูกดึงข้อมูลอย่างถูกต้อง**:
    * เปิด Developer Tools ในหน้า Google Form (คลิกขวา -> Inspect -> Console)
    * มองหาบันทึกจาก `content.js` โดยเฉพาะคำเตือนเกี่ยวกับ "ไม่สามารถดึงข้อความคำถาม" หรือ "ไม่มีการดึงตัวเลือก"
    * คอนโซลมักจะบันทึก HTML ของบล็อกที่มีปัญหา ซึ่งคุณสามารถใช้เพื่ออัปเดตตัวเลือกใน `content.js`
* **ไม่มีการกรอกคำตอบ / คำตอบไม่ถูกต้อง**:
    * ตรวจสอบคอนโซล service worker พื้นหลังเพื่อหาข้อผิดพลาด API หรือการตอบกลับที่ไม่คาดคิดจาก Gemini
    * ตรวจสอบพรอมต์ที่ส่งไปยัง API
    * ตรรกะใน `content.js` สำหรับการจับคู่ข้อความคำตอบของ Gemini กับตัวเลือกฟอร์มอาจต้องมีการปรับปรุงหากการใช้ถ้อยคำของ Gemini แตกต่างจากข้อความตัวเลือกเล็กน้อย

ด้วยการทำความเข้าใจในประเด็นเหล่านี้ คุณจะสามารถใช้งาน บำรุงรักษา และแก้ไขปัญหาส่วนขยาย Google Form Solver ได้ดียิ่งขึ้น

---

### ข้อจำกัดความรับผิดชอบ (DISCLAIMER)

**ผมไม่มีส่วนเกี่ยวข้องหรือรับผิดชอบต่อการนำส่วนขยายนี้ไปใช้งานในทางใดๆ ผมไม่สนับสนุนการทุจริตในทุกรูปแบบ นอกจากนี้ ผมจะไม่รับผิดชอบต่อคะแนนที่ไม่ดีหรือความไม่ถูกต้องใดๆ ที่เกิดจากส่วนขยาย เนื่องจากนั่นเป็นผลมาจาก Google Gemini ไม่ใช่ตัวผม**
