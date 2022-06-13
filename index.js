require("dotenv").config();

const express = require("express");
const app = express();

const morgan = require("morgan");
app.use(morgan("dev"));

app.use(express.json());

const { client } = require("./db");
client.connect();

const apiRouter = require('./api');
app.use('/api', apiRouter);

app.use((req, res, next) => {
    console.log("<____Body Logger START____>");
    console.log(req.body);
    console.log("<_____Body Logger END_____>");
  
    next();
});

app.get('/', (req, res) => {
    res.send("Juicebox api")
});

app.use('/api', (req, res, next) => {
    console.log("A request was made to /api");
    next();
});
  
app.get('/api', (req, res, next) => {
    console.log("A get request was made to /api");
    res.send({ message: "success" });
});

app.get('/api', (req, res, next) => {
    console.log("A get request was made to /api");
    res.send({ message: "success" });
});
  
app.use('/api', (req, res, next) => {
    console.log("A request was made to /api");
    next();
});

const { PORT = 1338 } = process.env;

app.listen(PORT, () => {
    console.log("Server is up and running!");
});