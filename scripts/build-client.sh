#!/bin/bash

cd ${JENKINS_HOME}/workspace

mkdir -p ${WORKSPACE}/public

if ls | grep ${GIT_BRANCH}-build
then
  cp -R ${GIT_BRANCH}-client/* ${WORKSPACE}/public/
else
  echo 'current build dir not found on workspace... try to clone repository'
  git clone https://${GIT_CLIENT_CREDENTIALS}@${GIT_CLIENT_REPO}
  cd ./his-client
  git branch -r
  TARGET=""
  if git branch -r | grep "origin/${GIT_BRANCH}"
  then
    TARGET="origin/${GIT_BRANCH}" 
  else
    TARGET="origin/master"
    echo 'same branch on client not found... try to build master branch'
  fi  
  git checkout -b origin/$TARGET -f 
  npm i
  mkdir -p ../${GIT_BRANCH}-build
  ng build --output-path=../${GIT_BRANCH}-build
  cd ..
  cp -R ${GIT_BRANCH}-build/* ${WORKSPACE}/public/
  rm -r ./his-client        
fi
