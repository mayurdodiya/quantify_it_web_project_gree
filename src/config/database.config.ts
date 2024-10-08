import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import { User } from "../entities/user.entity";
import { UserService } from "../utils/Admin";
import { Banner } from "../entities/banner.entity";
import { VisionExperties } from "../entities/vision_experties.entity";
import { CoreServices } from "../entities/core_services.entity";
import { SubServices } from "../entities/sub_services.entity";
import { TechnologicalExperties } from "../entities/technological_experties.entity";
import { Portfolio } from "../entities/portfolio.entity";
import { TrustedClients } from "../entities/trusted_clients.entity";
import { Blog } from "../entities/blog.entity";
import { QuestionAns } from "../entities/question_ans.entity";
import { AboutUs } from "../entities/about_us.entity";
import { CertificationDetails } from "../entities/certification_details.entity";
import { HowWeWork } from "../entities/how_we_work.entity";
import { EmployeeDetails } from "../entities/employee_details.entity";
import { ProvidedService } from "../entities/provided_service.entity";
import { FeaturedServices } from "../entities/featured_services.entity";
import { OurContactDetails } from "../entities/our_contact_details.entity";
import { Marketing } from "../entities/marketing.entity";
import { ContactUs } from "../entities/contact_us.entity";
import { PolicyAndTerms } from "../entities/policy_and_terms.entity";
import { ChatBoat } from "../entities/chat_boat.entity";

const host = process.env.HOST;
const database_port = parseInt(process.env.DATABASE_PORT);
const user_name = process.env.USER_NAME;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;

export const AppDataSource = new DataSource({
  type: "postgres",
  host: host,
  port: database_port,
  username: user_name,
  password: password,
  database: database,
  synchronize: true,
  logging: false,
  entities: [Banner, User, VisionExperties, CoreServices, SubServices, TechnologicalExperties, Portfolio, TrustedClients, Blog, QuestionAns, AboutUs, CertificationDetails, HowWeWork, EmployeeDetails, ProvidedService, FeaturedServices, OurContactDetails, Marketing, ContactUs, PolicyAndTerms, ChatBoat],
});

(async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database Connected successfully!");
    const userService = new UserService(AppDataSource);
    await userService.createAdmin();
  } catch (error) {
    console.error("Error during Data Source initialization", error);
  }
})();
