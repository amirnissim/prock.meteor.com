/*************************
** Settings
*************************/
var
    ADMIN_PASSWORD = "admin"  // MUST CHANGE PASSWORD

    ,DAYS_TO_CREATE_EVENTS_FOR = 7

    ,EVENT_SCHEDULE = {  // Hours are in Israel Time
        // Sunday
        '0': [
            { title: 'יוגה לחיזוק וגמישות (אשטנגה)', time: [20, 00], host: 'יונית' }
        ],
        // Monday
        '1': [
            // cancelled
            // { title: 'יוגה ויניאסה', time: [20, 00], host: 'דקלה' }
        ],
        // Tuesday
        '2': [
            // cancelled
            // { title: 'יוגה אשטנגה', time: [18, 30], host: 'אמיר' }
        ],
        // Wednesday
        '3': [

        ],
        // Thursday
        '4': [
            { title: 'יוגה איינגר', time: [20, 00], host: 'עינב' }
        ],
        // Friday
        '5': [

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
                    host: entry.host,
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


// see publishing events:
// http://stackoverflow.com/questions/19826804/understanding-meteor-publish-subscribe
Meteor.publish("directory", function () {
    return Meteor.users.find({}, {fields: {username:1, emails: 1, profile: 1}});
});
Meteor.publish("recent-events", function () {
    var lastMonth = moment.utc().subtract(1, 'months').startOf('month').toDate();
    return Events.find({
        'date': {
            '$gt': lastMonth
        }
    });
});
