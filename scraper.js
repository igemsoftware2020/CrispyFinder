const puppeteer = require("puppeteer");

const CCTOP = "https://cctop.cos.uni-heidelberg.de/";
const CRIPSR_DIRECT = "http://crispr.dbcls.jp/";
const CAS_DESIGNER = "http://www.rgenome.net/cas-designer/";
const CRISPOR = "http://crispor.tefor.net/crispor.py";


module.exports = (async function(seq) {
  let targets = {};
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();


    /********************* Scrape from CAS DESIGNER ********************/

  try {
    await page.goto(CAS_DESIGNER);
    await page.type("#query_seq", seq);

    await Promise.all([
      page.waitForNavigation(),
      page.click('.btn-primary')
    ]);
  
    // wait until entire job finished..
    await page.waitForSelector("#results #table_res > tbody > tr:not([style*='display: none'])");
  
    const rgenResults = await page.$$("#results #table_res > tbody > tr:not([style*='display: none'])");
  
    for (rgenResult of rgenResults) {
      const rgenPol = await rgenResult.$eval("td:nth-child(4)",
        (el) => el.textContent).catch((err) => console.error("No polarity"));
      
      let rgenScore = await rgenResult.$eval("td:nth-child(6) > a", (el) => (el.textContent)).catch((err)=>console.error("No score"));
      rgenScore = parseFloat(rgenScore);
      if (!isNaN(rgenScore) && rgenPol === "+" && rgenScore >= 66.0) {
        // also going to filter out 'greyed out' ones
        const rgenSeq = await rgenResult.$eval("td:nth-child(1) span span:not([class*='tt'])", (el) => el.textContent.slice(0, -3)).catch((err) => console.error("no rgenome sequence?", err));
    
        if (rgenSeq in targets) {
          let entry = {...targets[rgenSeq], ...{rgenome: page.url()}};
          targets[rgenSeq] = entry;
        } else {
          targets[rgenSeq] = {rgenome: page.url()};
        }
      }
    }
  } catch (err) {
    console.error("rgenome err", err);
  }

  


  








    /********************* Scrape from CCTOP ********************/

  try {

    await page.goto(CCTOP);
    await page.type("#seq", seq);
    await page.type("#demo_q", "hg38");
    await page.waitForXPath("//*[@id='hg38_anchor']");
    await page.evaluate(() => {
      [...document.querySelectorAll(".jstree-search")].find(el => el.textContent === "Human (Homo sapiens GRCh38/hg38)").click();
    });
    // 
    await page.click("#subm");
  
    
  
  
    await page.waitForSelector("iframe[src='unnamed_frame.html']", {
      visible: true,
      timeout: 0
    });
    
    
  
    // this is so that every frame is loaded...
    await page.waitFor(5000);
  
    
    const cctopFrame = await page.frames().find(f => f.name() === "iframe_targets");
   
  
  
    const cctopIframe = await page.waitForFunction(
      "document.querySelector('#middleColumn > iframe').contentDocument.body.innerHTML"
    );
  
   
    
    let cctopHTML =
    "<html><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'> <style type='text/css'> td.mono {font-family: 'Courier New', Courier, monospace}table.fancyTable, tr.fancyTable, td.fancyTable{border: 1px solid black;border-collapse: collapse;}.moveimage {    position: relative;    top: 1px;}.tooltip {    font-size: 10px;    display: none;    position: absolute;    border: 1px solid #cccccc;    padding: 0px 5px;    background-color: #f2f2f2;    text-align: justify;    box-shadow: 5px 5px 8px #AAA;    width: 300px;    line-height: 10px;}.hover:hover .tooltip {    z-index: 10;    text-decoration: none;    display: block;    position: absolute;}</style></head><body>" 
    + cctopIframe.toString() + "</body></html>";
    
  
  
  
    await page.setContent(cctopHTML);
  
  
    const cctopResults = await page.$$("body > table:nth-of-type(4n+2)");
    await page.$$("body > table");
  
  
  
    for(cctopResult of cctopResults) {
      const cctopScore = await cctopResult.$eval("tbody tr:nth-child(2) td:nth-child(2)", (el) => el.textContent).catch((err) => console.error("No efficacy score"));
      const cctopRating = cctopScore.split(" ");
      
      if (cctopRating[cctopRating.length - 1] === "HIGH") {
        
        const cctopSeq = await cctopResult.$eval("tbody > tr:nth-child(1) > td.mono", (el) => el.textContent.slice(0, -3)).catch((err)=>console.error("Error finding cctop seq"));
        
        if (cctopSeq in targets) {
          
          let entry = {...targets[cctopSeq], ...{cctop: page.url()}};
          targets[cctopSeq] = entry;
        } else {
          targets[cctopSeq] = {cctop: page.url()};
        }
      }
    }
  } catch (err) {
    console.error("cctop err", err);
  }


  






   /********************* Scrape from CRISPR Direct ********************/

  try {
    await page.goto(CRIPSR_DIRECT);
    // replace sample sequence with our own
    await page.$eval("#useq", el => el.value = "");
    await page.type("#useq", seq);
  
    //select correct specificity (hg38) from dropdown menu
    await page.click(".x-form-arrow-trigger");
    await page.evaluate(() => {
      [...document.querySelectorAll(".x-boundlist-item")].find(el => el.textContent === "Human (Homo sapiens) genome, GRCh38/hg38 (Dec, 2013)").click();
    });
    // design with our parameters
    await page.click(".zbutton");
  
    // wait until target sequences show up first
    await page.waitForSelector("select[name='result_length']");
    // just show all entries in one page for easier scraping
    await page.select("select[name='result_length']", "-1");
    // but only show highly specific target only
    await page.evaluate(()=>{
      document.querySelector("#filter_highlight").parentElement.click();
    });
  
  
    // scrape target sequences (excluding PAM) for +
    const CDResults = await page.$$(".dataTable tbody tr");
   
  
    
    for (let CDResult of CDResults) {
      
      const rawPolarity = await CDResult.$eval("td.v:nth-child(2)", (el) => el.textContent).catch((err) => console.error("No polarity"));
      const polarity = rawPolarity.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
      if (polarity === "+") {
        const cdSeq = await CDResult.$eval("td.v:nth-child(3) .mono", (el) => el.textContent.slice(0, -3).toUpperCase()).catch((err) => console.error("No sequence"));
        
        if (cdSeq in targets) {
          let entry = {...targets[cdSeq], ...{Crispr_Direct: page.url()}};
          targets[cdSeq] = entry;
        } else {
          targets[cdSeq] = {Crispr_Direct: page.url()};
        }
      }
    }
  } catch (err) {
    console.error("crispr direct err", err);
  }





  /********************* Scrape from CRISPOR ********************/
try {
  await page.goto(CRISPOR);
  await page.$eval("textarea[name='seq']", el => el.value = "");
  await page.type("textarea[name='seq']", seq);
  await page.click("#genomeDropDown_chosen");
  await page.type(".chosen-search input", "homo sapiens - human - ucsc dec.");
  await page.click(".chosen-results .active-result");
 


  await page.click("input[name='submit']");

  await page.waitForSelector("#otTable tbody tr td", {
    visible: true,
    timeout: 0
  });
  // not everything loads... so when we try to access child elements it throws an error
  await page.waitFor(5000);

  const crisporResults = await page.$$("#otTable tbody tr");
  // maybe filter instead of just 'break'
  for(crisporResult of crisporResults) {
    const crisporScore = await crisporResult.$eval("td:nth-child(3)", (el) => el.textContent).catch((err) => console.error("Crispor score error"));
    if(crisporScore > 50) {
      const crisporSeq = await crisporResult.$eval("td:nth-child(2) > small > tt", (el) => el.textContent).catch((err) => console.error("crispor seq error"));
      let crisporKey = crisporSeq.split(" ")[0];
      if (crisporKey in targets) {
        let entry = {...targets[crisporKey], ...{Crispor: page.url()}};
        targets[crisporKey] = entry;
      } else {
        targets[crisporKey] = {Crispor: page.url()};
      }
      
    }
    else {
      break;
    }
  }
} catch (err) {
  console.error("crispor err", err);
}



  browser.close();

  delete targets["undefined"];

  return targets;
});