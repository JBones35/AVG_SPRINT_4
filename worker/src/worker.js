import { ZBClient } from 'zeebe-node';
import  { kreditwuerdigkeitHandler } from './kreditwuerdigkeitHandler.js';
import  { risikobewertungHandler } from './risikobewertungspruefung.js';

const ZEEBE_ADDRESS='487e2664-45fe-4a21-9e53-860eddc37e5e.bru-2.zeebe.camunda.io:443';
const ZEEBE_CLIENT_ID='gMVS3RIcDByvRZQAq9SAVG.TPSN2Z.xH'
const ZEEBE_CLIENT_SECRET='5YStz7R99gYqn9iJh1qMGB03ywxGTyXP6ZWC1ppIZh_ieqkQzNj0CEEdTwSqup8T'

const zbClient = new ZBClient({
    camundaCloud: {
        clientId : ZEEBE_CLIENT_ID,
        clientSecret: ZEEBE_CLIENT_SECRET,
        clusterId: ZEEBE_ADDRESS.split('.')[0],
    },
    retry: true,
    maxRetries: 3,
    maxRetryTimeout: 30000,
});

zbClient.createWorker({
    taskType: 'kreditwuerdigkeitspruefung-automatisiert',
    taskHandler: kreditwuerdigkeitHandler,
    timeout: 30000,
    onReady: () => console.log(`Worker für 'kreditwuerdigkeitspruefung-automatisiert' bereit`),
    onConnectionError: () => console.error(`Worker für 'kreditwuerdigkeitspruefung-automatisiert' konnte keine Verbindung herstellen`),
});

zbClient.createWorker({
    taskType: 'risikobewertungspruefung-automatisiert',
    taskHandler: risikobewertungHandler,
    timeout: 30000,
    onReady: () => console.log(`Worker für 'risikobewertungspruefung-automatisiert' bereit`),
    onConnectionError: () => console.error(`Worker für 'risikobewertungspruefung-automatisiert' konnte keine Verbindung herstellen`),
});

console.log('Worker wird gestartet...');
process.on('SIGINT', async () => {
  console.log('SIGINT erhalten. Worker wird heruntergefahren...');
  await zbClient.close();
  console.log('Alle Worker gestoppt.');
  process.exit(0);
});

