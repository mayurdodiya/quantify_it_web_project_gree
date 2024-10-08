import { Repository, DeepPartial, FindOneOptions, FindManyOptions } from "typeorm";

class CommonService {
  async createData<T>(repository: Repository<T>, data: DeepPartial<T>, additional?: any): Promise<T> {
    const create = await repository.create(data);
    const saveData = await repository.save(create);
    if (!saveData) {
      return null;
    }
    return saveData;
  }

  async updateData<T>(repository: Repository<T>, data: DeepPartial<T>, additional?: any): Promise<T> {
    const saveData = await repository.save(data);
    if (!saveData) {
      return null;
    }
    return saveData;
  }

  async getDataById<T>(repository: Repository<T>, data: FindOneOptions<T>): Promise<T | null> {
    const saveData = await repository.findOne(data);
    if (!saveData) {
      return null;
    }
    return saveData;
  }
  async getPaginatedData<T>(repository: Repository<T>, options: FindManyOptions<T>, page: number, size: number): Promise<{ data: T[]; totalItems: number }> {
    const [data, totalItems] = await repository.findAndCount({
      ...options,
      skip: page * size,
      take: size,
    });
    return { data, totalItems };
  }
}

export const commonService = new CommonService();
