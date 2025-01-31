import logging             from "logging";
import { Kafka, logLevel } from "kafkajs";

import plainNutzernamePasswort         from '../../kafka-sasl.js';
import { statistikDatensatzVerbuchen } from "./service.js";


const logger = logging.default("kafka-empfaenger");

const clientUndGroupId = "nodejs-shortlink-stats-empfaenger";


/**
 * Kafka-Empfänger für Statistik-Events starten.
 * <br><br>
 *
 * Diese Funktion darf erst aufgerufen werden, wenn das Topic existiert!
 */
export async function kafkaEmpfaengerStarten() {

    let kafka = null;

    if (plainNutzernamePasswort.username) {

        logger.info("Konfiguration für entfernten Kafka-Server erkannt.");

        kafka = new Kafka({ clientId: clientUndGroupId,
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
                            clientId: clientUndGroupId,
                            logLevel: logLevel.ERROR
                          });
    }

    try {

        // GroupID hängt von Port-Nummer ab, damit jede Instanz des Microservices eine eigene GroupID hat
        // und somit alle Microservice-Instanzen alle Nachrichten empfangen.
        const consumer = kafka.consumer({ groupId: clientUndGroupId });

        await consumer.connect();

        await consumer.subscribe({ topic: "Dozent.Decker.ResolverStats" });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {

                const schluessel    = message.key.toString();
                const payloadString = message.value.toString();
                logger.info(`Statistik-Nachricht für Kürzel "${schluessel}" empfangen: ${payloadString}`);

                try {

                    const payloadObjekt = JSON.parse(payloadString);

                    statistikDatensatzVerbuchen(payloadObjekt);
                }
                catch (jsonFehler) {

                    logger.error(`Fehler beim Parsen der JSON-Payload: ${jsonFehler}`);
                }
            },
        });

        logger.info(`Kafka-Consumer mit Client+GroupID "${clientUndGroupId}" gestartet.`);
    }
    catch (error) {

        logger.error(`Fehler beim Starten des Kafka-Consumers: ${error}`);
    }
}

