#!/bin/bash
RESULT="`wget -qO- http://localhost:$((80 + BUILD_NUMBER))/api/ready`"
EXPECTED="server is fully up and running"
echo $RESULT
if [ "$RESULT" = "$EXPECTED" ];then
  return true
else
  return false
fi  
