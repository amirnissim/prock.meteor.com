Handlebars.registerHelper('prettyDate', function(dateArray) {
    return moment(dateArray).format('H:mm dddd D/M');
});

//Meteor.subscribe("directory");

Template.upcomingEvents.upcomingEvents = function(){
    return Events.find({}, {sort: {when: 1}});
};

Template.eventDetails.amGoing = function(){
    return _.contains(_.pluck(this.rsvps, "user"), Meteor.userId());
};
Template.eventDetails.attendanceList = function(){
    return _.map(_.pluck(this.rsvps, "user"), function(userId){
        return {
            name: displayName(userId),
            img: gravatarURL(userId)
        };
    })
};
Template.eventDetails.events({
    'click .rsvp': function(){
        Meteor.call("rsvp", this._id, function(error, result){
            if (error) alert(error.reason);
        });
    },
    'click .cancel': function(){
        Meteor.call("cancel", this._id, function(error, result){
            if (error) alert(error.reason);
        });
    }
});