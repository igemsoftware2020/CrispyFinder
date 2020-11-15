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


// comment out the above 3 testing lines, and uncomment these next 3 lines for electron packager
// app.use(express.static("./resources/app/public"));
// app.set("view engine", "ejs");
// app.set("views", "./resources/app/views");



// Run the following line to package the app into an executable
// electron-packager ./ app-name

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);



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





app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, () => {
  console.log("Server successfully started at port 3000.");
});