import logging   from "logging";
import validator from "validator";

import { pruefeAenderungspasswort } from "./service.js";


// Diese Datei enthält Middleware-Funktionen, die speziell für einzelne REST-Endpunkte
// registriert werden. Sie sind nicht allgemein für alle Endpunkte gültig.

const logger = logging.default("mw-individuell");


/**
 * Middleware-Funktion für HTTP-POST/PUT-Requests: überprüft, ob die Werte
 * in einem HTTP-POST-Request die zulässigen Typen haben.
 * <br><br>
 *
 * Sollte als erstes in der Kette der Middleware-Funktionen stehen, damit
 * die nachfolgenden Funktionen davon ausgehen können, dass die Werte
 * die korrekten Typen haben.
 */
export function mwWerteTypCheck(req, res, next) {

    const kuerzel = req.body.kuerzel;
    if ((kuerzel || kuerzel === null) && typeof kuerzel !== "string") {

        const fehlerText = `Feld 'kuerzel' hat unerlaubten Typ: ${typeof kuerzel} (erwartet: string)`;
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    const url = req.body.url;
    if ((url || url === null) && typeof url !== "string") {

        const fehlerText = `Feld 'url' hat unerlaubten Typ: ${typeof url} (erwartet: string)`;
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    const beschreibung = req.body.beschreibung;
    if ((beschreibung || beschreibung === null) && typeof beschreibung !== "string") {
        const fehlerText = `Feld 'beschreibung' hat unerlaubten Typ: ${typeof beschreibung} (erwartet: string)`;
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    const istAktiv = req.body.ist_aktiv;
    if ((istAktiv || istAktiv === null) && typeof istAktiv !== "boolean") {

        const fehlerText = `Feld 'ist_aktiv' hat unerlaubten Typ: ${typeof istAktiv} (erwartet: boolean)`;
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    const passwort = req.body.passwort;
    if ((passwort || passwort === null) & typeof passwort !== "string") {

        const fehlerText = `Feld 'passwort' hat unerlaubten Typ: ${typeof passwort} (erwartet: string)`;
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    next();
}


/**
 * Middleware-Funktion zum Trimmen von Werten in einem HTTP-POST-Request.
 * Vorher muss überprüft worden sein, ob die Werte zulässige Typen haben.
 */
export function mwWerteTrimmen(req, res, next) {

    if (req.body.kuerzel) { req.body.kuerzel = req.body.kuerzel.trim(); }

    if (req.body.url) { req.body.url = req.body.url.trim(); }

    if (req.body.beschreibung) { req.body.beschreibung = req.body.beschreibung.trim(); }

    next();
}

/**
 * Regulärer Ausdruck mit erlaubten Zeichen für Kürzel.
 */
const KUERZEL_REGEXP = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

/**
 * Funktion für HTTP-POST-Request die Check, ob Kürzel gesetzt ist
 * und einen zulässigen Wert hat.
 */
export function mwCheckKuerzel(req, res, next) {

    const kuerzel = req.body.kuerzel;

    if (!kuerzel || kuerzel.length === 0) {

        const fehlerText = "Pflichtfeld 'kuerzel' fehlt oder ist leer.";
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    if (KUERZEL_REGEXP.test(kuerzel) == false) {

        const fehlerText = `Feld 'kuerzel' enthält unerlaubte Zeichen: ${kuerzel}`;
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    next();
}


/**
 * Middleware-Funktion zum überprüfen, ob die beiden Pflichtfelder für einen
 * neuen Shortlink gesetzt sind
 * (für Check von Kürzel gibt es eigene Middleware-Funktion).
 */
export function mwCheckPflichtfelderNeuerShortlink(req, res, next) {

    const url          = req.body.url;
    const beschreibung = req.body.beschreibung;

    if (!url || url.length === 0) {

        const fehlerText = "Pflichtfeld 'url' fehlt oder ist leer.";
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }
    if (!beschreibung || beschreibung.length === 0) {

        const fehlerText = "Pflichtfeld 'beschreibung' fehlt oder ist leer.";
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    next();
}


/**
 * Middleware-Funktion zum Überprüfen, ob die in einem HTTP-POST-Request
 * übergebene URL korrekt ist.
 */
export function mwCheckUrl(req, res, next) {

    const url = req.body.url;

    if ( validator.isURL(url) ) {

        logger.debug("URL ist korrekt: " + url);
        next();

    } else {

        logger.error("Ungültige URL: " + url);
        res.status(400).send({ "nachricht": "Ungültige URL für neuen Shortlink." });
    }
}


/**
 * Middleware-Funktion für HTTP-PUT-Request: überprüft, ob
 * das Änderungspasswort korrekt ist.
 */
export function mwCheckAenderungspasswort(req, res, next) {

    const kuerzel  = req.body.kuerzel;
    const passwort = req.body.passwort;

    if (!passwort || passwort.length === 0) {

        logger.warn(`Request ohne Änderungspasswort für Kürzel "${kuerzel}" abgefangen.`);
        res.status(401).send({ "nachricht": "Änderungspasswort fehlt." });
        return;
    }

    const istOkay = pruefeAenderungspasswort(kuerzel, passwort);
    if (istOkay) {

        next();

    } else {

        logger.warn(`Request mit ungültigem Änderungspasswort für Kürzel "${kuerzel}" abgefangen.`);
        res.status(401).send({ "nachricht": "Ungültiges Änderungspasswort." });
    }
}


/**
 * Middleware-Funktion für HTTP-PUT-Request: überprüft, ob mindestens
 * eines der beiden Felder `beschreibung` oder `ist_aktiv` gesetzt ist;
 * es können nur diese beiden Felder geändert werden (URL kann aus Sicherheitsgründen
 * nicht geändert werden), deshalb ist ein HTTP-PUT-Request ohne diese Felder
 * sinnlos. Kürzel und Passwort werden von vorherigen Middleware-Funktionen
 * geprüft.
 */
export function mwCheckPflichtfelderAenderungShortlink(req, res, next) {

    let mindestensEinsGesetzt = false;

    // prüfen, ob Attribut "ist_aktiv" boolean ist
    if (req.body.ist_aktiv !== undefined) {

        mindestensEinsGesetzt = true;
    }

    if (req.body.beschreibung !== undefined) {

        if (req.body.beschreibung.length === 0) {

            const fehlerText = "Feld 'beschreibung' darf nicht leer sein.";
            logger.error(fehlerText);
            res.status(400).send({ "nachricht": fehlerText });
            return;
        }

        mindestensEinsGesetzt = true;
    }

    if (mindestensEinsGesetzt === false) {

        const fehlerText = "Änderungs-Request muss mindestens eines der folgenden Felder enthalten: `beschreibung`, `ist_aktiv`.";
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    next();
}
