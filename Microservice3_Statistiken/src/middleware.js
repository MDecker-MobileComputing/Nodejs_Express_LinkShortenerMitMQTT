import logging from "logging";


const logger = logging.default("middleware-funktionen");


/**
 * Diese Middleware-Funktion schreibt für jeden HTTP-Request eine Zeile
 * mit HTTP-Verb (z.B. `GET` oder `POST`) und Pfad (z.B. `/api/v1/...`
 * auf den Logger `request`.
 * <br><br>
 *
 * Beispiel-Zeilen:
 * ```
 * 16:53:06.900 [http-anfrage] GET  /api/v1/sg/VWL
 * 16:53:46.390 [http-anfrage] POST /api/v1/sg/
 * ```
 *
 * @param {*} req Request-Objekt, aus dem HTTP-Verb und Pfad gelesen werden
 *
 * @param {*} res Response-Objekt (wird nicht verwendet)
 *
 * @param {*} next Funktion, um nächste Middleware-Funktion aufzurufen
 */
export function mwRequestLogger(req, res, next) {

    logger.info(`${req.method} ${req.originalUrl}`);

    next();
};
