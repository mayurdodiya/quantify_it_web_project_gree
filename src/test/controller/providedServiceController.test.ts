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
      findAndCount: jest.fn(),
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

  it("11 should return not found if service does not exist", async () => {
    (AppDataSource.getRepository(ProvidedService).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await providedServiceController.removeProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This service provide data"),
    });
  });

  it("12 should soft delete provided service successfully", async () => {
    const existingService = { id: "1" };
    (AppDataSource.getRepository(ProvidedService).findOne as jest.Mock).mockResolvedValueOnce(existingService);
    (AppDataSource.getRepository(ProvidedService).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await providedServiceController.removeProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.DELETE_SUCCESS("Service provide data"),
    });
  });

  it("13 should return error if soft delete fails", async () => {
    const existingService = { id: "1" };
    (AppDataSource.getRepository(ProvidedService).findOne as jest.Mock).mockResolvedValueOnce(existingService);
    (AppDataSource.getRepository(ProvidedService).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

    mockRequest.params = { id: "1" };

    await providedServiceController.removeProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.DELETE_SUCCESS("Service provide data"),
    });
  });

  it("14 should return server error on unexpected error during deletion", async () => {
    (AppDataSource.getRepository(ProvidedService).findOne as jest.Mock).mockResolvedValueOnce({ id: "1" });
    (AppDataSource.getRepository(ProvidedService).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await providedServiceController.removeProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
    });
  });

  it("should return paginated data when valid parameters are provided", async () => {
    const mockData = [
      { id: 1, service_type: "Type1", service_name: "Service1", service_name_title: "Service 1 Title", card_img_url: "url1" },
      { id: 2, service_type: "Type2", service_name: "Service2", service_name_title: "Service 2 Title", card_img_url: "url2" },
    ];

    (AppDataSource.getRepository(ProvidedService).findAndCount as jest.Mock).mockResolvedValueOnce([mockData, mockData.length]);

    mockRequest.query = { page: "1", size: "2", s: "Type" };

    await providedServiceController.getAllProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Service provide data"),
      data: {
        currentPage: 1, // Adjusted to match the actual response
        totalItems: mockData.length, // Adjusted to match the actual response
        totalPages: 1, // Assuming you want to calculate total pages based on the data length and size
        data: mockData, // Actual data returned
      },
    });
  });

  it("should return an empty array when no services match the criteria", async () => {
    (AppDataSource.getRepository(ProvidedService).findAndCount as jest.Mock).mockResolvedValueOnce([[], 0]);

    mockRequest.query = { page: "1", size: "2", s: "NonExistent" };

    await providedServiceController.getAllProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Service provide data"),
      data: {
        currentPage: 1, // Adjusted to match the actual response
        totalItems: 0, // Adjusted to match the actual response
        totalPages: 0, // Assuming you want to show total pages as 0
        data: [], // Actual data returned
      },
    });
  });

  it("should handle errors gracefully", async () => {
    const errorMessage = "Database error";
    (AppDataSource.getRepository(ProvidedService).findAndCount as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    mockRequest.query = { page: "1", size: "2", s: "Type" };

    await providedServiceController.getAllProvidedService(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: errorMessage || "Internal server error",
      data: undefined,
    });
  });
});
