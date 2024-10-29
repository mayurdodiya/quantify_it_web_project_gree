import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { MarketingOffice } from "../../entities/marketing_office.entity";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { MarketingOfficeController } from "../../controller/marketing_office/marketing_office_controller";

jest.mock("../../config/database.config", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      softDelete: jest.fn(),
    }),
  },
}));

describe("MarketingOfficeController", () => {
  let marketingOfficeController: MarketingOfficeController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    marketingOfficeController = new MarketingOfficeController();
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    mockRequest = {
      params: {},
      body: {},
      query: {},
      get: jest.fn(),
    };

    mockResponse = {
      status: statusMock,
      set: jest.fn(),
      header: jest.fn(),
      json: jsonMock,
    } as unknown as Response;
  });

  // Add marketing office
  it("should save new marketing office and return success", async () => {
    (AppDataSource.getRepository(MarketingOffice).findOne as jest.Mock).mockResolvedValueOnce(null);
    (AppDataSource.getRepository(MarketingOffice).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
      office_name: "New Office",
      address: "123 Main St",
      img_url: "office.jpg",
    };

    await marketingOfficeController.addMarketingOffice(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.createSuccess);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Marketing office data"),
      data: undefined,
    });
  });

  it("should return error if marketing office already exists", async () => {
    (AppDataSource.getRepository(MarketingOffice).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
      office_name: "Existing Office",
      address: "123 Main St",
      img_url: "office.jpg",
    };

    await marketingOfficeController.addMarketingOffice(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.DATA_EXIST("This marketing office data"),
      data: undefined,
    });
  });

  // Update marketing office
  it("should return not found if marketing office does not exist for update", async () => {
    (AppDataSource.getRepository(MarketingOffice).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };
    mockRequest.body = { office_name: "Updated Office" };

    await marketingOfficeController.updateMarketingOffice(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This marketing office data"),
      data: undefined,
    });
  });

  it("should update the marketing office and return success", async () => {
    const existingOffice = { id: 1, office_name: "Old Office" };
    (AppDataSource.getRepository(MarketingOffice).findOne as jest.Mock).mockResolvedValueOnce(existingOffice);
    (AppDataSource.getRepository(MarketingOffice).save as jest.Mock).mockResolvedValueOnce({ ...existingOffice, office_name: "Updated Office" });

    mockRequest.params = { id: "1" };
    mockRequest.body = { office_name: "Updated Office" };

    await marketingOfficeController.updateMarketingOffice(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.UPDATED_SUCCESSFULLY("Marketing office data"),
      data: undefined,
    });
  });

  // Get marketing office
  it("should return not found if marketing office does not exist", async () => {
    (AppDataSource.getRepository(MarketingOffice).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await marketingOfficeController.getMarketingOffice(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This marketing office data"),
      data: undefined,
    });
  });

  it("should return marketing office data if found", async () => {
    const officeData = { id: 1, office_name: "Office Name" };
    (AppDataSource.getRepository(MarketingOffice).findOne as jest.Mock).mockResolvedValueOnce(officeData);

    mockRequest.params = { id: "1" };

    await marketingOfficeController.getMarketingOffice(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Marketing office data"),
      data: officeData,
    });
  });

  // Get all marketing offices
  it("should return a list of marketing offices", async () => {
    const offices = [
      { id: 1, office_name: "Office 1" },
      { id: 2, office_name: "Office 2" },
    ];
    (AppDataSource.getRepository(MarketingOffice).findAndCount as jest.Mock).mockResolvedValueOnce([offices, offices.length]);

    mockRequest.query = { page: "1", size: "10" };

    await marketingOfficeController.getAllMarketingOffice(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Marketing office data"),
      data: expect.any(Object), // Adjust according to your actual pagination response structure
    });
  });

  // Delete marketing office
  it("should return not found if marketing office does not exist for deletion", async () => {
    (AppDataSource.getRepository(MarketingOffice).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await marketingOfficeController.removeMarketingOffice(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This marketing office data"),
      data: undefined,
    });
  });

  it("should return success if marketing office is soft deleted", async () => {
    (AppDataSource.getRepository(MarketingOffice).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });
    (AppDataSource.getRepository(MarketingOffice).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await marketingOfficeController.removeMarketingOffice(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.DELETE_SUCCESS("Marketing office data"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(MarketingOffice).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await marketingOfficeController.removeMarketingOffice(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This marketing office data"),
      data: undefined,
    });
  });
});
