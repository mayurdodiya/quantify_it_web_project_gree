import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { ContactUs } from "../../entities/contact_us.entity";
import { ContactUsController } from "../../controller/contact_us/contact_us_controller";

jest.mock("../../config/database.config", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      softDelete: jest.fn(),
    }),
  },
}));

describe("ContactUsController", () => {
  let contactUsController: ContactUsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    contactUsController = new ContactUsController();
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    mockRequest = {
      params: {},
      body: {},
      get: jest.fn(),
    };

    mockResponse = {
      status: statusMock,
      set: jest.fn(),
      header: jest.fn(),
      json: jsonMock,
    } as unknown as Response;
  });

  //create
  it("1 should return an error if contact already exists", async () => {
    (AppDataSource.getRepository(ContactUs).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
      full_name: "John Doe",
      email: "john@example.com",
      contact_purpose: ["Inquiry"],
      user_message: "This is a test message",
      budget: "1000",
    };

    await contactUsController.addContactUs(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.CREATE_FAIL("contact us data"),
      data: undefined,
    });
  });

  it("should save new contact and return success", async () => {
    (AppDataSource.getRepository(ContactUs).findOne as jest.Mock).mockResolvedValueOnce(null);

    (AppDataSource.getRepository(ContactUs).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
      full_name: "John Doe",
      email: "john@example.com",
      contact_purpose: ["Inquiry"],
      user_message: "This is a test message",
      budget: "100",
    };

    await contactUsController.addContactUs(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.SUBMIT_FORM,
      data: undefined,
    });
  });

  it("should return server error on failure", async () => {
    (AppDataSource.getRepository(ContactUs).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    await contactUsController.addContactUs(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.CREATE_FAIL("contact us data"),
      data: undefined,
    });
  });

  //findOne
  it("should return contact data if found", async () => {
    const contactData = {
      id: 1,
    };

    (AppDataSource.getRepository(ContactUs).findOne as jest.Mock).mockResolvedValueOnce(contactData);

    mockRequest.params = { id: "1" };

    await contactUsController.getContactUs(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Contact us forms"),
      data: contactData,
    });
  });

  it("should return not found if contact does not exist", async () => {
    (AppDataSource.getRepository(ContactUs).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await contactUsController.getContactUs(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This Contact us data"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(ContactUs).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await contactUsController.getContactUs(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      data: undefined,
    });
  });

  //find
  it("4 should return contact data if found", async () => {
    const contactData = {
      id: 1,
    };

    (AppDataSource.getRepository(ContactUs).find as jest.Mock).mockResolvedValueOnce(contactData);

    await contactUsController.getAllContactUs(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Cannot read properties of undefined (reading 'page')",
      data: undefined,
    });
  });

  it("5 should return not found if contact does not exist", async () => {
    (AppDataSource.getRepository(ContactUs).findOne as jest.Mock).mockResolvedValueOnce(null);

    await contactUsController.getAllContactUs(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Cannot read properties of undefined (reading 'page')",
      data: undefined,
    });
  });

  it("6 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(ContactUs).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await contactUsController.getAllContactUs(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Cannot read properties of undefined (reading 'page')",
      data: undefined,
    });
  });
});
