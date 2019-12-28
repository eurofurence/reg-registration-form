#! /bin/bash

TARGETDIR=~/projects/static-website/$WEB_BASEPATH

mkdir -p $TARGETDIR
rm -rf $TARGETDIR/regui
mkdir -p $TARGETDIR/regui

cp -R config.json *.html css img js js-out lang snippets $TARGETDIR/regui

