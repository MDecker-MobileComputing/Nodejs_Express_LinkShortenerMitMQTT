"use strict";

let divErgebnis       = null;
let buttonAnlegen     = null;
let buttonReset       = null;
let inputUrlLang      = null;
let inputBeschreibung = null;
let inputKuerzel      = null;


/**
 * Diese Funktion wird aufgerufen, wenn das HTML-Dokument vollständig geladen wurde.
 */
document.addEventListener( "DOMContentLoaded", function() {

    divErgebnis       = document.getElementById( "ergebnisBox"         );
    buttonAnlegen     = document.getElementById( "buttonAnlegen"       );
    buttonReset       = document.getElementById( "buttonZuruecksetzen" );
    inputUrlLang      = document.getElementById( "urlLang"             );
    inputBeschreibung = document.getElementById( "beschreibung"        );
    inputKuerzel      = document.getElementById( "kuerzelCode"         );

    buttonAnlegen.addEventListener( "click", onAnlegen       );
    buttonReset.addEventListener(   "click", onZuruecksetzen );
});


/**
 * Formluar mit HTTP-Post absenden und Ergebnis in selber Seite anzeigen.
 */
function onAnlegen() {

    const url          = inputUrlLang.value.trim();
    const kuerzel      = inputKuerzel.value.trim();
    const beschreibung = inputBeschreibung.value.trim();

    if (url.length === 0) {

        alert("Bitte eine URL eingeben!");
        return;
    }
    if (kuerzel.length === 0) {

        alert("Bitte ein Kürzel eingeben!");
        return;
    }
    if (beschreibung.length === 0) {

        alert("Bitte eine Beschreibung eingeben!");
        return;
    }

    const payloadObjekt = {
        kuerzel: kuerzel,
        url: url,
        beschreibung: beschreibung
    };


    fetch( "/api/v1/shortlink/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( payloadObjekt )
    })
    .then( response => response.json() )
    .then(data => {

        ergebnisBox.style.display = "block"; // Ergebnis-Box auf "sichtbar" schalten

        const resultBox         = document.getElementById("ergebnisBox"      );
        const ergebnisNachricht = document.getElementById("ergebnisNachricht");
        const ergebnisUrl       = document.getElementById("ergebnisUrl"      );

        if (data.erfolgreich) {

            ergebnisNachricht.textContent = "Kurz-URL wurde angelegt:";

            const neueKurzUrl = `http://localhost:8123/k/${data.kuerzel}`;

            ergebnisUrl.href        = neueKurzUrl;
            ergebnisUrl.textContent = neueKurzUrl;

            resultBox.style.color = "green";

        } else {

            ergebnisNachricht.textContent = "FEHLER: " + data.fehler;
            resultBox.style.color = "red";
        }
    })
    .catch((error) => {

         alert("FEHLER: " + error);
    });
}


/**
 * Bei Klick auf Button "Eingaben zurücksetzen" wird hiermit auch die
 * "ergebnisBox" ausgeblendet.
 */
function onZuruecksetzen() {

    divErgebnis.style.display = "none";

    inputUrlLang.value      = "";
    inputBeschreibung.value = "";
    inputKuerzel.value      = "";
}
