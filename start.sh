#!/bin/bash
./bin/setup-mongo
./bin/start-mongo
node --stack-size=2000000 ./main/index
