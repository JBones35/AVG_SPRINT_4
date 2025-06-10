import axios from 'axios';

export const kreditwuerdigkeitHandler = async (job, complete) => {
    console.log(`Job ${job.type} erhalten mit Key: ${job.key}`);
    console.log(`Job Variablen: ${JSON.stringify(job.variables)}`);

     try {
        const antragsId = job.variables.antragsId;
        const kundenId = job.variables.kundenId;

        if(!antragsId || !kundenId) {
            console.error('AntragsId und KundenId ist erforderlich');
            return complete.failure('AntragsId und KundenId sind erforderlich', 0);
        }

        console.log(`Hole Daten für Kreditwürdigkeitsprüfung mit AntragsId: ${antragsId}, KundenId: ${kundenId}`);
        const response = await axios.get(`http://kreditwuerdigkeit.flaig.io/kreditwuerdigkeitspruefungen?antragsId=${antragsId}&kundenId=${kundenId}`);
        const daten = response.data[0];
        if(daten) {
            console.log(`Daten erhalten: ${JSON.stringify(daten)}`);
            complete.success({
                antragsId: antragsId,
                kundenId: kundenId,
                kreditwuerdig: daten.kreditwuerdig,
                score: daten.score,
                bemerkung: daten.bemerkung
            });
        } else {
            console.error('Keine Daten gefunden für die Kreditwürdigkeitsprüfung');
            complete.failure(`Keine Daten gefunden für AntragsId: ${antragsId}, KundenId: ${kundenId}`);
        }
    } catch (error) {
        console.error(`Fehler bei der Kreditwürdigkeitsprüfung: ${error.message}`);
        complete.failure(`Fehler bei der Kreditwürdigkeitsprüfung: ${error.message}`);
    }
};