# Link-Shortener mit Microservice-Architektur und Kafka #

<br>

Einfacher [Link-Shortener-Dienst](https://de.wikipedia.org/wiki/Kurz-URL-Dienst) mit Microservice-Architektur und [Nodejs](https://nodejs.org/en/about):

* Der Microservice "Shortlink Definition" schickt neue Shortlink-Definition via [Kafka](https://kafka.apache.org/)
an die Instanzen des Microservice "Shortlink Resolver".

* Der Resolver-Dienst verwendet die Template-Engine [Nunjucks](https://mozilla.github.io/nunjucks/) zur Erzeugung der
Ergebnis-Seiten.

* Es gibt auch noch einen Statistik-Service der weitere Möglichkeiten mit Nunjucks demonstriert.

<br>

----

## Microservices-Instanzen ##

| Microservice | Instanz | Portnummer |
| --- | --- | --- |
| Shortlink Definition | Nur eine Instanz |  [8000](http://localhost:8000)  |
| Shortlink Resolver   | Instanz 1        |  [9001](http://localhost:9001)  |
| Shortlink Resolver   | Instanz 2        |  [9002](http://localhost:9002)  |
| Statistiken          | Nur eine Instanz | [10000](http://localhost:10000) |

<br>

Das Repository enthält im Ordner `.vscode/` eine Datei [launch.json](.vscode/launch.json)
mit *Launch Configurations* für alle in der Tabelle aufgeführten Microservice-Instanzen.

<br>

----

## Siehe auch ##

<br>

Ähnliches Microservice-Beispiel mit Maven:
siehe [dieses Repo](https://github.com/MDecker-MobileComputing/Maven_SpringBoot_LinkShortener)

<br>

Nodejs und Kafka: siehe [dieses Repo](https://github.com/MDecker-MobileComputing/Nodejs_KafkaTest)

<br>
