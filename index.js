//core module
const path = require('path')

// third party module
const express = require('express');
const dotenv = require('dotenv')
const morgan = require('morgan')
const cors=require('cors');
const compression=require('compression')

// files from our project
dotenv.config({ path: 'config.env' })
const dbConnection = require('./config/database')
const globalError = require('./middleware/errorMidlleware')
const ApiError = require('./utils/apiError')
const mountRoutes=require('./routes')
const {webhookCheckout}=require('./services/orderService')
//connect with db
dbConnection();


// express App
const app = express();


// Checkout webhook
app.post(
    '/webhook-checkout',
    express.raw({ type: 'application/json' }),
    webhookCheckout
  );

//Middlewares
// to parse or convert body that came from the req from string to json to make it easy to dell with
app.use(express.json())

// enable any domain to access our apis
app.use(cors())
app.options('*',cors())
// we want to compress all responses to make our app faster
app.use(compression())



// to serve static files
app.use(express.static(path.join(__dirname, 'uploads')))


if (process.env.NODE_ENV === 'development') {
    app.use(morgan("dev"))
    console.log(`mode:${process.env.NODE_ENV}`)
}

// Mount Routes
mountRoutes(app)

app.all('*', (req, res, next) => {
    next(new ApiError(`can't find this route${req.originalUrl}`, 400))
})

// Global express middleware for Error Handling

app.use(globalError)





const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
    console.log(`App Running on port ${PORT}`);
})

// for handling any Error outside express application like database connection Error
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Errors ${err.name} | ${err.message}`)
    server.close(() => {
        console.log('shuting down ...');
        process.exit(1);
    })

})

