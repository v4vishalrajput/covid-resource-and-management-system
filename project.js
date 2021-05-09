const wd=require("selenium-webdriver");
const cd=require("chromedriver");
const fs=require("fs");
const process=require("process");
let age=process.argv[2];
let pincode=process.argv[3];
let finalData={ "covid-headlines":{},"covid-stats-delhi":{},"plasma-availability":[],"remdesevir/favipiravir-availability":[],"oxygen-bed-availability":[],"vaccine-availability":[]};
async function main(){
let browser=await new wd.Builder().forBrowser('chrome').build();
await browser.manage().window().maximize();
//COVID-NEWS
await browser.get("https://www.financialexpress.com/lifestyle/health");
await browser.wait(wd.until.elementsLocated(wd.By.css(".content-list h3 a")));
let headlines=await browser.findElements(wd.By.css(".content-list h3 a"));
for(let i=0;i<5;i++){
  finalData["covid-headlines"][i+1]=await headlines[i].getText();
}

//STATS
await browser.get("https://delhifightscorona.in");
let cell=await browser.findElements(wd.By.css(".card.stats .cell"));
for(let i=0;i<cell.length;i++){
    let var1=await cell[i].findElement(wd.By.css("h6")).getText();
    let var2=await cell[i].findElement(wd.By.css("h3")).getText();
    finalData["covid-stats-delhi"][var1]=var2;
}
//OXYGEN-BEDS
await browser.findElement(wd.By.css('a[title="Hospital Beds"]')).click();
await browser.wait(wd.until.elementLocated(wd.By.css('.card.text-white.bg-success.mb-3.shadow')));
let links=await browser.findElements(wd.By.css('.card.text-white.bg-success.mb-3.shadow'));
await links[1].click();
await browser.wait(wd.until.elementsLocated(wd.By.css('tr.table-success')));
let vacants=await browser.findElements(wd.By.css('tr.table-success'));
for(let i=0;i<vacants.length;i++){
  let data=await vacants[i].findElements(wd.By.css("a[role='button']"));
  finalData["oxygen-bed-availability"].push({
    "Hospital-name":await data[0].getText(),
    "Available-beds":await data[3].getText()
  })
}
// PLASMA
await browser.get("https://www.covidhelp.enactusnsut.com");
await browser.wait(wd.until.elementLocated(wd.By.css(".text-gray-600.body-font.relative")));
let link=await browser.findElements(wd.By.css(".text-gray-600.body-font.relative div div div"));
await link[2].click();
await browser.wait(wd.until.elementsLocated(wd.By.css('.description.text-sm.text-gray-600')));
let temp=await browser.findElements(wd.By.css(".description.text-sm.text-gray-600"));
let phone=await browser.findElements(wd.By.className("pr-2"));
for(let i=0;i<phone.length;i++){
  finalData["plasma-availability"].push({
    "status":await temp[i].getText(),
    "contact-no":await phone[i].getText()
  })
}
// MEDICINES
await link[3].click();
await browser.wait(wd.until.elementsLocated(wd.By.css('.description.text-sm.text-gray-600')));
let temp2=await browser.findElements(wd.By.css(".description.text-sm.text-gray-600"));
let phone2=await browser.findElements(wd.By.className("pr-2"));
for(let i=0;i<temp2.length;i++){
  finalData["remdesevir/favipiravir-availability"].push({
    "status":await temp2[i].getText(),
    "contact-no":await phone2[i].getText()
  })
}
// VACCINES

await browser.get("https://www.cowin.gov.in/home");
await browser.wait(wd.until.elementLocated(wd.By.className('pin-search-btn')));
await browser.findElement(wd.By.id('mat-input-0')).sendKeys(pincode);
let enterPin=await browser.findElement(wd.By.className('pin-search-btn'));
enterPin.click();
await browser.wait(wd.until.elementLocated(wd.By.className('form-check-label')));
let ageLink=await browser.findElements(wd.By.className("form-check-label"));
if(parseInt(age)>=18 && parseInt(age)<=44){
   await ageLink[0].click();
}
else{
  await ageLink[1].click();
}
let rows=await browser.findElements(wd.By.css('.center-box .row'));
for(let i=0;i<rows.length;i++){
let obj={};
obj["vaccine-center"]=await rows[i].findElement(wd.By.css(".center-box .row .center-name-title")).getText();
let name=await rows[i].findElements(wd.By.css(".center-box .row ul li h5"));
obj["vaccine-name"]=await name[1].getText();
let doses=await rows[i].findElements(wd.By.css(".center-box .row ul li a"));
obj["doses-available"]=await doses[1].getText();
finalData["vaccine-availability"].push(obj);
}
fs.writeFileSync("finalProject.json",JSON.stringify(finalData));
await browser.quit();
}
main();