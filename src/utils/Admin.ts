import "reflect-metadata";
import { User } from "../entities/user.entity";
import { Repository, DataSource } from "typeorm";
import { bcryptpassword } from "./bcrypt";
import { Role, Status } from "./enum";
import { message } from "./messages";

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
