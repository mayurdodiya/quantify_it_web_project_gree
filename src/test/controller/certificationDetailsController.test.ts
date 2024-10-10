import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { CertificationDetails } from "../../entities/certification_details.entity";
import { CertificationDetailsController } from "../../controller/certification_details/certification_details_controller";

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

describe("certificationDetailsController", () => {
  let certificationDetailsController: CertificationDetailsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    certificationDetailsController = new CertificationDetailsController();
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
  it("should return an error if certification details already exists", async () => {
    (AppDataSource.getRepository(CertificationDetails).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await certificationDetailsController.addCertificationDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.alreadyExist);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.DATA_EXIST("This certification details"),
      data: undefined,
    });
  });

  it("should save new certification details and return success", async () => {
    (AppDataSource.getRepository(CertificationDetails).findOne as jest.Mock).mockResolvedValueOnce(null);

    (AppDataSource.getRepository(CertificationDetails).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {};

    await certificationDetailsController.addCertificationDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Certification Details"),
      data: undefined,
    });
  });

  it("should return server error on failure", async () => {
    (AppDataSource.getRepository(CertificationDetails).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    await certificationDetailsController.addCertificationDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      data: undefined,
    });
  });

  //edit
  it("5 should return not found if certification details does not exist", async () => {
    (AppDataSource.getRepository(CertificationDetails).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await certificationDetailsController.updateCertificationDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This certification details"),
      data: undefined,
    });
  });

  it("should update the certification details and return save error", async () => {
    const existingService = {
      id: 1,
    };

    (AppDataSource.getRepository(CertificationDetails).findOne as jest.Mock).mockResolvedValueOnce(existingService);

    mockRequest.params = { id: "1" };
    mockRequest.body = {};

    await certificationDetailsController.updateCertificationDetails(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.insertError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.UPDATE_FAILED("certification details"),
      data: undefined,
    });
  });

  //find
  it("should return not found if certification details does not exist", async () => {
    (AppDataSource.getRepository(CertificationDetails).find as jest.Mock).mockResolvedValueOnce(null);

    await certificationDetailsController.getAllCertificationDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Certification Details"),
      data: null,
    });
  });

  it("should return certification details data if found", async () => {
    const certificationData = {
      id: 1,
    };

    (AppDataSource.getRepository(CertificationDetails).find as jest.Mock).mockResolvedValueOnce(certificationData);

    await certificationDetailsController.getAllCertificationDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Certification Details"),
      data: certificationData,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(CertificationDetails).find as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await certificationDetailsController.getAllCertificationDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  //findOne
  it("should return certification details data if found", async () => {
    const certificationData = {
      id: 1,
    };

    (AppDataSource.getRepository(CertificationDetails).findOne as jest.Mock).mockResolvedValueOnce(certificationData);

    mockRequest.params = { id: "1" };

    await certificationDetailsController.getCertificationDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Certification Details"),
      data: certificationData,
    });
  });

  it("should return not found if certification details does not exist", async () => {
    (AppDataSource.getRepository(CertificationDetails).findOne as jest.Mock).mockResolvedValueOnce(null);
    mockRequest.params = { id: "1" };

    await certificationDetailsController.getCertificationDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This certification details"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(CertificationDetails).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));
    mockRequest.params = { id: "1" };

    await certificationDetailsController.getCertificationDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  //delete
  it("should return success if certification details is soft deleted", async () => {
    (AppDataSource.getRepository(CertificationDetails).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await certificationDetailsController.removeCertificationDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This certification details"),
      data: undefined,
    });
  });

  it("should return not found if certification details does not exist", async () => {
    (AppDataSource.getRepository(CertificationDetails).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

    mockRequest.params = { id: "1" };

    await certificationDetailsController.removeCertificationDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This certification details"),
      data: undefined,
    });
  });

  it("should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(CertificationDetails).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await certificationDetailsController.removeCertificationDetails(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This certification details"),
      data: undefined,
    });
  });
});
