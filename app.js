const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

dotenv.config({ path: './config.env' });
const app = express();

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(() => console.log('DB connection successful'));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(`${ __dirname }/public`));

app.use('/api/users', userRouter);
app.use('/api/tours', tourRouter);

app.all('*', (req, res, next) => {
  next(new AppError("Not found", 404));
});

app.use(globalErrorHandler);

const server = app.listen(3000, () => console.log('Server started'));

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
