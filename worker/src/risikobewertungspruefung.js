import axios from 'axios';

export const risikobewertungHandler = async (job) => {
    console.log(`Job ${job.type} erhalten mit Key: ${job.key}`);
    console.log(`Job Variablen: ${JSON.stringify(job.variables)}`);

     try {
        const antragsId = job.variables.antrags_id;

        if(!antragsId) {
            console.error('AntragsId ist erforderlich');
            return job.fail('AntragsId ist erforderlich', 0);
        }

        console.log(`Hole Daten für Risikobewertung mit AntragsId: ${antragsId}`);
        const response = await axios.get(`http://localhost:3001/risikoBewertungen?antragsId=${antragsId}`);
        const daten = response.data[0];
        if(daten) {
            console.log(`Daten erhalten: ${JSON.stringify(daten)}`);
            job.complete({
                antragsId: antragsId,
                risikoScoreGesamt: daten.risikoScoreGesamt,
                risikoKategorie: daten.risikoKategorie,
                kapitaldienstfaehigkeitQuote: daten.kapitaldienstfaehigkeitQuote,
                verschuldungsgrad: daten.verschuldungsgrad,
                sicherheitenBewertung: daten.sicherheitenBewertung,
                zinssatzEmpfehlungBasispunkte: daten.zinssatzEmpfehlungBasispunkte,
                maxKreditvolumenFaktor: daten.maxKreditvolumenFaktor,
                simulationsKonfidenz: daten.simulationsKonfidenz,
                bemerkung: daten.bemerkung
            });
        } else {
            console.error('Keine Daten gefunden für die Risikobewertung');
            job.fail(`Keine Daten gefunden für AntragsId: ${antragsId},`);
        }
    } catch (error) {
        console.error(`Fehler bei der Risikobewertung: ${error.message}`);
        job.fail(`Fehler bei der Risikobewertung: ${error.message}`);
    }
};