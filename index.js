import express from "express";
import { connectDB } from "./config/db.js";
import { apiRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

// Database connection
connectDB();

// CORS Setup
const allowlist = process.env.ALLOW_LIST ? process.env.ALLOW_LIST.split(",") : ["http://localhost:5173"];
// const allowlist = process.env.ALLOW_LIST ? process.env.ALLOW_LIST.split(",") : ["https://hospital-patient-care-dashboard-frontend.vercel.app"];
// console.log("Allowed Origins:", allowlist);

const corsOptions = {
  origin: allowlist, // from env or default
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(cookieParser()); // Handle cookies

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// routes api
app.use("/api", apiRouter)

app.all("*", (req, res, next) => {
  res.status(404).json({ message: "Endpoint does not exist"})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})