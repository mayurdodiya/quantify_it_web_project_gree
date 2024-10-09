import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { PolicyAndTermsController } from "../../controller/policy_and_terms/policy_and_terms_controller";
import { PolicyAndTerms } from "../../entities/policy_and_terms.entity";

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

describe("PolicyAndTermsController", () => {
  let policyAndTermsController: PolicyAndTermsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    policyAndTermsController = new PolicyAndTermsController();
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
    (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
      
    };

    await policyAndTermsController.addPolicyAndTerms(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.alreadyExist);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.DATA_EXIST("This data"),
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("2 should save new service and return success", async () => {
    (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockResolvedValueOnce(null);

    (AppDataSource.getRepository(PolicyAndTerms).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
     
    };

    await policyAndTermsController.addPolicyAndTerms(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Data"),
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("3 should return server error on failure", async () => {
    (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    await policyAndTermsController.addPolicyAndTerms(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  // it("4 should return not found if service does not exist", async () => {
  //   (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockResolvedValueOnce(null);

  //   mockRequest.params = { id: "1" };

  //   await policyAndTermsController.updatePolicyAndTerms(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.NO_DATA("This experties"),
  //     data: undefined,
  //   });
  // });

  //---------------------------------------------------------------------------------------------------------

  // it("5 should update the service and return save error", async () => {
  //   const existingService = {
  //     id: 1,
  //     service_name: "Old Name",
  //     service_type: "Old Type",
  //   };

  //   (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockResolvedValueOnce(existingService);

  //   mockRequest.params = { id: "1" };
  //   mockRequest.body = {
  //     service_name: "New Name",
  //     service_type: "New Type",
  //   };

  //   await policyAndTermsController.updatePolicyAndTerms(mockRequest as Request, mockResponse as Response);
  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.UPDATE_FAILED("Experties"),
  //     data: undefined,
  //   });
  // });

  //---------------------------------------------------------------------------------------------------------

  it("6 should return not found if service does not exist", async () => {
    (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await policyAndTermsController.getPolicyAndTerms(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This data"),
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("7 should return service data if found", async () => {
    const serviceData = {
      id: 1,
    };

    (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockResolvedValueOnce(serviceData);

    mockRequest.params = { id: "1" };

    await policyAndTermsController.getPolicyAndTerms(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("This requested"),
      data: serviceData,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("8 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await policyAndTermsController.getPolicyAndTerms(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  //findOne
  it("9 should return contact data if found", async () => {
    const contactData = {
      id: 1,
    };

    (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockResolvedValueOnce(contactData);

    mockRequest.params = { id: "1" };
    await policyAndTermsController.getPolicyAndTerms(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("This requested"),
      data: contactData,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("10 should return not found if contact does not exist", async () => {
    (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await policyAndTermsController.getPolicyAndTerms(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This data"),
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("11 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await policyAndTermsController.getPolicyAndTerms(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  //find
  // it("12 should return contact data if found", async () => {
  //   const contactData = {
  //     id: 1,
  //   };

  //   (AppDataSource.getRepository(PolicyAndTerms).find as jest.Mock).mockResolvedValueOnce(contactData);

  //   await policyAndTermsController.getAllPolicyAndTerms(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: true,
  //     message: message.GET_DATA("Experties"),
  //     data: contactData,
  //   });
  // });
  //---------------------------------------------------------------------------------------------------------

  // it("13 should return not found if contact does not exist", async () => {
  //   (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockResolvedValueOnce(null);

  //   await policyAndTermsController.getAllPolicyAndTerms(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.NO_DATA("This experties"),
  //     data: undefined,
  //   });
  // });
  //---------------------------------------------------------------------------------------------------------

  // it("14 should return server error on unexpected error", async () => {
  //   (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

  //   await policyAndTermsController.getAllPolicyAndTerms(mockRequest as Request, mockResponse as Response);

  //   expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
  //   expect(jsonMock).toHaveBeenCalledWith({
  //     success: false,
  //     message: message.NO_DATA("This experties"),
  //     data: undefined,
  //   });
  // });
});
