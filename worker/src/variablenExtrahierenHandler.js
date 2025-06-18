export const variablenExtrahierenHandler = (job) => {
    try {
        console.log("variablenExtrahierenHandler", job);

        const request = job.variables.antrag.request;
        if (!request || !request.body || typeof request.body !== 'object') {
            const errorMessage = "Die eingehenden Job-Variablen haben nicht die erwartete Struktur 'request.body'.";
            console.error(errorMessage);
            // Job als fehlgeschlagen markieren
            return job.fail(errorMessage, 0);
        }
        console.log("Extrahiere Variablen aus dem Body:", request);

        const flattenedVariables = { ...request.body };
        console.log("Folgende 'flache' Variablen werden an die Prozessinstanz übergeben:", JSON.stringify(flattenedVariables, null, 2));

        job.complete(flattenedVariables, 0);
        console.log(`Job ${job.key} erfolgreich abgeschlossen.`);
    } catch (error) {
        console.error(`Fehler bei der Bearbeitung des Jobs ${job.key}:`, error);
        job.fail(error.message, 0);
    }
};