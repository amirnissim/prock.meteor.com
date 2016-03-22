#! /bin/bash

# start 'dev' VM and set the environment
docker-machine start dev
eval "$(docker-machine env dev)"

# build the image
docker build -t prock -f Dockerfile .
