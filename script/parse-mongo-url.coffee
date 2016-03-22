spawn = require('child_process').spawn
mongo = spawn 'meteor', ['mongo', '--url', 'prock.meteor.com'], stdio: [process.stdin, 'pipe', process.stderr]

mongo.stdout.on 'data', (data) ->
    data = data.toString()
    m = data.match /mongodb:\/\/([^:]+):([^@]+)@([^:]+):27017\/([^\/]+)/
    if m?
        process.stdout.write "-u #{m[1]} -p #{m[2]} -h #{m[3]} -d #{m[4]}"
    else
        if data == 'Password: '
            process.stderr.write data
