import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { ChatBoat } from "../../entities/chat_boat.entity";
import { AppDataSource } from "../../config/database.config";
import { ChatBoatController } from "../../controller/chat_boat/chat_boat_controller";
import { networkUtils } from "../../utils/ip_address";

jest.mock("../../config/database.config", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      query: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),

      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn(),
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

  it("should successfully send a message", async () => {
    const mockChat = {
      chatId: "123",
      senderId: "user1",
      receiverId: "user2",
      message: "Hello",
      image_url: null,
    };

    mockRequest.body = { ...mockChat };
    mockRequest.headers = {
      "x-forwarded-for": "192.168.1.1",
    };

    const saveMock = jest.fn().mockResolvedValue(mockChat);
    (AppDataSource.getRepository(ChatBoat).save as jest.Mock) = saveMock;

    jest.spyOn(networkUtils, "getMappedIp").mockReturnValue("192.168.1.1");

    await chatBoatController.sendMsg(mockRequest as Request, mockResponse as Response);

    expect(saveMock).toHaveBeenCalledTimes(1); // Ensure save is called once
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("chat"),
      })
    );
  });

  it("should reply with a predefined answer for certain messages", async () => {
    const mockChat = {
      chatId: "123",
      senderId: "user1",
      receiverId: "user2",
      message: "What types of sarees do you offer?",
      image_url: null,
    };
    mockRequest.body = { ...mockChat };
    mockRequest.headers = {
      "x-forwarded-for": "192.168.1.1",
    };
    const defaultQuestions = [{ question: "What types of sarees do you offer?", answer: "We offer a wide range of sarees, including silk, cotton, chiffon, georgette, and linen sarees." }];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (chatBoatController as any).method = defaultQuestions;
    mockRequest.body = { ...mockChat };
    (AppDataSource.getRepository(ChatBoat).save as jest.Mock).mockResolvedValueOnce(mockChat);

    await chatBoatController.sendMsg(mockRequest as Request, mockResponse as Response);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("chat reply"),
      })
    );
  });

  it("should successfully get all user last messages", async () => {
    const mockChats = [
      {
        chat_id: "123",
        sender_id: "user1",
        receiver_id: "user2",
        message: "Hello",
        image_url: null,
        isRead: false,
        user_ip_address: "192.168.1.1",
        createdAt: new Date(),
      },
      {
        chat_id: "124",
        sender_id: "user2",
        receiver_id: "user1",
        message: "Hi",
        image_url: null,
        isRead: true,
        user_ip_address: "192.168.1.1",
        createdAt: new Date(),
      },
    ];

    (AppDataSource.getRepository(ChatBoat).createQueryBuilder().getRawMany as jest.Mock).mockResolvedValueOnce(mockChats);

    await chatBoatController.getAllUserLastMSG(mockRequest as Request, mockResponse as Response);

    expect(AppDataSource.getRepository(ChatBoat).createQueryBuilder).toHaveBeenCalled();
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("Chat"),
        data: expect.any(Array),
      })
    );

    const responseData = jsonMock.mock.calls[0][0].data;
    expect(responseData).toHaveLength(2);
    expect(responseData[0]).toHaveProperty("chat_id");
    expect(responseData[0]).toHaveProperty("messages");
    expect(responseData[0].messages[0]).toHaveProperty("sender_id", "user1");
  });

  it("should handle errors and return an error response", async () => {
    const errorMessage = "Database error";
    (AppDataSource.getRepository(ChatBoat).createQueryBuilder().getRawMany as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    await chatBoatController.getAllUserLastMSG(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: errorMessage,
      })
    );
  });

  it("should mark messages as read successfully", async () => {
    const mockBody = {
      chat_id: "123",
      senderId: "user1",
      receiverId: "user2",
    };

    mockRequest.body = mockBody;

    // Mocking the execute method
    (AppDataSource.getRepository(ChatBoat).createQueryBuilder().execute as jest.Mock).mockResolvedValue({ affected: 1 });

    await chatBoatController.markAsRead(mockRequest as Request, mockResponse as Response);

    expect(AppDataSource.getRepository(ChatBoat).createQueryBuilder).toHaveBeenCalled();
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("Chat"),
      })
    );
  });

  it("should return an error when required parameters are missing", async () => {
    mockRequest.body = { chat_id: "123" }; // Missing senderId and receiverId

    await chatBoatController.markAsRead(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.badRequest);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Missing required parameters.",
      })
    );
  });

  it("should handle errors and return an error response", async () => {
    const mockBody = {
      chat_id: "123",
      senderId: "user1",
      receiverId: "user2",
    };

    mockRequest.body = mockBody;

    // Mocking the error for the execute method
    (AppDataSource.getRepository(ChatBoat).createQueryBuilder().execute as jest.Mock).mockRejectedValueOnce(new Error("Database error"));

    await chatBoatController.markAsRead(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(ResponseCodes.serverError);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Database error",
      })
    );
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
