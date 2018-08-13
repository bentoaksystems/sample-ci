#!/bin/bash

docker stop redis-$BUILD_NUMBER || echo "failed to stop redis-${BUILD_NUMBER}"
docker stop db-$BUILD_NUMBER || echo "failed to stop db-${BUILD_NUMBER}"
docker stop his-$BUILD_NUMBER || echo "failed to stop his-${BUILD_NUMBER}"
docker ps -aq --no-trunc -f status=exited | xargs docker rm || echo "failed to remove stopped containers"
docker rmi -f redis-$BUILD_NUMBER || echo "failed to remove redis-${BUILD_NUMBER}"
docker rmi -f db-$BUILD_NUMBER || echo "failed to remove db-${BUILD_NUMBER}"
docker rmi -f his-$BUILD_NUMBER || echo "failed to remove his-${BUILD_NUMBER}"
