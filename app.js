const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const itemsRouter = require("./routes/items/itemsRoutes");
const authRouter = require("./routes/users/authRoutes");

//Handling CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use(bodyParser.json());
app.use("/api/v1/items", itemsRouter);
app.use("/api/v1/users", authRouter);

module.exports = app;