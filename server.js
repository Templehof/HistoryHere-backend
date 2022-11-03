const mongoose = require("mongoose");
const app = require("./app");

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.20yf7pu.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => console.log("DB connection successful!"));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});