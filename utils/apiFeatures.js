class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    const queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${ match }`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    this.query = this.queryStr.sort ? this.query.sort(this.queryStr.sort.split(',').join(' ')) : this.query.sort('-createdAt');
    return this;
  }

  limitFields() {
    this.query = this.queryStr.fields ? this.query.select(this.queryStr.fields.split(',').join(' ')) : this.query.select('-__v');
    return this;
  }

  paginate() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
