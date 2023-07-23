#!/bin/bash

cd ./playground_images/vite-react
docker compose build

docker image prune -f
