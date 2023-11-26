// @ts-nocheck
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { getAppIdAndEntity,createProjectionFromArray } = require("../../utils/service");
const collectionName = process.env.COLLECTION;
const collection = mongoose.connection.collection(collectionName);

const create = async (req, res) => {
  try {
    const container = getAppIdAndEntity(req.url);
    const token = req?.headers?.authorization;
    var decodeduser = undefined;
    if (token) {
      decodeduser = jwt.verify(token, process.env.JWT_SECRET);
    }
    const objectToCreate = req.body;
    const now = new Date();
    objectToCreate.created_time = now;
    objectToCreate.updated_time = now;
    const result = await collection.insertOne({
      ...objectToCreate,
      ...container,
      created_by: decodeduser?.email,
    });
    res.status(StatusCodes.CREATED).json({
      message: "Record Created Successfully!",
      status: ReasonPhrases.CREATED,
      statusCode: StatusCodes.CREATED,
      result: result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      cause: error,
    });
  }
};

//Get All Record

const getAllRecord = async (req, res) => {
  try {
    const container = getAppIdAndEntity(req.url);
    const { sort, page, limit, filter } = req.query;
    
    var arrayOfValues ={}
    const selectKeys = req?.query?.select_keys
    if (selectKeys) {
      const cleanedArray = selectKeys.split(',').map(value => value.replace(/'/g, ''));
      arrayOfValues = createProjectionFromArray(cleanedArray);
    }
  
    var query = {};

    if (filter) {
      const filterObj = JSON.parse(filter);
      for (const key in filterObj) {
        query[key] = filterObj[key];
      }
    }

    var sortOptions = {};

    if (sort) {
      const [sortKey, sortOrder] = sort.split(":");
      sortOptions[sortKey] = sortOrder === "desc" ? -1 : 1;
    }

    var skip = 0;

    if (limit) {
      skip = (parseInt(page) - 1) * parseInt(limit);
    }
    const objects = await collection
      .find({ ...query, ...container },{ projection: arrayOfValues })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    const totalCount = await collection.countDocuments({
      ...query,
      ...container,
    });

    res.status(StatusCodes.OK).json({
      result: objects,
      total_record: totalCount,
      message: `Resumes Loaded Successfully!`,
      statusCode: StatusCodes.OK,
      status: ReasonPhrases.OK,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      cause: error,
    });
  }
};

const getSingleRecord = async (req, res) => {
  try {
    const container = getAppIdAndEntity(req.url);
    const objectId = req.params.id;

    
    if (!objectId) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: `No record id Provide`,
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    }
    const ID = new mongoose.Types.ObjectId(objectId);
    const object = await collection.findOne({ ...container, _id: ID });
    if (!object) {
      res.status(StatusCodes.NOT_FOUND).json({
        result: object,
        message: `No record Found for Given id!`,
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    } else {
      res.status(StatusCodes.OK).json({
        result: object,
        message: `Loaded Successfully!`,
        statusCode: StatusCodes.OK,
        status: ReasonPhrases.OK,
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      cause: error,
    });
  }
};

const removeRecord = async (req, res) => {
  try {
    const container = getAppIdAndEntity(req.url);
    const objectId = req.params.id;

    if (!objectId) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: `No record id Provide`,
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    }
    const ID = new mongoose.Types.ObjectId(objectId);
    const object = await collection.findOneAndDelete({ ...container, _id: ID });
    if (object.lastErrorObject.n == 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: `No record Found for Given id!`,
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    } else {
      res.status(StatusCodes.OK).json({
        result: object,
        message: `deleted successful!`,
        statusCode: StatusCodes.OK,
        status: ReasonPhrases.OK,
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      cause: error,
    });
  }
};

const updateSingleRecord = async (req, res) => {
  try {
    const container = getAppIdAndEntity(req.url);
    const objectId = req.params.id;
    const token = req?.headers?.authorization;
    var decodeduser = undefined;
    if (token) {
      decodeduser = jwt.verify(token, process.env.JWT_SECRET);
    }
    if (!objectId) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: `No record id Provide`,
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    }
    const ID = new mongoose.Types.ObjectId(objectId);
    const objectToUpdate = req.body
    objectToUpdate.updated_time = new Date();
    
    const result = await collection.findOneAndUpdate(
      { _id: ID },
      { $set: { ...objectToUpdate, update_by: decodeduser?.email } },
      { returnOriginal: false }
    );

    if (!result) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: `No record Found for Given id!`,
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    } else {
      res.status(StatusCodes.OK).json({
        result: result.value,
        message: `Update successfully!`,
        statusCode: StatusCodes.OK,
        status: ReasonPhrases.OK,
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      cause: error,
    });
  }
};

module.exports = {
  create,
  getAllRecord,
  getSingleRecord,
  removeRecord,
  updateSingleRecord,
};
