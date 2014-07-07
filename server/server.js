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
            { title: 'חוג בוגרים מתחילים', time: [20, 0] },
            { title: 'יוגה - איינגר', time: [20, 15] }
        ],
        // Monday
        '1': [
            { title: 'חוג היכרות', time: [19, 00] },
            { title: 'חוג בוגרים מתקדמים', time: [20, 0] },
            { title: 'יוגה - איינגר', time: [20, 15] }
        ],
        // Tuesday
        '2': [
            { title: 'חוג נשים', time: [19, 0] }
        ],
        // Wednesday
        '3': [
            { title: 'חוג בוגרים מתחילים', time: [20, 0] }
        ],
        // Thursday
        '4': [
            { title: 'יוגה - איינגר', time: [19, 30] }
        ],
        // Friday
        '5': [
            { title: 'יוגה - מתקדמים', time: [9, 30] }
        ]
    };

function createEvents () {
    console.log("================ Creating events ================");
    for (var i = 0; i <= DAYS_TO_CREATE_EVENTS_FOR; i++) {
        var eventDay = moment().add('days', i);

        var dailySchedule = EVENT_SCHEDULE[eventDay.day()];
        _.each(dailySchedule, function (entry) {

            // Schedule given in Israel time but we create dates in UTC
            var eventDate = moment.utc(eventDay.toArray().slice(0, 3).concat(entry.time));
            var offset = dstOffset(eventDate.toDate());
            eventDate = eventDate.subtract('hours', offset).toDate();

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
}


// once a day, create new events
Meteor.setInterval(createEvents, 24 * 60 * 60 * 1000);


Meteor.startup(function () {
    // create admin user
    var admin = Meteor.users.find({username: ADMIN_USERNAME}).count();
    if (!admin){
        Accounts.createUser({username: ADMIN_USERNAME, password: ADMIN_PASSWORD});
        console.log("Admin user created");
    }

    createEvents();
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
