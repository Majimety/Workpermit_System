require("dotenv").config();
const { google } = require("googleapis");
const { formatThaiDate, formatThaiTime } = require("./utils");

const SHEET_ID = process.env.SHEET_ID;

async function getSheetData(auth, rowNumber = 2) {
  const sheets = google.sheets({ version: "v4", auth });
  const range = `'Permit Form'!A${rowNumber}:AE${rowNumber}`;
  console.log("Fetching range:", range);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) throw new Error("No data found.");

  const values = rows[0];
  const startDateRaw = values[15];
  const endDateRaw = values[17];

  const startDate = new Date(startDateRaw);
  const endDate = new Date(endDateRaw);

  const diffTime = endDate - startDate;
  const diffDays = isNaN(diffTime) ? "" : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return {
    FORM_SUBSTATION: values[2] || "",
    FORM_ST_IN: values[4] || "",
    FORM_ST_OUT: values[8] || "",
    FORM_SV1: values[5] || "",
    FORM_SV2: values[9] || "",
    FORM_P_SV1: values[6] || "",
    FORM_P_SV2: values[10] || "",
    FORM_NUMWORK: values[11] || "",
    FORM_STDATE: formatThaiDate(startDateRaw),
    FORM_ENDDATE: formatThaiDate(endDateRaw),
    FORM_STTIME: formatThaiTime(values[16]),
    FORM_ENDTIME: formatThaiTime(values[18]),
    FORM_SUMDAY: diffDays,
    FORM_DETAIL1: values[20] || "",
    FORM_COMMENT1: values[21] || "",
    FORM_DETAIL2: values[23] || "",
    FORM_COMMENT2: values[24] || "",
    FORM_DETAIL3: values[25] || "",
    FORM_COMMENT3: values[26] || "",
    FORM_DETAIL4: values[27] || "",
    FORM_COMMENT4: values[28] || "",
    FORM_DETAIL5: values[29] || "",
    FORM_COMMENT5: values[30] || "",
  };
}

module.exports = { getSheetData };
