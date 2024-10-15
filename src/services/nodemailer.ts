import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import logger from "../utils/winston";
import nodemailers from "../config/variables/nodemailer.json";
import { MAIL_USER } from "../config/variables/nodemailer.json";

const mailConfigurations = nodemailers;
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(
      smtpTransport({
        host: "smtp.gmail.com",
        port: 587,
        service: "gmail",
        requireTLS: true,
        auth: {
          type: "OAuth2",
          user: mailConfigurations.MAIL_USER,
          pass: mailConfigurations.MAIL_PASSWORD,
          clientId: mailConfigurations.MAIL_CLIENT_ID,
          clientSecret: mailConfigurations.MAIL_CLIENT_SECRET,
          refreshToken: mailConfigurations.MAIL_REFRESH_TOKEN,
        },
      }),
    );
  }

  public async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const mailConfigurations = {
      from: MAIL_USER,
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailConfigurations);
      logger.info("Email sent: " + info.response);
      return info;
    } catch (error) {
      logger.error("Error sending email: " + error.message);
      throw error;
    }
  }
}