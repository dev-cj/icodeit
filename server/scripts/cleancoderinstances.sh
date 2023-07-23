#! /bin/bash

docker container stop $(docker container ls -a -q --filter name=coder_*)

docker container rm $(docker container ls -a -q --filter name=coder_*)

docker volume rm $(docker volume ls -q --filter name=volume_coder_*)

docker network rm $(docker network ls -q --filter name=network_coder_*)

docker image prune -f
