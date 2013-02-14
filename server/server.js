var myEvents = [
    {
        title: 'מבוגרים מתקדמים',
        instructor: 'אלון',
        when: moment([2013, 1, 13, 20, 0]).toArray()
    },
    {
        title: 'יוגה',
        instructor: 'אביטל',
        when: moment([2013, 1, 14, 20, 15]).toArray()
    },
    {
        title: 'יוגה',
        instructor: 'אביטל',
        when: moment([2013, 1, 15, 9, 0]).toArray()
    },
    {
        title: 'קטנטנים',
        instructor: 'שרון',
        when: moment([2013, 1, 17, 17, 0]).toArray()
    },
    {
        title: 'ילדים',
        instructor: 'שרון',
        when: moment([2013, 1, 17, 18, 0]).toArray()
    },
    {
        title: 'נוער',
        instructor: 'שרון',
        when: moment([2013, 1, 17, 19, 0]).toArray()
    },
    {
        title: 'מבוגרים מתקדמים',
        instructor: 'אלון',
        when: moment([2013, 1, 17, 20, 0]).toArray()
    }
];

Meteor.startup(function(){
    if (Events.find().count() == 0){
        _.forEach(myEvents, function(event, idx){
            Events.insert(event);
            console.log("created event #" + idx)
        })
    }
});

Meteor.publish("directory", function () {
    return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});