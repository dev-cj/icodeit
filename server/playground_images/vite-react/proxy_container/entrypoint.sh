#! /bin/bash
trap 'exit 0' SIGTERM


if [ -n "$FILES_GET_URL" ]
then
    cd $HOME
    rm -rf code
    curl -sS -o code.tar.gz "$FILES_GET_URL"

    tar -xzvf code.tar.gz
    rm code.tar.gz
  
fi

envsubst "\$codeservicename" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
nginx -g "daemon off;" &

cd $HOME/file_server
npm install
npm start



# Wait indefinitely to keep the container running
while true; do sleep 1; done
