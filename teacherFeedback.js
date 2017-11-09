<script type='text/javascript'>

// Models

app.Group = Backbone.Model.extend({
});

app.Event = Backbone.Model.extend({
});

// Collections
app.GroupList = Backbone.Firebase.Collection.extend({

  model: app.Group,
  url: 'https://ease-f60ed.firebaseio.com/groups/'

});

app.EventList = Backbone.Firebase.Collection.extend({

  model: app.Event,
  url: 'https://ease-f60ed.firebaseio.com/events/'

});

// Views

app.AppView = Backbone.View.extend({

  initialize: function() {

    app.eventList = new app.EventList();
    app.groupList = new app.GroupList();

    var that = this;
    
    google.script.run.withSuccessHandler(that.loadFeedback)
      .getFeedbackData();

  },
  load: function() {
  
    // Have firebase and feedback
    
    // Loop through the events
    for (var i = 0; i < app.eventList.models.length; i++) {
    
    	var model = app.eventList.models[i];

    	var four_hours_ago = moment().subtract(4, 'hours');
    	var now = moment();

    	// Did it occur in the last four hours?
    	if (moment(model.attributes.calEvent.calStart).isAfter(four_hours_ago)) {

    		if (moment(model.attributes.calEvent.calStart).isBefore(now)) {

    			// Send email!
    			var group = app.groupList.where({_id: model.attributes.groupID})[0];
    			var email = group.attributes.email;

    			if (email !== '') {

    				google.script.run()
    					.sendEmail(email);

    			}

    		}

    	}
    
    }
  
  },
  loadFeedback: function(json) {
  
    app.appView.feedback = JSON.parse(json);
    app.appView.load();
  
  }

});

$(document).ready(function() {

  app.appView = new app.AppView();

});

</script>