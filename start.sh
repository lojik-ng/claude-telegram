#!/bin/bash

APP_NAME="claude-telegram"
APP_SCRIPT="npm start"
APP_DIR="/home/lojik/Documents/GitHub/claude-telegram"

cd "$APP_DIR"

if pgrep -f "$APP_NAME" > /dev/null; then
    echo "$APP_NAME is already running"
else
    echo "Starting $APP_NAME..."
    $APP_SCRIPT &
    echo "$APP_NAME started with PID $!"
fi
