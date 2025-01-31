import logging from "logging";
import mqtt    from "mqtt";

import { neuOderAktualisieren } from "./service.js";
import mqttKonfiguration        from '../../mqtt-konfiguration.js';

const logger = logging.default( "mqtt-empfaenger" );


const authObjekt = {
                     username: mqttKonfiguration.nutzername,
                     password: mqttKonfiguration.passwort
                   };

const mqttClient = await mqtt.connectAsync( mqttKonfiguration.url,
                                            authObjekt );

logger.info( `MQTT-Verbindung hergestellt zu Server ${mqttKonfiguration.url}` );



/**
 * MQTT-Empfänger für Shortlink-Definitionen/Updates starten, also
 * entsprechend Topic abonnieren.
 */
export async function mqttEmpfaengerStarten() {

    try {

        mqttClient.subscribe( mqttKonfiguration.topic1 );

        mqttClient.on( "message", async ( topic, payload ) => {

            try {

                const payloadObjekt = JSON.parse( payload );

                await neuOderAktualisieren( payloadObjekt ); // Service-Funktion aufrufen für Verbuchung in DB
            }
            catch ( jsonFehler ) {

                logger.error( `Fehler beim Parsen der JSON-Payload: ${jsonFehler}` );
            }
        });

        logger.info( `MQTT-Subscription für Topic ${mqttKonfiguration.topic} gestartet.` );
    }
    catch ( fehler ) {

        logger.error( `Fehler beim Starten des MQTT-Consumers: ${fehler}` );
    }
}

