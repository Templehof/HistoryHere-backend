const express = require("express");
const bodyParser = require('body-parser')
const mongoose = require("mongoose");
const app = express();

const itemsRoutes = require("./routes/items/items");

//Handling CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type",
    "Authorization"
  );
  next();
});

app.use(bodyParser.json());
app.use(itemsRoutes);

(async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.20yf7pu.mongodb.net/?retryWrites=true&w=majority`
    );
    app.listen(process.env.PORT || 3000);
    console.log("Flight check complete");
  } catch (error) {
    console.log(err);
  }
})();
