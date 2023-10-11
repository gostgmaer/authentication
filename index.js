const express = require("express");
require("dotenv").config();
const connectDB = require("./db/connect");
const mongoose = require("mongoose");
const app = express();
var cors = require("cors");
const session = require("express-session");
const sessionStore = require("./db/session");
const authRouter = require("./routes/auth");
const unauthorized = require("./routes/aunauthorized");
const contactRoute = require("./routes/contact");
const resumeRoute = require("./routes/resume");
const genericRoute = require("./routes/generic");
const userRoute = require("./routes/user");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

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

// app.use(sessionMiddleware);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("APP is working!");
});

app.get("/api", (req, res) => {
  res.send("API is working!");
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/doc/swagger.json", (req, res) => {
  res.send("./doc/swagger.json");
});

//app route
app.use("/api", authRouter);
app.use("/api", contactRoute);
app.use("/api", resumeRoute);
app.use("/api", userRoute);
app.use("/api", genericRoute);
app.use("/api", unauthorized);

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
