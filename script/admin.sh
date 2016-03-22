# get a password for remote connection
alias getpass='meteor mongo --url prock.meteor.com | cut -d: -f3 | cut -d@ -f1'

alias db-export='mongoexport --collection events --type=csv --out prock_export.csv --fields _id,title,date,status,rsvps,walkins `coffee parse-mongo-url.coffee`'
alias db-dump='mongodump `coffee parse-mongo-url.coffee`'

# Mongo cheatsheet
# db.events.update({_id:'id'},{$set: {maxParticipants:99}});
# db.events.find().sort({date:-1}).limit(15)
# db.users.find({_id: {$in: ["jE", "Ca", "BN", "4G"]}})
