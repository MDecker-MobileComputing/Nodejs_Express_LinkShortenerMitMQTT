# Lokalen MQTT-Server mit Docker ##

<br>

Dieses Verzeichnis enthält die Datei [docker-compose.yml](./docker-compose.yml), mit der 
ein lokaler MQTT-Server – nämlich [EMQX von EMQ Technologies](https://www.emqx.com/en/downloads-and-install/broker) –
in einem Docker-Container gestartet werden kann.

<br>

Befehl zum Starten:
```
docker-compose up
```

<br>

Befehl zum Pausieren und Neustarten:
```
docker-compose stop
docker-compose start
```

<br>

Befehl zum Löschen (in Container gespeicherte Nachrichten mit URL-Definitionen und Statistiken gehen verloren!):
```
docker-compose down
```

----

## Admin-UI ##

<br>

Wenn der Container läuft, dann ist ein Web/Admin-UI unter http://localhost:18083/ verfügbar.

<br>

**Anmeldedaten:**

* Nutzername: `admin`
* Passwort: `public`

Nach der ersten Anmeldung muss ein neues Passwort vergeben werden.

<br>