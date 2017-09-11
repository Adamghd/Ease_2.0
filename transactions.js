// Transaction information

// Models

app.TransactionModel = Backbone.Model.extend({
  
  defaults: {
    id: '', // int
    amount: '', // int
    datePosted: '', // moment raw
    notes: '', // string
    paid: '', // bool
    datePaid: '', //moment raw
    eventID: '', // int if from event, null if not
    groupID: '' // int if from group, null if not
  },
  setDates: function() { // set actual date objects
    if (this.datePosted !== '' && this.datePosted !== null) {
      this.set({datePosted: moment(this.datePosted)});
    }
    if (this.datePaid !== '' && this.datePaid !== null) {
      this.set({datePaid: moment(this.datePaid)});
    }
  }
  
});

app.PaymentModel = Backbone.Model.extend({
  
  defaults: {
    id: '', // int
    transactionID: '', // int
    amount: '', // int
    paymentType: '', // string [from options] | need config model?
    datePaid: '', // moment raw
    datePosted: '' //moment raw
  },
  setDates: function() {
    if (this.datePosted !== '' && this.datePosted !== null) {
      this.set({datePosted: moment(this.datePosted)});
    }
    if (this.datePaid !== '' && this.datePaid !== null) {
      this.set({datePaid: moment(this.datePaid)});
    }
  }
  
});

// Collections

app.TransactionCollection = Backbone.Collection.extend({
  
  model: app.TransactionModel,
  initialize: function() {
    this.sort();
  },
  comparator: function(transaction) { // sort ascending by date posted
    return new Date(transaction.attributes.datePosted) * -1;
  }
  
});

app.PaymentCollection = Backbone.Collection.extend({
  
  model: app.PaymentModel,
  initialize: function() {
    this.sort();
  },
  comparator: function(payment) { // sort ascending by date posted
    return new Date(payment.attributes.datePosted) * -1;
  }
  
});

// When initializing, need to do this following
function init() {
  
  // To set date of both collections
  var setDate = function(model) {
    model.setDate();
  };
  
  // Transactions
  app.transactionCollection = new app.TransactionCollection(data.transactions);
  
  _.each(transactionCollection.models, setDate);
  
  // Payments
  app.paymentsCollection = new app.PaymentCollection(data.payments);
  
  _.each(paymentsCollection.models, setDate);
  
  
}