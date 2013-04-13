///////////////////////////////////////////////////////////////////////////////
// Events

/*
 Each event is represented by a document in the Events collection:
 title: String
 date: JavaScript date
 rsvps: Array of objects like {user: userId}
 */

Events = new Meteor.Collection("events");

///////////////////////////////////////////////////////////////////////////////
// Settings

var DAYS_TO_PUBLISH_EVENTS_FOR = 7,
    DAYS_TO_CREATE_EVENTS_FOR = 7,

    // Hours are in Israel Time
    EVENT_SCHEDULE = {
        // Sunday
        '0': [
            { title: 'מבוגרים מתקדמים', time: [20, 0] },
            { title: 'יוגה - איינגר', time: [20, 15] }
        ],
        // Monday
        '1': [
            { title: 'שיעור הכרות חד פעמי', time: [19, 15] },
            { title: 'מבוגרים מתחילים', time: [20, 0] },
            { title: 'יוגה - איינגר', time: [20, 15] }
        ],
        // Tuesday
        '2': [
            { title: 'מבוגרים מתחילים', time: [20, 0] },
            { title: 'יוגה - איינגר', time: [20, 15] }
        ],
        // Wednesday
        '3': [
            { title: 'מבוגרים מתקדמים', time: [20, 0] }
        ],
        // Friday
        '5': [
            { title: 'יוגה - אשטנגה', time: [9, 30] }
        ]
    },

    ISRAEL_DST_SCHEDULE = {
        2013: [new Date(2013, 2, 29, 2), new Date(2013, 9, 6, 2)],
        2014: [new Date(2014, 2, 28, 2), new Date(2014, 9, 5, 2)]
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