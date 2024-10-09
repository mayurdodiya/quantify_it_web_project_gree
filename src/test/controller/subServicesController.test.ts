import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import { SubServices } from "../../entities/sub_services.entity";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { SubServicesController } from "../../controller/sub_services/sub_services_controller";

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

describe("SubServicesController", () => {
  let subServicesController: SubServicesController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    subServicesController = new SubServicesController();
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

  //---------------------------------------------------------------------------------------------------------

  it("1 should return an error if service already exists", async () => {
    (AppDataSource.getRepository(SubServices).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
      
    };

    await subServicesController.addSubServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.alreadyExist);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.DATA_EXIST("This sub services"),
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("2 should save new service and return success", async () => {
    (AppDataSource.getRepository(SubServices).findOne as jest.Mock).mockResolvedValueOnce(null);

    (AppDataSource.getRepository(SubServices).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
     
    };

    await subServicesController.addSubServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This core service"),
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("3 should return server error on failure", async () => {
    (AppDataSource.getRepository(SubServices).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    await subServicesController.addSubServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("4 should return not found if service does not exist", async () => {
    (AppDataSource.getRepository(SubServices).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await subServicesController.updateSubServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This sub services"),
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("5 should update the service and return save error", async () => {
    const existingService = {
      id: 1,
      service_name: "Old Name",
      service_type: "Old Type",
    };

    (AppDataSource.getRepository(SubServices).findOne as jest.Mock).mockResolvedValueOnce(existingService);

    mockRequest.params = { id: "1" };
    mockRequest.body = {
      service_name: "New Name",
      service_type: "New Type",
    };

    await subServicesController.updateSubServices(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.UPDATED_SUCCESSFULLY("Sub services"),
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("6 should return not found if service does not exist", async () => {
    (AppDataSource.getRepository(SubServices).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await subServicesController.getSubServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This sub services"),
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("7 should return service data if found", async () => {
    const serviceData = {
      id: 1,
    };

    (AppDataSource.getRepository(SubServices).findOne as jest.Mock).mockResolvedValueOnce(serviceData);

    mockRequest.params = { id: "1" };

    await subServicesController.getSubServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Sub services"),
      data: serviceData,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("8 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(SubServices).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await subServicesController.getSubServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  //findOne
  it("9 should return contact data if found", async () => {
    const contactData = {
      id: 1,
    };

    (AppDataSource.getRepository(SubServices).findOne as jest.Mock).mockResolvedValueOnce(contactData);

    mockRequest.params = { id: "1" };
    await subServicesController.getSubServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Sub services"),
      data: contactData,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("10 should return not found if contact does not exist", async () => {
    (AppDataSource.getRepository(SubServices).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await subServicesController.getSubServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This sub services"),
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("11 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(SubServices).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await subServicesController.getSubServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  //find
  it("12 should return contact data if found", async () => {
    const contactData = {
      id: 1,
    };

    (AppDataSource.getRepository(SubServices).find as jest.Mock).mockResolvedValueOnce(contactData);

    await subServicesController.getAllSubServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Sub services"),
      data: contactData,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("13 should return not found if contact does not exist", async () => {
    (AppDataSource.getRepository(SubServices).findOne as jest.Mock).mockResolvedValueOnce(null);

    await subServicesController.getAllSubServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This sub services"),
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("14 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(SubServices).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await subServicesController.getAllSubServices(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This sub services"),
      data: undefined,
    });
  });
});
