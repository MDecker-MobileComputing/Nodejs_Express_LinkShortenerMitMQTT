import mqtt    from "mqtt";
import logging from "logging";

import mqttKonfiguration from '../../mqtt-konfiguration.js';


const logger = logging.default( "mqtt-init" );

const authObjekt = {
                     username: mqttKonfiguration.nutzername,
                     password: mqttKonfiguration.passwort
                   };

const mqttClient = await mqtt.connectAsync( mqttKonfiguration.url, authObjekt );

logger.info( `Verbindung zu MQTT-Server aufgebaut, ClientID=${mqttClient.options.clientId}` );

export default mqttClient;
