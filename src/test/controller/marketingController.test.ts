import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { Marketing } from "../../entities/marketing.entity";
import { AppDataSource } from "../../config/database.config";
import { MarketingController } from "../../controller/marketing/marketing_controller";

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

describe("marketingController", () => {
  let marketingController: MarketingController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    marketingController = new MarketingController();
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
  it("should return an error if marketing already exists", async () => {
    (AppDataSource.getRepository(Marketing).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await marketingController.addMarketing(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.saveError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.CREATE_FAIL("form data"),
      data: undefined,
    });
  });

  it("should save new marketing and return success", async () => {
    (AppDataSource.getRepository(Marketing).findOne as jest.Mock).mockResolvedValueOnce(null);

    (AppDataSource.getRepository(Marketing).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await marketingController.addMarketing(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.SUBMIT_FORM,
      data: undefined,
    });
  });

  it("should return server error on failure", async () => {
    (AppDataSource.getRepository(Marketing).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    await marketingController.addMarketing(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.saveError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.CREATE_FAIL("form data"),
      data: undefined,
    });
  });

  //find
  it("should return not found if marketing does not exist", async () => {
    (AppDataSource.getRepository(Marketing).find as jest.Mock).mockResolvedValueOnce(null);

    await marketingController.getAllMarketing(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This data"),
      data: undefined,
    });
  });

  it("should return marketing data if found", async () => {
    const empData = {
      id: 1,
    };

    (AppDataSource.getRepository(Marketing).find as jest.Mock).mockResolvedValueOnce(empData);

    await marketingController.getAllMarketing(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Marketing forms"),
      data: empData,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(Marketing).find as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await marketingController.getAllMarketing(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  //findOne
  it("should return marketing data if found", async () => {
    const empData = {
      id: 1,
    };

    (AppDataSource.getRepository(Marketing).findOne as jest.Mock).mockResolvedValueOnce(empData);

    mockRequest.params = { id: "1" };

    await marketingController.getMarketing(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Marketing forms"),
      data: empData,
    });
  });

  it("should return not found if marketing does not exist", async () => {
    (AppDataSource.getRepository(Marketing).findOne as jest.Mock).mockResolvedValueOnce(null);
    mockRequest.params = { id: "1" };

    await marketingController.getMarketing(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This data"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(Marketing).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));
    mockRequest.params = { id: "1" };

    await marketingController.getMarketing(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      data: undefined,
    });
  });
});
