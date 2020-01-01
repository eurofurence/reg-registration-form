#! /bin/bash

BASE_PATH=$1
if [ "$BASE_PATH" == "" ]; then
  echo "need base path as first argument"
  exit 1
fi
SCALE=$2
if [ "$SCALE" == "" ]; then
  echo "need a number as second argument. Number of runs is square of number given."
  exit 1
fi

rm -f testrun.log
rm -rf reports
mkdir reports
/c/software/apache-jmeter-5.2.1/bin/jmeter -n -t get-max-id-loadtest.jmx -l testrun.log -e -o reports -Jbase_path=$BASE_PATH -Jnum_threads=$SCALE -Jnum_per_thread=$SCALE

