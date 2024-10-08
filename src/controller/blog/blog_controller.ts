import { FindOneOptions, ILike, Like, Not, Or, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { Blog } from "../../entities/blog.entity";
import { commonService } from "../../services/common.service";
import { Status } from "../../utils/enum";

export class BlogController {
  private blogRepo: Repository<Blog>;

  constructor() {
    this.blogRepo = AppDataSource.getRepository(Blog);
  }

  //------------------------------------------------------------------------

  public createBlog = async (req: Request, res: Response) => {
    try {
      const { blog_title, description, img_url } = req.body;

      let obj: Partial<Blog> = {
        blog_title: blog_title,
        img_url: img_url,
        description: description,
      };

      const data = await commonService.createData(this.blogRepo, obj);
      if (data == null) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("Blog"), ResponseCodes.userError);
      }

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Blog"), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  public updateBlog = async (req: Request, res: Response) => {
    try {
      const { blog_title, img_url, description } = req.body;

      const dataId = parseInt(req.params.id);
      const getData = await this.blogRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This blog"), ResponseCodes.searchError);
      }

      const isExist = await this.blogRepo.findOne({ where: { blog_title: blog_title, id: Not(dataId) } });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This blog"), ResponseCodes.searchError);
      }

      getData.blog_title = blog_title || getData.blog_title;
      getData.description = description || getData.description;
      getData.img_url = img_url || getData.img_url;

      const data = await commonService.updateData(this.blogRepo, getData);
      if (data == null) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("Blog"), ResponseCodes.userError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Blog"), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // get data
  public async getBlog(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);

      const options: FindOneOptions<Blog> = {
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "blog_title", "description", "img_url", "creadtedAt"],
      };

      const data = await commonService.getDataById<Blog>(this.blogRepo, options);

      if (data == null) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This blog"), ResponseCodes.searchError);
      }

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Blog"), ResponseCodes.success, data);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllBlog(req: Request, res: Response) {
    try {
      var { page, size, s } = req.query;
      const pageData: number = parseInt(page as string, 10);
      const sizeData: number = parseInt(size as string, 10);

      let whereCondition: any = { status: Status.ACTIVE };

      if (s) {
        whereCondition = {
          ...whereCondition,
          blog_title: ILike(`%${s}%`),
        };
      }

      const options: FindOneOptions<Blog> = {
        where: whereCondition,
        select: ["id", "blog_title", "description", "img_url", "creadtedAt", "updatedAt"],
      };

      const { data, totalItems } = await commonService.getPaginatedData<Blog>(this.blogRepo, options, pageData, sizeData);

      const response = {
        totalItems,
        totalPages: Math.ceil(totalItems / sizeData),
        data,
        currentPage: pageData,
      };

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Blog"), ResponseCodes.success, response);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // public async removeBlog(req: Request, res: Response) {
  //   try {
  //     const dataId = parseInt(req.params.id);
  
  //     // Call the common service to remove the data
  //     const isDeleted = await commonService.removeData(this.blogRepo, dataId);
  
  //     if (!isDeleted) {
  //       return RoutesHandler.sendError(req, res, false, message.NO_DATA("This blog"), ResponseCodes.searchError);
  //     }
  
  //     return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Blog"), ResponseCodes.success, undefined);
  //   } catch (error) {
  //     console.error(error);
  //     return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
  //   }
  // }
  //------------------------------------------------------------------------

  // add data
  public addData = async (req: Request, res: Response) => {
    try {
      const { blog_title, description, img_url } = req.body;
      // const getData = await this.blogRepo.findOne({ where: { blog_title: blog_title } });
      // if (getData) {
      //   return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This blog"), ResponseCodes.insertError);
      // }

      const blogData = new Blog();

      blogData.blog_title = blog_title;
      blogData.img_url = img_url || null;
      blogData.description = description || null;
      await this.blogRepo.save(blogData);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Blog"), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
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
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This blog"), ResponseCodes.searchError);
      }

      const isExist = await this.blogRepo.findOne({ where: { blog_title: blog_title, id: Not(dataId) } });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This blog"), ResponseCodes.searchError);
      }

      getData.blog_title = blog_title || getData.blog_title;
      getData.description = description || getData.description;
      getData.img_url = img_url || getData.img_url;
      this.blogRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Blog"), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.blogRepo.findOne({ where: { id: dataId, status: Status.ACTIVE }, select: ["id", "blog_title", "description", "img_url", "creadtedAt"] });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This blog"), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Blog"), ResponseCodes.success, data);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllData(req: Request, res: Response) {
    try {
      var { page, size, s } = req.query;
      var pageData: number = parseInt(page as string, 10);
      var sizeData: number = parseInt(size as string, 10);

      const skipData: number = pageData * sizeData;
      var Dataobj: any = { status: Status.ACTIVE };
      if (s) {
        Dataobj = {
          ...Dataobj,
          blog_title: ILike(`%${s}%`),
        };
      }

      const [data, totalItems] = await this.blogRepo.findAndCount({ where: Dataobj, select: ["id", "blog_title", "description", "img_url", "creadtedAt", "updatedAt"], skip: skipData, take: sizeData });
      const response = {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / sizeData),
        data,
        currentPage: pageData,
      };

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Blog"), ResponseCodes.success, response);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const getData = await this.blogRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This blog"), ResponseCodes.searchError);
      }
      const data = await this.blogRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This blog"), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Blog"), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
