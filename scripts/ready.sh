#!/bin/bash
RESULT="`wget -qO- http://localhost:$((80 + BUILD_NUMBER))/api/ready`"
EXPECTED="server is fully up and running"
echo $RESULT
if [ "$RESULT" = "$EXPECTED" ];then
  exit 0
else
  exit 1
fi  
