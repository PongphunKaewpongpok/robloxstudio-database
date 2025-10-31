import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/router.js';
import session from "express-session";
import cors from "cors";


import authMiddleware from "./middlewares/authMiddleware.js"

const app = express();
const port = process.env.OPEN_PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cors());
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(session({
  name: "sid",                    
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60
  }
}));


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/", router);



//--
app.get("/", authMiddleware.redirectIfLoggedIn(), (req, res) => {
  res.sendFile(path.join(__dirname, "views/login.html"));
});

app.get("/login", authMiddleware.redirectIfLoggedIn(), (req, res) => {
  res.sendFile(path.join(__dirname, "views/login.html"));
});

app.get("/register", authMiddleware.redirectIfLoggedIn(), (req, res) => {
  res.sendFile(path.join(__dirname, "views/register.html"));
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});