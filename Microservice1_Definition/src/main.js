import logging from "logging";
import express from "express";

import { routenRegistrieren      } from "./controller.js";
import { datenbankInitialisieren } from "./datenbank.js";
import { mwRequestLogger         } from "./middleware-allgemein.js";
import { mwCatchIllegalJson      } from "./middleware-allgemein.js";

const logger = logging.default( "main-definition" );


// Express.js konfigurieren
const app = express();
app.use( express.static( "statischerWebContent" ) );
app.use( express.json() );
app.use( mwRequestLogger    );
app.use( mwCatchIllegalJson );
routenRegistrieren( app );
logger.info( "Express.js initialisiert." );


datenbankInitialisieren();

// Web-Server starten
const PORTNUMMER = 7000;
app.listen( PORTNUMMER,
            () => { logger.info(`Web-Server auf Port ${PORTNUMMER} gestartet.\n`); }
          );