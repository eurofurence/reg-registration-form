#! /bin/bash

mkdir -p js-out
cp node_modules/@babel/polyfill/dist/polyfill.min.js js-out/
cp node_modules/fetch-polyfill/fetch.js js-out/
./node_modules/.bin/babel js --out-dir js-out
