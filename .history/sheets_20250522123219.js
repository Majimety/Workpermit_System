const SHEET_ID = "1fdjeUEfPqYFQQrhXQ8xtK0YFttL986zmJ8CcoCcZk1c";
const { google } = require("googleapis");

function formatThaiDate(dateStr) { //แก้วันเป็นแบบสากลไทยตัวอย่าง(21 พ.ค. 2568)
  if (!dateStr) return "";

  const date = new Date(dateStr);
  if (isNaN(date)) return "";

  const thaiMonthsShort = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const day = date.getDate();
  const month = thaiMonthsShort[date.getMonth()];
  const year = date.getFullYear() + 543; //เปลี่ยนเป็นพุทธศักราช

  return `${day} ${month} ${year}`;
}

function formatThaiTime(timeStr) {
  if (!timeStr) return "";

  const [hour, minute] = timeStr.split(":");
  if (!hour || !minute) return "";

  return `${hour}.${minute}`;
}

async function getSheetData(auth, rowNumber = 2) {
  const sheets = google.sheets({ version: "v4", auth });

  const range = `'Permit Form'!A${rowNumber}:AB${rowNumber}`;
  console.log("Fetching range:", range);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) throw new Error("No data found.");

  const values = rows[0];

  return {
    FORM_SUBSTATION: values[2] || "",
    FORM_ST_IN: values[4] || "",
    FORM_ST_OUT: values[8] || "",
    FORM_SV1: values[5] || "",
    FORM_SV2: values[9] || "",
    FORM_P_SV1: values[6] || "",
    FORM_P_SV2: values[10] || "",
    FORM_NUMWORK: values[11] || "",
    FORM_STDATE: formatThaiDate(values[15]) || "", // Example 21 พ.ค. 2568
    FORM_ENDDATE: formatThaiDate(values[17]) || "",
    FORM_STTIME: values[16] || "",  // แก้เวลาจาก 13:44:06 เป็น 13.44
    FORM_ENDTIME: values[18] || "",
    FORM_SUMDAY: values[19] || "",
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
