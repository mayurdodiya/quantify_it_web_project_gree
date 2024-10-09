import request from "supertest";
import { app } from "../../index";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { ContactUs } from "../../entities/contact_us.entity";
import { AppDataSource } from "../../config/database.config";

const mockContactUsData = {
  full_name: "John Doe",
  email: "john@example.com",
  contact_purpose: ["Inquiry"],
  user_message: "Hello, I have a question.",
  budget: "1000",
};

const ContactUsRepo = AppDataSource.getRepository(ContactUs);

jest.mock("../../config/database.config", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      create: jest.fn(),
      save: jest.fn(),
    }),
  },
}));

describe("POST /api/contactus/add", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should successfully submit contact us form", async () => {
    (ContactUsRepo.create as jest.Mock).mockReturnValue(mockContactUsData);
    (ContactUsRepo.save as jest.Mock).mockResolvedValue(mockContactUsData);

    const response = await request(app).post("/api/contactus/add").send(mockContactUsData);

    expect(response.status).toBe(ResponseCodes.success);
    expect(response.body).toEqual({
      success: true,
      message: message.SUBMIT_FORM,
    });
  });

  it("Should return error for missing required fields", async () => {
    const response = await request(app).post("/api/contactus/add").send({});

    expect(response.status).toBe(ResponseCodes.badRequest);
    expect(response.body).toEqual({
      success: false,
      message: "Full name is required, Email is required, Contact purpose is required, Budget is required, Budget value must be in string format!",
    });
  });

  it("Should return error if database save fails", async () => {
    (ContactUsRepo.create as jest.Mock).mockReturnValue(mockContactUsData);
    (ContactUsRepo.save as jest.Mock).mockResolvedValue(null);

    const response = await request(app).post("/api/contactus/add").send(mockContactUsData);

    expect(response.status).toBe(ResponseCodes.insertError);
    expect(response.body).toEqual({
      success: false,
      message: message.CREATE_FAIL("contact us data"),
    });
  });

  it("Should handle unexpected server errors", async () => {
    (ContactUsRepo.create as jest.Mock).mockImplementation(() => {
      throw new Error(message.SERVER_ERROR);
    });

    const response = await request(app).post("/api/contactus/add").send(mockContactUsData);

    expect(response.status).toBe(ResponseCodes.serverError);
    expect(response.body).toEqual({
      success: false,
      message: message.SERVER_ERROR,
    });
  });
});

// describe("GET /api/contactus/get/:id", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("Should successfully retrieve contact us data by ID", async () => {
//     const contactId = "1";
//     (ContactUsRepo.findOne as jest.Mock).mockResolvedValue(mockContactUsData);

//     const response = await request(app).get(`/api/contactus/get/${contactId}`);

//     expect(response.status).toBe(ResponseCodes.success);
//     expect(response.body).toEqual({
//       success: true,
//       message: message.GET_DATA("Contact us forms"),
//       data: mockContactUsData,
//     });
//   });

//   it("Should return error if contact us data is not found for given ID", async () => {
//     const contactId = "1";
//     (ContactUsRepo.findOne as jest.Mock).mockResolvedValue(null);

//     const response = await request(app).get(`/api/contactus/get/${contactId}`);

//     expect(response.status).toBe(ResponseCodes.notFound);
//     expect(response.body).toEqual({
//       success: false,
//       message: message.NO_DATA("This Contact us data"),
//     });
//   });

//   it("Should handle unexpected server errors when finding data", async () => {
//     const contactId = "1";
//     (ContactUsRepo.findOne as jest.Mock).mockImplementation(() => {
//       throw new Error("Unexpected error");
//     });

//     const response = await request(app).get(`/api/contactus/get/${contactId}`);

//     expect(response.status).toBe(ResponseCodes.serverError);
//     expect(response.body).toEqual({
//       success: false,
//       message: "Unexpected error",
//     });
//   });
// });
