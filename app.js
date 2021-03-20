const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pretty = require('express-prettify');
require("dotenv").config();
const path = require('path');

// import routes
const scrapRoutes = require("./routes/scrap");

// app
const app = express();
app.use(pretty({ query: 'pretty' }));

// middlewares
//app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// routes middleware
app.use("/api", scrapRoutes);

// viewed at http://localhost:8080
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + "/view/index.html"));
});

const port = process.env.DATABASE || 8000;
app.listen(port, () => {
  console.log(`Server is running on .....`);
  console.log(`127.0.0.1:${port}`);
});