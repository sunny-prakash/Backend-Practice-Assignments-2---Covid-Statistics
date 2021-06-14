const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 8080;
const mongoose = require("mongoose");

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require("./connector");

app.get("/totalRecovered", async (req, res) => {
    const covidDetails = await connection.find();
    let total = 0;
    covidDetails.forEach((element) => {
        total += element.recovered;
    });
    res.status(200).send({ data: { _id: "total", recovered: total } });
});

app.get("/totalActive", async (req, res) => {
    const covidDetails = await connection.find();
    let total = 0;
    covidDetails.forEach((element) => {
        total += element.infected - (element.recovered + element.death);
    });
    res.status(200).send({ data: { _id: "total", active: total } });
});

app.get("/totalDeath", async (req, res) => {
    const covidDetails = await connection.find();
    let total = 0;
    covidDetails.forEach((element) => {
        total += element.death;
    });
    res.status(200).send({ data: { _id: "total", death: total } });
});

app.get("/hotspotStates", async (req, res) => {
    const covidDetails = await connection.find();

    let states = [];
    covidDetails.forEach((element) => {
        let value = ((element.infected - element.recovered) / element.infected).toFixed(5);
        console.log(value);
        if (value > 0.1) {
            states.push({
                state: element.state,
                rate: value,
            });
        }
    });
    res.status(200).send({ data: states });
});

app.get("/healthyStates", async (req, res) => {
    const covidDetails = await connection.find();

    let states = [];
    covidDetails.forEach((element) => {
        let value = element.death / element.infected;
        if (value < 0.005) {
            states.push({
                state: element.state,
                mortality: value,
            });
        }
    });
    res.status(200).send({ data: states });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;
