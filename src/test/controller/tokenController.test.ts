import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { TokenController } from "../../controller/token/token_controller";
import { Token } from "../../entities/token.entity";

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

describe("TokenController", () => {
  let tokenController: TokenController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    tokenController = new TokenController();
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

  //find
  it("12 should return contact data if found", async () => {
    const contactData = {
      id: 1,
    };

    (AppDataSource.getRepository(Token).find as jest.Mock).mockResolvedValueOnce(contactData);

    await tokenController.getToken(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Token"),
      data: contactData,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("13 should return not found if contact does not exist", async () => {
    (AppDataSource.getRepository(Token).findOne as jest.Mock).mockResolvedValueOnce(null);

    await tokenController.getToken(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Token"),
      data: undefined,
    });
  });
  //---------------------------------------------------------------------------------------------------------

  it("14 should return server error on unexpected error", async () => {
    (AppDataSource.getRepository(Token).findOne as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

    await tokenController.getToken(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("Token"),
      data: undefined,
    });
  });
});
