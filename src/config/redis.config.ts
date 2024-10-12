import logger from "../utils/winston";
import { REDIS_URL } from "./variables/common.json";
import { createClient, RedisClientType } from "redis";

class RedisClient {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: REDIS_URL,
    });

    this.initialize();
  }

  private async initialize() {
    try {
      await this.client.connect();
      logger.info("Redis connected!");
    } catch (err) {
      logger.error("Redis connection error:", err);
      throw err;
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  public async disconnect() {
    await this.client.quit();
  }
}

const redisClientInstance = new RedisClient();

export const redisClient = redisClientInstance.getClient();
