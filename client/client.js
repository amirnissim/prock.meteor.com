Meteor.subscribe("directory");
Meteor.subscribe("upcomingEvents");


Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
});


///////////////////////////////////////////////////////////////////////////////
// Main page

UI.body.rendered = function() {
    // defer likebox rendering
    this.find('#likebox iframe').style.display = 'block';
};

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
    // filter out cancelled events with no rsvps
    var events = Events.find().fetch();
    events = events.filter(function hideIt(event) {
        return !(event.status === EVENT_STATUS.CANCELLED &&
                    (!event.rsvps || event.rsvps.length === 0) &&
                    (!event.walkins || event.walkins.length === 0));
    });

    // group events by date
    var event_groups =  _.groupBy(events, function (event) {
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
    // if event hasn't started and there are spots left
    var participants = this.rsvps.length;
    if (this.walkins) {
        participants += this.walkins.length;
    }
    return (participants < this.maxParticipants) &&
        (this.date >= moment.utc().toDate());
};
Template.eventDetails.attending = function(){
    return (this.rsvps && this.rsvps.length) || (this.walkins && this.walkins.length);
};
Template.eventDetails.attendanceList = function(){
    return _.map(_.pluck(this.rsvps, "user"), function(userId){
        var user = Meteor.users.findOne(userId);
        return {
            name: displayName(user),
            phoneNumber: user.profile ? user.profile.phoneNumber : ''
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
        var phoneNumber = Meteor.user() && Meteor.user().profile &&
                            Meteor.user().profile.phoneNumber;
        if (phoneNumber) {
            doClickRsvp(this._id);
        }
        // ask for the user's phone number
        else {
            var phoneNumber = prompt('בבקשה מלא מספר טלפון כדי שנוכל לעדכן אותך על שינויים', '');
            if (phoneNumber) {
                if (isValidPhoneNumber(phoneNumber)) {
                    Meteor.call("setPhoneNumber", phoneNumber);
                    doClickRsvp(this._id);
                } else {
                    alert('מספר טלפון קצר מדי');
                }
            }
        }
    },
    'click .cancel-rsvp': function(){
        Meteor.call("cancelRsvp", this._id, function(error, result){
            if (error) alert(error.reason);
        });
    },

    // admin-actions
    'click .add-walkin': function(event){
        var name = $(event.target).parents(".event").find("#walkin-name").val();
        var phoneNumber = $(event.target).parents(".event").find("#walkin-phoneNumber").val();
        Meteor.call("addWalkin", this._id, name, phoneNumber, function(error, result){
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

function doClickRsvp(eventId) {
    Meteor.call("rsvp", eventId, function(error, result){
        if (error) alert(error.reason);
    });
}

function isValidPhoneNumber(phoneNumber) {
    if (phoneNumber && phoneNumber.length > 7) {
        return true;
    }
    return false;
}

function displayName(user) {
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