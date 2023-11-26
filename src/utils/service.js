function getAppIdAndEntity(url) {
  // Split the URL by '?' to remove the query part
  const [pathPart] = url.split("?");

  // Split the remaining URL into parts using '/'
  const parts = pathPart.split("/");

  // Find the index of "table" in the parts array
  const tableIndex = parts.indexOf("table");

  // Check if "table" is found in the URL and has exactly one '/' on each side
  if (
    tableIndex !== -1 &&
    tableIndex > 0 &&
    tableIndex < parts.length - 1 &&
    parts[tableIndex - 1] &&
    !parts[tableIndex - 1].includes("/") &&
    parts[tableIndex + 1] &&
    !parts[tableIndex + 1].includes("/")
  ) {
    // Get the path key before "table" as "app_id"
    const appId = parts[tableIndex - 1];

    // Get the path key after "table" as "entity"
    const entity = parts[tableIndex + 1];

    return {
      app_id: appId,
      entity: entity,
    };
  } else {
    // "table" not found or doesn't have exactly one '/' on each side
    return null;
  }
}

function isemptyObject(obj) {
  return Object.keys(obj).length === 0;
}

function createProjectionFromArray(fields) {
  const projection = {};
  fields.forEach((field) => {
    projection[field] = 1;
  });
  if (isemptyObject(projection)) {
    return (projection = "");
  } else {
    return projection;
  }
}

module.exports = {
  getAppIdAndEntity,
  createProjectionFromArray,
  isemptyObject,
};


const jwt = require("jsonwebtoken");
const axios = require("axios"); // You may need to install axios

const { jwtSecret } = require("../config/setting");

function decodeToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

const FilterOptions = (sort = "updatedAt:desc", page, limit, filter) => {
  var query = {};

  if (filter) {
    const filterObj = JSON.parse(filter);
    // const startwith = generateMatchQuery(filterObj["match"])

    delete filterObj?.["match"];
    delete filterObj?.["startwith"];

    for (const key in filterObj) {
      query[key] = filterObj[key];
    }
  }
  let statusFilter = { status: { $ne: "INACTIVE" } };

  if (query.status != "" && query.status) {
    statusFilter = { ...statusFilter, status: query.status };
  }

  query = { ...query, ...statusFilter };

  removeEmptyKeys(query);
  var sortOptions = {};

  if (sort) {
    const [sortKey, sortOrder] = sort.split(":");
    sortOptions[sortKey] = sortOrder === "desc" ? -1 : 1;
  }

  var skip = 0;

  if (limit) {
    skip = (parseInt(page) - 1) * parseInt(limit);
  }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
    sort: sortOptions,
  };
  return {
    options: options,
    query: query,
  };
};

const FilterOptionsSearch = (sort = "updatedAt:desc", page, limit, filter) => {
  var query = {};

  if (filter) {
    const filterObj = JSON.parse(filter);
    // const startwith = generateMatchQuery(filterObj["match"])

    delete filterObj?.["match"];
    delete filterObj?.["startwith"];

    for (const key in filterObj) {
      query[key] = filterObj[key];
    }
  }
  let statusFilter = { status: { $ne: "INACTIVE" } };

  if (query.status != "" && query.status) {
    statusFilter = { ...statusFilter, status: query.status };
  }

  query = { ...query, ...statusFilter };

  removeEmptyKeys(query);
  var sortOptions = {};

  if (sort) {
    const [sortKey, sortOrder] = sort.split(":");
    sortOptions[sortKey] = sortOrder === "desc" ? -1 : 1;
  }

  var skip = 0;

  if (limit) {
    skip = (parseInt(page) - 1) * parseInt(limit);
  }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
    sort: sortOptions,
  };
  return {
    options: options,
    query: query,
  };
};

async function getLocationInfo(ip) {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    return {
      ip: response.data.query,
      city: response.data.city,
      region: response.data.regionName,
      country: response.data.country,
      zip: response.data.zip,
    };
  } catch (error) {
    console.error("Error getting location info:", error);
    return {};
  }
}

function removeEmptyKeys(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (value === null || value === undefined || value === "") {
        delete obj[key];
      }
    }
  }
}

const generateMatchQuery = (query) => {
  const dynamicQuery = {};
  Object.keys(query).forEach((key) => {
    // Use RegExp only if the property exists in the query
    if (query[key]) {
      dynamicQuery[key] = new RegExp(query[key], "i");
    }
  });
  return dynamicQuery;
};

module.exports = {
  decodeToken,
  FilterOptions,
  getLocationInfo,
  removeEmptyKeys,
  FilterOptionsSearch,
};
