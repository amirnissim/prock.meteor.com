# get a password for remote connection
alias getpass='meteor mongo --url prock.meteor.com | cut -d: -f3 | cut -d@ -f1'

alias db-export='mongoexport --collection events --csv --out export.csv --fields title,date,status,rsvps,walkins -u client -h production-db-a1.meteor.io:27017 -d prock_meteor_com -p `getpass`'
alias db-dump='mongodump -u client -h production-db-a1.meteor.io:27017 -d prock_meteor_com -p `getpass`'

# Mongo cheatsheet
# db.events.update({_id:'id'},{$set: {maxParticipants:99}});
# db.events.find().sort({date:-1}).limit(15)
# db.users.find({_id: {$in: ["jE", "Ca", "BN", "4G"]}})
