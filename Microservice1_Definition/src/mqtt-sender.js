
import logging           from "logging";
import mqtt              from "mqtt";
import mqttKonfiguration from "../../mqtt-konfiguration.js";


const logger = logging.default( "mqtt-sender" );

const authObjekt = {
                     username: mqttKonfiguration.nutzername,
                     password: mqttKonfiguration.passwort
                   };

logger.info( `Versuche Verbindung zu MQTT-Server ${mqttKonfiguration.url} aufzubauen ...` );

const mqttClient = await mqtt.connectAsync( mqttKonfiguration.url,
                                            authObjekt );
logger.info( `Verbindung zu MQTT-Server aufgebaut, ClientID=${mqttClient.options.clientId}` );


/**
 * Neuen oder geänderten Shortlink via MQTT  an die Resolver-Microservices senden.
 *
 * @param {object} shortlinkObjekt  Shortlink-Objekt, das gesendet werden soll; auch
 *                                  bei Änderungen müssen alle Attribute gesetzt sein.
 *
 * @return {boolean} `true` wenn die Nachricht erfolgreich gesendet wurde, sonst `false`.
 */
export async function sendeMqttNachricht( shortlinkObjekt ) {

    try {

        // Neues Objekt für MQTT-Nachricht erstellen, das nur die benötigten
        // Attribute enthält (Passwort darf nicht über MQTT gesendet werden).
        const transportObjekt = {

            kuerzel     : shortlinkObjekt.kuerzel,
            url         : shortlinkObjekt.url,
            beschreibung: shortlinkObjekt.beschreibung,
            ist_aktiv   : shortlinkObjekt.ist_aktiv,
            erstellt_am : shortlinkObjekt.erstellt_am,
            geaendert_am: shortlinkObjekt.geaendert_am
        };

        const shortlinkObjektAlsJsonString = JSON.stringify( transportObjekt );

        await mqttClient.publishAsync( mqttKonfiguration.topic1, shortlinkObjektAlsJsonString );

        logger.info( `MQTT-Nachricht gesendet für Shortlink "${shortlinkObjekt.kuerzel}".` );

        return true;
    }
    catch ( fehler ) {

        logger.error( `Fehler beim Senden einer MQTT-Nachricht für Kürzel "${shortlinkObjekt.kuerzel}": ${fehler}` );
        return false;
    }
}
