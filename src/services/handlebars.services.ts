import path from "path";
import * as fs from "fs";
import Handlebars from "handlebars";

const method = {
  addMarketingFormHandleBar: async (email: string, full_name: string) => {
    const mailData = {
      email: email,
      subject: "Thank You! Your Form Has Been Submitted!",
      text: "",
      bodyData: {
        full_name: full_name,
      },
    };
    const filePath = path.join(__dirname, "../", "public", `marketing_submit_form.handlebars`);
    const templateSource = fs.readFileSync(filePath, { encoding: "utf8" });
    const template = Handlebars.compile(templateSource);
    const htmlContent = template(mailData);
    return {
      email: mailData.email,
      subject: mailData.subject,
      text: mailData.text,
      htmlContent: htmlContent,
    };
  },
  
  getInTouchFormHandleBar: async (email: string, full_name: string) => {
    const mailData = {
      email: email,
      subject: "Thank You! Your Form Has Been Submitted!",
      text: "",
      bodyData: {
        full_name: full_name,
      },
    };
    const filePath = path.join(__dirname, "../", "public", `get_in_touch.handlebars`);
    const templateSource = fs.readFileSync(filePath, { encoding: "utf8" });
    const template = Handlebars.compile(templateSource);
    const htmlContent = template(mailData);
    return {
      email: mailData.email,
      subject: mailData.subject,
      text: mailData.text,
      htmlContent: htmlContent,
    };
  },
};

export default method;
