import { DataSource } from "typeorm";
import "reflect-metadata";
import { User } from "../entities/user.entity";
import { AboutUsService, TokenService, UserService } from "../utils/admin";
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
import { Token } from "../entities/token.entity";
import { DataCleanupScheduler } from "../utils/crone";
import logger from "../utils/winston";
import DB from "../config/variables/database.json";

const databaseConfigurations = DB;

const host = databaseConfigurations.HOST;
const database_port = parseInt(databaseConfigurations.DATABASE_PORT);
const user_name = databaseConfigurations.USER_NAME;
const password = databaseConfigurations.PASSWORD;
const database = databaseConfigurations.DATABASE;

export const AppDataSource = new DataSource({
  type: "postgres",
  host: host,
  port: database_port,
  username: user_name,
  password: password,
  database: database,
  synchronize: false,
  logging: false,
  entities: [
    Banner,
    User,
    VisionExperties,
    CoreServices,
    SubServices,
    TechnologicalExperties,
    Portfolio,
    TrustedClients,
    Blog,
    QuestionAns,
    AboutUs,
    CertificationDetails,
    HowWeWork,
    EmployeeDetails,
    ProvidedService,
    FeaturedServices,
    OurContactDetails,
    Marketing,
    ContactUs,
    PolicyAndTerms,
    ChatBoat,
    Token,
  ],
});

(async () => {
  try {
    await AppDataSource.initialize();
    logger.info("Database connected successfully!");
    const userService = new UserService(AppDataSource);
    await userService.createAdmin();
    const addAboutUs = new AboutUsService(AppDataSource);
    addAboutUs.createAboutsUsPage();
    const addToken = new TokenService(AppDataSource);
    addToken.createToken();
    const dataCleanupScheduler = new DataCleanupScheduler();
    dataCleanupScheduler.start();
  } catch (error) {
    logger.error("Error during Data Source initialization", error);
  }
})();
