// Global Vars
var spreadSheet = SpreadsheetApp.openById('1wClvPHRd4YSdvJrGlLBlBvd5JqhizFdhO6tWeHn1eUo');
var sheet = spreadSheet.getSheetByName('data');

// Accessible Functions
function Read() {

	var json = sheet.getRange(1, 1).getValue();
	return json;

}

function Write(json) {

	sheet.getRange(1, 1).setValue(json);
	return true;

}

// Primary function
function doGet() {

	return HtmlService.createTemplateFromFile('index').evaluate().setTitle('Ease');

}

// HTML functions
function include(filename) {

  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();

}

// Create Event Function
function createEvent(json) {
  
 	var object = JSON.parse(json);

 	var calendar = CalendarApp.getCalendarById('q3qhk29ni908mhhrrvrha1lfq0@group.calendar.google.com');
 	var event = calendar.createEvent(
 		object.group.groupName + " - " + object.group.groupType,
 		new Date(object.event_DATA.calEvent.calStart),
 		new Date(object.event_DATA.calEvent.calEnd)
 	);
 	var id = event.getId();
 	object.event_DATA.calEvent.eventID = id;
 	var res = {
 		response: true,
 		id: id,
 		event_DATA: object.event_DATA
 	};
 	var json = JSON.stringify(res);
 	return json;
  
}

// Remove event
function removeEvent(json) {

	var object = JSON.parse(json);

	var calendar = CalendarApp.getCalendarById('q3qhk29ni908mhhrrvrha1lfq0@group.calendar.google.com');
	var event = findEvent(calendar, object);
	if (event !== false) { // event was found!
		event.deleteEvent();
		var object = {
			response: true
		}
		var json = JSON.stringify(object);
		return json;
	} else { // event wasn't found
		var object = {
			response: false
		}
		var json = JSON.stringify(object);
		return json;
	}

}

// Find a calendar event
function findEvent(calendar, object) {

	var events = calendar.getEvents(new Date(object.start), new Date(object.end));
	for (var i = 0; i < events.length; i++) {
		var id = events[i].getId();
		if (events[i].getId() === object.event_id) {
			return events[i];
		}
	}
	return false;

}

// Create Invoice Function
function createInvoice(json) {

	var object = JSON.parse(json);

	var folder = DriveApp.getFolderById('0B-u8AnaoQYgrQ1dPNnFoTEZYOEE'); // get archives folder
	var template = DriveApp.getFileById('1wvUpCYHmpVDK0d7BvhWsh9wWzYNxfUqMZbyND1pBES4'); // get template document
	var newID = template.makeCopy(object.name + "_" + object.calEvent + "_invoice", folder).getId(); // make new copy
	var file = DocumentApp.openById(newID);	 // open file
	var body = file.getBody(); // get body of document

	var replace = function(field, value) {
		body.replaceText("{" + field + "}", value);
	}

	for (var field in object) {

		replace(field, object[field]);

	}

	var current_date = new Date().toDateString();

	replace('current_date', current_date);

	var url = file.getUrl();


	// Create response object
	var object = {
		html: "<a href='" + url + "' target='_blank'>To Invoice</a>"
	}

	// stringify to json
	var json = JSON.stringify(object);

	return json;

}

// Jean Schedule Function
function getJeansSchedule() {

	// Get raw data from google
	var calendar = CalendarApp.getCalendarById('jeanmcreighton@gmail.com');
	var month = 2600000000;
	var current_date = new Date();
	var past_date = new Date(current_date.getTime() - month);
	var future_date = new Date(current_date.getTime() + month);
	var google_events = calendar.getEvents(past_date, future_date);

	var subtractFiveHours = function(date) {
		date.setTime(date.getTime() - (5*60*60*1000));
		return date;
	}

	// Transpose data into FullCalendar format
	var events = [];
	for (var i = 0; i < google_events.length; i++) {

		var object = {
			title: google_events[i].getTitle(),
			start: subtractFiveHours(google_events[i].getStartTime()),
			end: subtractFiveHours(google_events[i].getEndTime()),
			color: 'green'
		}

		events.push(object);

	}

	return JSON.stringify(events);

}