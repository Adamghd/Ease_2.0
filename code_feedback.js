// Global Vars
var sheet = SpreadsheetApp.openById('1aquKD90j5eMf85s4feG-eR3Za-VGHEAGuhuckDks9Qg'); // Get sheet doc
var feedbackSheet = sheet.getSheetByName('Form Responses 1'); // Get info sheet

function main() {

  return HtmlService.createTemplateFromFile('index').evaluate().setTitle('Teacher Feedback');

}

function doGet(e) {

  return HtmlService.createTemplateFromFile('index').evaluate().setTitle('Teacher Feedback');

}

function test() {

	sendEmail('gallaghersam95@gmail.com');

}

function sendEmail(email) {

 	MailApp.sendEmail(email, 'UWM Planetarium Party Feedback', 'Testing this feature');

}

function getFeedbackData() {

  // Get feedback data
  var row_count = feedbackSheet.getLastRow();
  var col_count = feedbackSheet.getLastColumn();

  var data = feedbackSheet.getRange(2, 1, row_count, col_count).getValues(); // [ [], ... ]

  return JSON.stringify(data);

}

function include(filename) {

  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();

}