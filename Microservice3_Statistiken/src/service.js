import logging   from "logging";
import useragent from "useragent";

import { insert }                        from "./datenbank.js";
import { queryRecordsByKuerzelUndDatum } from "./datenbank.js";
import { queryRecordsByKuerzelUndMonat } from "./datenbank.js";
import { sendeBrowserDaten }             from "./kafka-sender.js";


const logger = logging.default("service");


/**
 * Statistik-Datensatz verbuchen.
 *
 * @param {*} statistikObjekt  Statistik-Datensatz, das verbucht werden soll.
 */
export async function statistikDatensatzVerbuchen(statistikObjekt) {

    statistikObjekt.datum = statistikObjekt.zeitpunkt.substring(0, 10); // nur erste 10 Zeichen von z.B. 2024-03-15T09:50:36.765Z

    delete statistikObjekt.zeitpunkt;

    await insert(statistikObjekt);

    logger.info(`Statistik-Datensatz verbucht: ${JSON.stringify(statistikObjekt)}`);

    await erstelleBrowserStatistikObjekt(statistikObjekt.userAgent);
}


async function erstelleBrowserStatistikObjekt(userAgentString) {

    const userAgent = useragent.lookup(userAgentString);

    const browserName    = `${userAgent.family} ${userAgent.major}`; // z.B. "Chrome 122" oder "Firefox 123"
    const betriebssystem = `${userAgent.os.family} ${userAgent.os.major}`; // z.B. "Windows 10" oder "macOS 10.15"

    const erfolgreich = await sendeBrowserDaten(browserName, betriebssystem);

    if (erfolgreich) {

        logger.info(`Browsername "${browserName}" und Betriebssystem "${betriebssystem}" via Kafka gesendet.`);

    } else {

        logger.error(`Browsername "${browserName}" und Betriebssystem "${betriebssystem}" konnten nicht via Kafka gesendet werden.`);
    }    
}


/**
 * Kürzel von Shortlink auf Gültigkeit prüfen (nur Buchstaben, Ziffern, Bindestrich und Unterstrich).
 *
 * @param {*} kuerzel Kürzel, das zu überprüfen ist.
 *
 * @returns `true` gdw. Kürzel gültig ist, sonst `false`.
 */
export function checkKuerzel(kuerzel) {

    const KUERZEL_REGEXP = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

    return KUERZEL_REGEXP.test(kuerzel);
}



/**
 * Ermittelt die Anzahl der erfolgreichen und erfolglosen Zugriffe für den Shortlink
 * mit dem angegebenen Kürzel am angegebenen Datum.
 *
 * @param {string} kuerzel Kürzel des Shortlinks
 *
 * @param {string} datum Datum im Format "YYYY-MM-DD"
 *
 * @returns Objekt mit folgenden Attributen: `kuerzel`, `datum`, `anzahl_erfolg`, `anzahl_erfolglos`.
 *          Wenn keine Datensätze gefunden werden, dann wird ein Objekt mit `anzahl_erfolg=0` und
 *          `anzahl_erfolglos=0` zurückgegeben.
 */
export function getStatsFuerTagUndLink(kuerzel, datum) {

    const datensaetzeArray = queryRecordsByKuerzelUndDatum(kuerzel, datum);

    const anzahlErfolg    = datensaetzeArray.filter( datensatz => datensatz.erfolg === true  ).length;
    const anzahlErfolglos = datensaetzeArray.filter( datensatz => datensatz.erfolg === false ).length;

    return {
        "kuerzel"          : kuerzel,
        "datum"            : datum,
        "anzahl_erfolg"    : anzahlErfolg,
        "anzahl_erfolglos" : anzahlErfolglos
    };
}


/**
 * Ermittelt die Anzahl der erfolgreichen und erfolglosen Zugriffe für den Shortlink
 * mit dem angegebenen Kürzel im angegebenen Monat.
 * 
 * @param {*} kuerzel Kürzel des Shortlinks
 * 
 * @param {*} monat   Monat im Format "YYYY-MM", z.B. "2024-03"
 * 
 * @return {Array} Array mit Objekten, die die Anzahl der erfolgreichen und erfolglosen
 *                 Zugriffe für jeden Tag im Monat enthalten; kann leerer Array sein,
 *                 aber nicht `null`.
 */
export function getStatsFuerMonatUndLink(kuerzel, monat) {

    const datensaetzeArray = queryRecordsByKuerzelUndMonat(kuerzel, monat); // sortiert nach aufsteigendem Tag
    if (datensaetzeArray.length === 0) { 
        
        return []; 
    }

    const ergebnisArray = [];

    let aktuellerTag = datensaetzeArray[0].datum;
    let aktuellesErgebnisObjekt = { "datum" : aktuellerTag, "anzahl_erfolg" : 0, "anzahl_erfolglos" : 0 };
    ergebnisArray.push(aktuellesErgebnisObjekt);

    for (let datensatz of datensaetzeArray) {

        const datumVonDatensatz = datensatz.datum;
        if (aktuellerTag === datumVonDatensatz) {

            if (datensatz.erfolg === true) { aktuellesErgebnisObjekt.anzahl_erfolg++; }                
            else { aktuellesErgebnisObjekt.anzahl_erfolglos++; }

        } else { // neuen Tag anfangen
            
            aktuellerTag = datumVonDatensatz;
            aktuellesErgebnisObjekt = { "datum" : aktuellerTag, "anzahl_erfolg" : 0, "anzahl_erfolglos" : 0 };
            ergebnisArray.push(aktuellesErgebnisObjekt);

            if (datensatz.erfolg === true) { aktuellesErgebnisObjekt.anzahl_erfolg++; }                
            else { aktuellesErgebnisObjekt.anzahl_erfolglos++; }
        }        
    }

    return ergebnisArray;
}
