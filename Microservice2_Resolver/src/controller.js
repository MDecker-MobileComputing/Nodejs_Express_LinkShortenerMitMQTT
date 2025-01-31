import logging from "logging";

import { shortlinkAufloesen } from "./service.js";

const logger = logging.default("controller");


/**
 * Routen registrieren.
 *
 * @param app App-Objekt von Express.js
 */
export function routenRegistrieren(app) {

    const pfad = "/r/:kuerzel";
    app.get(pfad, getKuerzel);
    logger.info(`Route registriert: GET ${pfad}`);
};


/**
 * Funktion für HTTP-GET-Request zum Auflösen eines Kurzlinks.
 * Gibt eine mit Nunjucks gerenderte HTML-Seite zurück.
 *
 * @param {*} request Request-Objekt von Express.js, aus dem der
 *                    Pfad-Parameter `kuerzel` ausgelesen wird
 *
 * @param {*} response Response-Objekt von Express.js, in das
 *                     der HTTP-Status-Code sowie die gerenderte
 *                     HTML-Seite von der Template-Engine geschrieben
 *                     wird
 */
async function getKuerzel(request, response) {

    const kuerzel = request.params.kuerzel.trim();

    const userAgentString = request.headers["user-agent"];

    // *** Service-Funktion aufrufen ***
    const ergObjekt = await shortlinkAufloesen(kuerzel, userAgentString);

    if (!ergObjekt.url) {

        response.status(404); // Not found

        response.render("nicht_gefunden", {
            titel   : "Fehler",
            kuerzel : kuerzel
        });

    } else {

        response.status(200); // OK

        response.render("gefunden", {
            titel        : `Shortlink "${kuerzel}" aufgelöst`,
            url          : ergObjekt.url,
            beschreibung : ergObjekt.beschreibung,
            erstellt_am  : ergObjekt.erstellt_am,
            geaendert_am : ergObjekt.geaendert_am
        });
    }
}

