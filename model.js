///////////////////////////////////////////////////////////////////////////////
// Events

/*
 Each event is represented by a document in the Events collection:
 title: String
 date: JavaScript date
 rsvps: Array of objects like {user: userId}
 */

Events = new Meteor.Collection("events");

ADMIN_USERNAME = "admin";

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
    cancel: function (eventId) {
        if (!Meteor.userId())
            throw new Meteor.Error(403, "You must be logged in to cancel");

        var event = Events.findOne(eventId);
        if (!event) {
            throw new Meteor.Error(404, "No such event");
        }
        Events.update(eventId, {$pull: {rsvps: {user: Meteor.userId()}}});
    }
});