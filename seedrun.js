// seedRun.js
const mongoose = require("mongoose");
require("dotenv").config();
const seedData = require("./seed");

mongoose
  .connect(process.env.MDB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB Connected");
    await seedData();  // This actually runs the insert
    mongoose.connection.close(); // Optional: close DB after seeding
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
