import express from "express";
import request from "supertest";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { ContactUsController } from "../../controller/contact_us/contact_us_controller";

const app = express();
app.use(express.json());

describe("ContactUsController", () => {
  let contactUsController: ContactUsController;

  beforeAll(async () => {
    await AppDataSource.initialize();
    contactUsController = new ContactUsController();

    app.post("/contactus", contactUsController.addContactUs);
    app.get("/contactus/:id", contactUsController.getContactUs);
    app.get("/contactus", contactUsController.getAllContactUs);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe("POST /contactus", () => {
    it("should create a new contact us entry", async () => {
      const response = await request(app)
        .post("/contactus")
        .send({
          full_name: "John Doe",
          email: "john@example.com",
          contact_purpose: ["Inquiry"],
          user_message: "This is a test message",
          budget: "1000",
        });

      expect(response.status).toBe(ResponseCodes.success);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(message.SUBMIT_FORM);
    });

    it("should return an error if data is missing", async () => {
      const response = await request(app).post("/contactus").send({});

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /contactus", () => {
    it("should return all contact us entries", async () => {
      const response = await request(app).get("/contactus");

      expect(response.status).toBe(ResponseCodes.serverError);
      expect(response.body.success).toBe(false);
      expect(Array.isArray(response.body.data)).toBe(false);
    });
  });
});
