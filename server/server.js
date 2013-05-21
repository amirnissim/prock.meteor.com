/*************************
** Settings
*************************/
var
    ADMIN_PASSWORD = "admin"  // MUST CHANGE PASSWORD

    ,DAYS_TO_PUBLISH_EVENTS_FOR = 7
    ,DAYS_TO_CREATE_EVENTS_FOR = 7

    ,EVENT_SCHEDULE = {  // Hours are in Israel Time
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
            { title: 'יוגה - מתקדמים', time: [9, 30] }
        ]
    };

Meteor.startup(function () {
    // create admin user
    var admin = Meteor.users.find({username: ADMIN_USERNAME}).count();
    if (!admin){
        Accounts.createUser({username: ADMIN_USERNAME, password: ADMIN_PASSWORD});
        console.log("Admin user created");
    }

    // create events when the server starts
    console.log("Creating events...\n=======");
    for (var i = 0; i <= DAYS_TO_CREATE_EVENTS_FOR; i++) {
        var eventDay = moment().add('days', i);

        var dailySchedule = EVENT_SCHEDULE[eventDay.day()];
        _.each(dailySchedule, function (entry) {

            // Schedule given in Israel time but we create dates in UTC
            var eventDate = moment.utc(eventDay.toArray().slice(0, 3).concat(entry.time));
            eventDate = eventDate.subtract('hours', dstOffset(eventDate.toDate())).toDate();

            // event already exists - do nothing
            if (Events.find({'date': eventDate}).count() > 0){
                console.log("event exists " + entry.title + " " + eventDate);
            }

            // create event
            else{
                createEvent({
                    title: entry.title,
                    date: eventDate,
                    maxParticipants: entry.maxParticipants
                });
            }
        });
    }
});


Meteor.publish("directory", function () {
    return Meteor.users.find({}, {fields: {username:1, emails: 1, profile: 1}});
});
Meteor.publish("upcomingEvents", function () {
    // show event for one hour after it begins
    var start_date = moment.utc().subtract("hours", 1).toDate(),
        end_date = moment.utc().add('days', DAYS_TO_PUBLISH_EVENTS_FOR).endOf("day").toDate();

    return Events.find({'date': {'$gt': start_date, '$lt': end_date}});
});