import logging from "logging";

import { getShortlinkByKuerzel } from "./datenbank.js";
import { upsert                } from "./datenbank.js";
import { sendeMqttNachricht    } from "./mqtt-sender.js";

const logger = logging.default( "service" );


/**
 * Zufälliges Passwort generieren.
 *
 * @returns Passwort, z.B. `n0i6fs` oder `ub5mfk`.
 */
function passwortGenerieren() {

    // die ersten beiden Zeichen im String sind immer "0.1",
    // da der Wert von Math.random() immer zwischen 0.0 und 1.0 liegt
    return Math.random().toString( 36 ).substring( 2, 8 );
}


/**
 * Service-Funktion für neuen Shortlink.
 *
 * @param {} shortlinkObjekt Objekt mit Daten für neuen Shortlink; bei Erfolg
 *                           enthält es die folgenden zusätzlichen Attribute:
 *                           - `passwort` (generiertes Passwort)
 *                           - `erstellt_am` (Datum/Zeitpunkt der Erstellung)
 *                           - `geaendert_am` (selber Wert wie `erstellt_am`)
 *
 * @return {object} Fehlerobjekt; es ist leer, wenn kein Fehler aufgetreten ist.
 *                  Dann kann über `shortlinkObjekt.passwort` das generierte Passwort
 *                  ausgelesen werden, sowie die Datum/Zeitpunkte über `shortlinkObjekt.erstellt_am`
 *                  und `shortlinkObjekt.geaendert_am` (wegen "Call by Reference" sind diese
 *                  Änderungen für den Aufrufer sichtbar).
 *                  Bei Fehlern ist entweder das Attribut `nutzerfehler` oder `mqttFehler`
 *                  gesetzt.
 */
export async function shortlinkNeu( shortlinkObjekt ) {

    const dbErgebnis = await getShortlinkByKuerzel( shortlinkObjekt.kuerzel );
    if ( dbErgebnis ) {

        logger.info( `Shortlink existiert bereits: ${shortlinkObjekt.kuerzel}` );
        return { nutzerFehler: "Shortlink existiert bereits" };
    }

    shortlinkObjekt.passwort = passwortGenerieren();

    const jetztDateIsoString = new Date().toISOString();
    shortlinkObjekt.erstellt_am  = jetztDateIsoString;
    shortlinkObjekt.geaendert_am = jetztDateIsoString;

    await upsert( shortlinkObjekt );

    const mqttErfolg = await sendeMqttNachricht( shortlinkObjekt );
    if ( mqttErfolg ) {

        return {}; // leeres Fehlerobjekt

    } else {

        return { mqttFehler: "Shortlink konnte nicht über MQTT versendet werden." };
    }
}


/**
 * Service-Funktion für Änderung eines Shortlinks; zumindest eines der
 * Attribute `beschreibung` oder `ist_aktiv` muss gesetzt sein.
 *
 * @param {*} kuerzel Kürzel von Shortlink, der geändert werden soll.
 *
 * @param {*} beschreibung Neuer Beschreibungstext oder `null`, wenn nicht geändert werden soll.
 *
 * @param {*} istAktiv Neuer Wert für `ist_aktiv` oder `null`, wenn nicht geändert werden soll.
 */
export async function shortlinkAendern( kuerzel, beschreibung, istAktiv ) {

    const shortlinkAlt = await getShortlinkByKuerzel( kuerzel );

    shortlinkAlt.geaendert_am = new Date().toISOString();
    if ( beschreibung ) {

        shortlinkAlt.beschreibung = beschreibung;
        logger.info( `Beschreibung für Shortlink "${kuerzel}" geändert auf: ${beschreibung}` );
    }
    if ( istAktiv != null && istAktiv != undefined ) {

        shortlinkAlt.ist_aktiv = istAktiv;
        logger.info( `Aktiv-Status für Shortlink "${kuerzel}" geändert auf: ${istAktiv}` );
    }

    await upsert( shortlinkAlt ); // *** eigentliche Änderungsoperation auf der DB ***

    const mqttErfolg = await sendeMqttNachricht( shortlinkAlt );
    if ( mqttErfolg ) {

        return {}; // leeres Fehlerobjekt

    } else {

        return { mqttFehler: "Änderung konnte nicht über MQTT versendet werden." };
    }
}


/**
 * Methode überprüft, ob `passwort` das Änderungspasswort für den Shortlink
 * mit Kürzel `kuerzel` ist.
 *
 * @param {*} kuerzel Kürzel von Shortlin
 *
 * @param {*} passwort  für den Shortlink mit `kuerzel`.
 *
 * @returns `true` wenn das Passwort korrekt ist, sonst `false`.
 */
export function pruefeAenderungspasswort( kuerzel, passwort ) {

    const shortlinkObjekt = getShortlinkByKuerzel( kuerzel );
    if ( !shortlinkObjekt ) {

        logger.error( `Interner Fehler: Shortlink mit Kürzel ${kuerzel} nicht gefunden.` );
        return false;
    }

    if ( shortlinkObjekt.passwort === passwort ) {

        return true;
    }

    return false;
}
