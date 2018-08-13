#!/bin/bash
docker exec his-$BUILD_NUMBER bash
wait
pwd
npm test