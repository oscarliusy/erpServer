#!/bin/bash -ilex

export SERVER_NAME=erpServerAuto 

pm2 stop $SERVER_NAME

npm install

npx sequelize-cli db:migrate --env production

npm run prd

