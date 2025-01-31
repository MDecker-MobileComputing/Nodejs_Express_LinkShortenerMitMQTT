import logging from "logging";
import express from "express";

import { datenbankInitialisieren } from "./datenbank.js";
import { expressKonfigurieren    } from "./controller.js";
import { kafkaEmpfaengerStarten  } from "./kafka-empfaenger.js";

const logger = logging.default("main-statistik");


await datenbankInitialisieren();


const app = express();
expressKonfigurieren(app);


kafkaEmpfaengerStarten();


// Web-Server starten
const PORTNUMMER = 10000;
app.listen( PORTNUMMER,
            () => { logger.info(`Web-Server auf Port ${PORTNUMMER} gestartet.\n`); }
          );
