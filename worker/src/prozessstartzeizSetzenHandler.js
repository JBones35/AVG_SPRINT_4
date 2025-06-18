export const prozessStartZeitSetzenHandler = async (job) => {
    try {
        console.log(`Task "${job.type}" aktiviert mit Key ${job.key}`);

        // 1. Aktuellen Zeitstempel im korrekten ISO 8601 Format (UTC) erzeugen
        const korrekterZeitstempel = new Date().toISOString()+'[GMT]';

        // Beispiel-Ausgabe: "2025-06-17T13:20:05.123Z"
        console.log(`Erzeugter Zeitstempel: ${korrekterZeitstempel}`);

        // 2. Die Prozessvariable setzen. Der Name ist hier "processStartTime".
        const variablesToSet = {
            processStartTime: korrekterZeitstempel
        };

        // 3. Den Job abschließen und die Variable an den Prozess übergeben
        await job.complete(variablesToSet);
        console.log(`Task "${job.type}" erfolgreich abgeschlossen. Variable "processStartTime" wurde gesetzt.`);

    } catch (error) {
        console.log(`Fehler im Task "${job.type}": ${error.message}`);
        await job.fail(error.message, 0);
    }
};