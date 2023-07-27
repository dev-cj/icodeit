# Frontend for icodeit

### Pre requisites
* docker

## Run locally in development
```
    docker compose up
```


### Pre requisites for production
* domain name
* a wildcard subdomain entry in dns record to your ec2 instance or elastic ip

## Run on vercel in production
* fork this repository
* replace icodeit.xyz in frontend repository with your domain
* give vercel access to forked repository
* select frontend folder
* deploy
