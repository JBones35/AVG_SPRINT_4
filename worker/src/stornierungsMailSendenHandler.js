import { transporter } from "./mailSendenHandler.js";

export const stornierungsMailSendenHandler = async (job) => {
    console.log(`E-Mail-Versand für Job ${job.key} wird vorbereitet.`);
    const { email, vorname, nachname, antrags_id } = job.variables;
    if (!email || !vorname || !nachname || !antrags_id) {
        return job.fail('Variable "email", "vorname", "nachname" oder "antrags_id" fehlt.', 0);
    }

    try{
        const subject = 'Stornierung Ihres Kreditantrags';
        const htmlBody = `<p>Sehr geehrte/r ${vorname} ${nachname},</p>
                          <p>Ihr Kreditantrag mit der ID ${antrags_id} wurde storniert.</p>
                          <p>Für weitere Informationen kontaktieren Sie uns bitte.</p>`;

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
        console.error(`Fehler beim Senden der E-Mail an ${email}:`, error);
        await job.fail(`Fehler beim Senden der E-Mail: ${error.message}`, 0);
    }
};

