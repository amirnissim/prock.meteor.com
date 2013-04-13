Meteor.publish("directory", function () {
    return Meteor.users.find({}, {fields: {username:1, emails: 1, profile: 1}});
});
Meteor.publish("upcomingEvents", function () {
    var start_date = moment().subtract("hours", 1).toDate(),
        end_date = moment().add('days', DAYS_TO_PUBLISH_EVENTS_FOR).endOf("day").toDate();

    return Events.find({'date': {'$gt': start_date, '$lt': end_date}});
});

function dstOffset(ilDate){
    var year = ilDate.getFullYear(),
        dstStart = ISRAEL_DST_SCHEDULE[year][0],
        dstEnd = ISRAEL_DST_SCHEDULE[year][1],
        offset;

    if (dstStart <= ilDate && ilDate < dstEnd){
        offset = 3;  // DST ON
    } else {
        offset = 2;  // DST OFF
    }

    return offset;
}

Meteor.startup(function () {
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
                var event = {
                    'title': entry.title,
                    'date': eventDate,
                    'rsvps': []
                };
                Events.insert(event);
                console.log("created event " + event.title + " at " + event.date);
            }
        });
    }
});
