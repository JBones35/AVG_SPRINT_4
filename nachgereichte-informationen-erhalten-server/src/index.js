import 'dotenv/config';
import express from 'express';
import { ZBClient } from 'zeebe-node';

const { ZEEBE_ADDRESS, ZEEBE_CLIENT_ID, ZEEBE_CLIENT_SECRET } = process.env;

const app = express();
app.use(express.json());

const zbc = new ZBClient(
    {
        camundaCloud: {
            clientId: ZEEBE_CLIENT_ID,
            clientSecret: ZEEBE_CLIENT_SECRET,
            clusterId: ZEEBE_ADDRESS.split('.')[0],
        },
    }
);

app.post('/api/dokumente-einreichen', async (req, res) => {
    try {
        const { antragsNummer, ...nachgereichteVariablen } = req.body;

        if (!antragsNummer) {
            return res.status(400).send('Antragsnummer (correlationKey) fehlt.');
        }

        console.log(`Empfange Daten für Antrag ${antragsNummer}. Publishe Message an Camunda...`);

        await zbc.publishMessage({
            name: 'nachgereichte_informationen_erhalten',

            correlationKey: antragsNummer,

            variables: nachgereichteVariablen,
            timeToLive: 'PT5M' 
        });

        console.log(`Message für Antrag ${antragsNummer} erfolgreich an Camunda gesendet.`);
        res.status(200).send('Ihre Dokumente wurden erfolgreich übermittelt.');

    } catch (error) {
        console.error('Fehler beim Senden der Message an Camunda:', error);
        res.status(500).send('Ein interner Fehler ist aufgetreten.');
    }
});

app.post('/api/storno', async (req, res) => {
    try {
        console.log('Stop-Request empfangen. Camunda Prozess wird gestoppt...');
        const { antragsNummer } = req.body;
        if (!antragsNummer) {
            return res.status(400).send('Antragsnummer (correlationKey) fehlt.');
        }
    await zbc.publishMessage({
            name: 'storniere_kreditprozess_message',
            correlationKey: antragsNummer,
            variables: {},
            timeToLive: 'PT5M' 
        });

        console.log(`Stop-Message für Antrag ${antragsNummer} erfolgreich an Camunda gesendet.`);
        res.status(200).send('Der Prozess wurde erfolgreich gestoppt.');
    } catch (error) {
        console.error('Fehler beim Senden der Stop-Message an Camunda:', error);
        res.status(500).send('Ein interner Fehler ist aufgetreten.');
    }
});

app.listen(3009, () => console.log('API-Server lauscht auf Port 3009'));