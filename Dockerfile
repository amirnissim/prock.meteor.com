FROM ubuntu:12.04 

RUN apt-get update
RUN apt-get install curl -y
RUN curl https://install.meteor.com/ | sh

# mongoDB
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo "deb http://repo.mongodb.org/apt/ubuntu precise/mongodb-org/3.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.0.list
RUN apt-get update
RUN apt-get install mongodb-org-tools -y

EXPOSE 3000
VOLUME /app
WORKDIR /app
