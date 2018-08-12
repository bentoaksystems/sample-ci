#!/bin/bash
RESULT="`wget -qO- http://localhost:$((80 + BUILD_NUMBER))/api/ready`"
echo $RESULT
if [ $RESULT == "server is fully up and running" ]
then
  return true
else
  return false
fi  
