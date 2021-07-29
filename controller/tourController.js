class APIfeature {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  filter() {
    const queryObj = { ...this.queryStr };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // Filtering
    let queries = JSON.stringify(queryObj);
    queries = queries.replace(/\b(lte|lt|gte|gt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queries));
    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      const sort = this.query.sort.split(',').join(' ');
      this.query = this.query.sort(sort);
    }
    return this;
  }
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }
  paginate() {
    const page = +this.queryStr.page;
    const limit = +this.queryStr.limit;
    const skipVal = (page - 1) * limit;
    this.query = this.query.skip(skipVal).limit(limit);
    return this;
  }
}

module.exports = APIfeature;
