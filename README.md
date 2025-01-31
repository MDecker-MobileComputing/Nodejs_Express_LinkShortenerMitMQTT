# Link-Shortener mit Microservice-Architektur und MQTT #

<br>

Einfacher [Link-Shortener-Dienst](https://de.wikipedia.org/wiki/Kurz-URL-Dienst) mit Microservice-Architektur
und [Nodejs](https://nodejs.org/en/about):

* Der Microservice "Shortlink Definition" schickt neue Shortlink-Definition via [MQTT](https://mqtt.org/)
  an die Instanzen des Microservice "Shortlink Resolver".

* Der Resolver-Dienst verwendet die Template-Engine [Nunjucks](https://mozilla.github.io/nunjucks/) zur Erzeugung
  der Ergebnis-Seiten.

* Es gibt auch noch einen Statistik-Service der weitere Möglichkeiten mit Nunjucks demonstriert.

<br>

----

## Microservices-Instanzen ##

<br>

| Microservice         | Instanz          | Portnummer                      |
| -------------------- | ---------------- | ------------------------------- |
| Shortlink Definition | Nur eine Instanz |  [7000](http://localhost:7000)  |
| Shortlink Resolver   | Instanz 1        |  [8001](http://localhost:8001)  |
| Shortlink Resolver   | Instanz 2        |  [8002](http://localhost:8002)  |
| Statistiken          | Nur eine Instanz |  [9000](http://localhost:9000)  |

<br>

Das Repository enthält im Ordner `.vscode/` eine Datei [launch.json](.vscode/launch.json)
mit *Launch Configurations* für alle in der Tabelle aufgeführten Microservice-Instanzen.

<br>

----

## Siehe auch ##

<br>

Link Shortener mit *Spring Boot* und Kafka:
siehe [dieses Repo](https://github.com/MDecker-MobileComputing/Maven_SpringBoot_LinkShortener)

<br>

Diese Anwendung mit Nodejs und Kafka:
siehe [dieses Repo](https://github.com/MDecker-MobileComputing/Nodejs_Express_LinkShortenerMitKafka)

<br>
