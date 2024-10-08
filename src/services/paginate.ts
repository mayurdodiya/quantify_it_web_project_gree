export const paginateData = async (
  userdata: any[],
  input: any
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    if (!userdata?.length) {
      return resolve({
        nextpage: null,
        pageSize: 0,
        totalPages: 0,
        data: [],
      });
    }

    const pageSize = 10;
    let nextpage = input["nextpage"] || 1;
    const totalCount = userdata?.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    if (nextpage > totalPages) {
      nextpage = 1;
    }

    const startIndex = (nextpage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = userdata?.slice(startIndex, endIndex);
    resolve({
      nextpage: nextpage === totalPages ? null : nextpage + 1,
      pageSize: pageSize,
      totalPages: totalPages,
      data: paginatedData,
    });
  });
};
