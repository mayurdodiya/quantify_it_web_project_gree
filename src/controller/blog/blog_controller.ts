import { FindOperator, ILike, Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { Blog } from "../../entities/blog.entity";
import { Status } from "../../utils/enum";
import { getPagination, getPagingData } from "../../services/paginate";

export class BlogController {
  private blogRepo: Repository<Blog>;

  constructor() {
    this.blogRepo = AppDataSource.getRepository(Blog);
  }

  // add data
  public addBlog = async (req: Request, res: Response) => {
    try {
      const { blog_title, description, img_url } = req.body;

      const blogData = new Blog();

      blogData.blog_title = blog_title;
      blogData.img_url = img_url || null;
      blogData.description = description || null;

      const data = await this.blogRepo.save(blogData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("blog"), ResponseCodes.insertError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Blog"), ResponseCodes.createSuccess, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateBlog(req: Request, res: Response) {
    try {
      const { blog_title, img_url, description } = req.body;

      const dataId = req.params.id;
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

      const data = await this.blogRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("blog"), ResponseCodes.insertError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Blog"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getBlog(req: Request, res: Response) {
    try {
      const dataId = req.params.id as string;
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
  public async getAllBlog(req: Request, res: Response) {
    try {
      const { page = 1, size = 10, s } = req.query;

      const { limit, offset } = getPagination(parseInt(page as string, 10), parseInt(size as string, 10));

      const Dataobj: { status: Status; blog_title?: FindOperator<string> } = {
        status: Status.ACTIVE,
      };
      if (s) {
        Dataobj.blog_title = ILike(`%${s}%`);
      }

      const [data, totalItems] = await this.blogRepo.findAndCount({
        where: Dataobj,
        select: ["id", "blog_title", "description", "img_url", "createdAt", "updatedAt"],
        skip: offset,
        take: limit,
      });

      const response = getPagingData({ count: totalItems, rows: data }, parseInt(page as string, 10), limit);

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Blog"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message || "Internal server error", ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeBlog(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
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
