const transporter = require("../../../config/mailer");

async function sendVerificationEmail(email, token) {
  const verifyLink = `${process.env.BACKEND_URL}/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Soporte" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verifica tu email",
    html: `
        <h2>Bienvenido</h2>
        <p>Haz click para verificar tu email:</p>
        <a href="${verifyLink}">Verificar email</a>
        <p>Este link expirará en 15 minutos</p>
        `,
  });
}
module.exports = sendVerificationEmail;
