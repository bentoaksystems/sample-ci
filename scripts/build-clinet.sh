#!/bin/bash

mkdir -p ../client && cd ../client
git clone https://${GIT_USER}:${GIT_PASS}@${GIT_CLIENT_REPO}
git branch -r