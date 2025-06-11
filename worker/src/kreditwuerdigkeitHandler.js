import axios from 'axios';

export const kreditwuerdigkeitHandler = async (job) => {
    console.log(`Job ${job.type} erhalten mit Key: ${job.key}`);
    console.log(`Job Variablen: ${JSON.stringify(job.variables)}`);

     try {
        const antragsId = job.variables.antrags_id;
        const kundenId = job.variables.kunden_id;

        if(!antragsId || !kundenId) {
            console.error('AntragsId und KundenId ist erforderlich');
            return job.fail('AntragsId und KundenId sind erforderlich', 0);
        }

        console.log(`Hole Daten für Kreditwürdigkeitsprüfung mit AntragsId: ${antragsId}, KundenId: ${kundenId}`);
        const response = await axios.get(`http://localhost:3000/kreditwuerdigkeitspruefungen?antragsId=${antragsId}&kundenId=${kundenId}`);
        const daten = response.data[0];
        if(daten) {
            if (daten.systemStatus === 'FEHLER_BEI_PRUEFUNG') {
                job.error(`System nicht erreichbar für AntragsId: ${antragsId}, KundenId: ${kundenId}`, 0);
                return;
            }
            console.log(`Daten erhalten: ${JSON.stringify(daten)}`);
            job.complete({
                antragsId: antragsId,
                kundenId: kundenId,
                kreditwuerdig: daten.kreditwuerdig,
                score: daten.score,
                bemerkung: daten.bemerkung
            });
        } else {
            console.error('Keine Daten gefunden für die Kreditwürdigkeitsprüfung');
            job.fail(`Keine Daten gefunden für AntragsId: ${antragsId}, KundenId: ${kundenId}`);
        }
    } catch (error) {
        console.error(`Fehler bei der Kreditwürdigkeitsprüfung: ${error.message}`);
        job.fail(`Fehler bei der Kreditwürdigkeitsprüfung: ${error.message}`);
    }
};