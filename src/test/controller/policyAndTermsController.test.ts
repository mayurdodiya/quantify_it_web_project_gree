import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { PolicyAndTermsController } from "../../controller/policy_and_terms/policy_and_terms_controller";
import { PolicyAndTerms } from "../../entities/policy_and_terms.entity";
import { DocumentType } from "../../utils/enum";

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

    mockRequest.body = {};

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

    mockRequest.body = {};

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

  it("4 should return not found if service does not exist", async () => {
    // Mock the findOne method to return null
    (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockResolvedValueOnce(null);

    // Set up the mock request parameters
    mockRequest.params = { id: "1" };
    mockRequest.body = {
      document_type: "some_type", // Ensure to include this field as it is required by the controller
    };

    // Call the controller method
    await policyAndTermsController.updatePolicyAndTerms(mockRequest as Request, mockResponse as Response);

    // Check that the response status and body are correct
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound); // Changed to notFound
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This data"), // Ensure the message matches the implementation
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("5 should update the service and return save error", async () => {
    // Mock existing service data
    const existingService = {
      id: 1,
      subject: "Old Subject",
      explanation: "Old Explanation",
      document_type: "old_type",
    };

    // Mock the findOne method to return the existing service
    (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockResolvedValueOnce(existingService);

    // Set up the mock request parameters and body
    mockRequest.params = { id: "1" };
    mockRequest.body = {
      document_type: "new_type", // Include the document_type
      subject: "New Subject",
      explanation: "New Explanation",
    };

    // Mock the save method to simulate a save error
    (AppDataSource.getRepository(PolicyAndTerms).save as jest.Mock).mockResolvedValueOnce(null);

    // Call the controller method
    await policyAndTermsController.updatePolicyAndTerms(mockRequest as Request, mockResponse as Response);

    // Verify that the status and response body are correct
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.saveError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.UPDATE_FAILED("Data"),
      data: undefined,
    });
  });

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

  // find
  it("12 should return contact data if found", async () => {
    const contactData = [
      {
        id: 1,
        document_type: DocumentType.PRIVACY_POLICY,
        subject: "Subject 1",
        explanation: "Explanation 1",
      },
    ]; // Mock as an array since `find` returns an array of results

    // Mock the find method to resolve with the expected data
    (AppDataSource.getRepository(PolicyAndTerms).find as jest.Mock).mockResolvedValueOnce(contactData);

    // Mock the request
    mockRequest.query = {
      document_type: DocumentType.PRIVACY_POLICY.toString(),
    }; // Convert to string

    // Call the controller method
    await policyAndTermsController.getAllPolicyAndTerms(mockRequest as Request, mockResponse as Response);

    // Assert the status and response
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success); // Expect success
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("This requested"), // Adjust message if necessary
      data: contactData,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("13 should return not found if contact does not exist", async () => {
    // Mock the find method to resolve with an empty array
    (AppDataSource.getRepository(PolicyAndTerms).find as jest.Mock).mockResolvedValueOnce([]);

    // Mock the request to include document_type
    mockRequest.query = {
      document_type: DocumentType.PRIVACY_POLICY.toString(),
    }; // Convert to string

    await policyAndTermsController.getAllPolicyAndTerms(mockRequest as Request, mockResponse as Response);

    // Expect a not found status and message
    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success); // Expect notFound
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: "This requested data get successfully!", // Ensure the message matches what your handler returns
      data: [],
    });
  });

  //---------------------------------------------------------------------------------------------------------

  it("14 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(PolicyAndTerms).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await policyAndTermsController.getAllPolicyAndTerms(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Cannot read properties of undefined (reading 'document_type')",
      data: undefined,
    });
  });

  //---------------------------------------------------------------------------------------------------------

  //delete
  it("15 should return success if work data is soft deleted", async () => {
    (AppDataSource.getRepository(PolicyAndTerms).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await policyAndTermsController.removePolicyAndTerms(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("16 should return not found if work data does not exist", async () => {
    (AppDataSource.getRepository(PolicyAndTerms).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

    mockRequest.params = { id: "1" };

    await policyAndTermsController.removePolicyAndTerms(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This data"),
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("17 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(PolicyAndTerms).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await policyAndTermsController.removePolicyAndTerms(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This data"),
      data: undefined,
    });
  });
});
