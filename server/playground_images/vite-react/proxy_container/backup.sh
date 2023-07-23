#! /bin/bash


if [ -n "$FILES_PUT_URL" ]
then
        cd $HOME
        tar -czvf code.tar.gz code
        curl -X PUT -T code.tar.gz -L "$FILES_PUT_URL"
fi
exit 0
