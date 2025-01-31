import mqtt    from "mqtt";
import logging from "logging";

import mqttKonfiguration from '../../mqtt-konfiguration.js';

const logger = logging.default( "mqtt-sender" );

const mqttClient =
    await mqtt.connectAsync( mqttKonfiguration.url, {
        username: mqttKonfiguration.nutzername,
        password: mqttKonfiguration.passwort
    } );

logger.info( `MQTT-Verbindung hergestellt zu Server ${mqttKonfiguration.url}` );



/**
 * Nachricht mit Statistik-Event für Auflösen von Shortlink via Kafka senden.
 *
 * @param {object} statistikObjekt Kürzel, Zeitpunkt und Flag für Erfolg
 *
 * @return {boolean} `true` wenn die Nachricht erfolgreich gesendet wurde, sonst `false`.
 */
export async function sendeStatistikNachricht( statistikObjekt ) {

    try {

        const statistikObjektAlsJsonString = JSON.stringify( statistikObjekt );

        // Schlüssel als Key der Nachricht, damit eine Änderung des Shortlinks
        // nicht die Originalnachricht überholt. Nachrichten mit demselben Schlüssel
        // kommen nämlich in dieselbe Partition des Topics, und nur für eine Partition
        // ist gewährleistet, dass eine Nachricht nicht eine andere überholt.
        const nachrichtObjekt = {

            key  : statistikObjekt.kuerzel,
            value: statistikObjektAlsJsonString
        };

        if ( verbunden === false ) {

            logger.info( "Versuche Verbindung zu Kafka-Server aufzubauen..." );
            await producer.connect();
            logger.info( "Verbindung zu Kafka-Server aufgebaut." );
            verbunden = true;

        } else {

            logger.info( "Kafka-Producer war schon verbunden." );
        }

        await producer.send({ topic: "Dozent.Decker.ResolverStats",
                              messages: [ nachrichtObjekt ]
                            });

        logger.info( `Statistik-Event für Shortlink mit Kürzel "${statistikObjekt.kuerzel}" via Kafka gesendet.` );

        //await producer.disconnect();
        // disconnect erst beim Herunterfahren des Microservices ... aber wie fängt man das ab?

        return true;
    }
    catch ( fehler ) {

        logger.error( `Fehler beim Senden einer MQTT-Nachricht mit Statistik-Event "${statistikObjekt.kuerzel}": ${fehler}` );
        return false;
    }
}
