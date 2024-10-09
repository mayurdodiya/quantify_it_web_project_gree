import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { Banner } from "../../entities/banner.entity";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { BannerController } from "../../controller/banner/banner_controller";

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

describe("BannerController", () => {
  let bannerController: BannerController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    bannerController = new BannerController();
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
  it("should return an error if banner already exists", async () => {
    (AppDataSource.getRepository(Banner).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
      title: "Your trusted partner in it excellence",
      description: ["Our commitment to excellence means we are always striving to exceed your expectations. We are not just a service provider; we are your partners in innovation"],
      banner_name: "rock on ig",
      pc_img_url: "xyz.jpg",
      mobile_img_url: "xyz.jpg",
    };

    await bannerController.createBanner(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.alreadyExist);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Banner name already exist!",
      data: undefined,
    });
  });

  it("should save new banner and return success", async () => {
    (AppDataSource.getRepository(Banner).findOne as jest.Mock).mockResolvedValueOnce(null);

    (AppDataSource.getRepository(Banner).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await bannerController.createBanner(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Banner"),
      data: undefined,
    });
  });

  it("should return server error on failure", async () => {
    (AppDataSource.getRepository(Banner).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    await bannerController.createBanner(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      data: undefined,
    });
  });

  //edit
  it("should return not found if banner does not exist", async () => {
    (AppDataSource.getRepository(Banner).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await bannerController.updateBanner(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This banner"),
      data: undefined,
    });
  });

  it("should update the banner and return save error", async () => {
    const existingService = {
      id: 1,
    };

    (AppDataSource.getRepository(Banner).findOne as jest.Mock).mockResolvedValueOnce(existingService);

    mockRequest.params = { id: "1" };
    mockRequest.body = {};

    await bannerController.updateBanner(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.saveError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.UPDATE_FAILED("Banner"),
      data: undefined,
    });
  });

  //find
  it("should return not found if banner does not exist", async () => {
    (AppDataSource.getRepository(Banner).find as jest.Mock).mockResolvedValueOnce(null);

    await bannerController.getBanner(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Banner"),
      data: null,
    });
  });

  it("should return banner data if found", async () => {
    const BannerData = {
      id: 1,
    };

    (AppDataSource.getRepository(Banner).find as jest.Mock).mockResolvedValueOnce(BannerData);

    await bannerController.getBanner(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Banner"),
      data: BannerData,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(Banner).find as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await bannerController.getBanner(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  //delete
  it("should return success if banner is soft deleted", async () => {
    (AppDataSource.getRepository(Banner).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await bannerController.removeBanner(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.DELETE_SUCCESS("Banner"),
      data: undefined,
    });
  });

  it("should return not found if banner does not exist", async () => {
    (AppDataSource.getRepository(Banner).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

    mockRequest.params = { id: "1" };

    await bannerController.removeBanner(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.DELETE_SUCCESS("Banner"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(Banner).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await bannerController.removeBanner(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });
});
