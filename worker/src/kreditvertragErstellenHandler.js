import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';


export const kreditvertragErstellenHandler = async (job) => {
    try {
        console.log(`Job ${job.type} erhalten mit Key: ${job.key}`);
        console.log(`Job Variablen: ${JSON.stringify(job.variables)}`);

        const {
            antrags_id: antragsId,
            kunden_id: kundenId,
            vorname,
            nachname,
            anschrift,
            gewuenschter_kreditbetrag: kreditbetrag,
            zinskalkulationOutput,
            laufzeit_in_monaten: laufzeit
        } = job.variables;

        const name = `${vorname} ${nachname}`;
        const zinssatz = zinskalkulationOutput.berechneterZinssatz;
        const monatlicheRate = (kreditbetrag / (zinssatz / 100)) / laufzeit;

        const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Kreditvertrag</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 20px auto; padding: 40px; background-color: #fff; border: 1px solid #ddd; }
        .header { text-align: right; font-size: 0.9em; color: #666; }
        .header .company-name { font-weight: bold; font-size: 1.2em; color: #000; }
        .address-block { margin-top: 40px; margin-bottom: 40px; }
        .subject { font-size: 1.4em; font-weight: bold; margin-top: 50px; margin-bottom: 20px; }
        .reference-info { font-size: 0.9em; margin-bottom: 30px; color: #555; }
        .salutation { font-weight: bold; margin-bottom: 20px; }
        .conditions-table { margin-top: 20px; width: 100%; border-collapse: collapse; }
        .conditions-table th, .conditions-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .conditions-table th { background-color: #f2f2f2; }
        .footer { margin-top: 40px; }
        .signature { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; color: #555; }
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
            Ihr Kreditvertrag zum Antrag Nr.: ${antragsId}
        </div>
        <div class="reference-info">
            Kunden-Nr.: ${kundenId}
        </div>
        <div class="salutation">
            Sehr geehrte/r ${name},
        </div>
        <div class="main-content">
            <p>wir freuen uns, Ihnen mitteilen zu können, dass Ihr Kreditantrag genehmigt wurde. Anbei erhalten Sie die Vertragsunterlagen mit den vereinbarten Konditionen.</p>
            <p>Bitte prüfen Sie die folgenden Angaben sorgfältig.</p>
            
            <table class="conditions-table">
                <thead>
                    <tr><th colspan="2">Zentrale Kreditkonditionen</th></tr>
                </thead>
                <tbody>
                    <tr><td>Nettodarlehensbetrag</td><td>${kreditbetrag.toFixed(2)} €</td></tr>
                    <tr><td>Sollzinssatz (p.a., gebunden)</td><td>${zinssatz.toFixed(2)} %</td></tr>
                    <tr><td>Laufzeit</td><td>${laufzeit} Monate</td></tr>
                    <tr><td>Monatliche Rate</td><td>${monatlicheRate.toFixed(2)} €</td></tr>
                </tbody>
            </table>

            <p>Weitere Details und rechtliche Hinweise entnehmen Sie bitte den beigefügten AGB. Der Vertrag wird mit Ihrer Unterschrift wirksam.</p>
        </div>
        <div class="footer">
            Mit freundlichen Grüßen
            <div class="signature">
                Ihre Firma GmbH<br>
                (Kreditabteilung)
            </div>
        </div>
    </div>
</body>
</html>
`;
        const filePath = await createPDF(htmlContent, antragsId);

        const fileVariable = {
            fileName: `kreditvertrag-${antragsId}.pdf`,
            mimeType: 'application/pdf',
            filePath
        };

        await job.complete({
            kreditvertrags_dokument: fileVariable
        });
        
        console.log(`Kreditvertrag für AntragsId ${antragsId} erfolgreich erstellt und Pfad gespeichert.`);

    } catch (err) {
        console.error('Fehler beim Erstellen des Kreditvertrags:', err);
        await job.fail(`Fehler beim Erstellen des Kreditvertrags: ${err.message}`, 0);
    }
};

const createPDF = async (htmlContent, antragsId) => {
    console.log('PDF wird erstellt...');
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
        
        const outputDir = path.join(process.cwd(), 'output', 'kreditvertraege');
        const filePath = path.join(outputDir, `kreditvertrag-${antragsId}.pdf`);

        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(filePath, pdfBuffer);
        
        console.log(`PDF erfolgreich unter ${filePath} gespeichert.`);
        return filePath;
    } finally {
        await page.close();
        await browser.close();
    }
};