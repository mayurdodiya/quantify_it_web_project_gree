import "reflect-metadata";
import { User } from "../entities/user.entity";
import { Repository, DataSource } from "typeorm";
import { bcryptpassword } from "./bcrypt";
import { Role, Status } from "./enum";
import { message } from "./messages";
import { AboutUs } from "../entities/about_us.entity";
import { Token } from "../entities/token.entity";
import { generateToken } from "./auth.token";
import logger from "./winston";
import admin from "../config/variables/admin.json";
import token from "../config/variables/token.json";

const adminConfigurations = admin;
const tokenConfigurations = token;

export class UserService {
  private userRepository: Repository<User>;

  constructor(private AppDataSource: DataSource) {
    this.userRepository = this.AppDataSource.getRepository(User);
  }

  public async createAdmin(): Promise<void> {
    try {
      const first_name = adminConfigurations.ADMIN_FIRST_NAME;
      const last_name = adminConfigurations.ADMIN_LAST_NAME;
      const password = adminConfigurations.ADMIN_PASSWORD;
      const email = adminConfigurations.ADMIN_EMAIL;
      const phone_no = adminConfigurations.ADMIN_PHONE_NO;

      const oldAdmin = await this.userRepository.findOne({
        where: { email: email, status: Status.ACTIVE, role: Role.ADMIN },
      });

      if (!oldAdmin) {
        const hashedPassword = await bcryptpassword(password);

        const adminData = this.userRepository.create({
          first_name: first_name,
          last_name: last_name,
          password: hashedPassword,
          email: email,
          phone_no: phone_no,
          status: Status.ACTIVE,
          role: Role.ADMIN,
        });

        await this.userRepository
          .save(adminData)
          .then(() => {
            logger.info(message.CREATE_SUCCESS("Admin"));
          })
          .catch((err) => {
            logger.error("Error saving admin:", err);
          });
      } else {
        logger.info(message.DATA_EXIST("Admin"));
      }
    } catch (error) {
      logger.error("Error:", error);
    }
  }
}

export class AboutUsService {
  private aboutUsRepo: Repository<AboutUs>;

  constructor(private AppDataSource: DataSource) {
    this.aboutUsRepo = AppDataSource.getRepository(AboutUs);
  }

  public async createAboutsUsPage(): Promise<void> {
    try {
      const oldData = await this.aboutUsRepo.find({});
      if (oldData.length) {
        logger.info("Aboutus page alreardy exist!");
        return;
      }

      
      const our_vision = ["Our vision is to help our clients succeed by offering dependable and creative tech solutions. We strive to be he go-to partner that helps businesses grow and excel in today’s fast-changing digital world."];
      const our_mission = ["Our mission is to deliver dependable and innovative technology solutions that help our clients achieve their goals. We are dedicated to support start-up businesses bocome an established enterprise."];
      const vision_mission_img_url = "https=//picsum.photos/200";
      const works_about_title = "Trusted by 1,000+ HappyCustomers";
      const works_about_description = [
        "At Quantify IT, we take pride in our proven track record of success, having earned the trust of over 1,000+ satisfied customers worldwide. Our commitment to delivering exceptional solutions has set us apart in the industry. Each project is a testament to our dedication to quality and our passion for innovation. Our clients’ happiness and success are the ultimate measures of our performance!",
      ];
      const works_about_img_url = "https=//picsum.photos/200";

      const aboutUsData = new AboutUs();

      aboutUsData.our_vision = our_vision;
      aboutUsData.our_mission = our_mission;
      aboutUsData.vision_mission_img_url = vision_mission_img_url;
      aboutUsData.works_about_title = works_about_title;
      aboutUsData.works_about_description = works_about_description;
      aboutUsData.works_about_img_url = works_about_img_url;

      await this.aboutUsRepo
        .save(aboutUsData)
        .then(() => {
          logger.info(message.CREATE_SUCCESS("About us page"));
        })
        .catch((err) => {
          logger.error("Error saving aboutus page:", err);
        });
    } catch (error) {
      logger.error("Error:", error);
    }
  }
}

export class TokenService {
  private tokenRepo: Repository<Token>;

  constructor(private AppDataSource: DataSource) {
    this.tokenRepo = AppDataSource.getRepository(Token);
  }

  public async createToken(): Promise<void> {
    try {
      const oldData = await this.tokenRepo.find({});
      if (oldData.length) {
        logger.info("Token alreardy exist!");
        return;
      }

      const token = generateToken(tokenConfigurations.TOKEN_SECRETE_KEY_2, Role.ADMIN);

      const tokenData = await this.tokenRepo.create({
        token: token,
      });

      await this.tokenRepo
        .save(tokenData)
        .then(() => {
          logger.info(message.CREATE_SUCCESS("Token"));
        })
        .catch((err) => {
          logger.error("Error saving token:", err);
        });
    } catch (error) {
      logger.error("Error:", error);
    }
  }
}
