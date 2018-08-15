#!/bin/bash

cd ${JENKINS_HOME}/workspace

mkdir -p ${WORKSPACE}/public

if ls | grep ${GIT_BRANCH}-build
then
  cp -R ${GIT_BRANCH}-client/* ${WORKSPACE}/public/
else
  git clone https://${GIT_CLIENT_CREDENTIALS}@${GIT_CLIENT_REPO}
  cd ./his-client
  git branch -r
  TARGET="origin/master"
  if git branch -r | grep "origin/${GIT_BRANCH}"
  then
    TARGET="origin/${GIT_BRANCH}" 
  fi  
  git checkout -b origin/$TARGET -f 
  npm i
  mkdir -p ../${GIT_BRANCH}-build
  ng build --output-path=../${GIT_BRANCH}-build
  cd ..
  cp -R ${GIT_BRANCH}-build/* ${WORKSPACE}/public/
  rm -r ./his-client        
fi
