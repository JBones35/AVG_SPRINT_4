import { transporter } from './mailSendenHandler.js';

export const mailFürAnforderungenSendenHandler = async (job) => {
    console.log(`E-Mail-Versand für Job ${job.key} wird vorbereitet.`);

    const { email, vorname, nachname, anmerkungen_des_pruefers } = job.variables;
    if (!email || !anmerkungen_des_pruefers) {
        return job.fail('Variable "email" oder "anmerkungen_des_pruefers" fehlt.', 0);
    }

    try {
        const subject = 'Anforderung für Ihre Unterlagen';
        const htmlBody = `<p>Sehr geehrte/r ${vorname} ${nachname},</p><p>Wir brauchen noch Unterlagen von ihnen.</p><p>${anmerkungen_des_pruefers}</p>
        <p>Job Key: ${job.key}</p><p>Antrags-ID: ${job.variables.antrags_id}</p>`;

        const mailOptions = {
            from: `"Ihre Firma GmbH" <${process.env.GMAIL_ADDRESS}>`,
            to: email,
            subject: subject,
            html: htmlBody + '<p>Mit freundlichen Grüßen,<br>Ihre Firma GmbH</p>',
        };

        await transporter.sendMail(mailOptions);
        console.log(`E-Mail erfolgreich an ${email} gesendet.`);
        await job.complete();

    } catch (error) {
        console.error('Fehler im E-Mail-Handler:', error);
        await job.fail(`E-Mail-Fehler: ${error.message}`, 0);
    }
}