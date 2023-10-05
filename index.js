const express = require("express");
require("dotenv").config();
const connectDB = require("./db/connect");
const app = express();
var cors = require("cors");
const session = require("express-session");
const mongoSessionStore = require("connect-mongodb-session")(session);
const sessionStore = new mongoSessionStore({
  uri: "mongodb+srv://kishor811:c11yrbZf6MOdj8Ue@test.yrbiejx.mongodb.net/?retryWrites=true&w=majority",
  collection: "sessions",
});
const authRouter = require("./routes/auth");
const contactRoute = require("./routes/contact");
const corsOpts = {
  origin: "*",

  methods: ["GET", "POST", "PUT"],

  allowedHeaders: ["Content-Type"],
};

app.use(
  session({
    store: sessionStore,
    secret: process.env.JWT_SECRET,
    resave: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    saveUninitialized: false,
  })
);

// app.use(sessionMiddleware);

app.use(cors());
app.use(express.json());
app.use("/api", authRouter);
app.use("/api", contactRoute);
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
