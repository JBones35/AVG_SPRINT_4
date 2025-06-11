import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

export const absageErstellenHandler = async (job) => {
    try {
        console.log(`Job ${job.type} erhalten mit Key: ${job.key}`);
        console.log(`Job Variablen: ${JSON.stringify(job.variables)}`);

        const antragsId = job.variables.antrags_id;
        const kundenId = job.variables.kunden_id;
        const absageGrund = job.variables.absage_grund;
        const name = job.variables.vorname + ' ' + job.variables.nachname;
        const anschrift = job.variables.anschrift;

        const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Absageschreiben</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 20px auto; padding: 40px; background-color: #fff; border: 1px solid #ddd; }
        .header { text-align: right; font-size: 0.9em; color: #666; }
        .header .company-name { font-weight: bold; font-size: 1.2em; color: #000; }
        .address-block { margin-top: 40px; margin-bottom: 40px; }
        .subject { font-size: 1.4em; font-weight: bold; margin-top: 50px; margin-bottom: 20px; }
        .reference-info { font-size: 0.9em; margin-bottom: 30px; color: #555; }
        .salutation { font-weight: bold; margin-bottom: 20px; }
        .rejection-reason { margin-top: 20px; margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #d9534f; }
        .footer { margin-top: 40px; }
        .signature { margin-top: 20px; color: #555; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-name">Ihre Firma GmbH</div>
            <div>Musterstraße 123</div>
            <div>12345 Musterstadt</div>
        </div>
        <div class="address-block">
            ${name}<br>
            ${anschrift}
        </div>
        <div style="text-align: right;">
            ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </div>
        <div class="subject">
            Absage Ihres Antrags mit der Nummer: ${antragsId}
        </div>
        <div class="reference-info">
            Kunden-Nr.: ${kundenId}
        </div>
        <div class="salutation">
            Sehr geehrte/r ${name},
        </div>
        <div class="main-content">
            <p>vielen Dank für Ihren Antrag und das damit verbundene Interesse an unseren Dienstleistungen.</p>
            <p>Wir haben Ihre Unterlagen sorgfältig geprüft. Leider müssen wir Ihnen mitteilen, dass wir Ihrem Antrag zum gegenwärtigen Zeitpunkt nicht entsprechen können.</p>
            <div class="rejection-reason">
                <strong>Grund für die Entscheidung:</strong><br>
                ${absageGrund}
            </div>
            <p>Wir bedauern, Ihnen keine positivere Nachricht übermitteln zu können und bitten um Ihr Verständnis für diese Entscheidung.</p>
        </div>
        <div class="footer">
            Mit freundlichen Grüßen
            <div class="signature">
                Ihre Firma GmbH<br>
                (Abteilung Antragsprüfung)
            </div>
        </div>
    </div>
</body>
</html>
`;

        const filePath = await createPDF(htmlContent, antragsId);

        const fileVariable = {
            fileName: `absageschreiben-${antragsId}.pdf`,
            mimeType: 'application/pdf',
            filePath: filePath,
        };
        
        await job.complete({
            absage_schreiben: fileVariable,
        });

        console.log(`Absageschreiben für AntragsId ${antragsId} erfolgreich erstellt und Pfad gespeichert.`);
    } catch (err) {
        console.error('Fehler beim Erstellen der Absage:', err);
        await job.fail(`Fehler beim Erstellen der Absage: ${err.message}`, 0);
    }
};

const createPDF = async (htmlContent, antragsId) => {
    console.log('Absage-PDF wird erstellt...');
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        await page.emulateMediaType('screen');
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
        await page.evaluateHandle('document.fonts.ready');
        
        const pdfBuffer = await page.pdf({ 
            format: 'A4', 
            printBackground: true, 
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' } 
        });
        
        const outputDir = path.join(process.cwd(), 'output', 'absagen');
        const filePath = path.join(outputDir, `absageschreiben-${antragsId}.pdf`);

        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(filePath, pdfBuffer);
        
        console.log(`Absageschreiben erfolgreich unter ${filePath} gespeichert.`);

        return filePath;

    } finally {
        await page.close();
        await browser.close();
    }
};