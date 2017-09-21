// Global Vars
var spreadSheet = SpreadsheetApp.openById('1wClvPHRd4YSdvJrGlLBlBvd5JqhizFdhO6tWeHn1eUo');
var sheet = spreadSheet.getSheetByName('data_2');
var config_sheet = spreadSheet.getSheetByName('config');
var cal_id = 'q3qhk29ni908mhhrrvrha1lfq0@group.calendar.google.com'; // Dev
//var cal_id = 'nbqhislsj9vvnp8h6tb52dsq6c@group.calendar.google.com'; // Live

function dev() {

	var json = sheet.getRange(5, 1).getValue();
	writeData(json);

}

function dev_2() {

	var json = Read();
	sheet.getRange(7, 1).setValue(json);	

}

// Accessible Functions
function Read() {

	// Groups
	var groups_length = config_sheet.getRange(1, 1).getValue();
	var groups_array = sheet.getRange(1, 1, 1, groups_length).getValues();
	var groups_json = groups_array.join('');

	// Events
	var events_length = config_sheet.getRange(2, 1).getValue();
	var events_array = sheet.getRange(2, 1, 1, events_length).getValues();
	var events_json = events_array.join('');

	// Transactions
	var transactions_length = config_sheet.getRange(3, 1).getValue();
	var transactions_array = sheet.getRange(3, 1, 1, transactions_length).getValues();
	var transactions_json = transactions_array.join('');

	// Payments
	var payments_length = config_sheet.getRange(4, 1).getValue();
	var payments_array = sheet.getRange(4, 1, 1, payments_length).getValues();
	var payments_json = payments_array.join('');

	// Create object
	var object = {
		groups: JSON.parse(groups_json),
		events: JSON.parse(events_json),
		transactions: JSON.parse(transactions_json),
		payments: JSON.parse(payments_json)
	};

	var json = JSON.stringify(object);
	return json;

}

function Read_2(time) {

	var server_time = config_sheet.getRange(5, 1).getValue();
	if (time === server_time) { // Is the same state
		var response_json = response({response: true});
		return response_json;
	} else { // Isn't the same state
		var json = Read();
		var response_object = {
			ease: JSON.parse(json),
			time: server_time,
			response: false
		}
		return JSON.stringify(response_object);
	}

}

function Write(json) {

	// Check timestamps
	var object = JSON.parse(json);
	var server_time = config_sheet.getRange(5, 1).getValue();
	if (object.time === null) { // new instance of client

		writeData(json);
		var client_time = new Date().getTime();
		config_sheet.getRange(5,1).setValue(client_time);
		var response_json = response({response:true, time:client_time});
		return response_json;

	} else if (object.time === server_time) { // is the same state as the client

		writeData(json);
		var response_json = response({response:true, time: object.time});
		return response_json;

	} else if (object.time !== server_time) { // isn't the same state as the client

		var new_json = merge(json, Read()); // Create a new json string from new + old data
		writeData(new_json);
		var client_time = new Date().getTime();
		var response_json = response({response:true, time:client_time});
		return response_json;

	}

}

function merge(json_1, json_2) {

	var object_1 = JSON.parse(json_1);
	var object_2 = JSON.parse(json_2);

	object_1.groups = object_1.groups.concat(object_2.groups);
	object_1.events = object_1.events.concat(object_2.events);
	object_1.transactions = object_1.transactions.concat(object_2.transactions);
	object_1.payments = object_1.payments.concat(object_2.payments);

	return JSON.stringify(object_1);

}

function response(object) {
	return JSON.stringify(object);
}

function writeData(json) {

	var object = JSON.parse(json);

	var checkLength = function(json, length, index) {
		if (length > 50000) {
			var array = [];
			for (var i = 0; i < length; i += 50000) {
				var temp = json.substring(i, (i + 50000));
				if (temp.charAt(0) === ',') { // find ghost comma
					temp = temp.substring(1, temp.length);
				}
				array.push(temp);
				config_sheet.getRange(1, 5).setValue(i);
			}
			config_sheet.getRange(index, 1).setValue(i / 50000);
			return array;
		} else {
			config_sheet.getRange(index, 1).setValue(1);
			return [json];
		}
	}

	// Groups
	var groups = object.groups;
	var groups_json = JSON.stringify(groups);
	var groups_length = groups_json.length;
	var groups_array = checkLength(groups_json, groups_length, 1);
	sheet.getRange(1, 1, 1, groups_array.length).setValues([groups_array]);

	// Events
	var events = object.events;
	var events_json = JSON.stringify(events);
	var events_length = events_json.length;
	var events_array = checkLength(events_json, events_length, 2);
	sheet.getRange(2, 1, 1, events_array.length).setValues([events_array]);

	// Transactions
	var transactions = object.transactions;
	var transactions_json = JSON.stringify(transactions);
	var transactions_length = transactions_json.length;
	var transactions_array = checkLength(transactions_json, transactions_length, 3);
	sheet.getRange(3, 1, 1, transactions_array.length).setValues([transactions_array]);

	// Payments
	var payments = object.payments;
	var payments_json = JSON.stringify(payments);
	var payments_length = payments_json.length;
	var payments_array = checkLength(payments_json, payments_length, 4);
	sheet.getRange(4, 1, 1, payments_array.length).setValues([payments_array]);

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

 	var calendar = CalendarApp.getCalendarById(cal_id);
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

// Edit event
function editEvent(json) {

	var object = JSON.parse(json);

	var calendar = CalendarApp.getCalendarById(cal_id);
	var event = findEvent(calendar, object);
	if (event !== false) { // event was found!
		event.setTime(new Date(object.new_start), new Date(object.new_end));
		var object = {
			response: true
		};
		var json = JSON.stringify(object);
		return json;
	} else { // event wasn't found
		var object = {
			response: false
		};
		var json = JSON.stringify(object);
		return json;
	}

}

// Remove event
function removeEvent(json) {

	var object = JSON.parse(json);

	var calendar = CalendarApp.getCalendarById(cal_id);
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