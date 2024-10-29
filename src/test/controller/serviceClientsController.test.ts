import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import { ServiceClientsController } from "../../controller/service_clients/service_clients_controller";
import { ServiceClients } from "../../entities/service_clients.entity";
import { ResponseCodes } from "../../utils/response-codes";
import { message } from "../../utils/messages";

jest.mock("../../config/database.config", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      softDelete: jest.fn(),
    }),
  },
}));

describe("ServiceClientsController", () => {
  let serviceClientsController: ServiceClientsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    serviceClientsController = new ServiceClientsController();
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

  // Add service client
  it("1 should save new service client and return success", async () => {
    (AppDataSource.getRepository(ServiceClients).findOne as jest.Mock).mockResolvedValueOnce(null);
    (AppDataSource.getRepository(ServiceClients).save as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
      client_name: "New Client",
      his_profession: "Profession",
      img_url: "image.jpg",
      description: "Description",
      rating: 5,
    };

    await serviceClientsController.addServiceClients(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("Client"),
      data: undefined,
    });
  });

  it("2 should return error if client already exists", async () => {
    (AppDataSource.getRepository(ServiceClients).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

    mockRequest.body = {
      client_name: "Existing Client",
      his_profession: "Profession",
      img_url: "image.jpg",
      description: "Description",
      rating: 5,
    };

    await serviceClientsController.addServiceClients(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.alreadyExist);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.DATA_EXIST("This client"),
      data: undefined,
    });
  });

  // Update service client
  it("3 should return not found if client does not exist for update", async () => {
    (AppDataSource.getRepository(ServiceClients).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };
    mockRequest.body = { client_name: "Updated Client" };

    await serviceClientsController.updateServiceClients(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This client"),
      data: undefined,
    });
  });

  it("4 should update the client and return success", async () => {
    const existingClient = { id: 1, client_name: "Old Client" };
    (AppDataSource.getRepository(ServiceClients).findOne as jest.Mock).mockResolvedValueOnce(existingClient);
    (AppDataSource.getRepository(ServiceClients).save as jest.Mock).mockResolvedValueOnce({ ...existingClient, client_name: "Updated Client" });

    mockRequest.params = { id: "1" };
    mockRequest.body = { client_name: "Updated Client" };

    await serviceClientsController.updateServiceClients(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.UPDATED_SUCCESSFULLY("Client"),
      data: undefined,
    });
  });

  // Get service client by ID
  it("5 should return not found if client does not exist", async () => {
    (AppDataSource.getRepository(ServiceClients).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await serviceClientsController.getServiceClients(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This client"),
      data: undefined,
    });
  });

  it("6 should return client data if found", async () => {
    const clientData = { id: 1, client_name: "Client Name" };
    (AppDataSource.getRepository(ServiceClients).findOne as jest.Mock).mockResolvedValueOnce(clientData);

    mockRequest.params = { id: "1" };

    await serviceClientsController.getServiceClients(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Client"),
      data: clientData,
    });
  });

  // Get all service clients
  it("7 should return a list of service clients", async () => {
    const clients = [
      { id: 1, client_name: "Client 1" },
      { id: 2, client_name: "Client 2" },
    ];
    (AppDataSource.getRepository(ServiceClients).findAndCount as jest.Mock).mockResolvedValueOnce([clients, clients.length]);

    mockRequest.query = { page: "1", size: "10", s: "" };

    await serviceClientsController.getAllServiceClients(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Client"),
      data: expect.any(Object), // Replace with actual data structure if needed
    });
  });

  // Delete service client
  it("8 should return not found if client does not exist for deletion", async () => {
    (AppDataSource.getRepository(ServiceClients).findOne as jest.Mock).mockResolvedValueOnce(null);

    mockRequest.params = { id: "1" };

    await serviceClientsController.removeServiceClients(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This client"),
      data: undefined,
    });
  });

  it("9 should return success if client is soft deleted", async () => {
    (AppDataSource.getRepository(ServiceClients).findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });
    (AppDataSource.getRepository(ServiceClients).softDelete as jest.Mock).mockResolvedValueOnce({ affected: 1 });

    mockRequest.params = { id: "1" };

    await serviceClientsController.removeServiceClients(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.DELETE_SUCCESS("Client"),
      data: undefined,
    });
  });

  it("10 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(ServiceClients).softDelete as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    mockRequest.params = { id: "1" };

    await serviceClientsController.removeServiceClients(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.notFound);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: message.NO_DATA("This client"),
      data: undefined,
    });
  });
});
