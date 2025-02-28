# Dockerfile to build Load Balancer #

<br>

This folder contains a [Dockerfile](./Dockerfile), that builds an image for
a load balancer in front of the two instances of microservice 2 (resolver).
As load balancer [nginx](https://nginx.org/en/) is used, therefore the base
image is `nginx:alpine`.

<br>

Command to build an image according to this `Dockerfile`:

```
docker build --tag mide/loadbalancer-for-linkshortener-on-nodejs:1.0.0 .
```

<br>