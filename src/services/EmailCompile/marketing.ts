import * as path from "path";
import * as fs from "fs";
import { handlebars } from "hbs";
import { EmailService } from "../nodemailer";
import logger from "../../utils/winston";

const emailService = new EmailService();

export const MarketingUser = async (
  email: string,
  subject: string,
  body: string
): Promise<boolean> => {
  try {
    const parentDir = path.dirname(__dirname);

    const grandParentDir = path.dirname(parentDir);

    const emailTemplate = fs.readFileSync(
      path.join(grandParentDir, "utils/templates/marketing.hbs"),
      "utf-8"
    );

    const template = handlebars.compile(emailTemplate);

    const htmlContent = template({ NAME: body });

    await emailService.sendEmail(email, subject, body, htmlContent);

    return true;
  } catch (error) {
    logger.info(error);
    return true;
  }
};
