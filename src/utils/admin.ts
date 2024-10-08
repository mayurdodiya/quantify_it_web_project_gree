import "reflect-metadata";
import { User } from "../entities/user.entity";
import { Repository, DataSource } from "typeorm";
import { bcryptpassword } from "./bcrypt";
import { Role, Status } from "./enum";
import { message } from "./messages";
import { AboutUs } from "../entities/about_us.entity";

export class UserService {
  private userRepository: Repository<User>;

  constructor(private AppDataSource: DataSource) {
    this.userRepository = this.AppDataSource.getRepository(User);
  }

  public async createAdmin(): Promise<void> {
    try {
      const first_name = process.env.ADMIN_FIRST_NAME;
      const last_name = process.env.ADMIN_LAST_NAME;
      const password = process.env.ADMIN_PASSWORD;
      const email = process.env.ADMIN_EMAIL;
      const phone_no = process.env.ADMIN_PHONE_NO;

      const oldAdmin = await this.userRepository.findOne({ where: { email: email, status: Status.ACTIVE, role: Role.ADMIN } });

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
            console.log(message.CREATE_SUCCESS("Admin"));
          })
          .catch((err) => {
            console.log("Error saving admin:", err);
          });
      } else {
        console.log(message.DATA_EXIST("Admin"));
      }
    } catch (error) {
      console.log("Error:", error);
    }
  }
}

export class AboutUsControllerService {
  private aboutUsRepo: Repository<AboutUs>;

  constructor(private AppDataSource: DataSource) {
    this.aboutUsRepo = AppDataSource.getRepository(AboutUs);
  }

  public async createAboutsUsPage(): Promise<void> {
    try {
      const oldData = await this.aboutUsRepo.find({});
      if (oldData.length) {
        return console.log("Aboutus page alreardy exist!");
      }

      const title = "Your Trusted Partner for Innovative IT Solutions and Business Success";
      const description = ["We are more than just service providers; we are offering everything from IT strategy and consulting to ustomized oftware development. Whether you're a new startup or a leading corporation. Quantify IT Agency is here to help you navigate he complexities of technology and unlock new opportunities for growth."];
      const who_we_are_img_url_1 = "https=//picsum.photos/200/300";
      const who_we_are_img_url_2 = "https=//picsum.photos/200";
      const our_vision = ["Our vision is to help our clients succeed by offering dependable and creative tech solutions. We strive to be he go-to partner that helps businesses grow and excel in today’s fast-changing digital world."];
      const our_mission = ["Our mission is to deliver dependable and innovative technology solutions that help our clients achieve their goals. We are dedicated to support start-up businesses bocome an established enterprise."];
      const vision_mission_img_url = "https=//picsum.photos/200";
      const works_about_title = "Trusted by 1,000+ HappyCustomers";
      const works_about_description = ["At Quantify IT, we take pride in our proven track record of success, having earned the trust of over 1,000+ satisfied customers worldwide. Our commitment to delivering exceptional solutions has set us apart in the industry. Each project is a testament to our dedication to quality and our passion for innovation. Our clients’ happiness and success are the ultimate measures of our performance!"];
      const works_about_img_url = "https=//picsum.photos/200";
      const total_experience = "10";
      const talented_it_professionals = "1100";
      const successfull_projects = "1200";
      const served_country = "32";

      const aboutUsData = new AboutUs();

      aboutUsData.title = title;
      aboutUsData.description = description;
      aboutUsData.who_we_are_img_url_1 = who_we_are_img_url_1;
      aboutUsData.who_we_are_img_url_2 = who_we_are_img_url_2;
      aboutUsData.our_vision = our_vision;
      aboutUsData.our_mission = our_mission;
      aboutUsData.vision_mission_img_url = vision_mission_img_url;
      aboutUsData.works_about_title = works_about_title;
      aboutUsData.works_about_description = works_about_description;
      aboutUsData.works_about_img_url = works_about_img_url;
      aboutUsData.total_experience = total_experience;
      aboutUsData.talented_it_professionals = talented_it_professionals;
      aboutUsData.successfull_projects = successfull_projects;
      aboutUsData.served_country = served_country;

      await this.aboutUsRepo
        .save(aboutUsData)
        .then(() => {
          console.log(message.CREATE_SUCCESS("About us page"));
        })
        .catch((err) => {
          console.log("Error saving aboutus page:", err);
        });
    } catch (error) {
      console.log("Error:", error);
    }
  }
}
