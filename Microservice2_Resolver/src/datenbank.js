import { JSONFilePreset } from "lowdb/node";
import logging            from "logging";

const logger = logging.default("datenbank");


// Anfangsdaten, wenn die Datenbank-Datei noch nicht existiert
const anfangsDaten =  {

    "testlink_aktiv": {
        "url": "https://nodejs.org/en/about/previous-releases#release-schedule",
        "beschreibung": "Node.js Release Schedule",
        "ist_aktiv": true,
        "erstellt_am": "2024-03-09T18:34:56.238Z",
        "geaendert_am": "2024-03-09T18:37:00.000Z",
    },
    "testlink_inaktiv": {
        "url": "https://kafka.js.org/docs/admin#a-name-create-topics-a-create-topics",
        "beschreibung": "kafka.js - Admin API - createTopics()",
        "ist_aktiv": false,
        "erstellt_am": "2024-03-08T18:34:56.238Z",
        "geaendert_am": "2024-03-09T09:42:00.000Z",
    }
};


/* Objekt für Zugriff auf Datenbank. */
let datenbank = null;


/**
 * Datenbank initialisieren.
 *
 * @param {*} dateiname Dateiname für Datenbankdatei (jede Microservice-Instanz
 *                      muss eine eigene Datenbankdatei haben); muss schon
 *                      Suffix ".json" haben, aber kein Verzeichnis.
 */
export async function datenbankInitialisieren(dateiname) {

    const datenbankDatei = `db/${dateiname}`
    datenbank = await JSONFilePreset( datenbankDatei, anfangsDaten );
    await datenbank.write();

    logger.info(`Datenbank initialisiert: ${datenbankDatei}`);
    anzahlDatensaetzeToLogger();
}


/**
 * Datensatz für Shortlink mit `kuerzel` suchen.
 *
 * @param {*} kuerzel Kürzel des Short-Links
 *
 * @returns Datensatz für `kuerzel` oder `undefined`, wenn nicht vorhanden
 */
export function getByKuerzel(kuerzel) {

    return datenbank.data[ kuerzel ];
}


/**
 * Shortlink-Objekt in Datenbank speichern oder aktualisieren.
 * <br>
 * `upsert`: Insert oder Update
 *
 * @param {*} shortlinkObjekt Neues Objekt oder geändertes Objekt für Shortlink
 */
export async function upsert(shortlinkObjekt) {

    datenbank.data[ shortlinkObjekt.kuerzel ] = shortlinkObjekt;
    await datenbank.write();

    logger.info(`Datensatz upserted: ${shortlinkObjekt.kuerzel}`);
    anzahlDatensaetzeToLogger();
}


/**
 * Schreibt aktuelle Anzahl der Datensätze auf den Logger.
 */
function anzahlDatensaetzeToLogger() {

    const anzahlDatensaetze = Object.keys( datenbank.data ).length;
    logger.info(`Anzahl Datensätze: ${anzahlDatensaetze}`);
}