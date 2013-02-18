Meteor.subscribe("directory");
Meteor.subscribe("upcomingEvents");


Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
});


///////////////////////////////////////////////////////////////////////////////
// Main page

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
Template.eventDetails.attendanceList = function(){
    return _.map(_.pluck(this.rsvps, "user"), function(userId){
        return {
            name: displayName(userId)
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

///////////////////////////////////////////////////////////////////////////////
// Functions

var displayName = function (userId) {
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
};

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

///////////////////////////////////////////////////////////////////////////////
// Handlebars

Handlebars.registerHelper('moment', function(date, format) {
    return moment(date).format(format);
});
