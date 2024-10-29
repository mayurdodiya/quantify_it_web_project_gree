import { Request, Response } from "express";
import { WhoWeAreController } from "../../controller/who_we_are/who_we_are_controller";
import { AppDataSource } from "../../config/database.config";
import { ResponseCodes } from "../../utils/response-codes";
import { message } from "../../utils/messages";
import { WhoWeAre } from "../../entities/who_we_are.entity";

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

describe("WhoWeAreController", () => {
  let whoWeAreController: WhoWeAreController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    whoWeAreController = new WhoWeAreController();
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

  // Add WhoWeAre
  it("1 should save new WhoWeAre and return success", async () => {
    (AppDataSource.getRepository(WhoWeAre).findOne as jest.Mock).mockResolvedValueOnce(null);
    (AppDataSource.getRepository(WhoWeAre).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
      title: "Who We Are Title",
      description: "Description",
      who_we_are_img_url_1: "image1.jpg",
      who_we_are_img_url_2: "image2.jpg",
      total_experience: 10,
      talented_it_professionals: 50,
      successfull_projects: 100,
      served_country: "Global",
    };

    await whoWeAreController.addWhoWeAre(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Page"),
      data: undefined,
    });
  });

  it("2 should return error if WhoWeAre already exists", async () => {
    (AppDataSource.getRepository(WhoWeAre).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = { title: "Existing Title" };

    await whoWeAreController.addWhoWeAre(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.alreadyExist);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.DATA_EXIST("This page"),
      data: undefined,
    });
  });

  // Update WhoWeAre
  it("3 should return not found if WhoWeAre does not exist for update", async () => {
    (AppDataSource.getRepository(WhoWeAre).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };
    mockRequest.body = { title: "Updated Title" };

    await whoWeAreController.updateWhoWeAre(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This experties"),
      data: undefined,
    });
  });

  it("4 should update WhoWeAre and return success", async () => {
    const existingWhoWeAre = { id: 1, title: "Old Title" };
    (AppDataSource.getRepository(WhoWeAre).findOne as jest.Mock).mockResolvedValueOnce(existingWhoWeAre);
    (AppDataSource.getRepository(WhoWeAre).save as jest.Mock).mockResolvedValueOnce({ ...existingWhoWeAre, title: "Updated Title" });

    mockRequest.params = { id: "1" };
    mockRequest.body = { title: "Updated Title" };

    await whoWeAreController.updateWhoWeAre(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.UPDATED_SUCCESSFULLY("Page"),
      data: undefined,
    });
  });

  // Get WhoWeAre
  it("5 should return not found if WhoWeAre does not exist", async () => {
    (AppDataSource.getRepository(WhoWeAre).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await whoWeAreController.getWhoWeAre(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This page"),
      data: undefined,
    });
  });

  it("6 should return WhoWeAre data if found", async () => {
    const whoWeAreData = { id: 1, title: "Who We Are Title" };
    (AppDataSource.getRepository(WhoWeAre).findOne as jest.Mock).mockResolvedValueOnce(whoWeAreData);

    mockRequest.params = { id: "1" };

    await whoWeAreController.getWhoWeAre(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Page"),
      data: whoWeAreData,
    });
  });

  // Get all WhoWeAre
  it("7 should return a list of WhoWeAre", async () => {
    const whoWeAreList = [{ id: 1, title: "Who We Are 1" }, { id: 2, title: "Who We Are 2" }];
    (AppDataSource.getRepository(WhoWeAre).find as jest.Mock).mockResolvedValueOnce(whoWeAreList);

    await whoWeAreController.getAllWhoWeAre(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Page"),
      data: whoWeAreList,
    });
  });

  // Delete WhoWeAre
  it("8 should return not found if WhoWeAre does not exist for deletion", async () => {
    (AppDataSource.getRepository(WhoWeAre).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await whoWeAreController.removeWhoWeAre(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This page"),
      data: undefined,
    });
  });

  it("9 should return success if WhoWeAre is soft deleted", async () => {
    const existingWhoWeAre = { id: 1 };
    (AppDataSource.getRepository(WhoWeAre).findOne as jest.Mock).mockResolvedValueOnce(existingWhoWeAre);
    (AppDataSource.getRepository(WhoWeAre).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await whoWeAreController.removeWhoWeAre(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.DELETE_SUCCESS("Page"),
      data: undefined,
    });
  });

  it("10 should return error on unexpected error during deletion", async () => {
    (AppDataSource.getRepository(WhoWeAre).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });
    (AppDataSource.getRepository(WhoWeAre).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await whoWeAreController.removeWhoWeAre(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  // Get ideas and experience data
  it("11 should return ideas and experience data", async () => {
    const experienceData = [{ id: 1, total_experience: 10 }];
    (AppDataSource.getRepository(WhoWeAre).find as jest.Mock).mockResolvedValueOnce(experienceData);

    await whoWeAreController.getIdeasExperienceData(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Your ideas, our experience"),
      data: experienceData,
    });
  });
});
