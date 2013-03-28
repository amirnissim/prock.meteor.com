Meteor.publish("directory", function () {
    return Meteor.users.find({}, {fields: {username:1, emails: 1, profile: 1}});
});
Meteor.publish("upcomingEvents", function () {
    var start_date = moment().subtract("hours", 1).toDate(),
        end_date = moment().add('days', DAYS_TO_PUBLISH_EVENTS_FOR).endOf("day").toDate();

    return Events.find({'date': {'$gt': start_date, '$lt': end_date}});
});


Meteor.startup(function () {
    // create events when the server starts

    console.log("Creating events...\n=======");
    for (var i = 0; i <= DAYS_TO_CREATE_EVENTS_FOR; i++) {
        var event_day = moment().add('days', i);

        var daily_schedule = EVENT_SCHEDULE[event_day.day()];
        _.each(daily_schedule, function (entry) {
            var event_date = moment(event_day.toArray().slice(0, 3).concat(entry.time))
                // FIXME - hack for Israel Timezone
                .subtract('hours', 3)
                .toDate();

            // event already exists - do nothing
            if (Events.find({'date': event_date}).count() > 0){
                console.log("event exists " + entry.title + " " + event_date);
            }

            // create event
            else{
                var event = {
                    'title': entry.title,
                    'date': event_date,
                    'rsvps': []
                };
                Events.insert(event);
                console.log("created event " + event.title + " at " + event.date);
            }
        });
    }
});
