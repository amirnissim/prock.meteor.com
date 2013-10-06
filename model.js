///////////////////////////////////////////////////////////////////////////////
// Events

/*
 Each event is represented by a document in the Events collection:
 title: String
 date: JavaScript date
 status: EVENT_STATUS.cancelled if the event was cancelled
 rsvps: Array of objects like {user: userId}
 walkins: Array of (string) names
 */

Events = new Meteor.Collection("events");
Events.allow({
    insert: function(){
        return isAdmin();
    }
});

ADMIN_USERNAME = "admin";

EVENT_STATUS = {
    OK: 'ok',
    CANCELLED: 'cancelled'
};

var MAX_PARTICIPANTS = 9;

///////////////////////////////////////////////////////////////////////////////
// Methods
isAdmin = function(){
    return (Meteor.user() && Meteor.user().username == ADMIN_USERNAME);
};

createEvent = function(eventOptions){
    if (!validDate(eventOptions.date)){
        return undefined;
    }

    var event = {
        title: eventOptions.title,
        date: eventOptions.date,
        maxParticipants: eventOptions.maxParticipants || MAX_PARTICIPANTS,
        rsvps: []
    };
    Events.insert(event);
    console.log("created event " + event.title + " at " + event.date);

    return event;
};

dstOffset = function(ilDate){

    var ISRAEL_DST_SCHEDULE = {
        2013: [new Date(2013, 2, 29, 2), new Date(2013, 9, 27, 2)],
        2014: [new Date(2014, 2, 28, 2), new Date(2014, 9, 26, 2)]
    };

    var year = ilDate.getFullYear(),
        dstStart = ISRAEL_DST_SCHEDULE[year][0],
        dstEnd = ISRAEL_DST_SCHEDULE[year][1],
        offset;

    if (dstStart <= ilDate < dstEnd){
        offset = 3;  // DST ON
    } else {
        offset = 2;  // DST OFF
    }

    return offset;
};

validDate = function(d){
    return (Object.prototype.toString.call(d) === "[object Date]" &&
        d.toString() !== "Invalid Date");
};


Meteor.methods({
    setPhoneNumber: function(phoneNumber) {
        var currentUserId = Meteor.userId();
        if (!currentUserId)
            throw new Meteor.Error(403, "You must be logged in to do that");

        Meteor.users.update(currentUserId, {$set: {'profile.phoneNumber': phoneNumber}});
    },
    rsvp: function (eventId) {
        if (!Meteor.userId())
            throw new Meteor.Error(403, "You must be logged in to RSVP");

        var event = Events.findOne(eventId);
        if (!event) {
            throw new Meteor.Error(404, "No such event");
        }
        Events.update(eventId, {$addToSet: {rsvps: {user: Meteor.userId()}}});
    },
    cancelRsvp: function (eventId) {
        if (!Meteor.userId())
            throw new Meteor.Error(403, "You must be logged in to cancel");

        var event = Events.findOne(eventId);
        if (!event) {
            throw new Meteor.Error(404, "No such event");
        }
        Events.update(eventId, {$pull: {rsvps: {user: Meteor.userId()}}});
    },
    addWalkin: function(eventId, name, phoneNumber){
        if (!(Meteor.user().username == ADMIN_USERNAME))
            throw new Meteor.Error(403, "You are not authorized to edit events");
        var event = Events.findOne(eventId);
        if (!event) {
            throw new Meteor.Error(404, "No such event");
        }
        Events.update(eventId, {$push: {walkins: {name: name, phoneNumber: phoneNumber}}});
    },
    removeWalkin: function(eventId, name){
        if (!(Meteor.user().username == ADMIN_USERNAME))
            throw new Meteor.Error(403, "You are not authorized to edit events");
        var event = Events.findOne(eventId);
        if (!event) {
            throw new Meteor.Error(404, "No such event");
        }

        // there can more than one walking with 'name' --- remove only the first
        // 'pull' removes all instances of the value, it is currently not possible to remove only the first
        // see https://groups.google.com/forum/?fromgroups=#!topic/mongodb-user/B8Vz7qTX-t4
        Events.update({_id: eventId, "walkins.name": name}, {"$unset": {"walkins.$": {"name": name}}});
        Events.update({_id: eventId}, {"$pull": {"walkins": null}});
    },
    cancelEvent: function(eventId){
        if (!(Meteor.user().username == ADMIN_USERNAME))
            throw new Meteor.Error(403, "You are not authorized to edit events");
        var event = Events.findOne(eventId);
        if (!event) {
            throw new Meteor.Error(404, "No such event");
        }
        Events.update(eventId, {$set: {status: EVENT_STATUS.CANCELLED}});
    },
    restoreEvent: function(eventId){
        if (!(Meteor.user().username == ADMIN_USERNAME))
            throw new Meteor.Error(403, "You are not authorized to edit events");
        var event = Events.findOne(eventId);
        if (!event) {
            throw new Meteor.Error(404, "No such event");
        }
        Events.update(eventId, {$set: {status: EVENT_STATUS.OK}});
    }
});