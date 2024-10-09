import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { OurContactDetails } from "../../entities/our_contact_details.entity";
import { OurContactDetailsController } from "../../controller/our_contact_details/our_contact_details_controller";

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

describe("ourContactDetailsController", () => {
  let ourContactDetailsController: OurContactDetailsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    ourContactDetailsController = new OurContactDetailsController();
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
  // it("should return an error if our contact details already exists", async () => {
  //   (AppDataSource.getRepository(OurContactDetails).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

  //   mockRequest.body = {};

  //   await ourContactDetailsController.addOurContactDetails(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.CREATE_FAIL("form data"),
  //     data: undefined,
  //   });
  // });

  // it("should save new our contact details and return success", async () => {
  //   (AppDataSource.getRepository(OurContactDetails).findOne as jest.Mock).mockResolvedValueOnce(null);

  //   (AppDataSource.getRepository(OurContactDetails).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

  //   mockRequest.body = {};

  //   await ourContactDetailsController.addOurContactDetails(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.CREATE_FAIL("form data"),
  //     data: undefined,
  //   });
  // });

  // it("should return server error on failure", async () => {
  //   (AppDataSource.getRepository(OurContactDetails).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

  //   await ourContactDetailsController.addOurContactDetails(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.CREATE_FAIL("form data"),
  //     data: undefined,
  //   });
  // });

  //edit
  it("should return not found if our contact details does not exist", async () => {
    (AppDataSource.getRepository(OurContactDetails).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await ourContactDetailsController.updateOurContactDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This our contact details"),
      data: undefined,
    });
  });

  it("should update the our contact details and return save error", async () => {
    const existingService = {
      id: 1,
    };

    (AppDataSource.getRepository(OurContactDetails).findOne as jest.Mock).mockResolvedValueOnce(existingService);

    mockRequest.params = { id: "1" };
    mockRequest.body = {};

    await ourContactDetailsController.updateOurContactDetails(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.saveError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.UPDATE_FAILED("our contact details"),
      data: undefined,
    });
  });

  //find
  it("should return not found if our contact details does not exist", async () => {
    (AppDataSource.getRepository(OurContactDetails).find as jest.Mock).mockResolvedValueOnce(null);

    await ourContactDetailsController.getOurContactDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This our contact details"),
      data: undefined,
    });
  });

  it("should return our contact details data if found", async () => {
    const empData = {
      id: 1,
    };

    (AppDataSource.getRepository(OurContactDetails).find as jest.Mock).mockResolvedValueOnce(empData);

    await ourContactDetailsController.getOurContactDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This our contact details"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(OurContactDetails).find as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await ourContactDetailsController.getOurContactDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This our contact details"),
      data: undefined,
    });
  });

  //findOne
  it("should return our contact details data if found", async () => {
    const empData = {
      id: 1,
    };

    (AppDataSource.getRepository(OurContactDetails).findOne as jest.Mock).mockResolvedValueOnce(empData);

    mockRequest.params = { id: "1" };

    await ourContactDetailsController.removeContactDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This our contact details"),
      data: undefined,
    });
  });

  it("should return not found if our contact details does not exist", async () => {
    (AppDataSource.getRepository(OurContactDetails).findOne as jest.Mock).mockResolvedValueOnce(null);
    mockRequest.params = { id: "1" };

    await ourContactDetailsController.removeContactDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This our contact details"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(OurContactDetails).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));
    mockRequest.params = { id: "1" };

    await ourContactDetailsController.removeContactDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This our contact details"),
      data: undefined,
    });
  });

  //delete
  it("should return success if our contact details is soft deleted", async () => {
    (AppDataSource.getRepository(OurContactDetails).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await ourContactDetailsController.removeContactDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.DELETE_SUCCESS("Our contact details"),
      data: undefined,
    });
  });

  it("should return not found if our contact details does not exist", async () => {
    (AppDataSource.getRepository(OurContactDetails).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

    mockRequest.params = { id: "1" };

    await ourContactDetailsController.removeContactDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.DELETE_SUCCESS("Our contact details"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(OurContactDetails).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await ourContactDetailsController.removeContactDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });
});
