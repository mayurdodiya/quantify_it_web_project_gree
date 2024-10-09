import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { ProvidedService } from "../../entities/provided_service.entity";
import { ProvidedServiceController } from "../../controller/provided_service/provided_service_controller";

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

describe("ProvidedServiceController", () => {
  let providedServiceController: ProvidedServiceController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    providedServiceController = new ProvidedServiceController();
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

  it("should return an error if service already exists", async () => {
    (AppDataSource.getRepository(ProvidedService).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
      service_type: "Type1",
      service_name: "Service1",
    };

    await providedServiceController.addProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.alreadyExist);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.DATA_EXIST("This service name"),
      data: undefined,
    });
  });

  it("should save new service and return success", async () => {
    (AppDataSource.getRepository(ProvidedService).findOne as jest.Mock).mockResolvedValueOnce(null);

    (AppDataSource.getRepository(ProvidedService).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
      card_img_url: "test_url",
      service_type: "Type1",
      service_name: "Service1",
    };

    await providedServiceController.addProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Service provide data"),
      data: undefined,
    });
  });

  it("should return server error on failure", async () => {
    (AppDataSource.getRepository(ProvidedService).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    await providedServiceController.addProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      data: undefined,
    });
  });

  it("should return not found if service does not exist", async () => {
    (AppDataSource.getRepository(ProvidedService).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await providedServiceController.updateProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This service provide data"),
      data: undefined,
    });
  });

  it("should update the service and return save error", async () => {
    const existingService = {
      id: 1,
      service_name: "Old Name",
      service_type: "Old Type",
    };

    (AppDataSource.getRepository(ProvidedService).findOne as jest.Mock).mockResolvedValueOnce(existingService);

    mockRequest.params = { id: "1" };
    mockRequest.body = {
      service_name: "New Name",
      service_type: "New Type",
    };

    await providedServiceController.updateProvidedService(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.saveError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Failed to update service provide data. Please try again!",
      data: undefined,
    });
  });

  it("should return not found if service does not exist", async () => {
    (AppDataSource.getRepository(ProvidedService).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await providedServiceController.getProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This service provide data"),
      data: undefined,
    });
  });

  it("should return service data if found", async () => {
    const serviceData = {
      id: 1,
      card_img_url: "test_url",
      service_type: "Type1",
      service_name: "Service1",
      service_name_title: "Service Title",
      description: "Service Description",
      service_benifits: "Benefits",
      work_planning_title: "Work Planning",
      work_planning_description: "Planning Description",
      work_planning_img_url: "work_img_url",
      business_solutions_title: "Business Solutions",
      business_solutions_description: "Solutions Description",
      business_solutions_img_url: "solutions_img_url",
      completed_works: "Completed Works",
      client_ratings: "Client Ratings",
      bussiness_reports_percentage: 75,
      createdAt: new Date(),
    };

    (AppDataSource.getRepository(ProvidedService).findOne as jest.Mock).mockResolvedValueOnce(serviceData);

    mockRequest.params = { id: "1" };

    await providedServiceController.getProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Service provide data"),
      data: serviceData,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(ProvidedService).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await providedServiceController.getProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

});
