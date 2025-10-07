/**
 * Centralized query building and filtering utilities
 */

/**
 * Build MongoDB query from request parameters
 */
const buildQuery = (req, allowedFields = []) => {
  const query = {};
  
  // Handle search parameter
  if (req.query.search) {
    const searchTerm = req.query.search.trim();
    if (allowedFields.length > 0) {
      query.$or = allowedFields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' }
      }));
    }
  }
  
  // Handle filter parameters
  Object.keys(req.query).forEach(key => {
    if (key === 'search' || key === 'page' || key === 'limit' || key === 'sort' || key === 'order') {
      return;
    }
    
    const value = req.query[key];
    
    // Handle boolean filters
    if (value === 'true' || value === 'false') {
      query[key] = value === 'true';
    }
    // Handle array filters (comma-separated)
    else if (value.includes(',')) {
      query[key] = { $in: value.split(',').map(v => v.trim()) };
    }
    // Handle range filters (e.g., "min-max")
    else if (value.includes('-') && !isNaN(value.split('-')[0])) {
      const [min, max] = value.split('-').map(v => parseInt(v.trim()));
      query[key] = { $gte: min, $lte: max };
    }
    // Handle date range filters
    else if (key.includes('Date') && value.includes('to')) {
      const [startDate, endDate] = value.split('to').map(d => new Date(d.trim()));
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        query[key] = { $gte: startDate, $lte: endDate };
      }
    }
    // Handle regular string filters
    else {
      query[key] = { $regex: value, $options: 'i' };
    }
  });
  
  return query;
};

/**
 * Build sort object from request parameters
 */
const buildSort = (req, defaultSort = { createdAt: -1 }) => {
  const { sort, order } = req.query;
  
  if (!sort) return defaultSort;
  
  const sortOrder = order === 'asc' ? 1 : -1;
  return { [sort]: sortOrder };
};

/**
 * Build aggregation pipeline for advanced queries
 */
const buildAggregationPipeline = (req, options = {}) => {
  const pipeline = [];
  
  // Match stage
  if (options.match) {
    pipeline.push({ $match: options.match });
  }
  
  // Lookup stage for population
  if (options.populate) {
    options.populate.forEach(pop => {
      pipeline.push({
        $lookup: {
          from: pop.from,
          localField: pop.localField,
          foreignField: pop.foreignField,
          as: pop.as
        }
      });
    });
  }
  
  // Add fields stage for computed fields
  if (options.addFields) {
    pipeline.push({ $addFields: options.addFields });
  }
  
  // Project stage to select fields
  if (options.project) {
    pipeline.push({ $project: options.project });
  }
  
  // Sort stage
  if (options.sort) {
    pipeline.push({ $sort: options.sort });
  }
  
  // Facet stage for pagination and counting
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: parseInt(limit) }],
      totalCount: [{ $count: 'count' }]
    }
  });
  
  return pipeline;
};

/**
 * Process aggregation result for paginated response
 */
const processAggregationResult = (result, page = 1, limit = 10) => {
  const data = result[0]?.data || [];
  const totalCount = result[0]?.totalCount[0]?.count || 0;
  
  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1
    }
  };
};

/**
 * Build text search query
 */
const buildTextSearchQuery = (searchTerm, fields = []) => {
  if (!searchTerm || fields.length === 0) return {};
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

/**
 * Build date range query
 */
const buildDateRangeQuery = (startDate, endDate, field = 'createdAt') => {
  const query = {};
  
  if (startDate) {
    query[field] = { ...query[field], $gte: new Date(startDate) };
  }
  
  if (endDate) {
    query[field] = { ...query[field], $lte: new Date(endDate) };
  }
  
  return query;
};

/**
 * Build array contains query
 */
const buildArrayContainsQuery = (field, values) => {
  if (!Array.isArray(values) || values.length === 0) return {};
  
  return {
    [field]: { $in: values }
  };
};

/**
 * Build nested field query
 */
const buildNestedQuery = (nestedField, query) => {
  return {
    [nestedField]: query
  };
};

/**
 * Build geo-location query
 */
const buildGeoQuery = (coordinates, maxDistance = 10000) => {
  return {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    }
  };
};

/**
 * Optimize query for performance
 */
const optimizeQuery = (query) => {
  // Add index hints for better performance
  if (query._id) {
    return query; // _id queries are already optimized
  }
  
  // Add compound index hints for complex queries
  const indexHints = [];
  
  // Sort fields
  if (query.sort) {
    indexHints.push(query.sort);
  }
  
  // Filter fields
  Object.keys(query).forEach(key => {
    if (key !== 'sort' && key !== '_id') {
      indexHints.push({ [key]: 1 });
    }
  });
  
  return query;
};

/**
 * Validate query parameters
 */
const validateQueryParams = (req, allowedParams = []) => {
  const errors = [];
  
  Object.keys(req.query).forEach(param => {
    if (!allowedParams.includes(param)) {
      errors.push(`Invalid parameter: ${param}`);
    }
  });
  
  return errors;
};

module.exports = {
  buildQuery,
  buildSort,
  buildAggregationPipeline,
  processAggregationResult,
  buildTextSearchQuery,
  buildDateRangeQuery,
  buildArrayContainsQuery,
  buildNestedQuery,
  buildGeoQuery,
  optimizeQuery,
  validateQueryParams
};
