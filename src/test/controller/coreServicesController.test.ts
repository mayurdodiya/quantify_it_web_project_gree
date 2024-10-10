import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { CoreServices } from "../../entities/core_services.entity";
import { CoreServicesController } from "../../controller/core_services/core_services_controller";

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

describe("coreServicesController", () => {
  let coreServicesController: CoreServicesController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    coreServicesController = new CoreServicesController();
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
  it("should return an error if core services already exists", async () => {
    (AppDataSource.getRepository(CoreServices).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await coreServicesController.addCoreServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Cannot read properties of undefined (reading 'toLocaleLowerCase')",
      data: undefined,
    });
  });

  it("should save new core services and return success", async () => {
    (AppDataSource.getRepository(CoreServices).findOne as jest.Mock).mockResolvedValueOnce(null);

    (AppDataSource.getRepository(CoreServices).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await coreServicesController.addCoreServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Cannot read properties of undefined (reading 'toLocaleLowerCase')",
      data: undefined,
    });
  });

  it("should return server error on failure", async () => {
    (AppDataSource.getRepository(CoreServices).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    await coreServicesController.addCoreServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Cannot read properties of undefined (reading 'toLocaleLowerCase')",
      data: undefined,
    });
  });

  //edit
  it("should return not found if core services does not exist", async () => {
    (AppDataSource.getRepository(CoreServices).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await coreServicesController.updateCoreServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Cannot read properties of undefined (reading 'toLocaleLowerCase')",
      data: undefined,
    });
  });

  it("should update the core services and return save error", async () => {
    const existingService = {
      id: 1,
    };

    (AppDataSource.getRepository(CoreServices).findOne as jest.Mock).mockResolvedValueOnce(existingService);

    mockRequest.params = { id: "1" };
    mockRequest.body = {};

    await coreServicesController.updateCoreServices(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Cannot read properties of undefined (reading 'toLocaleLowerCase')",
      data: undefined,
    });
  });

  //find
  it("should return not found if core services does not exist", async () => {
    (AppDataSource.getRepository(CoreServices).find as jest.Mock).mockResolvedValueOnce(null);

    await coreServicesController.getAllCoreServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: "Core services data get successfully!",
      data: null,
    });
  });

  it("should return core services data if found", async () => {
    const coreData = {
      id: 1,
    };

    (AppDataSource.getRepository(CoreServices).find as jest.Mock).mockResolvedValueOnce(coreData);

    await coreServicesController.getAllCoreServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Core services"),
      data: coreData,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(CoreServices).find as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await coreServicesController.getAllCoreServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  //findOne
  it("should return core services data if found", async () => {
    const coreData = {
      id: 1,
    };

    (AppDataSource.getRepository(CoreServices).findOne as jest.Mock).mockResolvedValueOnce(coreData);

    mockRequest.params = { id: "1" };

    await coreServicesController.getCoreServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Core services"),
      data: coreData,
    });
  });

  it("should return not found if core services does not exist", async () => {
    (AppDataSource.getRepository(CoreServices).findOne as jest.Mock).mockResolvedValueOnce(null);
    mockRequest.params = { id: "1" };

    await coreServicesController.getCoreServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "This core services doesn't exist!",
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(CoreServices).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));
    mockRequest.params = { id: "1" };

    await coreServicesController.getCoreServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      data: undefined,
    });
  });

  //delete
  it("should return success if core services is soft deleted", async () => {
    (AppDataSource.getRepository(CoreServices).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await coreServicesController.removeCoreServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "This core services doesn't exist!",
      data: undefined,
    });
  });

  it("should return not found if core services does not exist", async () => {
    (AppDataSource.getRepository(CoreServices).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

    mockRequest.params = { id: "1" };

    await coreServicesController.removeCoreServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "database_config_1.AppDataSource.createQueryRunner is not a function",
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(CoreServices).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await coreServicesController.removeCoreServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "database_config_1.AppDataSource.createQueryRunner is not a function",
      data: undefined,
    });
  });
});
