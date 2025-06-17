import 'dotenv/config';
import { ZBClient } from 'zeebe-node';
import  { kreditwuerdigkeitHandler } from './kreditwuerdigkeitHandler.js';
import  { risikobewertungHandler } from './risikobewertungspruefung.js';
import { absageErstellenHandler } from './absageErstellenHandler.js';
import { kreditvertragErstellenHandler } from './kreditvertragErstellenHandler.js';
import { mailSendenHandler } from './mailSendenHandler.js';
import { mailFürAnforderungenSendenHandler } from './mailFürAnforderungenSendenHandler.js';
import { stornierungsMailSendenHandler } from './stornierungsMailSendenHandler.js';
import { prozessStartZeitSetzenHandler } from './prozessstartzeizSetzenHandler.js';

const { ZEEBE_ADDRESS, ZEEBE_CLIENT_ID, ZEEBE_CLIENT_SECRET } = process.env;

const zbClient = new ZBClient({
    camundaCloud: {
        clientId : ZEEBE_CLIENT_ID,
        clientSecret: ZEEBE_CLIENT_SECRET,
        clusterId: ZEEBE_ADDRESS.split('.')[0],
    },
    retry: true,
    maxRetries: 3,
    maxRetryTimeout: 30000,
    grpc: {
    'grpc.keepalive_time_ms': 10000,
    'grpc.keepalive_permit_without_calls': 1,
    'grpc.keepalive_timeout_ms': 5000,
    'grpc.http2.min_time_between_pings_ms': 10000,
    'grpc.http2.max_pings_without_data': 0,
    }
});

const workersToCreate = [
    { taskType: 'kreditwuerdigkeitspruefung-automatisiert', handler: kreditwuerdigkeitHandler },
    { taskType: 'risikobewertungspruefung-automatisiert', handler: risikobewertungHandler },
    { taskType: 'absage-erstellen-automatisiert', handler: absageErstellenHandler },
    { taskType: 'kreditvertrag-erstellen-automatisiert', handler: kreditvertragErstellenHandler },
    { taskType: 'mail-senden-automatisiert', handler: mailSendenHandler },
    { taskType: 'mail-fuer-anforderungen-senden-automatisiert', handler: mailFürAnforderungenSendenHandler },
    { taskType: 'stornierungs-mail-senden-automatisiert', handler: stornierungsMailSendenHandler },
    { taskType: 'prozess-start-zeit-setzen', handler: prozessStartZeitSetzenHandler }
];

workersToCreate.forEach(workerConfig => {
    zbClient.createWorker({
        taskType: workerConfig.taskType,
        taskHandler: workerConfig.handler,
        timeout: 30000,
        onReady: () => console.log(`Worker für '${workerConfig.taskType}' bereit`),
        onConnectionError: () => console.error(`Worker für '${workerConfig.taskType}' konnte keine Verbindung herstellen`),
    });
});

console.log('Worker wird gestartet...');
process.on('SIGINT', async () => {
  console.log('SIGINT erhalten. Worker wird heruntergefahren...');
  await zbClient.close();
  console.log('Alle Worker gestoppt.');
  process.exit(0);
});

