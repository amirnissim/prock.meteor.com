#! /bin/bash

rm .meteor/local/db/mongo.lock

# copy /app to /root fixes permissions that break mongo
docker run -p 3000:3000 -it -v `pwd`:/app prock sh -c 'cp -r /app /root && cd /root/app && meteor'
