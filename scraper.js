const puppeteer = require("puppeteer");

const CCTOP = "https://cctop.cos.uni-heidelberg.de/";
const CRIPSR_DIRECT = "http://crispr.dbcls.jp/";
const CAS_DESIGNER = "http://www.rgenome.net/cas-designer/";


module.exports = (async function(seq) {
  const targets = {};
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  // Scrape from CAS-Designer
  await page.goto(CAS_DESIGNER);
  await page.type("#query_seq", seq);
  // await page.click(".btn-primary");

  await Promise.all([
    page.waitForNavigation(),
    page.click('.btn-primary')
  ]);

  // wait until entire job finished..
  await page.waitForSelector("#results #table_res > tbody > tr:not([style*='display: none'])");

  const rgenResults = await page.$$("#results #table_res > tbody > tr:not([style*='display: none'])");

  console.log(rgenResults.length);
  for (rgenResult of rgenResults) {
    // console.log(rgenResult);
    const rgenPol = await rgenResult.$eval("td:nth-child(4)",
      (el) => el.textContent).catch((err) => console.error("No polarity"));
    // console.log(rgenPol);
    if (rgenPol === "+") {
      const rgenSeq = await rgenResult.$eval("td:nth-child(1) span span", (el) => el.textContent.slice(0, -3)).catch((err) => console.error("Invalid sequence"));
      if (rgenSeq in targets) {
        targets[rgenSeq]++;
      } else {
        targets[rgenSeq] = 1;
      }
    }
  }








  // Scrape from CCTop
  // await page.goto(CCTOP);
  // await page.type("#seq", seq);
  // await page.type("#demo_q", "hg38");
  // await page.waitForXPath("//*[@id='hg38_anchor']");
  // await page.evaluate(() => {
  //   [...document.querySelectorAll(".jstree-search")].find(el => el.textContent === "Human (Homo sapiens GRCh38/hg38)").click();
  // });
  // //
  //
  // // await page.click("#subm");
  // await Promise.all([
  //   page.waitForNavigation(),
  //   page.click('#subm')
  // ]);








  // Scrape from CRISPR direct
  await page.goto(CRIPSR_DIRECT);
  // replace sample sequence with our own
  await page.$eval("#useq", el => el.value = "");
  await page.type("#useq", seq);

  //select correct specificity (hg38) from dropdown menu
  await page.click("#ext-gen1698");
  await page.evaluate(() => {
    [...document.querySelectorAll(".x-boundlist-item")].find(el => el.textContent === "Human (Homo sapiens) genome, GRCh38/hg38 (Dec, 2013)").click();
  });
  // design with our parameters
  await page.click(".zbutton");

  // wait until target sequences show up first
  await page.waitForSelector("select[name='result_length']");
  // just show all entries in one page for easier scraping
  await page.select("select[name='result_length']", "-1");


  // scrape target sequences (excluding PAM) for +
  const CDResults = await page.$$(".dataTable tbody tr");
  for (let CDResult of CDResults) {
    // check textcontent for polarity, then do the push into object as key thing
    const rawPolarity = await CDResult.$eval("td.v:nth-child(2)", (el) => el.textContent).catch((err) => console.error("No polarity"));
    const polarity = rawPolarity.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
    if (polarity === "+") {
      const resultSeq = await CDResult.$eval("td.v:nth-child(3) .mono", (el) => el.textContent.slice(0, -3).toUpperCase()).catch((err) => console.error("No sequence"));
      // console.log(resultSeq);
      if (resultSeq in targets) {
        targets[resultSeq]++;
      } else {
        targets[resultSeq] = 1;
      }
    }
  }
  return targets;
});