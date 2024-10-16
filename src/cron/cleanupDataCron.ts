import cron from "node-cron";
import { LessThan } from "typeorm";
import logger from "../utils/winston";
import { AppDataSource } from "../config/database.config";
import { AboutUs } from "./../entities/about_us.entity";
import { Banner } from "./../entities/banner.entity";
import { Blog } from "./../entities/blog.entity";
import { CertificationDetails } from "./../entities/certification_details.entity";
import { ChatBoat } from "./../entities/chat_boat.entity";
import { ContactUs } from "./../entities/contact_us.entity";
import { CoreServices } from "./../entities/core_services.entity";
import { EmployeeDetails } from "./../entities/employee_details.entity";
import { FeaturedServices } from "./../entities/featured_services.entity";
import { HowWeWork } from "./../entities/how_we_work.entity";
import { Marketing } from "./../entities/marketing.entity";
import { OurContactDetails } from "./../entities/our_contact_details.entity";
import { PolicyAndTerms } from "./../entities/policy_and_terms.entity";
import { Portfolio } from "./../entities/portfolio.entity";
import { ProvidedService } from "./../entities/provided_service.entity";
import { QuestionAns } from "./../entities/question_ans.entity";
import { SubServices } from "./../entities/sub_services.entity";
import { TechnologicalExperties } from "./../entities/technological_experties.entity";
import { Token } from "./../entities/token.entity";
import { TrustedClients } from "./../entities/trusted_clients.entity";
import { VisionExperties } from "./../entities/vision_experties.entity";
import { User } from "./../entities/user.entity";

export class DataCleanup {
  start() {
    cron.schedule("0 0 * * *", async () => {
      logger.info("Data Cleanup Cron job is running.");
      await this.cleanupData();
    });
    logger.info("Data Cleanup Cron job started (everyday - midnight).");
  }

  async cleanupData() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const repositories = [AboutUs, Banner, Blog, CertificationDetails, ChatBoat, ContactUs, CoreServices, EmployeeDetails, FeaturedServices, HowWeWork, Marketing, OurContactDetails, PolicyAndTerms, Portfolio, ProvidedService, QuestionAns, SubServices, TechnologicalExperties, Token, TrustedClients, User, VisionExperties];

      for (const entity of repositories) {
        await AppDataSource.getRepository(entity).delete({
          deletedAt: LessThan(sixMonthsAgo),
        });
      }

      logger.info("Data Cleanup Cron job ran successfully.");
    } catch (error) {
      logger.error("Error occurred during cron job:", error);
    }
  }
}
