const express = require("express");
require("dotenv").config();
const connectDB = require("./src/db/dbConnact");
const { dbUrl, serverPort } = require("./src/config/setting");
const app = express();
var cors = require("cors");
const session = require("express-session");
const sessionStore = require("./src/db/sessionConnact");
const userRouter = require("./src/routes/user");
const authRoute = require("./src/routes/auth");

app.use(
  session({
    store: sessionStore,
    secret: process.env.JWT_SECRET,
    httpOnly: false,
    resave: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
    saveUninitialized: false,
  })
);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("APP is working!");
});

app.get("/api", (req, res) => {
  res.send("API is working!");
});


app.use("/api", userRouter);
app.use("/api", authRoute);


const port = serverPort || 5000;
const start = async () => {
  try {
    connectDB(dbUrl);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log("error =>", error);
  }
};
start();
