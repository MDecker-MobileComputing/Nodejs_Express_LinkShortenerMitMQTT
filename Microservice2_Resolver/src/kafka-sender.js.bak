import { Kafka, logLevel } from "kafkajs";
import logging             from "logging";

import plainNutzernamePasswort from '../../kafka-sasl.js';

const logger = logging.default("kafka-sender");

const clientId = "nodejs-shortlink-resolver-stats-sender";

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

const producer = kafka.producer();


/**
 * Nachricht mit Statistik-Event für Auflösen von Shortlink via Kafka senden.
 *
 * @param {object} statistikObjekt Kürzel, Zeitpunkt und Flag für Erfolg
 *
 * @return {boolean} `true` wenn die Nachricht erfolgreich gesendet wurde, sonst `false`.
 */
export async function sendeStatistikNachricht(statistikObjekt) {

    try {

        const statistikObjektAlsJsonString = JSON.stringify(statistikObjekt);

        // Schlüssel als Key der Nachricht, damit eine Änderung des Shortlinks
        // nicht die Originalnachricht überholt. Nachrichten mit demselben Schlüssel
        // kommen nämlich in dieselbe Partition des Topics, und nur für eine Partition
        // ist gewährleistet, dass eine Nachricht nicht eine andere überholt.
        const nachrichtObjekt = {

            key  : statistikObjekt.kuerzel,
            value: statistikObjektAlsJsonString
        };

        if (verbunden === false) {

            logger.info("Versuche Verbindung zu Kafka-Server aufzubauen...");
            await producer.connect();
            logger.info("Verbindung zu Kafka-Server aufgebaut.");
            verbunden = true;

        } else {

            logger.info("Kafka-Producer war schon verbunden.")
        }

        await producer.send({ topic: "Dozent.Decker.ResolverStats",
                              messages: [ nachrichtObjekt ]
                            });

        logger.info(`Statistik-Event für Shortlink mit Kürzel "${statistikObjekt.kuerzel}" via Kafka gesendet.`);

        //await producer.disconnect();
        // disconnect erst beim Herunterfahren des Microservices ... aber wie fängt man das ab?

        return true;
    }
    catch (fehler) {

        logger.error(`Fehler beim Senden einer Kafka-Nachricht mit Statistik-Event "${statistikObjekt.kuerzel}": ${fehler}`);
        return false;
    }
}
