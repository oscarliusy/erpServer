#!/bin/bash -ilex

export SERVER_NAME=erpServerAuto

npm install

if ! pm2 restart $SERVER_NAME; then
  pm2 start ecosystem.config.js --env production
fi
