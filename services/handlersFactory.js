const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require('../utils/apiFeatures');
const { populate } = require("../models/reviewModel");



exports.createOne = (Model) =>
    asyncHandler(async (req, res) => {
        const name = req.body.name;
        const result = await Model.create(req.body);
        res.status(201).json({ data: result });
    });

exports.getOne = (Model,populateOpt) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        // 1)Build Query 
        let query =  Model.findById(id);
        // 2) Add populate option if exists
        if(populateOpt){
            query=query.populate(populateOpt);
        }
        const result=await query;
        if (!result) {
            return next(new ApiError(`No  ${Model}  for this id ${id}`, 404));
        }
        res.status(200).json({ data: result });
    });
exports.updateOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const updatedResult = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedResult) {
            return next(new ApiError(`No ${Model} for this ${req.params.id}`, 404));
        }
        updatedResult.save()
        res.status(200).json({ data: updatedResult });
    });


exports.deleteOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        
        const document = await Model.findByIdAndDelete(id);
        if (!document) {
            return next(new ApiError(`No ${Model} for this id ${id}`, 404));
        }
        if(Model=='Review')
            await Model.calcAvgRatingsAndQuantity(this.product)
        res.status(204).send();
    });

exports.getAll = (Model, ModelName = '') =>
    asyncHandler(async (req, res) => {
        let filter = {}
        if (req.filterObj) { filter = req.filterObj }
        const numberOfDocuments = await Model.countDocuments()
        console.log(ModelName)
        const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
            .paginate(numberOfDocuments)
            .filter()
            .sort()
            .search(ModelName)
            .LimitFields()


        const { mongooseQuery, paginationResult } = apiFeatures
        //Excute mongoose query
        const documents = await mongooseQuery;
        res.status(200).json({ result: documents.length, paginationResult, data: documents });




    })
