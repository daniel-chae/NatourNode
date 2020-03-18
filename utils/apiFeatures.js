class APIFeatures {
  constructor(query, queryString) {
    //query is what is returned from Model.find()
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Filtring
    const queryObj = { ...this.queryString }; //Way to create a copy of an object. If we do queryObj = req.query, it won't be copy but exactly the same object.
    const excludeFields = ['page', 'sort', 'limit', 'fields']; // Delete non-filtering relevant properties from query string e.g. pagination
    excludeFields.forEach(el => delete queryObj[el]); //delete operation to delete propety from object

    // 1B)Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy); //sort method exist as a prototype of query object // sort.('price ratingsAverage)
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
