#!/bin/bash
platform=`uname -s`
./bin/$platform/setup-mongo.sh
./bin/$platform/start-mongo.sh
npm install
NODE_ENV=prod node --stack-size=2000000 ./main/index
