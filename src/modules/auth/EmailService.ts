import transporter from "../../config/mailer.js";

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Soporte" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verifica tu email",
    html: `
        <h2>Bienvenido</h2>
        <p>Haz clic en el siguiente enlace para verificar tu email:</p>
        <a href="${verifyLink}">${verifyLink}</a>
        <p>Este enlace expirará en 15 minutos.</p>
        `,
  });
}

export default sendVerificationEmail;
