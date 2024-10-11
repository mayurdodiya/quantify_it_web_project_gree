interface PaginateInput {
  nextpage?: number;
}

interface PaginateResponse<T> {
  nextpage: number | null;
  pageSize: number;
  totalPages: number;
  data: T[];
}

export const paginateData = async <T>(userdata: T[], input: PaginateInput): Promise<PaginateResponse<T>> => {
  return new Promise((resolve) => {
    if (!userdata?.length) {
      return resolve({
        nextpage: null,
        pageSize: 0,
        totalPages: 0,
        data: [],
      });
    }

    const pageSize = 10;
    let nextpage = input.nextpage || 1;
    const totalCount = userdata.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    if (nextpage > totalPages) {
      nextpage = 1;
    }

    const startIndex = (nextpage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = userdata.slice(startIndex, endIndex);

    resolve({
      nextpage: nextpage === totalPages ? null : nextpage + 1,
      pageSize: pageSize,
      totalPages: totalPages,
      data: paginatedData,
    });
  });
};

export const getPagination = (page: number, size: number) => {
  const limit = size ? +size : 10;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getPagingData = (alldata: { count: number; rows: any[] }, page: number, limit: number) => {
  const { count: totalItems, rows: data } = alldata;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);
   
  return { totalItems, data, totalPages, currentPage };
};
