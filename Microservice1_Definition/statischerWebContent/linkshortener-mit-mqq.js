"use strict";

let divErgebnis        = null;
let buttonAnlegen      = null;
let buttonReset        = null;
let inputUrlLang       = null;
let inputBeschreibung  = null;
let inputKuerzel       = null;
let linkErgebnisUrl    = null;
let spanErgebnisUrl    = null;
let pErgebnisNachricht = null;


/**
 * Diese Funktion wird aufgerufen, wenn das HTML-Dokument vollständig geladen wurde.
 */
document.addEventListener( "DOMContentLoaded", function() {

    divErgebnis        = document.getElementById( "ergebnisBox"         );

    buttonAnlegen      = document.getElementById( "buttonAnlegen"       );
    buttonReset        = document.getElementById( "buttonZuruecksetzen" );

    inputUrlLang       = document.getElementById( "urlLang"             );
    inputBeschreibung  = document.getElementById( "beschreibung"        );
    inputKuerzel       = document.getElementById( "kuerzelCode"         );

    linkErgebnisUrl    = document.getElementById( "ergebnisLink"        );
    spanErgebnisUrl    = document.getElementById( "ergebnisLinkText"    );

    pErgebnisNachricht = document.getElementById( "ergebnisNachricht"   );

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

    if ( url.length === 0 ) {

        alert("Bitte eine URL eingeben!");
        return;
    }
    if ( kuerzel.length === 0 ) {

        alert("Bitte ein Kürzel eingeben!");
        return;
    }
    if ( beschreibung.length === 0 ) {

        alert("Bitte eine Beschreibung eingeben!");
        return;
    }

    const payloadObjekt = {
        kuerzel      : kuerzel,
        url          : url,
        beschreibung : beschreibung
    };


    fetch( "/api/v1/shortlink/", {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify( payloadObjekt )
    })
    .then( response => response.json()
                               .then( data => ( { status: response.status, 
                                                  body: data }) ) 
         )
    .then( result => {

        if ( result.status === 201 ) {

            pErgebnisNachricht.innerHTML = "Kurzlink erfolgreich angelegt!";

            const shortLink = result.body.ergebnisLink;
            spanErgebnisUrl.textContent = shortLink;
            linkErgebnisUrl.href        = shortLink;

        } else {

            spanErgebnisUrl.textContent = "";
            linkErgebnisUrl.href        = "";

            const fehlermeldung = result.body.nachricht;
            pErgebnisNachricht.innerHTML = "Fehler: " + fehlermeldung;
        }
    })
    .catch( ( fehler ) => {

         alert( "FEHLER: " + fehler );
    });
}


/**
 * Bei Klick auf Button "Eingaben zurücksetzen" wird hiermit auch die
 * "ergebnisBox" ausgeblendet.
 */
function onZuruecksetzen() {

    inputUrlLang.value           = "";
    inputBeschreibung.value      = "";
    inputKuerzel.value           = "";
    spanErgebnisUrl.value        = "";
    linkErgebnisUrl.href         = "";
    spanErgebnisUrl.textContent  = "";
    pErgebnisNachricht.innerHTML = "";    
}
