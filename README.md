# 🛠️ Work Permit System

**Work Permit System** is an automated workflow tool that integrates Google Sheets, generates PDF forms via the iText DITO API, uploads them to Google Drive, shares public links, and writes those links back into the Sheet—all triggered seamlessly by webhook events.

---

## 🔗 Features

- ✅ Read and write data from Google Sheets
- ✅ Generate PDF using iText DITO (template-based API)
- ✅ Upload PDF to Google Drive
- ✅ Automatically share the file (Anyone with the link can view)
- ✅ Update the original Google Sheet with the public link
- ✅ Triggered by Google Apps Script on form edit

---

## 📁 Project Structure

work-permit-system/
├── index.js # Main Express server - receives webhook from Apps Script
├── sheets.js # Interacts with Google Sheets API
├── pdf.js # Generates PDF from sheet data using iText DITO
├── drive.js # Uploads and shares files to Google Drive
├── utils.js # Utility functions (file naming, data handling, etc.)
├── credential.json # Google Service Account credentials (keep this secure)
├── output/ # Temporary storage for generated PDFs
└── README.md

---

## ⚙️ Technology Stack

| Tool / Library          | Purpose                              |
|-------------------------|--------------------------------------|
| **Node.js**             | Backend server                       |
| **Express.js**          | REST API to receive webhook requests |
| **Google Sheets API**   | Read & write spreadsheet data        |
| **Google Drive API**    | Upload and share PDFs                |
| **iText DITO API**      | Generate PDF via REST API            |
| **Google Apps Script**  | Trigger webhooks on sheet changes    |

---

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-org/work-permit-system.git
cd work-permit-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add credential.json
- Go to Google Cloud Console
- Create a Service Account
- Enable Google Sheets and Google Drive APIs
- Generate a JSON key and save it as credential.json in the root folder
- Share your Google Sheet and target Drive folder with the Service Account email

### 4. Setup Google Apps Script Trigger
In your Google Sheet, add a script like this:
```bash
function onChange(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CREATE PDF Form");
  if (!sheet) return;

  const changeType = e.changeType;
  if (changeType !== 'EDIT') return;

  const range = sheet.getActiveRange();
  if (!range) return;

  const row = range.getRow();
  const column = range.getColumn();

  if (row < 2 || column < 1 || column > 29) return;

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ triggerRow: row }),
  };

  UrlFetchApp.fetch("https://your-server.com/sheet-updated", options);
}
```
Replace https://your-server.com/sheet-updated with your actual server or ngrok endpoint.

### 5. Run the server
```bash
node index.js
```

### 6. Test the Workflow
- Edit a row in the "CREATE PDF Form" sheet
- The system will generate a PDF → upload to Google Drive → return the shared link → write it back into the sheet

### 🛡️ Security Notes
Never commit credential.json to the repository (add it to .gitignore)

Use HTTPS or ngrok with an auth token in production

Add retries and error handling for network/API failures
