///////////////////////////////////////////////////////////////////////////////
// Events

/*
 Each event is represented by a document in the Events collection:
 title, description: String
 when: array [year, month, day, hour, minute, second, millisecond]
 public: Boolean
 rsvps: Array of objects like {user: userId}
 */

Events = new Meteor.Collection("events");

Meteor.methods({
    rsvp: function(eventId){
        if (! Meteor.userId())
            throw new Meteor.Error(403, "You must be logged in to RSVP");

        var event = Events.findOne(eventId);
        if (! event){
            throw new Meteor.Error(404, "No such event");
        }
        Events.update(eventId, {$addToSet: {rsvps: {user: Meteor.userId()}}});
    },
    cancel: function(eventId){
        if (! Meteor.userId())
            throw new Meteor.Error(403, "You must be logged in to cancel");

        var event = Events.findOne(eventId);
        if (! event){
            throw new Meteor.Error(404, "No such event");
        }
        Events.update(eventId, {$pull: {rsvps: {user: Meteor.userId()}}});
    }
});

Meteor.users.allow(
    {update: function(){return true}}
);
///////////////////////////////////////////////////////////////////////////////
// Users

var displayName = function (userId) {
    var user = Meteor.users.findOne(userId);
    if (! user)
        return "Unknown user";

    if (user.profile && user.profile.name)
        return user.profile.name;
    return user.emails[0].address;
};

var gravatarURL = function(userId){
    var user = Meteor.users.findOne(userId);
    if (! (user && user.emails.length && user.emails[0].address))
        return "";
    var email = user.emails[0].address;
    var hash = CryptoJS.MD5(email.trim().toLowerCase());
    return 'http://www.gravatar.com/avatar/' + hash;
};