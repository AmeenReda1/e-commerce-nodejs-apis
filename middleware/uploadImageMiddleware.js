const multer = require('multer')
const ApiError = require("../utils/apiError");


const multerOptions = () => {
    // 2) multer memoryStorage to make some image prossing using sharp library which need the image as buffer
    //            so we use multer memoryStorge
    const multerStorage = multer.memoryStorage();
    const multerFilter = function (req, file, cb) {
        if (file.mimetype.startsWith("image")) {
            //cb(error,)
            cb(null, true)
        } else {
            cb(new ApiError("Only images allowed", 400), false)
        }
    }
    upload = multer({
        storage: multerStorage,
        fileFilter: multerFilter
    })
    return upload
}

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);




exports.uploadMixOfImages = (arrayOfFields) => multerOptions().fields(arrayOfFields)