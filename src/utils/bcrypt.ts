import * as bcrypt from "bcrypt";
import logger from "./winston";

export const bcryptpassword = async (Password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(Password, 10, (err, hash) => {
      if (err) {
        logger.error("Error hashing password:- ", err);
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
};

export const comparepassword = async (Password: string, hashPassword: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(Password, hashPassword, (err: Error | undefined, result: boolean) => {
      if (err) {
        logger.error("Error comparing passwords:- ", err);
        reject(true);
      } else {
        resolve(result);
      }
    });
  });
};
