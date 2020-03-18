//server.js becomes the entry point

// 1) Handle some application erros. e.g. non-existing variable
// This error handling should be on the top since uncaught exception can happen at any point.
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEIPTION! shutting down...');
  console.log(err.name, err.message);
  process.exit(1); //not like unhandledRejection, uncaughtException is more critical. It should be terminated immediately.
});

// 2) Set environment variables
const dotenv = require('dotenv');

//import config.env file to create environment variables
dotenv.config({ path: './config.env' });

// 3) Connect to MongoDB by mongoose
const mongoose = require('mongoose');

// build database connection string in case we use mongoDB cloud from atlas
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// const DB = process.env.DATABASE_local;

//connect to atlas database using mongoose.connect
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection successful!');
  });

// 4) Require App and listen
const app = require('./app');

const port = process.env.PORT || 3000;

//app.listen returns the server
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// 1) Handle some application erros. e.g. failure to connect to mongoDB due to wrong password
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  //we clost the server first before we finish the app.
  server.close(() => {
    process.exit(1); //process.exit(0) - success, process.exit(1)- uncaught exception
  });
});
