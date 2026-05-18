// Google Apps Script — paste this into script.google.com
// Linked to a Google Sheet. Appends one row per contact form submission.
//
// SETUP (one-time):
// 1. Create a new Google Sheet (name it e.g. "Konfigurator – upiti")
// 2. Open Extensions > Apps Script
// 3. Paste this entire file, save (Ctrl+S)
// 4. Click Deploy > New deployment > Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the deployment URL
// 6. Add it to .env.local:  GOOGLE_SHEETS_SCRIPT_URL=<paste URL here>
// 7. Restart the dev server (or redeploy to production)
//
// The sheet will auto-create a header row on the first submission.
// Add a "Dogovoreno?" column manually after the header and fill it in
// as you close deals — that's how you track your conversion rate.

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Vreme', 'Ime', 'Telefon', 'Email', 'Grad',
        'Proizvod', 'Tip', 'Materijal', 'Profil',
        'Širina (mm)', 'Visina (mm)',
        'Komarnik', 'Roletna', 'Okapnica', 'Pod-prozorska', 'Montaža',
        'Ukupno (€)', 'Dogovoreno?',
      ])
    }

    sheet.appendRow([
      data.timestamp ? new Date(data.timestamp).toLocaleString('sr-RS') : new Date().toLocaleString('sr-RS'),
      data.name || '',
      data.phone || '',
      data.email || '',
      data.city || '',
      data.product || '',
      data.type || '',
      data.material || '',
      data.profile || '',
      data.width || '',
      data.height || '',
      data.komarnik ? 'Da' : 'Ne',
      data.roletna ? 'Da' : 'Ne',
      data.okapnica ? 'Da' : 'Ne',
      data.podprozorska ? 'Da' : 'Ne',
      data.montaza ? 'Da' : 'Ne',
      data.total !== '' ? Number(data.total) : '',
      '',  // "Dogovoreno?" — fill in manually
    ])

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}
