# get a password for remote connection
getpass='meteor mongo --url prock.meteor.com | cut -d: -f3 | cut -d@ -f1'

alias db-export='mongoexport --collection events --csv --out export.csv --fields title,date,status,rsvps,walkins -u client -h production-db-a1.meteor.io:27017 -d prock_meteor_com -p `getpass`'
alias db-dump='mongodump -u client -h production-db-a1.meteor.io:27017 -d prock_meteor_com -p `getpass`'