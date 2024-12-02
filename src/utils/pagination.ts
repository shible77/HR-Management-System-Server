export const getPagination = (page: number, pageSize: number) => {
  const limit = pageSize ? +pageSize : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

export const getPagingData = (
  data: any[],
  count: number,
  page: number,
  limit: number,
  offset: number
) => {
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(count / limit);
  const endIndex = page * limit;
  return {
    totalPages,
    currentPage,
    data,
    next:
      endIndex < count
        ? {
            page: page + 1,
            limit,
          }
        : null,
    previous:
      page > 1
        ? {
            page: page - 1,
            limit,
          }
        : null,
  };
};
