const ApiError = require("../utils/apiError");

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-use-before-define
    sendErrorForDev(err, res);
  } else {
    // eslint-disable-next-line no-use-before-define
    if(err.name=="JsonWebTokenError")
      err=handelJwtInvalidSignature();
    if(err.name=="TokenExpiredError")
      err=handleJwtExpired();
    sendErrorForProd(err, res);
  }
};
handelJwtInvalidSignature=()=>
new ApiError("Invalid Token , Please Login Again..",401)


handleJwtExpired=()=>
new ApiError("Expired Token, Please Login Again..",401);

const sendErrorForDev = (err, res) =>{
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

const sendErrorForProd = (err, res) =>{
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
}
module.exports = globalError;

