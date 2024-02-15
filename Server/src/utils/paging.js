export const getPagination = (page, limit = 10) => {
    if (page > 0) {
        page = page - 1;
    }
    const offset = page ? page * limit : 0;

    return { limit, offset };
};

export const getPagingData = (data, total, page = 0, offset = 10, extend) => {
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(total / offset);
    const result = { total: total , items:data, totalPages: totalPages, currentPage: currentPage};
    if (extend) result.extend = extend
    return result
};