Meteor.subscribe("directory");
Meteor.subscribe("upcomingEvents");


Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
});


///////////////////////////////////////////////////////////////////////////////
// Main page

Template.adminTools.canEdit = function(){
    return isAdmin();
};
Template.adminTools.events = {
    'click #createNewEvent': function(){
        var eventDate = $("#newEventDate").val(),
            eventTime = $("#newEventTime").val(),
            eventTitle = $("#newEventTitle").val();

        if (eventDate && eventTime && eventTitle){
            var utc = moment.utc(eventDate),
                hours = eventTime.split(":")[0],
                minutes = eventTime.split(":")[1];

            utc = utc.hours(hours).minutes(minutes).subtract('hours', dstOffset(utc.toDate())).toDate();

            var newEvent = createEvent({
                title: eventTitle,
                date: utc
            });
            if (!newEvent){
                alert("oops, that didn't work");
            }
        } else {
            alert("Please fill in all details");
        }
    }
};

Template.upcomingEvents.upcomingEvents = function(){
    // group events by date
    var event_groups =  _.groupBy(Events.find().fetch(), function (event) {
        return moment(event.date).format("YY-M-D")
    });

    // put groups in a list
    event_groups = _.map(event_groups, function (event_list) {
        return {
            'date': event_list[0].date,
            'title': getTitle(event_list[0].date),
            'event_list': _.sortBy(event_list, function(e) { return e.date })
        }
    });

    // return list sorted by date
    return _.sortBy(event_groups, function(o){ return o.date; });
};

Template.eventDetails.amGoing = function(){
    return _.contains(_.pluck(this.rsvps, "user"), Meteor.userId());
};
Template.eventDetails.isOpen = function(){
    return this.rsvps.length < this.maxParticipants;
};
Template.eventDetails.attending = function(){
    return (this.rsvps && this.rsvps.length) || (this.walkins && this.walkins.length);
};
Template.eventDetails.attendanceList = function(){
    return _.map(_.pluck(this.rsvps, "user"), function(userId){
        return {
            name: displayName(userId)
        };
    })
};
Template.eventDetails.canEdit = function(){
    return isAdmin();
};
Template.eventDetails.cancelled = function(){
    return this.status == EVENT_STATUS.CANCELLED;
};

Template.eventDetails.events({
    // user actions
    'click .rsvp': function(){
        Meteor.call("rsvp", this._id, function(error, result){
            if (error) alert(error.reason);
        });
    },
    'click .cancel-rsvp': function(){
        Meteor.call("cancelRsvp", this._id, function(error, result){
            if (error) alert(error.reason);
        });
    },

    // admin-actions
    'click .add-walkin': function(event){
        var name = $(event.target).parents(".event").find("#walkin-name").val();
        Meteor.call("addWalkin", this._id, name, function(error, result){
            if (error) alert(error.reason);
        });
    },
    'click .remove-walkin': function(event){
        // hack since Meteor does not yet support accessing parent scope
        var eventId = $(event.target).parents('.event').find('.event-id').val();
        Meteor.call("removeWalkin", eventId, this.name, function(error, result){
            if (error) alert(error.reason);
        });
    },
    'click .cancel-event': function(){
        Meteor.call("cancelEvent", this._id, function(error, result){
            if (error) alert(error.reason);
        });
    },
    'click .restore-event': function(){
        Meteor.call("restoreEvent", this._id, function(error, result){
            if (error) alert(error.reason);
        });
    }
});

Template.eventDetails.helpers({
    moment: function(date, format) {
        return moment(date).format(format);
    }
});


///////////////////////////////////////////////////////////////////////////////
// Functions

function displayName(userId) {
    var user = Meteor.users.findOne(userId);
    if (!user)
        return "משתמש לא מוכר";

    if (user.profile && user.profile.name)
        return user.profile.name;

    if (user.emails)
        return user.emails[0].address;

    if (user.username)
        return user.username;

    return "משתמש לא מוכר";
}

function getTitle(date){
    var title_format = "dddd D/M";
    var m = moment(date);
    var diff = m.diff(moment().startOf('day'), 'days', true);
    var title =
        diff < -1 ? m.format(title_format) :
            diff < 0 ? 'אתמול' :
                diff < 1 ? 'היום ' + m.format('D/M') :
                    m.format(title_format);

    return title;
}