///////////////////////////////////////////////////////////////////////////////
// Events

/*
 Each event is represented by a document in the Events collection:
 title: String
 date: JavaScript date
 status: EVENT_STATUS.cancelled if the event was cancelled
 rsvps: Array of objects like {user: userId}
 */

Events = new Meteor.Collection("events");

ADMIN_USERNAME = "admin";

EVENT_STATUS = {
    OK: 'ok',
    CANCELLED: 'cancelled'
};

///////////////////////////////////////////////////////////////////////////////
// Methods

Meteor.methods({
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
    cancelEvent: function(eventId){
        if (!Meteor.user().username == ADMIN_USERNAME)
            throw new Meteor.Error(403, "You are not authorized to edit events");
        var event = Events.findOne(eventId);
        if (!event) {
            throw new Meteor.Error(404, "No such event");
        }
        Events.update(eventId, {$set: {status: EVENT_STATUS.CANCELLED}});
        console.log(Events.findOne({_id: eventId}));
    },
    restoreEvent: function(eventId){
        if (!Meteor.user().username == ADMIN_USERNAME)
            throw new Meteor.Error(403, "You are not authorized to edit events");
        var event = Events.findOne(eventId);
        if (!event) {
            throw new Meteor.Error(404, "No such event");
        }
        Events.update(eventId, {$set: {status: EVENT_STATUS.OK}});
    }
});