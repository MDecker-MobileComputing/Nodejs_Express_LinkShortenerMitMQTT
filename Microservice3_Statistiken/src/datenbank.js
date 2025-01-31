import { JSONFilePreset } from "lowdb/node";
import logging            from "logging";

const logger = logging.default("datenbank");


const anfangsDaten = [

    { "datum"    : "1999-12-31",
      "kuerzel"  : "test-1",
      "erfolg"   : true,
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    },
    { "datum"     :"1999-12-31",
      "kuerzel"   :"test-1",
      "erfolg"    :false,
      "userAgent" :"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0"
    }
];



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
 * Neuen Datensatz speichern.
 *
 * @param {*} statistikObjekt Objekt mit Statistik-Daten, das zu speichern ist.
 */
export async function insert(statistikObjekt) {

    // statistikObjekt an Array anhängen
    datenbank.data.push( statistikObjekt );

    await datenbank.write();

    anzahlDatensaetzeToLogger();
}


/**
 * Gibt alle Datensätze für Zugriffe für das angegebene Kürzel und Datum zurück.
 *
 * @param {string} kuerzel Kürzel des Shortlinks
 *
 * @param {string} datum Datum (Tag) im Format "YYYY-MM-DD"
 */
export function queryRecordsByKuerzelUndDatum(kuerzel, datum) {

    const filterFunktion = datensatz => datensatz.kuerzel === kuerzel &&
                                        datensatz.datum   === datum;

    return datenbank.data.filter( filterFunktion );
}


/**
 * Gibt alle Datensätze für Zugriffe für das angegebene Kürzel und Monat zurück.
 * 
 * @param {*} kuerzel Kürzel des Shortlinks
 * 
 * @param {*} monat Monat im Format "YYYY-MM"
 * 
 * @return {Array} Array mit Objekten, die die Anzahl der erfolgreichen und erfolglosen
 *                 Zugriffe für jeden Tag im Monat enthalten; sortiert nach aufsteigendem
 *                 Datum.
 */
export function queryRecordsByKuerzelUndMonat(kuerzel, monat) {

    const filterFunktion = datensatz => datensatz.kuerzel === kuerzel &&
                                        datensatz.datum.startsWith(monat);

    const ergebnisArray = datenbank.data.filter( filterFunktion );                                        


    const sortierFunktion = (a, b) => a.datum.localeCompare(b.datum);
    
    return ergebnisArray.sort( sortierFunktion );
}


/**
 * Schreibt aktuelle Anzahl der Datensätze auf den Logger.
 */
function anzahlDatensaetzeToLogger() {

    const anzahlDatensaetze = datenbank.data.length;
    logger.info(`Anzahl Datensätze: ${anzahlDatensaetze}`);
}