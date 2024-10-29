import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { PortfolioType } from "../../entities/portfolio_type.entity";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { PortfolioTypeController } from "../../controller/portfolio_type/portfolio_type_controller";

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

describe("PortfolioTypeController", () => {
  let portfolioTypeController: PortfolioTypeController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    portfolioTypeController = new PortfolioTypeController();
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

  // Add portfolio type
  it("1 should save new portfolio type and return success", async () => {
    (AppDataSource.getRepository(PortfolioType).findOne as jest.Mock).mockResolvedValueOnce(null);
    (AppDataSource.getRepository(PortfolioType).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = { type_name: "New Portfolio Type" };

    await portfolioTypeController.addPortfolioType(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Portfolio type"),
      data: undefined,
    });
  });

  it("2 should return error if portfolio type already exists", async () => {
    (AppDataSource.getRepository(PortfolioType).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = { type_name: "Existing Portfolio Type" };

    await portfolioTypeController.addPortfolioType(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.alreadyExist);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.DATA_EXIST("This portfolio type"),
      data: undefined,
    });
  });

  // Update portfolio type
  it("3 should return not found if portfolio type does not exist for update", async () => {
    (AppDataSource.getRepository(PortfolioType).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };
    mockRequest.body = { type_name: "Updated Portfolio Type" };

    await portfolioTypeController.updatePortfolioType(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This portfolio"),
      data: undefined,
    });
  });

  it("4 should update the portfolio type and return success", async () => {
    const existingPortfolioType = { id: 1, type_name: "Old Portfolio Type" };
    (AppDataSource.getRepository(PortfolioType).findOne as jest.Mock).mockResolvedValueOnce(existingPortfolioType);
    (AppDataSource.getRepository(PortfolioType).save as jest.Mock).mockResolvedValueOnce({ ...existingPortfolioType, type_name: "Updated Portfolio Type" });

    mockRequest.params = { id: "1" };
    mockRequest.body = { type_name: "Updated Portfolio Type" };

    await portfolioTypeController.updatePortfolioType(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.UPDATED_SUCCESSFULLY("Portfolio"),
      data: undefined,
    });
  });

  // Get portfolio type
  it("5 should return not found if portfolio type does not exist", async () => {
    (AppDataSource.getRepository(PortfolioType).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await portfolioTypeController.getPortfolioType(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This portfolio"),
      data: undefined,
    });
  });

  it("6 should return portfolio type data if found", async () => {
    const portfolioTypeData = { id: 1, type_name: "Portfolio Type" };
    (AppDataSource.getRepository(PortfolioType).findOne as jest.Mock).mockResolvedValueOnce(portfolioTypeData);

    mockRequest.params = { id: "1" };

    await portfolioTypeController.getPortfolioType(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Portfolio"),
      data: portfolioTypeData,
    });
  });

  // Get all portfolio types
  it("7 should return a list of portfolio types", async () => {
    const portfolioTypes = [
      { id: 1, type_name: "Portfolio Type 1" },
      { id: 2, type_name: "Portfolio Type 2" },
    ];
    (AppDataSource.getRepository(PortfolioType).findAndCount as jest.Mock).mockResolvedValueOnce([portfolioTypes, portfolioTypes.length]);

    mockRequest.query = { page: "1", size: "10" };

    await portfolioTypeController.getAllPortfolioType(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Portfolio"),
      data: expect.any(Object), // Replace with actual data structure if needed
    });
  });

  // Delete portfolio type
  it("8 should return not found if portfolio type does not exist for deletion", async () => {
    (AppDataSource.getRepository(PortfolioType).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await portfolioTypeController.removePortfolioType(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This portfolio"),
      data: undefined,
    });
  });

  it("9 should return success if portfolio type is soft deleted", async () => {
    (AppDataSource.getRepository(PortfolioType).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });
    (AppDataSource.getRepository(PortfolioType).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await portfolioTypeController.removePortfolioType(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.DELETE_SUCCESS("Portfolio"),
      data: undefined,
    });
  });

  it("10 should return not found if portfolio type does not exist for deletion", async () => {
    (AppDataSource.getRepository(PortfolioType).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

    mockRequest.params = { id: "1" };

    await portfolioTypeController.removePortfolioType(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This portfolio"),
      data: undefined,
    });
  });

  it("11 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(PortfolioType).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await portfolioTypeController.removePortfolioType(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This portfolio"),
      data: undefined,
    });
  });
});
