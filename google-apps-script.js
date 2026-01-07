const SHEET_ID = '15VrbrEp4Z_hAgKZNJ1UMQ4JrJLd8Vbkh-ED7MICfXTE';

// Email addresses to receive notifications
const EMAIL_1 = 'diana_maria_erika@yahoo.com';
const EMAIL_2 = 'madalingarbeagabriel@gmail.com';
const EMAIL_3 = 'aerika04@yahoo.com'; 

function doPost(e) {
  try {
    if (SHEET_ID === 'YOUR_SHEET_ID' || !SHEET_ID) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Sheet ID not configured. Please set SHEET_ID in the script.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    } catch (error) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Cannot access spreadsheet. Check Sheet ID and sharing.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = spreadsheet.getActiveSheet();

    let data = {};
    if (e.parameter && Object.keys(e.parameter).length > 0) {
      data = e.parameter;
    } else if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (_) {
        data = e.parameter || {};
      }
    }

    const rowData = [
      new Date(),
      (data.name || '').toString(),
      (data.attending || '').toString(),
      (data.details || '').toString(),
      (data.attendance || '').toString()
    ];

    sheet.appendRow(rowData);

    try {
      sendEmailNotification(data);
    } catch (_) {}

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendEmailNotification(data) {
  // Safety check: ensure data exists
  if (!data || typeof data !== 'object') {
    data = {};
  }

  const emailAddresses = [EMAIL_1, EMAIL_2, EMAIL_3].filter(
    email => email && email.trim() !== '' && !email.includes('example.com')
  );

  if (emailAddresses.length === 0) return false;

  const attendanceText =
    (data.attendance === 'yes')
      ? 'Da, confirm prezența'
      : 'Nu pot să particip';

  const subject = '🎉 Nouă confirmare - ' + (data.name || 'Invitat');

  const body = `
Ceaules!

Ați primit un nou raspuns pentru nuntă aia bengoasa.

📋 Detalii confirmare:

👤 Nume: ${data.name || 'N/A'}
👥 Număr persoane: ${data.attending || 'N/A'}
✅ Confirmare prezență: ${attendanceText}
${data.details ? '💬 Mesaj: ' + data.details : ''}


Va puuup,
IERI.SRL
  `.trim();

  MailApp.sendEmail({
    to: emailAddresses.join(','),
    subject,
    body
  });

  return true;
}
