import cron from "node-cron";
import { Role } from "./enum";
import { message } from "./messages";
import { generateToken } from "./auth.token";
import { AppDataSource } from "../config/database.config";
import { Token } from "../entities/token.entity";
import { Repository } from "typeorm";

export class DataCleanupScheduler {
  private tokenRepo: Repository<Token>;

  constructor() {
    this.tokenRepo = AppDataSource.getRepository(Token);
  }

  start() {
    cron.schedule("0 0 * * *", () => this.cleanupData());
    console.log("Cron job started.");
  }

  async cleanupData() {
    try {
      const oldData = await this.tokenRepo.find({});

      let token;
      if (oldData.length === 0) {
        token = generateToken(process.env.TOKEN_SECRETE_KEY_2, Role.ADMIN);
        const tokenData = this.tokenRepo.create({ token });
        await this.tokenRepo.save(tokenData);
        console.log(message.CREATE_SUCCESS("Token"));
      } else {
        token = generateToken(process.env.TOKEN_SECRETE_KEY_2, Role.ADMIN);
        await this.tokenRepo.update({ id: oldData[0].id }, { token });
        console.log(message.UPDATED_SUCCESSFULLY("Token"));
      }
    } catch (error) {
      console.error("Error occurred during cron job:", error);
    }
  }
}
