const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const app = express();
const scrape = require("./scraper");


// for testing!
app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views");


// app.use(express.static("./resources/app/public"));
// app.set("view engine", "ejs");
// app.set("views", "./resources/app/views");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// electron-packager ./ KSAKorea-Crispy


app.get("/", (req, res) => {
  res.render("index");
});




app.post("/", async (req, res) => {
  const rawSeq = await req.body.seq.replace(/\n/g, "");
 
  const scrapeResult = await scrape(rawSeq);
  
  res.render("result", {
    targets: scrapeResult,
    i: 1
  });
});

// 




app.get("/about", (req, res) => {
  console.log(req.body);
  res.render("about");
});

app.listen(3000, () => {
  console.log("Server successfully started at port 3000.");
});