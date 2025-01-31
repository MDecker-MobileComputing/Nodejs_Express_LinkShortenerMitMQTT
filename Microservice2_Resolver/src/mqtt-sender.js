import mqtt    from "mqtt";
import logging from "logging";

import mqttKonfiguration from '../../mqtt-konfiguration.js';

const logger = logging.default( "mqtt-sender" );

const authObjekt = {
                     username: mqttKonfiguration.nutzername,
                     password: mqttKonfiguration.passwort
                   };

const mqttClient = await mqtt.connectAsync( mqttKonfiguration.url, authObjekt );

logger.info( `MQTT-Verbindung hergestellt zu Server ${mqttKonfiguration.url}` );



/**
 * Nachricht mit Statistik-Event für Auflösen von Shortlink via MQTT senden.
 *
 * @param {object} statistikObjekt Kürzel, Zeitpunkt und Flag für Erfolg
 *
 * @return {boolean} `true` wenn die Nachricht erfolgreich gesendet wurde, sonst `false`.
 */
export async function sendeStatistikNachricht( statistikObjekt ) {

    try {

        const statistikObjektAlsJsonString = JSON.stringify( statistikObjekt );

        await mqttClient.publishAsync( mqttKonfiguration.topic2, statistikObjektAlsJsonString );

        logger.info( `Statistik-Event für Shortlink mit Kürzel "${statistikObjekt.kuerzel}" via MQTT gesendet.` );

        return true;
    }
    catch ( fehler ) {

        logger.error( `Fehler beim Senden einer MQTT-Nachricht mit Statistik-Event "${statistikObjekt.kuerzel}": ${fehler}` );
        return false;
    }
}
