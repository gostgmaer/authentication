const express = require("express");
require("dotenv").config();
const connectDB = require("./db/connect");
const app = express();
var cors = require("cors");
var session = require("express-session");
const authRouter = require("./routes/auth");
const corsOpts = {
  origin: "*",

  methods: ["GET", "POST", "PUT"],

  allowedHeaders: ["Content-Type"],
};

const sessionMiddleware = session({
  secret: process.env.JWT_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
});

app.use(sessionMiddleware);

app.use(cors());
app.use(express.json());
app.use("/api", authRouter);
// authRouter.use(session({secret:process.env.JWT_SECRET}))
app.get("/", (req, res) => {
  res.send("APP is working!");
});

app.get("/api", (req, res) => {
  res.send("API is working!");
});

//Port and Connect to DB
const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log("error =>", error);
  }
};
start();
