
"use server";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: parseInt(process.env.EMAIL_PORT || "587") === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface WelcomeEmailParams {
  to: string;
  name: string;
  token: string;
}

export async function sendVerificationEmail({ to, name, token }: WelcomeEmailParams): Promise<boolean> {
  const subject = "¡Bienvenido/a a ONLYfansLY!";
  // TODO: Make email content configurable from admin panel in the future
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>¡Bienvenido/a a ONLYfansLY, ${name}!</h2>
      <p>Gracias por registrarte en ONLYfansLY.</p>
      <p>Usa el siguiente token para verificar tu cuenta y comenzar a explorar todo lo que tenemos para ofrecer:</p>
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #D81B60; background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center;">
        ${token}
      </p>
      <p>Si no te registraste en ONLYfansLY, por favor ignora este correo.</p>
      <br>
      <p>¡Saludos,</p>
      <p>El equipo de ONLYfansLY</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', to);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}
