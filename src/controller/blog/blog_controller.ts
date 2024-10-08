import { FindOperator, ILike, Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { Blog } from "../../entities/blog.entity";
import { Status } from "../../utils/enum";

export class BlogController {
  private blogRepo: Repository<Blog>;

  constructor() {
    this.blogRepo = AppDataSource.getRepository(Blog);
  }

  // add data
  public addData = async (req: Request, res: Response) => {
    try {
      const { blog_title, description, img_url } = req.body;

      const blogData = new Blog();

      blogData.blog_title = blog_title;
      blogData.img_url = img_url || null;
      blogData.description = description || null;
      await this.blogRepo.save(blogData);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Blog"), ResponseCodes.createSuccess, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateData(req: Request, res: Response) {
    try {
      const { blog_title, img_url, description } = req.body;

      const dataId = parseInt(req.params.id);
      const getData = await this.blogRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This blog"), ResponseCodes.notFound);
      }

      const isExist = await this.blogRepo.findOne({
        where: { blog_title: blog_title, id: Not(dataId) },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This blog"), ResponseCodes.alreadyExist);
      }

      getData.blog_title = blog_title || getData.blog_title;
      getData.description = description || getData.description;
      getData.img_url = img_url || getData.img_url;
      this.blogRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Blog"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.blogRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "blog_title", "description", "img_url", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This blog"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Blog"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllData(req: Request, res: Response) {
    try {
      const { page, size, s } = req.query;
      const pageData: number = parseInt(page as string, 10);
      const sizeData: number = parseInt(size as string, 10);

      const skipData: number = pageData * sizeData;
      let Dataobj: { status: Status; blog_title?: FindOperator<string> } = { status: Status.ACTIVE };
      if (s) {
        Dataobj = {
          ...Dataobj,
          blog_title: ILike(`%${s}%`),
        };
      }

      const [data, totalItems] = await this.blogRepo.findAndCount({
        where: Dataobj,
        select: ["id", "blog_title", "description", "img_url", "createdAt", "updatedAt"],
        skip: skipData,
        take: sizeData,
      });
      const response = {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / sizeData),
        data,
        currentPage: pageData,
      };

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Blog"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const getData = await this.blogRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This blog"), ResponseCodes.notFound);
      }
      const data = await this.blogRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This blog"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Blog"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
