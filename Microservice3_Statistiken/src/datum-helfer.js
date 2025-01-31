import moment  from "moment";
import logging from "logging";

const logger = logging.default("datum-helfer");


/**
 * Datum auf Gültigkeit prüfen (Format "YYYY-MM-DD", kein Datum in
 * der Zukunft).
 *
 * @param {string} datum Datum, das zu überprüfen ist.
 *
* @returns `true` gdw. wenn Datum gültig ist
 */
export function checkDatum(datum) {

    const momentDatum = moment(datum, "YYYY-MM-DD", true);

    if (momentDatum.isValid() == false) {

        logger.warn(`Datum ist syntaktisch nicht korrekt: ${datum}`);
        return false;
    }

    const jetzt = moment();
    if (momentDatum.isAfter(jetzt)) {

        logger.warn(`Datum liegt in der Zukunft: ${datum}`);
        return false;
    }

    return true;
}


/**
 * Monatsangabe auf Gültigkeit prüfen (Format "YYYY-MM", kein Monat in
 * der Zukunft).
 * 
 * @param {string} monatUndJahr Monagsangabe im Format "YYYY-MM"
 * 
 * @returns `true` gdw. wenn Monatsangabe gültig ist (syntaktisch korrekt 
 *          und nicht in der Zukunft liegend).
 */
export function checkMonat(monatUndJahr) {

    const momentDatum = moment(monatUndJahr, "YYYY-MM", true);

    if (momentDatum.isValid() == false) {

        logger.warn(`Monatsangabe ist syntaktisch nicht korrekt: ${monatUndJahr}`);
        return false;
    }

    const jetzt = moment();
    if (momentDatum.isAfter(jetzt)) {

        logger.warn(`Montagsangabe liegt in der Zukunft: ${monatUndJahr}`);
        return false;
    }

    return true;
}