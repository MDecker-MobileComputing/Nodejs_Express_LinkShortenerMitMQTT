import express         from "express";
import expressNunjucks from "express-nunjucks";
import logging         from "logging";
import moment          from "moment";

import { checkDatum }               from "./datum-helfer.js";
import { checkMonat }               from "./datum-helfer.js";
import { getStatsFuerTagUndLink   } from "./service.js";
import { getStatsFuerMonatUndLink } from "./service.js";
import { checkKuerzel }             from "./service.js";
import { mwRequestLogger }          from "./middleware.js";


const logger = logging.default("controller");


/**
 * Express.js konfigurieren:
 * * Allgemeine Middleware-Funktionen registrieren
 * * Template-Engine "Nunjucks" konfigurieren
 * * Routen registrieren
 * * Verzeichnis mit statischen Dateien festlegen
 *
 * @param {*} app Express.js-Objekt
 */
export function expressKonfigurieren(app) {

    app.use( mwRequestLogger );
    app.use( express.static("statischerWebContent") );

    templateEngineKonfigurieren(app);
    routenRegistrieren(app);
    
    logger.info("Express.js ist konfiguriert.");
}


/**
 * Template-Engine "Nunujs" konfigurieren.
 *
 * @param {*} app Express.js-Objekt
 */
function templateEngineKonfigurieren(app) {

    app.set( "views"      , "nunjucks-templates/" );
    app.set( "view engine", "njk"                 ); // .njk statt .html, damit VSC-Extension für Nunjucks-Syntax-Highlighting funktioniert

    // Im Modus "Entwicklung" werden Änderungen an den Template-Dateien ohne Neustart der Anwendung wirksam.
    const istDevModus = app.get("env") === "development";

    const nj = expressNunjucks( app, 
                                { watch  : istDevModus, 
                                  noCache: istDevModus 
                                } 
                              );

    nj.env.addFilter( "datum", 
                      function(date) { return moment(date).format("DD. MMMM YYYY (ddd)"); } 
                    );

    logger.info( `Nunjucks konfiguriert (Modus: ${istDevModus ? "Entwicklung" : "Produktion"}).` );
}


/**
 * Routen registrieren.
 *
 * @param app App-Objekt von Express.js
 */
function routenRegistrieren(app) {

    // Tages-Statistiken (ts)
    const pfad1 = "/ts/:kuerzel/:datum"; 
    app.get(pfad1, getStatistikFuerKuerzelUndTag);
    logger.info(`Route registriert: GET ${pfad1}`);

    // Tages-Statistiken (ms)
    const pfad2 = "/ms/:kuerzel/:monat";
    app.get(pfad2, getStatistikFuerKuerzelUndMonat);
    logger.info(`Route registriert: GET ${pfad2}`);
};


/**
 * Funktion für HTTP-GET-Pfad `/ts/:kuerzel/:monat` (Monats-Statistik).
 * 
 * @param {*} request Request-Objekt, aus dem die beiden Pfad-Parameter
 *                    `kuerzel` und `monat` ausgelesen werden.
 * 
 * @param {*} response Response-Objekt mit Seite von Template-Engine gerendert
 */
function getStatistikFuerKuerzelUndMonat(request, response) {

    const kuerzel = request.params.kuerzel;
    const monat   = request.params.monat;

    if (checkKuerzel(kuerzel) === false) {

        response.status(400); // Bad Request
        response.render("fehler_pfadparameter", {
            titel         : "Pfadparameter \"kuerzel\" enthält ungültige Zeichen",
            pfadparameter : "kuerzel",
            wert          :  kuerzel
        });
        return;
    }
    if (checkMonat(monat) === false) {

        response.status(400); // Bad Request
        response.render("fehler_pfadparameter", {
            titel         : "Pfadparameter \"monat\" ist ungültig",
            pfadparameter : "monat",
            wert          :  monat
        });
        return;
    }

    // *** Service-Funktion aufrufen ***
    const ergebnisArray = getStatsFuerMonatUndLink(kuerzel, monat);

    response.status(200); // OK
    response.render("statistik-kuerzel-monat", {
        titel            : `Zugriffs-Statisik für Shortlink mit Kürzel "${kuerzel}"`,
        kuerzel          : kuerzel,
        monat            : monat,
        ergebnis_array   : ergebnisArray // kann leer sein
    });
}


/**
 * Funktion für HTTP-GET-Pfad `/ts/:kuerzel/:datum` (Tages-Statistik).
 *
 * @param {*} request Request-Objekt, aus dem die beiden Pfad-Parameter
 *                    `kuerzel` und `datum` ausgelesen werden.
 *
 * @param {*} response Response-Objekt mit Seite von Template-Engine gerendert
 */
function getStatistikFuerKuerzelUndTag(request, response) {

    const kuerzel = request.params.kuerzel;
    const datum   = request.params.datum;

    if (checkKuerzel(kuerzel) === false) {

        response.status(400); // Bad Request
        response.render("fehler_pfadparameter", {
            titel         : "Pfadparameter \"kuerzel\" enthält ungültige Zeichen",
            pfadparameter : "kuerzel",
            wert          :  kuerzel
        });
        return;
    }
    if (checkDatum(datum) === false) {

        response.status(400); // Bad Request
        response.render("fehler_pfadparameter", {
            titel         : "Pfadparameter \"datum\" ist ungültig",
            pfadparameter : "datum",
            wert          :  datum
        });
        return;
    }

    // *** Service-Funktion aufrufen ***
    const ergebnisObjekt = getStatsFuerTagUndLink(kuerzel, datum);


    response.status(200); // OK
    response.render("statistik-kuerzel-tag", {
        titel            : `Zugriffs-Statisik für Shortlink mit Kürzel "${kuerzel}"`,
        kuerzel          : kuerzel,
        datum            : datum,
        anzahl_erfolg    : ergebnisObjekt.anzahl_erfolg,
        anzahl_erfolglos : ergebnisObjekt.anzahl_erfolglos
    });
}
