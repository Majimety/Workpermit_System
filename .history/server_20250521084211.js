const express = require('express');
const { getSheetData } = require('./sheets');
const { createPdf } = require('./pdf');
const { uploadToDrive } = require('./drive');
const { google } = require('googleapis');

const app = express();
app.use(express.json());

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets.readonly'],
});

app.post('/sheet-updated', async (req, res) => {
  try {
    const client = await auth.getClient();
    const data = await getSheetData(client);
    const pdfPath = await createPdf(data);
    const fileId = await uploadToDrive(client, pdfPath);

    console.log('Uploaded PDF to Google Drive with ID:', fileId);
    res.status(200).send('Success');
  } catch (error) {
    console.error('Error processing update:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => console.log('Server listening on port 3000'));
