import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { AboutUsController } from "../../controller/about_us/about_us_controller";
import { AboutUs } from "../../entities/about_us.entity";

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

describe("AboutUsController", () => {
  let aboutUsController: AboutUsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    aboutUsController = new AboutUsController();
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

  //--------------------------------------------------------------------------------------------------------

  // it("should return an error if service already exists", async () => {
  //   (AppDataSource.getRepository(AboutUs).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

  //   mockRequest.body = {
  //     service_type: "Type1",
  //     service_name: "Service1",
  //   };

  //   await aboutUsController.addAboutUs(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.CREATE_FAIL("about us page"),
  //     data: undefined,
  //   });
  // });

  //--------------------------------------------------------------------------------------------------------

  // create post
  // it("should save new service and return success", async () => {
  //   (AppDataSource.getRepository(AboutUs).findOne as jest.Mock).mockResolvedValueOnce(null);

  //   (AppDataSource.getRepository(AboutUs).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

  //   mockRequest.body = {
  //     card_img_url: "test_url",
  //     service_type: "Type1",
  //     service_name: "Service1",
  //   };

  //   await aboutUsController.addAboutUs(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: true,
  //     message: message.CREATE_SUCCESS("About us page"),
  //     data: undefined,
  //   });
  // });

  //--------------------------------------------------------------------------------------------------------

  // create post
  // it("should return server error on failure", async () => {
  //   (AppDataSource.getRepository(AboutUs).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

  //   await aboutUsController.addAboutUs(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.CREATE_FAIL("about us page"),
  //     data: undefined,
  //   });
  // });

  //--------------------------------------------------------------------------------------------------------

  it("should return not found if service does not exist", async () => {
    (AppDataSource.getRepository(AboutUs).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await aboutUsController.updateAboutUs(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("About us page"),
      data: undefined,
    });
  });

  //--------------------------------------------------------------------------------------------------------

  it("should update the service and return save error", async () => {
    const existingService = {
      id: 1,
      vision_mission_img_url: "https://picsum.photos/200",
      works_about_title: "Trusted by 1,000+ HappyCustomers",
    };

    (AppDataSource.getRepository(AboutUs).findOne as jest.Mock).mockResolvedValueOnce(existingService);

    mockRequest.params = { id: "1" };
    mockRequest.body = {
      vision_mission_img_url: "https://picsum.photos/200",
      works_about_title: "Trusted by 1,000+ HappyCustomers",
    };

    await aboutUsController.updateAboutUs(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.UPDATE_FAILED("about us page"),
      data: undefined,
    });
  });
  
   //---------------------------------------------------------------------------------------------------------

  //find
  it("12 should return contact data if found", async () => {
    const contactData = {
      id: 1,
    };

    (AppDataSource.getRepository(AboutUs).find as jest.Mock).mockResolvedValueOnce(contactData);

    await aboutUsController.getAboutUs(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("About us"),
      data: contactData,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("13 should return not found if contact does not exist", async () => {
    (AppDataSource.getRepository(AboutUs).findOne as jest.Mock).mockResolvedValueOnce(null);

    await aboutUsController.getAboutUs(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.searchError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("About us page"),
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("14 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(AboutUs).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await aboutUsController.getAboutUs(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.searchError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("About us page"),
      data: undefined,
    });
  });
  
});
