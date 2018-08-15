#!/bin/bash

cd ${JENKINS_HOME}/workspace

echo ${GIT_BRANCH}
mkdir -p ${WORKSPACE}/public

if ls | grep ${GIT_BRANCH}-build
then
  cp -R ${GIT_BRANCH}-client/* ${WORKSPACE}/public/
else
  echo 'current build dir not found on workspace... try to clone repository'
  
  if ls | grep master-build
    echo 'pre master-build exists on workspace... copy to public folder'
    cp -R master-build/* ${WORKSPACE}/public/
  fi

  git clone https://${GIT_CLIENT_CREDENTIALS}@${GIT_CLIENT_REPO}
  cd ./his-client
  git branch -r
  TARGET=""
  if git branch -r | grep "origin/${GIT_BRANCH}"
  then
    TARGET="${GIT_BRANCH}" 
  else
    TARGET="master"
    echo 'same branch on client not found... try to build master branch'
  fi   
  git checkout -b origin/$TARGET -f 
  npm i
  mkdir -p ../${TARGET}-build
  ng build --output-path=../${TARGET}-build
  cd ..
  cp -R ${TARGET}-build/* ${WORKSPACE}/public/
  rm -r ./his-client         
fi
