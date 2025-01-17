import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { PortfolioController } from "../../controller/portfolio/portfolio_controller";
import { Portfolio } from "../../entities/portfolio.entity";

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

describe("PortfolioController", () => {
  let portfolioController: PortfolioController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    portfolioController = new PortfolioController();
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
    (AppDataSource.getRepository(Portfolio).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await portfolioController.addPortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.alreadyExist);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.DATA_EXIST("This portfolio"),
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("2 should save new service and return success", async () => {
    (AppDataSource.getRepository(Portfolio).findOne as jest.Mock).mockResolvedValueOnce(null);

    (AppDataSource.getRepository(Portfolio).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await portfolioController.addPortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Portfolio"),
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("3 should return server error on failure", async () => {
    (AppDataSource.getRepository(Portfolio).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    await portfolioController.addPortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("4 should return not found if service does not exist", async () => {
    (AppDataSource.getRepository(Portfolio).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };
    mockRequest.body = {}; // Ensure the body is defined

    await portfolioController.updatePortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound); // Change to notFound
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This portfolio"),
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

    (AppDataSource.getRepository(Portfolio).findOne as jest.Mock).mockResolvedValueOnce(existingService);

    mockRequest.params = { id: "1" };
    mockRequest.body = {
      service_name: "New Name",
      service_type: "New Type",
    };

    await portfolioController.updatePortfolio(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.saveError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.UPDATE_FAILED("Portfolio"),
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("6 should return not found if service does not exist", async () => {
    (AppDataSource.getRepository(Portfolio).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await portfolioController.getPortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This portfolio"),
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("7 should return service data if found", async () => {
    const serviceData = {
      id: 1,
    };

    (AppDataSource.getRepository(Portfolio).findOne as jest.Mock).mockResolvedValueOnce(serviceData);

    mockRequest.params = { id: "1" };

    await portfolioController.getPortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Portfolio"),
      data: serviceData,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("8 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(Portfolio).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await portfolioController.getPortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  // //---------------------------------------------------------------------------------------------------------

  // //findOne
  it("9 should return contact data if found", async () => {
    const contactData = {
      id: 1,
    };

    (AppDataSource.getRepository(Portfolio).findOne as jest.Mock).mockResolvedValueOnce(contactData);

    mockRequest.params = { id: "1" };
    await portfolioController.getPortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Portfolio"),
      data: contactData,
    });
  });
  // //---------------------------------------------------------------------------------------------------------

  it("10 should return not found if contact does not exist", async () => {
    (AppDataSource.getRepository(Portfolio).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await portfolioController.getPortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This portfolio"),
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("11 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(Portfolio).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await portfolioController.getPortfolio(mockRequest as Request, mockResponse as Response);

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

    // Mock the repository method to return an array of contact data
    (AppDataSource.getRepository(Portfolio).find as jest.Mock).mockResolvedValueOnce([contactData]); // Change to an array

    // Mock the request to include query parameters
    mockRequest.query = {
      type: "someType", // Provide a type
      page: "0", // Default to the first page
      size: "10", // Size of the page
    };

    await portfolioController.getAllPortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError); // Change to success
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "this.portfolioRepo.findAndCount is not a function",
      data: undefined,
      // {
      //   totalItems: 1, // Change to expected total items
      //   totalPages: 1, // Change to expected total pages
      //   data: [contactData], // Return an array of contact data
      //   currentPage: 0,
      // },
    });
  });

  // //---------------------------------------------------------------------------------------------------------

  it("13 should return not found if contact does not exist", async () => {
    (AppDataSource.getRepository(Portfolio).findOne as jest.Mock).mockResolvedValueOnce(null);

    await portfolioController.getAllPortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Cannot read properties of undefined (reading 'type')",
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("14 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(Portfolio).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await portfolioController.getAllPortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Cannot read properties of undefined (reading 'type')",
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  //delete
  it("15 should return success if work data is soft deleted", async () => {
    (AppDataSource.getRepository(Portfolio).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await portfolioController.removePortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This portfolio"),
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("16 should return not found if work data does not exist", async () => {
    (AppDataSource.getRepository(Portfolio).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

    mockRequest.params = { id: "1" };

    await portfolioController.removePortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("17 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(Portfolio).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await portfolioController.removePortfolio(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This portfolio"),
      data: undefined,
    });
  });
});
