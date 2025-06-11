import 'dotenv/config';
import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';

const GMAIL_ADDRESS = process.env.GMAIL_ADDRESS;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: GMAIL_ADDRESS,
        pass: GMAIL_APP_PASSWORD,
    },
});


export const mailSendenHandler =  async (job) => {
    try {
        console.log(`E-Mail-Versand wird für Job ${job.key} vorbereitet.`);

        const { email, vorname, nachname } = job.variables;
        const dokument = job.variables.kreditvertrags_dokument || job.variables.absage_schreiben;

        if (!email || !dokument || !dokument.filePath) {
            return job.fail('Variable "email" oder der Dokumentenpfad (filePath) fehlt.', 0);
        }

        console.log('Dokument-Objekt gefunden. Lese Datei von Pfad:', dokument.filePath);

        const pdfBuffer = await fs.readFile(dokument.filePath);
        

        const isVertrag = !!job.variables.kreditvertrags_dokument;
        const subject = isVertrag ? 'Ihr Kreditvertrag bei der Firma GmbH' : 'Entscheidung zu Ihrem Antrag';
        const htmlBody = isVertrag ?
            `<p>Sehr geehrte/r ${vorname} ${nachname},</p><p>anbei erhalten Sie Ihren Kreditvertrag.</p>` :
            `<p>Sehr geehrte/r ${vorname} ${nachname},</p><p>anbei erhalten Sie die Entscheidung zu Ihrem Antrag.</p>`;

        const mailOptions = {
            from: `"Ihre Firma GmbH" <${GMAIL_ADDRESS}>`,
            to: email,
            subject: subject,
            html: htmlBody + '<p>Mit freundlichen Grüßen,<br>Ihre Firma GmbH</p>',
            attachments: [{
                filename: dokument.fileName,
                content: pdfBuffer,
                contentType: dokument.mimeType,
            }],
        };

        await transporter.sendMail(mailOptions);
        console.log(`E-Mail erfolgreich an ${email} gesendet.`);
        await job.complete();

    } catch (error) {
        console.error('Fehler im E-Mail-Handler:', error);
        await job.fail(`E-Mail-Fehler: ${error.message}`, 0);
    }
};