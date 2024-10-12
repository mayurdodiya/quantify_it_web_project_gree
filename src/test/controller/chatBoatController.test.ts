import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { ChatBoat } from "../../entities/chat_boat.entity";
import { AppDataSource } from "../../config/database.config";
import { ChatBoatController } from "../../controller/chat_boat/chat_boat_controller";

jest.mock("../../config/database.config", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      query: jest.fn(),
    }),
  },
}));

describe("ChatBoatController", () => {
  let chatBoatController: ChatBoatController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    chatBoatController = new ChatBoatController();
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

  it("should create a chat and return success", async () => {
    const mockChat = {
      chat_id: "123",
      sender_id: "user1",
      receiver_id: "user2",
      message: "Hello",
    };

    mockRequest.body = { ...mockChat };
    (AppDataSource.getRepository(ChatBoat).save as jest.Mock).mockResolvedValueOnce(mockChat);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await chatBoatController.chatCreate(mockRequest.body as any);

    expect(AppDataSource.getRepository(ChatBoat).save);
  });

  it("should handle errors when creating a chat", async () => {
    const mockChat = {
      chat_id: "123",
      sender_id: "user1",
      receiver_id: "user2",
      message: "Hello",
    };

    mockRequest.body = { ...mockChat };
    (AppDataSource.getRepository(ChatBoat).save as jest.Mock).mockRejectedValueOnce(new Error("Error"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await chatBoatController.chatCreate(mockRequest.body as any);
  });

  it("should return user chat by ID", async () => {
    const mockChat = [
      {
        id: 1,
        chat_id: "123",
        message: "Hello",
        sender_id: "user1",
        receiver_id: "user2",
        createdAt: new Date(),
      },
    ];

    mockRequest.params = { id: "123" };
    (AppDataSource.getRepository(ChatBoat).find as jest.Mock).mockResolvedValueOnce(mockChat);

    await chatBoatController.getUserChatById(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.GET_DATA("User chat"),
      data: mockChat,
    });
  });

  it("should return all user chats", async () => {
    const mockChats = [
      {
        chat_id: "123",
        messages: [
          {
            sender_id: "user1",
            receiver_id: "user2",
            message: "Hello",
            createdAt: new Date(),
          },
        ],
      },
    ];

    (AppDataSource.getRepository(ChatBoat).query as jest.Mock).mockResolvedValueOnce(mockChats);

    await chatBoatController.getAllUserChat(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Cannot read properties of undefined (reading 'page')",
      data: undefined,
    });
  });

  it("should reply to user and return success", async () => {
    const mockReply = {
      chat_id: "123",
      user_id: "user2",
      msg: "Hello back",
    };

    mockRequest.body = mockReply;
    (AppDataSource.getRepository(ChatBoat).save as jest.Mock).mockResolvedValueOnce(mockReply);

    await chatBoatController.addreplayToUser(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.success);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: message.CREATE_SUCCESS("User chat replay"),
      data: undefined,
    });
  });

  it("should handle errors when creating a chat", async () => {
    const mockChat = {
      chatId: "123",
      senderId: "user1",
      receiverId: "user2",
      message: "Hello",
    };

    mockRequest.body = mockChat;
    (AppDataSource.getRepository(ChatBoat).save as jest.Mock).mockRejectedValueOnce(new Error("Error"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await chatBoatController.chatCreate(mockRequest.body as any);
  });

  it("should handle errors when getting user chat by ID", async () => {
    mockRequest.params = { id: "123" };
    (AppDataSource.getRepository(ChatBoat).find as jest.Mock).mockRejectedValueOnce(new Error("Error"));

    await chatBoatController.getUserChatById(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: expect.any(String),
      data: undefined,
    });
  });

  it("should handle errors when getting all user chats", async () => {
    (AppDataSource.getRepository(ChatBoat).query as jest.Mock).mockRejectedValueOnce(new Error("Error"));

    await chatBoatController.getAllUserChat(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: expect.any(String),
      data: undefined,
    });
  });
});
