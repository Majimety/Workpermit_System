function formatThaiDate(dateStr) {//แก้วันเป็นแบบสากลไทย
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  const thaiMonthsShort = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${date.getDate()} ${thaiMonthsShort[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function formatThaiTime(timeStr) {//เปลี่ยนเป็นพุทธศักราช
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":");
  return hour && minute ? `${hour}.${minute}` : "";
}

function sanitizeFilename(name) {//ป้องกันไม่ให้ชื่อไฟล์มีอักขระต้องห้าม
  return name.replace(/[<>:"/\\|?*\s]+/g, "_");
}

module.exports = { formatThaiDate, formatThaiTime, sanitizeFilename };
