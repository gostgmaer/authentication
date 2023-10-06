// @ts-nocheck
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const {getAppIdAndEntity} =require('../../utils/service')
const collectionName = process.env.COLLECTION;
const collection = mongoose.connection.collection(collectionName);



// async function updateObject(id, updatedObject) {
//   const result = await collection.findOneAndUpdate(
//     { _id: mongoose.Types.ObjectId(id) },
//     { $set: updatedObject },
//     { returnOriginal: false }
//   );
//   return result.value;
// }

// async function deleteObject(id) {
//   const result = await collection.findOneAndDelete({
//     _id: mongoose.Types.ObjectId(id),
//   });
//   return result;
// }

const create = async (req, res) => {
  
  try {

    const container = getAppIdAndEntity(req.url)

    const objectToCreate = req.body;
    const result = await collection.insertOne({...req.body,...container});
    res.status(StatusCodes.CREATED).json({
      message: "Record Created Successfully!",
      status: ReasonPhrases.CREATED,
      statusCode: StatusCodes.CREATED,
      result: result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

//Get All Record

const getAllRecord = async (req, res) => {
  try {
    const container = getAppIdAndEntity(req.url)
    const { sort, page, limit, filter } = req.query;

    const query = {};

    if (filter) {
      const filterObj = JSON.parse(filter);
      for (const key in filterObj) {
        query[key] = filterObj[key];
      }
    }

    const sortOptions = {};

    if (sort) {
      const [sortKey, sortOrder] = sort.split(":");
      sortOptions[sortKey] = sortOrder === "desc" ? -1 : 1;
    }

    var skip = 0;

    if (limit) {
      skip = (parseInt(page) - 1) * parseInt(limit);
    }
    const objects = await collection
      .find({...query,...container})
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    const totalCount = await collection.countDocuments({...query,...container});

    res.status(StatusCodes.OK).json({
      result: objects,
      total_record: totalCount,
      message: `Resumes Loaded Successfully!`,
      statusCode: StatusCodes.OK,
      status: ReasonPhrases.OK,
    });
  } catch (error) {
    console.error("Error reading objects:", error);
    res.status(500).json({ error: "Error reading objects" });
  }
};


const getSingleRecord = async (req, res) => {
  try {
    const container = getAppIdAndEntity(req.url)
    const objectId = req.params.id;
   
    if(!objectId){
      res.status(StatusCodes.NOT_FOUND).json({
        message: `No record id Provide`,
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    }
    const ID = new mongoose.Types.ObjectId(objectId);
    const object = await collection.findOne({...container, _id: ID })
    if (!object) {
      res.status(StatusCodes.NOT_FOUND).json({
        result: object,
        message: `No record Found for Given id!`,
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    }else{
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
      cause:error
    });
  }
};

const removeRecord = async (req,res) => {
  try {
    const container = getAppIdAndEntity(req.url)
    const objectId = req.params.id;
   
    if(!objectId){
      res.status(StatusCodes.NOT_FOUND).json({
        message: `No record id Provide`,
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    }
    const ID = new mongoose.Types.ObjectId(objectId);
    const object = await collection.findOneAndDelete({...container, _id: ID })
    if (object.lastErrorObject.n==0) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: `No record Found for Given id!`,
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    }else{
      res.status(StatusCodes.OK).json({
        result: object,
        message: `deleted successfully!`,
        statusCode: StatusCodes.OK,
        status: ReasonPhrases.OK,
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      cause:error
    });
  }
}


// // Read all objects
// app.get("/api/read", async (req, res) => {
//   try {
//     const objects = await readAllObjects();
//     res.json(objects);
//   } catch (error) {
//     console.error("Error reading objects:", error);
//     res.status(500).json({ error: "Error reading objects" });
//   }
// });

// // Read one object by ID
// app.get("/api/read/:id", async (req, res) => {
  // try {
  //   const objectId = req.params.id;
  //   const object = await readObjectById(objectId);
  //   if (!object) {
  //     return res.status(404).json({ error: "Object not found" });
  //   }
  //   res.json(object);
  // } catch (error) {
  //   console.error("Error reading object:", error);
  //   res.status(500).json({ error: "Error reading object" });
  // }
// });

// // Update an object by ID
// app.put("/api/update/:id", async (req, res) => {
//   try {
//     const objectId = req.params.id;
//     const updatedObject = req.body;
//     const result = await updateObject(objectId, updatedObject);
//     if (!result) {
//       return res.status(404).json({ error: "Object not found" });
//     }
//     res.json({ message: "Object updated successfully", result });
//   } catch (error) {
//     console.error("Error updating object:", error);
//     res.status(500).json({ error: "Error updating object" });
//   }
// });

// // Delete an object by ID
// app.delete("/api/delete/:id", async (req, res) => {
//   try {
//     const objectId = req.params.id;
//     const result = await deleteObject(objectId);
//     if (!result) {
//       return res.status(404).json({ error: "Object not found" });
//     }
//     res.json({ message: "Object deleted successfully", result });
//   } catch (error) {
//     console.error("Error deleting object:", error);
//     res.status(500).json({ error: "Error deleting object" });
//   }
// });

module.exports = {
  create,
  getAllRecord,
  getSingleRecord,removeRecord
};
