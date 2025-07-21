function formatThaiDate(dateStr) {//แก้วันเป็นแบบสากลไทย
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  const thaiMonthsShort = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${date.getDate()} ${thaiMonthsShort[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function formatThaiTime(timeStr) {//เปลี่ยน ค.ศ. -> พ.ศ.
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":");
  return hour && minute ? `${hour}.${minute}` : "";
}

function sanitizeFilename(name) {//ป้องกันไม่ให้ชื่อไฟล์มีอักขระต้องห้าม
  return name.replace(/[<>:"/\\|?*\s]+/g, "_");
}

function formatSafeThaiDateTimeForFilename(date = new Date()) {//แปลง timestamp to human date/time สำหรับไฟล์ทุกประเภท
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear() + 543;

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`;
}

function getValue(row, index, fallback = "") {//ดึงค่าคอลัมน์ที่ x จากแถว row ใน sheets
  return row?.[index] ?? fallback;
}

function getMatchedValue(str) {//แยกเอาค่าที่อยู่ในวงเล็บ () ออกจาก string""
  return (str?.match(/\(([^)]+)\)/)?.[1] || "").trim();
}

function getAfterParenthesis(str) {//คืนค่าข้อความหลัง )
  return (str?.split(")").pop() || "").trim();
}

const fs = require('fs');
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

const { createLogger, format, transports } = require('winston');
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/app.log' }) // ตรงนี้จะไม่ error แล้ว
  ]
});

const getCurrentDate = () => new Date().toISOString();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getSignatureUrlByName(name) {
  const signatureMap = {
    "นายสาธิน ผาสุข": "https://drive.google.com/uc?export=view&id=1sVhQ2IEpK78R7NmmR0DccNJIzT8zzdUs",
    "นายประเสริฐศักดิ์ เหลือวงศ์": "https://drive.google.com/uc?export=view&id=1KXA9o3q_UN1tnlfF-iz0mX9l_xM9Q1qi",
    "นางสาวระพิกร นนท์จุมจัง": "https://drive.google.com/uc?export=view&id=1ZNefyo6vMCLUHF67rmAmuS0zYIW1KG_y"
    // เพิ่มชื่อคนอื่น ๆ
  };

  const url = signatureMap[name];
  
  if (url) {
    logger.info(`Found signature URL for "${name}": ${url}`);
  } else {
    logger.warn(`Signature URL not found for name: ${name}`);
  }

  return url || "";
}

function removeTitle(name) {// ตัดคำนำหน้า
  if (typeof name !== 'string') return '';

  const titles = ['นาย', 'นางสาว', 'นาง'];
  for (const title of titles) {
    if (name.startsWith(title)) {
      return name.slice(title.length).trim(); 
    }
  }
  return name;
}

module.exports = {
  formatThaiDate,
  formatThaiTime,
  sanitizeFilename,
  formatSafeThaiDateTimeForFilename,
  getValue,
  getMatchedValue,
  getAfterParenthesis,
  logger,
  getCurrentDate,
  sleep,
  getSignatureUrlByName,
  removeTitle
};