import logging from "logging";

import { getByKuerzel, upsert    } from "./datenbank.js";
import { sendeStatistikNachricht } from "./kafka-sender.js";


const logger = logging.default("service");


/**
 * Service-Funktion für Auflösen von Shortlink.
 *
 * @param {*} kuerzel Kürzel von Shortlink, der aufgelöst werden soll
 *
 * @param {string} User-Agent-String des Browsers, wird für Statistik-Event benötigt
 *
 * @returns Objekt mit URL und Beschreibung des Shortlinks oder leeres Objekt,
 *          wenn nicht gefunden oder gefundener Shortlink deaktiviert ist.
 */
export async function shortlinkAufloesen(kuerzel, userAgentString) {

    const dbErgebnisObjekt = getByKuerzel(kuerzel);
    if (dbErgebnisObjekt === undefined) {

        logger.info(`Kürzel nicht gefunden: ${kuerzel}`);
        await statistikNachrichtSenden(kuerzel, false, userAgentString);

        return {};

    } else {

        if (dbErgebnisObjekt.ist_aktiv === false) {

            logger.info(`Kürzel gefunden, ist aber deaktiviert: ${kuerzel}`);
            await statistikNachrichtSenden(kuerzel, false, userAgentString);

            return {};

        } else {

            logger.info(`Kürzel gefunden, ist aktiv: ${kuerzel}`);
            await statistikNachrichtSenden(kuerzel, true, userAgentString);

            return dbErgebnisObjekt;
        }
    }
}


/**
 * Statistik-Event über erfolgreiches/erfolgloses Auflösen von Shortlink senden.
 *
 * @param {*} kuerzel Kürzel des Shortlinks
 *
 * @param {*} erfolg {@code true} gdw., wenn der Shortlink erfolgreich aufgelöst wurde,
 *                   sonst {@code false} (`false` auch bei deaktiviertem Shortlink).
 *
 * @param {string} userAgentString User-Agent-String des Browsers
 */
async function statistikNachrichtSenden(kuerzel, erfolg, userAgentString) {

    const statistikObjekt = {
        kuerzel   : kuerzel,
        erfolg    : erfolg,
        zeitpunkt : new Date(),
        userAgent : userAgentString
    };

    await sendeStatistikNachricht(statistikObjekt);
}


/**
 * Shortlink-Datensatz (via Kafka empfangen) neu anlegen oder aktualisieren.
 *
 * @param {*} shortlinkObjekt Neues oder zu aktualisierendes Shortlink-Objekt.
 */
export async function neuOderAktualisieren(shortlinkObjekt) {

    const kuerzel = shortlinkObjekt.kuerzel;

    const dbErgebnisObjekt = getByKuerzel(kuerzel);
    if (dbErgebnisObjekt === undefined) {

        logger.info(`Versuche neuen Shortlink in DB zu speichern: ${kuerzel}`);

    } else {

        logger.info(`Versuche Shortlink in DB zu aktualisieren: ${kuerzel}`);
    }

    await upsert(shortlinkObjekt);
}
