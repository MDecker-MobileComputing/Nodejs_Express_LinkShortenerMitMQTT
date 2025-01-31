import { Kafka, logLevel } from "kafkajs";
import logging             from "logging";

import plainNutzernamePasswort from '../../kafka-sasl.js';

const logger = logging.default("kafka-sender");

const clientId = "nodejs-shortlink-browser-os-statistics-sender";

let kafka = null;

if (plainNutzernamePasswort.username) {

    logger.info("Konfiguration für entfernten Kafka-Server erkannt.");

    kafka = new Kafka({ clientId: clientId,
                        brokers: ["zimolong.eu:9092"],
                        sasl: plainNutzernamePasswort,
                        ssl: false, // Disabling SSL as you're using SASL_PLAINTEXT
                        connectionTimeout: 1000,
                        authenticationTimeout: 1000,
                        logLevel: logLevel.ERROR
                      });
} else {

    logger.info("Konfiguration für lokalen Kafka-Server erkannt.");

    kafka = new Kafka({ brokers: [ "localhost:9092" ],
                        clientId: clientId,
                        logLevel: logLevel.ERROR
                     });
}


let verbunden = false;

const producer = kafka.producer({ idempotent: true, transactionalId: 'brower-os-statistiken' }); 
// idempotent: Nachricht nur einmal senden, wegen Transaktionen


/**
 * Sendet Browser- und Betriebssystem-Strings auf getrennte Kafka-Topics. Es wird eine Transaktion
 * verwendet, um sicherzustellen, dass beide Nachrichten oder keine Nachricht gesendet wird.
 * 
 * @param {*} browserName Browser-Name, z.B. "Chrome 122" oder "Firefox 123".
 * 
 * @param {*} betriebssystem Betriebssystem, z.B. "Windows 10" oder "macOS 10.15".
 * 
 * @return `true` gdw. die Nachrichten erfolgreich gesendet wurden, sonst `false`.
 */
export async function sendeBrowserDaten(browserName, betriebssystem) {

    try {

        if (verbunden === false) {

            logger.info("Versuche Verbindung zu Kafka-Server aufzubauen...");
            await producer.connect();
            logger.info("Verbindung zu Kafka-Server aufgebaut.");
            verbunden = true;

        } else {

            logger.info("Kafka-Producer war schon verbunden.")
        }

        const transaktion = await producer.transaction();
        logger.info("Transaktion gestartet.");

        try {

            // Nachrichten ohne Key, da Reihenfolge der Nachrichten nicht wichtig
            const browserNachricht        = { value: browserName    };
            const betriebssystemNachricht = { value: betriebssystem };

            await producer.send({ topic: "Dozent.Decker.BrowserStrings",
                                  messages: [ browserNachricht ]
                                });
            logger.info(`Browser-String in Kafka-Transaktion gesendet: "${browserName}"`); 
            
            await producer.send({ topic: "Dozent.Decker.BetriebssystemStrings",
                                  messages: [ betriebssystemNachricht ]
                                });                 
            logger.info(`Betriebssystem-String in Kafka-Transaktion gesendet: "${betriebssystem}"`); 

            await transaktion.commit();
            logger.info("Transaktion erfolgreich abgeschlossen.");

        } catch (error) {

            await transaktion.abort();
            logger.error(`Fehler beim Senden von Browser- und Betriebssystem-String (Transaktion zurückgerollt): ${error}`);
        }

        //await producer.disconnect();
        // disconnect erst beim Herunterfahren des Microservices ... aber wie fängt man das ab?

        return true;
    }
    catch (fehler) {

        logger.error(`Fehler beim Senden von zwei Kafka-Nachrichten mit Browser- und Betriebssystem-String: ${fehler}`);
        return false;
    }
}
