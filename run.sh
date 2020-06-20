#!/bin/bash -ilex

export SERVER_NAME=erpServerAuto
export npm=/usr/local/src/.nvm/versions/node/v12.18.0/bin/npm
export pm2=/usr/local/src/.nvm/versions/node/v12.18.0/bin/pm2


$npm install

if ! $pm2 restart $SERVER_NAME; then
  $pm2 start ecosystem.config.js --env production
fi
