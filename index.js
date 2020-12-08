const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const config = require('config');

const app = express();
app.use(express.json());
app.use(cors());

//testing
app.get('/', (req,res) => res.json('it works'));

//bring all routes
const testing = require('./routes/testing');
const userRoute = require('./routes/user');
const loanRoute = require('./routes/loan');

//DB config
const db = config.get('mongoURI');

//DB connection
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log("mongoDB connected!!");
  })
  .catch(err => console.log(err));

//Actual routes
app.use('/test', testing);
app.use('/api', userRoute);
app.use('/api', loanRoute);

//PORT 
const port = process.env.PORT || 5000;

//starting server
app.listen(port, () => {
    console.log(`server running at ${port}`);
}); 