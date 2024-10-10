import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { TechnologicalExpertiesController } from "../../controller/technological_experties/technological_experties_controller";

jest.mock("../../config/database.config", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    query: jest.fn(), // Ensure query is mocked
  },
}));

jest.mock("../../utils/response-codes");

describe("TechnologicalExpertiesController", () => {
  let technologicalExpertiesController: TechnologicalExpertiesController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    technologicalExpertiesController = new TechnologicalExpertiesController();
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

  // it("1 should return an error if service already exists", async () => {
  //   (AppDataSource.getRepository(TechnologicalExperties).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

  //   mockRequest.body = {};

  //   await technologicalExpertiesController.addTechnologicalExperties(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.DATA_EXIST("This experties"),
  //     data: undefined,
  //   });
  // });

  // //---------------------------------------------------------------------------------------------------------

  // it("2 should save new service and return success", async () => {
  //   (AppDataSource.getRepository(TechnologicalExperties).findOne as jest.Mock).mockResolvedValueOnce(null);

  //   (AppDataSource.getRepository(TechnologicalExperties).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

  //   mockRequest.body = {};

  //   await technologicalExpertiesController.addTechnologicalExperties(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: true,
  //     message: message.CREATE_SUCCESS("Experties"),
  //     data: undefined,
  //   });
  // });

  // //---------------------------------------------------------------------------------------------------------

  // it("3 should return server error on failure", async () => {
  //   (AppDataSource.getRepository(TechnologicalExperties).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

  //   await technologicalExpertiesController.addTechnologicalExperties(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: "Server error",
  //     data: undefined,
  //   });
  // });

  // //---------------------------------------------------------------------------------------------------------

  // it("4 should return not found if service does not exist", async () => {
  //   (AppDataSource.getRepository(TechnologicalExperties).findOne as jest.Mock).mockResolvedValueOnce(null);

  //   mockRequest.params = { id: "1" };

  //   await technologicalExpertiesController.updateTechnologicalExperties(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.NO_DATA("This experties"),
  //     data: undefined,
  //   });
  // });

  // //---------------------------------------------------------------------------------------------------------

  // it("5 should update the service and return save error", async () => {
  //   const existingService = {
  //     id: 1,
  //     service_name: "Old Name",
  //     service_type: "Old Type",
  //   };

  //   (AppDataSource.getRepository(TechnologicalExperties).findOne as jest.Mock).mockRejectedValueOnce(existingService);

  //   mockRequest.params = { id: "1" };
  //   mockRequest.body = {
  //     service_name: "New Name",
  //     service_type: "New Type",
  //   };

  //   await technologicalExpertiesController.updateTechnologicalExperties(mockRequest as Request, mockResponse as Response);
  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.UPDATE_FAILED("Experties"),
  //     data: undefined,
  //   });
  // });

  // //---------------------------------------------------------------------------------------------------------

  // it("6 should return not found if service does not exist", async () => {
  //   (AppDataSource.getRepository(TechnologicalExperties).findOne as jest.Mock).mockResolvedValueOnce(null);

  //   mockRequest.params = { id: "1" };

  //   await technologicalExpertiesController.getTechnologicalExperties(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.NO_DATA("This experties"),
  //     data: undefined,
  //   });
  // });

  // //---------------------------------------------------------------------------------------------------------

  // it("7 should return service data if found", async () => {
  //   const serviceData = {
  //     id: 1,
  //   };

  //   (AppDataSource.getRepository(TechnologicalExperties).findOne as jest.Mock).mockResolvedValueOnce(serviceData);

  //   mockRequest.params = { id: "1" };

  //   await technologicalExpertiesController.getTechnologicalExperties(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: true,
  //     message: message.GET_DATA("Experties"),
  //     data: serviceData,
  //   });
  // });

  // //---------------------------------------------------------------------------------------------------------

  // it("8 should return server error on unexpected error", async () => {
  //   (AppDataSource.getRepository(TechnologicalExperties).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

  //   mockRequest.params = { id: "1" };

  //   await technologicalExpertiesController.getTechnologicalExperties(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: "Server error",
  //     data: undefined,
  //   });
  // });

  // //---------------------------------------------------------------------------------------------------------

  // //findOne
  // it("9 should return contact data if found", async () => {
  //   const contactData = {
  //     id: 1,
  //   };

  //   (AppDataSource.getRepository(TechnologicalExperties).findOne as jest.Mock).mockResolvedValueOnce(contactData);

  //   mockRequest.params = { id: "1" };
  //   await technologicalExpertiesController.getTechnologicalExperties(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: true,
  //     message: message.GET_DATA("Experties"),
  //     data: contactData,
  //   });
  // });
  // //---------------------------------------------------------------------------------------------------------

  // it("10 should return not found if contact does not exist", async () => {
  //   (AppDataSource.getRepository(TechnologicalExperties).findOne as jest.Mock).mockResolvedValueOnce(null);

  //   mockRequest.params = { id: "1" };

  //   await technologicalExpertiesController.getTechnologicalExperties(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.NO_DATA("This experties"),
  //     data: undefined,
  //   });
  // });
  // //---------------------------------------------------------------------------------------------------------

  // it("11 should return server error on unexpected error", async () => {
  //   (AppDataSource.getRepository(TechnologicalExperties).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

  //   mockRequest.params = { id: "1" };

  //   await technologicalExpertiesController.getTechnologicalExperties(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: "Unexpected error",
  //     data: undefined,
  //   });
  // });
  //---------------------------------------------------------------------------------------------------------

  it("12 should return success with grouped data", async () => {
    const mockGroupedData = [
      {
        experties_type: "Frontend",
        data: [{ id: 1, experties_name: "React", img_url: "react.png" }],
      },
    ];

    // Mock AppDataSource.query to return mockGroupedData
    (AppDataSource.query as jest.Mock).mockResolvedValueOnce(mockGroupedData);

    await technologicalExpertiesController.getAllTechnologicalExperties(mockRequest as Request, mockResponse as Response);

    expect(AppDataSource.query).toHaveBeenCalledWith(expect.any(String));
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Experties"),
      data: mockGroupedData,
    });
  });
  //---------------------------------------------------------------------------------------------------------
  it("13 should return no data found when groupedData is null", async () => {
    // Mock AppDataSource.query to return null
    (AppDataSource.query as jest.Mock).mockResolvedValueOnce(null);

    await technologicalExpertiesController.getAllTechnologicalExperties(mockRequest as Request, mockResponse as Response);

    expect(AppDataSource.query).toHaveBeenCalledWith(expect.any(String));
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This experties"),
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------
  it("14 should handle database errors and return a server error response", async () => {
    const errorMessage = "Database error";

    // Mock AppDataSource.query to throw an error
    (AppDataSource.query as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    await technologicalExpertiesController.getAllTechnologicalExperties(mockRequest as Request, mockResponse as Response);

    expect(AppDataSource.query).toHaveBeenCalledWith(expect.any(String));
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: errorMessage,
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  //delete
  // it("15 should return success if work data is soft deleted", async () => {
  //   (AppDataSource.getRepository(TechnologicalExperties).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

  //   mockRequest.params = { id: "1" };

  //   await technologicalExpertiesController.removeTechnologicalExperties(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.NO_DATA("This experties"),
  //     data: undefined,
  //   });
  // });
  //---------------------------------------------------------------------------------------------------------

  // it("16 should return not found if work data does not exist", async () => {
  //   (AppDataSource.getRepository(TechnologicalExperties).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

  //   mockRequest.params = { id: "1" };

  //   await technologicalExpertiesController.removeTechnologicalExperties(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.NO_DATA("This experties"),
  //     data: undefined,
  //   });
  // });
  //---------------------------------------------------------------------------------------------------------

  // it("17 should return server error on unexpected error", async () => {
  //   (AppDataSource.getRepository(TechnologicalExperties).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

  //   mockRequest.params = { id: "1" };

  //   await technologicalExpertiesController.removeTechnologicalExperties(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.NO_DATA("This experties"),
  //     data: undefined,
  //   });
  // });
});
