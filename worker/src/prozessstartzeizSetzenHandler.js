export const prozessStartZeitSetzenHandler = async (job) => {
    try {
        console.log(`Task "${job.type}" aktiviert mit Key ${job.key}`);

        const startTime = new Date().toISOString();

        console.log(`Setze Prozessvariable "prozessStartZeit" auf: ${startTime}`);
        const variablesToSet = {
            processStartTime: startTime
        };
        await job.complete(variablesToSet);
        console.log(`Task "${job.type}" erfolgreich abgeschlossen.`);
    } catch (error) {
        console.log(`Fehler im Task "${job.type}": ${error.message}`);
        await job.fail(error.message, 0);
    }
};
