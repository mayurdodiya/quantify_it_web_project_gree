import cron from "node-cron";
import { Role } from "./enum";
import { message } from "./messages";
import { generateToken } from "./auth.token";
import { AppDataSource } from "../config/database.config";
import { Token } from "../entities/token.entity";
import { Repository } from "typeorm";
import logger from "./winston";
import token from "../config/variables/token.json";
const tokenConfigurations = token;

export class DataCleanupScheduler {
  private tokenRepo: Repository<Token>;

  constructor() {
    this.tokenRepo = AppDataSource.getRepository(Token);
  }

  start() {
    cron.schedule("0 0 * * *", () => this.cleanupData());
  }

  async cleanupData() {
    try {
      const oldData = await this.tokenRepo.find({});

      let token;
      if (oldData.length === 0) {
        token = generateToken(tokenConfigurations.TOKEN_SECRETE_KEY_2, Role.ADMIN);
        const tokenData = this.tokenRepo.create({ token });
        await this.tokenRepo.save(tokenData);

        logger.info(message.CREATE_SUCCESS("Token"));
      } else {
        token = generateToken(tokenConfigurations.TOKEN_SECRETE_KEY_2, Role.ADMIN);
        await this.tokenRepo.update({ id: oldData[0].id }, { token });
        logger.info(message.UPDATED_SUCCESSFULLY("Token"));
      }
    } catch (error) {
      logger.error("Error occurred during cron job: ", error);
    }
  }
}
