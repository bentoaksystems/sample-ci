#!/bin/bash

deployPath=/home/Projects/HIS
mkdir -p /home/Projects/HIS
cp -R ${WORKSPACE}/* $deployPath
cd $deployPath
node ./scripts/docker-compose-builder.js production
docker-compose up -d
