#!/bin/sh

APP_NAME="id3"


################################
#      STOP PM2 INSTANCE	   #
################################
pm2 stop "$APP_NAME"
