export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

#!/bin/bash

# Go to app folder
cd /home/ec2-user/app

# start again
pm2 start all
