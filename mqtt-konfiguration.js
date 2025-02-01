
/**
 * Topic mit JSON-Objekten für neu angelegte Kurzlinks.
 *
 * Topic-Namen fangen laut Konvention ohne "/" an, auch wenn es möglich wäre.
 */
const topicLinks        = "dozent/decker/linkshortener";
const topicStatsLinks   = "dozent/decker/linkstats";
const topicStatsBrowser = "dozent/decker/browserstats";


const mqttKonfigRemote = {
    nutzername: "alice",
    passwort  : "g3h3im",
    url       : "wss://mqtt.beispiel-host.de",
    topic1    : topicLinks,
    topic2    : topicStatsLinks,
    topic3    : topicStatsBrowser,
};

const mqttKonfigLokal = {
    nutzername: "bob",
    passwort  : "s3cr3t",
    url       : "wss://localhost:8080",
    topic1    : topicLinks,
    topic2    : topicStatsLinks,
    topic3    : topicStatsBrowser,
};


const mqttKonfig = mqttKonfigRemote;

module.exports = mqttKonfig;
