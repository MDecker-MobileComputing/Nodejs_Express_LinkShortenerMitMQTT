
/** Topic-Namen fangen laut Konvention ohne "/" an, auch wenn es möglich wäre. */
const topicLinks = "dozent/decker/linkshortener";

const mqttKonfigRemote = {
    nutzername: "bob",
    passwort  : "s3cr3t",
    url       : "wss://mqtt.host.com/",
    topic     : topicLinks    
};

const mqttKonfigLokal = {
    nutzername: "alice",
    passwort  : "g3h3im",
    url       : "wss://localhost:8080",
    topic     : topicLinks
};


const mqttKonfig = mqttKonfigRemote;

module.exports = mqttKonfig;
