import logging from "logging";
import mqtt    from "mqtt";

import mqttKonfiguration               from '../../mqtt-konfiguration.js';
import { statistikDatensatzVerbuchen } from "./service.js";


const logger = logging.default( "mqtt-empfaenger" );

const authObjekt = {
    username: mqttKonfiguration.nutzername,
    password: mqttKonfiguration.passwort
  };

logger.info( `Versuche Verbindung zu MQTT-Server ${mqttKonfiguration.url} aufzubauen ...` );

const mqttClient = await mqtt.connectAsync( mqttKonfiguration.url,
                                            authObjekt );

logger.info( `Verbindung zu MQTT-Server aufgebaut, ClientID=${mqttClient.options.clientId}` );


/**
 * MQTT-Empfänger für Statistik-Events starten.
 */
export async function mqttEmpfaengerStarten() {

    try {

        mqttClient.subscribe( mqttKonfiguration.topic2 );

        mqttClient.on( "message", async ( topic, payload ) => {

            try {

                const payloadObjekt = JSON.parse( payload );

                await statistikDatensatzVerbuchen( payloadObjekt ); // Service-Funktion aufrufen für Verbuchung in DB
            }
            catch ( jsonFehler ) {

                logger.error( `Fehler beim Parsen der JSON-Payload: ${jsonFehler}` );
            }
        });

        logger.info( `MQTT-Subscription für Topic ${mqttKonfiguration.topic2} gestartet.` );
    }
    catch (error) {

        logger.error( `Fehler beim Starten des MQTT-Consumers: ${error}` );
    }
}

