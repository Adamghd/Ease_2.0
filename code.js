// Global Vars
var presenting_staff_calendar = CalendarApp.getCalendarById('493o9l8a968b0k1thm49ll71pc@group.calendar.google.com');
var non_presenting_staff_calendar = CalendarApp.getCalendarById('h83hlksd8o8eamj0hj3fp8s9sk@group.calendar.google.com');
var cal_id = 'q3qhk29ni908mhhrrvrha1lfq0@group.calendar.google.com'; // Dev
//var cal_id = 'nbqhislsj9vvnp8h6tb52dsq6c@group.calendar.google.com'; // Live

function response(object) {
	return JSON.stringify(object);
}

function getProfile() {

  var user_email = Session.getActiveUser().getEmail();
  //var auth = GetAuthorization(user_email);
  var auth = true;
  return response({response:true,email:user_email,authorization:auth});

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

// Gmail Function
function gmail(email, subject, body) {

	GmailApp.sendEmail(email, subject, body);
	return true;

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

function dev() {

	var json = {"id":60,"name":"Scouting Event","calEvent":"Sat, Oct 7th @ 10:00 am - 5:00 pm","group":"","workPhone":"","cellPhone":"","activity":'None',"show":"","price":"0","numOfPeople":"","email":"","grade":"None"};

	var ret = createInvoice(JSON.stringify(json));

}

// Create Invoice Function
function createInvoice(json) {

	var object = JSON.parse(json);

	var folder = DriveApp.getFolderById('0B-u8AnaoQYgrQ1dPNnFoTEZYOEE'); // get archives folder
	var template = DriveApp.getFileById('1kZICuh44fu3F5yLCFBZHyIE2O058LPjcRNE7hV1cbyg'); // get template document
	var newID = template.makeCopy(object.name + "_" + object.calEvent + "_invoice", folder).getId(); // make new copy
	var file = DocumentApp.openById(newID);	 // open file
	var body = file.getBody(); // get body of document

	var replace = function(field, value) {
      	if (value === null) {
      		value = ' ';
      	}
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
		url: url,
		id: object.id,
		response: true
	}

	// stringify to json
	var json = JSON.stringify(object);

	return json;

}

function getSchedulingEvents() {

	var jean = getJeansSchedule();
	var events = getPresentingSchedules();
	var object = {
		calendar_title: "Jean",
		events: jean
	};
	events.push(object);
	return JSON.stringify(events);

}

function getPresentingSchedules() {

  // Get current date
  var date = new Date();
  
  // Get date 6 months ago
  var six_months_ms = 15778476000;
  var old_date = new Date(date.getTime() - six_months_ms);
  
  // Get date 6 months in future
  var future_date = new Date(date.getTime() + six_months_ms);
  
  // Get the events in that range
  var presenting_staff_events = presenting_staff_calendar.getEvents(old_date, future_date);
  var non_presenting_staff_events = non_presenting_staff_calendar.getEvents(old_date, future_date);
  
  // Create global event object
  var events = [];
  
  // Get test staff data
  var presenting_staff = ['Elisabeth', 'Derek', 'Elise'];
  var non_presenting_staff = ['Evan', 'Nik'];
  for (var i = 0; i < presenting_staff.length; i++) {
    var object = getEventSeries(presenting_staff_events, presenting_staff[i]);
    events.push(object);
  }
  for (var j = 0; j < non_presenting_staff.length; j++) {
    var object = getEventSeries(non_presenting_staff_events, non_presenting_staff[j]);
    events.push(object);
  }

  return events;

   /* Array of these objects
  
    {
      calendar_title: "Elisabeth",
      events: [
        {
          start: date,
          end: date,
          title: "Elisabeth",
          color: color
        }, ...
      ]
    }
  
  */ 

}

// Jean Schedule Function
function getJeansSchedule() {

	// Get raw data from google
	var calendar = CalendarApp.getCalendarById('jeanmcreighton@gmail.com');
	var month = 2600000000*6;
	var current_date = new Date();
	var past_date = new Date(current_date.getTime() - month);
	var future_date = new Date(current_date.getTime() + month);
	var google_events = calendar.getEvents(past_date, future_date);


	// Transpose data into FullCalendar format
	var events = [];
	for (var i = 0; i < google_events.length; i++) {

		var object = {
			title: google_events[i].getTitle(),
			start: google_events[i].getStartTime(),
			end: google_events[i].getEndTime(),
			color: 'green'
		}

		events.push(object);

	}

	return events;

}

function getEventSeries(events, staff) {
  
  var array = [];
  var color = rainbow(Math.random(), Math.random());
  for (var i = 0; i < events.length; i++) {
    
    if (events[i].getTitle().indexOf(staff) !== -1) { // If the staff name is present in the event title | CORRECT EVENT
      
      var object = {
        
        title: staff,
        start: events[i].getStartTime(),
        end: events[i].getEndTime(),
        color: color
        
      };
      array.push(object);
      
    }
    
  }
  var response = {
    
    calendar_title: staff,
    events: array
    
  };
  return response;
  
}

function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}