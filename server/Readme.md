# icodeit


## Pre requisites
* docker
* an s3 bucket to store playground code files



## Run locally in development
* clone this repository
* make scripts executable
  
    ```
    chmod +x ./scripts/*
    ```
* create docker images for playgrounds

    ```
    ./scripts/createcoderinstances.sh
    ```
* create rename .env.example to .env and update values
  
* run server
    ```
    yarn docker:dev
    ```
    * when running for first time, open another terminal shell into container and create db
        ```
        docker exec -it apiserver-dev /bin/sh
        ``` 
        ```
        yarn db:push
        ```
        restart the server or trigger server restart by saving a file
* optional run yarn to get intellisense, linting and prettier


## Pre-requisites for production
* minimum system requirement 2gb ram and 2 cpu cores or t2.medium
* platform uses https, use self generated certificates using certbot tool and copy 
    > cert.pem to /traefik/certs/cert.pem

    > privKey.pem to /traefik/certs/privKey.pem

    permissions
    *  cert.pem 644
    *  privKey.pem 600

    #### or update traefik.yml to use acme auto generated certificates


## Run on server in production
* clone this repository
* make scripts executable
  
    ```
    chmod +x ./scripts/*
    ```
* create docker images for playgrounds

    ```
    ./scripts/createcoderinstances.sh
    ```
* create rename .env.example to .env and update values
  
* run server

    if yarn is available  
    ```
    yarn docker:prod
    ```
    else
    ```
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up
    ```
    * when running for first time, open another terminal shell into container and create db
        ```
        docker exec -it apiserver-dev /bin/sh
        ``` 
        ```
        yarn db:push
        ```
        restart the server or trigger server restart by saving a file

## important
playground connections with clients and active playgrounds data will get lost between server restart.

run cleancoderinstances.sh script to stop and clear running playgrounds
