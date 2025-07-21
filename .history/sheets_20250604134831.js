require("dotenv").config();
const { google } = require("googleapis");
const {
  formatThaiDate,
  formatThaiTime,
  getValue,
  getMatchedValue,
  getAfterParenthesis,
  logger,
  getSignatureUrl
} = require("./utils");

const SHEET_ID = process.env.SHEET_ID;

async function getSheetData(auth, rowNumber = 2) {
  const sheets = google.sheets({ version: "v4", auth });
  const range = `'CREATE PDF Form'!A${rowNumber}:AT${rowNumber}`;
  logger.info(`Fetching sheet data from range: ${range}`);

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  const row = data.values?.[0];
  if (!row) {
    logger.error("No data found in sheet.");
    throw new Error("No data found.");
  }

  const startDateRaw = getValue(row, 19);
  const endDateRaw = getValue(row, 21);
  const dateExecutiveRaw = getValue(row, 34);

  const startDate = new Date(startDateRaw);
  const endDate = new Date(endDateRaw);
  const diffTime = endDate - startDate;
  const diffDays = isNaN(diffTime) ? "" : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return {
    WP_NUM: getValue(row, 0),
    WP_YEAR: formatThaiDate(new Date(dateExecutiveRaw)).replace(/ /g, "/"),
    FORM_SUBSTATION: getValue(row, 3),
    FORM_ST_IN1: getValue(row, 4),
    FORM_SV1: getValue(row, 6),
    FORM_P_SV1: getValue(row, 7),
    FORM_ST_IN2: getValue(row, 8),
    FORM_SV2: getValue(row, 9),
    FORM_P_SV2: getValue(row, 10),
    FORM_ST_OUT: getValue(row, 12),
    FORM_SV_OUT: getValue(row, 13),
    FORM_P_OUT: getValue(row, 14),
    FORM_NUMWORK: getValue(row, 15),
    FORM_STDATE: formatThaiDate(startDateRaw),
    FORM_ENDDATE: formatThaiDate(endDateRaw),
    FORM_STTIME: formatThaiTime(getValue(row, 20)),
    FORM_ENDTIME: formatThaiTime(getValue(row, 22)),
    FORM_SUMDAY: diffDays,
    FORM_DETAIL1: getValue(row, 24),
    FORM_COMMENT1: getValue(row, 25),
    FORM_DETAIL2: getValue(row, 27),
    FORM_COMMENT2: getValue(row, 28),
    FORM_DETAIL3: getValue(row, 29),
    FORM_COMMENT3: getValue(row, 30),
    FORM_DETAIL4: getValue(row, 31),
    FORM_COMMENT4: getValue(row, 32),
    FORM_CB_SUBSTATION: getValue(row, 17) === "Substation",
    FORM_CB_UNMANSUBSTATION: getValue(row, 17) === "Unmanned Substation",
    FORM_CB_AGENCY: true,
    FORM_CB_EXTERNALAGENCY: getValue(row, 11) === "TRUE",
    FORM_CB_EXTINGUISH: ["ดับไฟปฏิบัติงาน", "ไม่ดับไฟปฏิบัติงาน , ดับไฟปฏิบัติงาน"].includes(getValue(row, 16)),
    FORM_CB_NOEXTINGUISH: ["ไม่ดับไฟปฏิบัติงาน", "ไม่ดับไฟปฏิบัติงาน , ดับไฟปฏิบัติงาน"].includes(getValue(row, 16)),
    FORM_CB_PLAN: getValue(row, 18) === "นอกแผน",
    FORM_CB_NOPLAN: getValue(row, 18) === "ตามแผน",
    FORM_CB_EMERGENCY: getValue(row, 18) === "กรณีฉุกเฉิน (ศูนย์ฯ พิจารณา)",
    EXECUTIVE_TEMP: formatThaiDate(dateExecutiveRaw).replace(/ /g, " / "),
    FORM_EXECUTIVE: getValue(row, 35),
    FORM_EXECUTIVE_VACANCY: getValue(row, 36),
    FORM_RECIPIENT: getMatchedValue(getValue(row, 37)),
    FORM_RECIPIENT_VACANCY: getAfterParenthesis(getValue(row, 37)),
    FORM_CB_ACCEPT: getValue(row, 38) === "TRUE",
    FORM_CB_DENY: getValue(row, 38) === "FALSE",
    FORM_DENY_CAUSE: getValue(row, 39),
    FORM_TO_SIGNER: getValue(row, 36) ? "อ" + getValue(row, 36).substring(1) : "",
    FORM_APPROVED: getValue(row, 40),
    FORM_UNITS: getValue(row, 41),
    FORM_SIGNER: getMatchedValue(getValue(row, 42)),
    FORM_SIGNER_VACANCY: getValue(row, 42)?.replace(/\([^)]+\)/, "").trim() || "",
    PERFORMANCE_REPORT: getValue(row, 43),
    FORM_PPSTAFF: getValue(row, 44),
    FORM_PPSTAFF_VACANCY: getValue(row, 45),
    SIGNATURE_RECIPIENT: 
  };
}

async function deleteOldFileIfExists(authClient, rowNumber) {
  const sheets = google.sheets({ version: "v4", auth: authClient });
  const range = `CREATE PDF Form!AH${rowNumber}`;
  logger.info(`Checking for existing file at ${range}`);

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range,
    });

    const existingUrl = res.data.values?.[0]?.[0];
    if (existingUrl?.includes("drive.google.com")) {
      const match = existingUrl.match(/\/d\/([a-zA-Z0-9_-]+)\//);
      const oldFileId = match?.[1];

      if (oldFileId) {
        const drive = google.drive({ version: "v3", auth: authClient });
        try {
          await drive.files.delete({ fileId: oldFileId });
          logger.info(`Deleted old file: ${oldFileId}`);
        } catch (err) {
          if (err.code === 404) {
            logger.warn(`File not found (already deleted): ${oldFileId}`);
          } else {
            logger.error(`Failed to delete file ${oldFileId}: ${err.message}`);
          }
        }
      } else {
        logger.warn(`Could not extract file ID from URL: ${existingUrl}`);
      }
    } else {
      logger.info(`No file to delete for row ${rowNumber}`);
    }
  } catch (err) {
    logger.error(`Error reading sheet for old file: ${err.message}`);
  }
}

async function updateSheetWithUrl(authClient, rowNumber, url) {
  const sheets = google.sheets({ version: "v4", auth: authClient });
  logger.info(`Updating sheet at row ${rowNumber} with URL: ${url}`);
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range: `CREATE PDF Form!AH${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [[url]] },
  });
  logger.info(`Sheet updated successfully at row ${rowNumber}`);
}

module.exports = { 
  getSheetData, 
  deleteOldFileIfExists,
  updateSheetWithUrl
};
