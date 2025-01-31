import { JSONFilePreset } from "lowdb/node";
import logging            from "logging";

const logger = logging.default("datenbank");


const anfangsDaten =  {

    "lowdb": {
        "url": "https://github.com/typicode/lowdb?tab=readme-ov-file#lowdb--",
        "beschreibung": "Repo von lowdb auf GitHub",
        "ist_aktiv": true,
        "erstellt_am": "2025-01-09T18:34:56.238Z",
        "geaendert_am": "2025-01-09T18:37:00.000Z",
        "passwort": "g3h3im"
    }
};


/* Objekt für Zugriff auf Datenbank. */
let datenbank = null;


/**
 * Datenbank initialisieren.
 */
export async function datenbankInitialisieren() {

    const datenbankDatei = "db.json";
    datenbank = await JSONFilePreset( datenbankDatei, anfangsDaten );
    await datenbank.write();

    logger.info(`Datenbank initialisiert: ${datenbankDatei}`);
    anzahlDatensaetzeToLogger();
}


/**
 * Shortlink-Objekt anhand des Kürzels aus der Datenbank auslesen.
 *
 * @param {*} kuerzel Shortlink-Kürzel, für den Objekt zurückgegeben werden soll.
 *
 * @return {*} Shortlink-Objekt, das zum Kürzel passt, oder `undefined`, wenn das
 *             Objekt nicht gefunden wurde.
 */
export function getShortlinkByKuerzel(kuerzel) {

    return datenbank.data[ kuerzel ];
}


/**
 * Neues Shortlink-Objekt in Datenbank einfügen oder bestehendes aktualisieren.
 *
 * @param {*} shortlinkObjekt Neues oder aktualisiertes Shortlink-Objekt.
 */
export async function upsert(shortlinkObjekt) {

    datenbank.data[ shortlinkObjekt.kuerzel ] = shortlinkObjekt;
    await datenbank.write();

    logger.info(`Datensatz upserted für Shortlink "${shortlinkObjekt.kuerzel}".`);
    anzahlDatensaetzeToLogger();
}


/**
 * Schreibt aktuelle Anzahl der Datensätze auf den Logger.
 */
function anzahlDatensaetzeToLogger() {

    const anzahlDatensaetze = Object.keys( datenbank.data ).length;
    logger.info(`Anzahl Datensätze: ${anzahlDatensaetze}`);
}
