# Load Balancer in Docker #

<br>

Dieser Ordner enthält eine [Dockerfile](./Dockerfile), die ein Image für einen
*Load Balancer* vor den beiden Instanzen des Microservice 2 (Resolver) erstellt.
Als *Load Balancer* wird [nginx](https://nginx.org/en/) verwendet, daher ist das
Basis-Image `nginx:alpine`.

<br>

Befehl zum Erstellen eines Images gemäß dieser `Dockerfile`:

```
docker build --tag mide/loadbalancer-for-linkshortener-on-nodejs:1.0.0 .
```

<br>

Wenn das Image lokal erstellt wurde, dann kann ein darauf basierender Container
mit dem folgenden Befehl gestartet werden:

```
docker-compose up
```

<br>