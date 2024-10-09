import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { FeaturedServices } from "../../entities/featured_services.entity";
import { FeaturedServicesController } from "../../controller/featured_services/featured_services_controller";

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

describe("featuredServicesController", () => {
  let featuredServicesController: FeaturedServicesController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    featuredServicesController = new FeaturedServicesController();
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
  it("should return an error if featured service already exists", async () => {
    (AppDataSource.getRepository(FeaturedServices).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await featuredServicesController.addFeaturedServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.alreadyExist);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.DATA_EXIST("This featured service"),
      data: undefined,
    });
  });

  it("should save new featured service and return success", async () => {
    (AppDataSource.getRepository(FeaturedServices).findOne as jest.Mock).mockResolvedValueOnce(null);

    (AppDataSource.getRepository(FeaturedServices).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await featuredServicesController.addFeaturedServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Featured service"),
      data: undefined,
    });
  });

  it("should return server error on failure", async () => {
    (AppDataSource.getRepository(FeaturedServices).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    await featuredServicesController.addFeaturedServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      data: undefined,
    });
  });

  //edit
  it("should return not found if featured service does not exist", async () => {
    (AppDataSource.getRepository(FeaturedServices).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await featuredServicesController.updateFeaturedServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This featured service"),
      data: undefined,
    });
  });

  it("should update the featured service and return save error", async () => {
    const existingService = {
      id: 1,
    };

    (AppDataSource.getRepository(FeaturedServices).findOne as jest.Mock).mockResolvedValueOnce(existingService);

    mockRequest.params = { id: "1" };
    mockRequest.body = {};

    await featuredServicesController.updateFeaturedServices(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.saveError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.UPDATE_FAILED("featured service data"),
      data: undefined,
    });
  });

  //find
  it("should return not found if featured service does not exist", async () => {
    (AppDataSource.getRepository(FeaturedServices).find as jest.Mock).mockResolvedValueOnce(null);

    await featuredServicesController.getAllFeaturedServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This featured service"),
      data: undefined,
    });
  });

  it("should return featured service data if found", async () => {
    const featureData = {
      id: 1,
    };

    (AppDataSource.getRepository(FeaturedServices).find as jest.Mock).mockResolvedValueOnce(featureData);

    await featuredServicesController.getAllFeaturedServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Featured service"),
      data: featureData,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(FeaturedServices).find as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await featuredServicesController.getAllFeaturedServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  //findOne
  it("should return featured service data if found", async () => {
    const featureData = {
      id: 1,
    };

    (AppDataSource.getRepository(FeaturedServices).findOne as jest.Mock).mockResolvedValueOnce(featureData);

    mockRequest.params = { id: "1" };

    await featuredServicesController.getFeaturedServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Featured service"),
      data: featureData,
    });
  });

  it("should return not found if featured service does not exist", async () => {
    (AppDataSource.getRepository(FeaturedServices).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await featuredServicesController.getFeaturedServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This featured service"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(FeaturedServices).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await featuredServicesController.getFeaturedServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  //delete
  it("should return success if featured service is soft deleted", async () => {
    (AppDataSource.getRepository(FeaturedServices).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await featuredServicesController.removeFeaturedServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This featured service"),
      data: undefined,
    });
  });

  it("should return not found if featured service does not exist", async () => {
    (AppDataSource.getRepository(FeaturedServices).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

    mockRequest.params = { id: "1" };

    await featuredServicesController.removeFeaturedServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This featured service"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(FeaturedServices).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await featuredServicesController.removeFeaturedServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This featured service"),
      data: undefined,
    });
  });
});
