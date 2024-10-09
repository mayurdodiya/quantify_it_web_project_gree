import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { HowWeWork } from "../../entities/how_we_work.entity";
import { HowWeWorkController } from "../../controller/how_we_work/how_we_work_controller";

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

describe("howWeWorkController", () => {
  let howWeWorkController: HowWeWorkController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    howWeWorkController = new HowWeWorkController();
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
  it("should return an error if work data already exists", async () => {
    (AppDataSource.getRepository(HowWeWork).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await howWeWorkController.addHowWeWork(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.DATA_EXIST("This work data"),
      data: undefined,
    });
  });

  it("should save new work data and return success", async () => {
    (AppDataSource.getRepository(HowWeWork).findOne as jest.Mock).mockResolvedValueOnce(null);

    (AppDataSource.getRepository(HowWeWork).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await howWeWorkController.addHowWeWork(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Work data"),
      data: undefined,
    });
  });

  it("should return server error on failure", async () => {
    (AppDataSource.getRepository(HowWeWork).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    await howWeWorkController.addHowWeWork(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      data: undefined,
    });
  });

  //edit
  it("should return not found if work data does not exist", async () => {
    (AppDataSource.getRepository(HowWeWork).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await howWeWorkController.updateHowWeWork(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This work data"),
      data: undefined,
    });
  });

  it("should update the work data and return save error", async () => {
    const workData = {
      id: 1,
    };

    (AppDataSource.getRepository(HowWeWork).findOne as jest.Mock).mockResolvedValueOnce(workData);

    mockRequest.params = { id: "1" };
    mockRequest.body = {};

    await howWeWorkController.updateHowWeWork(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.saveError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.UPDATE_FAILED("work data"),
      data: undefined,
    });
  });

  //find
  it("should return not found if work data does not exist", async () => {
    (AppDataSource.getRepository(HowWeWork).find as jest.Mock).mockResolvedValueOnce(null);

    await howWeWorkController.getAllHowWeWork(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This work data"),
      data: undefined,
    });
  });

  it("should return work data data if found", async () => {
    const workData = {
      id: 1,
    };

    (AppDataSource.getRepository(HowWeWork).find as jest.Mock).mockResolvedValueOnce(workData);

    await howWeWorkController.getAllHowWeWork(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Work data"),
      data: workData,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(HowWeWork).find as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await howWeWorkController.getAllHowWeWork(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  //findOne
  it("should return work data data if found", async () => {
    const workData = {
      id: 1,
    };

    (AppDataSource.getRepository(HowWeWork).findOne as jest.Mock).mockResolvedValueOnce(workData);

    mockRequest.params = { id: "1" };

    await howWeWorkController.getHowWeWork(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Work data"),
      data: workData,
    });
  });

  it("should return not found if work data does not exist", async () => {
    (AppDataSource.getRepository(HowWeWork).findOne as jest.Mock).mockResolvedValueOnce(null);
    mockRequest.params = { id: "1" };

    await howWeWorkController.getHowWeWork(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This work data"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(HowWeWork).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));
    mockRequest.params = { id: "1" };

    await howWeWorkController.getHowWeWork(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  //delete
  it("should return success if work data is soft deleted", async () => {
    (AppDataSource.getRepository(HowWeWork).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await howWeWorkController.removeHowWeWork(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This work data"),
      data: undefined,
    });
  });

  it("should return not found if work data does not exist", async () => {
    (AppDataSource.getRepository(HowWeWork).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

    mockRequest.params = { id: "1" };

    await howWeWorkController.removeHowWeWork(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This work data"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(HowWeWork).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await howWeWorkController.removeHowWeWork(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This work data"),
      data: undefined,
    });
  });
});
