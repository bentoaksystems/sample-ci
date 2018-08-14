#!/bin/bash

git clone https://${GIT_CLIENT_CREDENTIALS}@${GIT_CLIENT_REPO}
cd ./his-client
git branch -r