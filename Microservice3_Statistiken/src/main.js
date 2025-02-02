import logging from "logging";
import express from "express";

import { datenbankInitialisieren } from "./datenbank.js";
import { expressKonfigurieren    } from "./controller.js";
import { mqttEmpfaengerStarten   } from "./mqtt-empfaenger.js";

const logger = logging.default( "main-statistik" );


await datenbankInitialisieren();


const app = express();
expressKonfigurieren( app );


mqttEmpfaengerStarten();


// Web-Server starten
const PORTNUMMER = 9000;
app.listen( PORTNUMMER,
            () => { logger.info(`Web-Server auf Port ${PORTNUMMER} gestartet.\n`); }
          );
