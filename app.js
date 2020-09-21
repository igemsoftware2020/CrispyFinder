const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const app = express();
const scrape = require("./scraper");


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", async (req, res) => {
  // get the seq from submitted form,
  const rawSeq = await req.body.seq.replace(/\n/g, "");
  // scrape from our sites,
  // async () => {
  const scrapeResult = await scrape(rawSeq);
  // const scrapeResult = scrape(rawSeq);
  console.log(scrapeResult);
  // send scraped data to our result page to be displayed
  res.render("result", {
    targets: scrapeResult,
    i: 1
  });
  // }
});

// app.get("/result", (req, res) => {
//   res.render("result");
// });

app.listen(3000, () => {
  console.log("Server successfully started at port 3000.");
});