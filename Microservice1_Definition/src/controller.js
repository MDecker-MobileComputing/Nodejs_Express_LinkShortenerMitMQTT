import logging from "logging";

import { shortlinkNeu,
         shortlinkAendern } from "./service.js";

import { mwCheckPflichtfelderNeuerShortlink,
         mwCheckPflichtfelderAenderungShortlink,
         mwCheckUrl,
         mwWerteTypCheck,
         mwWerteTrimmen,
         mwCheckAenderungspasswort,
         mwCheckKuerzel             } from "./middleware-individuell.js";

const logger = logging.default("controller");


/**
 * Routen registrieren.
 *
 * @param app App-Objekt von Express.js
 */
export function routenRegistrieren(app) {

    const postPfad = "/api/v1/shortlink/";
    const postMiddlewareArray = [ mwWerteTypCheck,
                                  mwWerteTrimmen,
                                  mwCheckKuerzel,
                                  mwCheckPflichtfelderNeuerShortlink,
                                  mwCheckUrl ];
    app.post(postPfad, postMiddlewareArray, postShortlink);
    logger.info(`Route registriert: POST ${postPfad}`);

    const putPfad = "/api/v1/shortlink/";
    const putMiddlewareArray = [ mwWerteTypCheck,
                                 mwWerteTrimmen,
                                 mwCheckKuerzel,
                                 mwCheckAenderungspasswort,
                                 mwCheckPflichtfelderAenderungShortlink ];
    app.put(putPfad, putMiddlewareArray, putShortLink);
    logger.info(`Route registriert: PUT  ${putPfad}`);
};


/**
 * Funktion für HTTP-POST-Request um neuen Shortlink zu definieren.
 *
 * @param request  HTTP-Request, muss folgende Fehler enthalten:
 *                 `kuerzel`, `url`, `beschreibung`.
 */
async function postShortlink(request, response) {

    const kuerzel      = request.body.kuerzel;
    const url          = request.body.url;
    const beschreibung = request.body.beschreibung;

    const objNeu = {
        kuerzel     : kuerzel,
        url         : url,
        beschreibung: beschreibung
    };

    const fehlerObjekt = await shortlinkNeu(objNeu);
    if (fehlerObjekt.nutzerfehler) {

        response.status(409) // Conflict
                .send({ "nachricht": `Shortlink mit Code/Kürzel "${kuerzel}" existiert bereits.`});
        return;
    }
    if (fehlerObjekt.mqttFehler) {

        response.status(500) // Internal Server Error
        .send({ "nachricht": `Shortlink mit Code/Kürzel "${kuerzel}" konnte nicht über MQTT versendet werden.`});
        return;
    }

    objNeu.ergebnisLink = `http://localhost:8001/r/${kuerzel}`;

    response.status(201) // Created
            .send(objNeu);
}


/**
 * Funktion für HTTP-PUT-Request um Shortlink zu ändern.
 *
 * @param request  HTTP-Request, muss folgende Pflichtfelder enthalten:
 *                 - `kuerzel`: Definiert Kürzel, das geändert werden soll
 *                 - `passwort`: Nachweis, dass man der "Besitzer" des Shortlinks ist
 *                 - Mindestens eines der folgender Felder: `beschreibung`, `ist_aktiv`
 *                   (die URL kann kann aus Sicherheitsgründen nicht geändert werden)
 */
async function putShortLink(request, response) {

    const kuerzel      = request.body.kuerzel;
    const beschreibung = request.body.beschreibung;
    const istAktiv     = request.body.ist_aktiv;

    const fehlerObjekt = await shortlinkAendern(kuerzel, beschreibung, istAktiv);
    if (fehlerObjekt.mqttFehler) {

        response.status(500) // Internal Server Error
                .send({ "nachricht: ": "Shortlink-Änderung konnte nicht über MQTT versendet werden."});
        return;
    }

    response.status(200) // OK
            .send({ "nachricht: ": `Shortlink "${kuerzel}" erfolgreich geändert.`});
}
