#!/bin/bash

#bootstrap
platform=`uname -s`
./bin/$platform/setup-node.sh
./bin/$platform/setup-mongo.sh
./bin/$platform/start-mongo.sh
npm install
