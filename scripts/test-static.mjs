import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
const server = spawn(process.execPath,["scripts/serve-static.mjs"],{env:{...process.env,PORT:"4173"},stdio:"pipe"});
let browser;
try {
 await new Promise((resolve,reject)=> { server.stdout.once("data",resolve);server.once("error",reject); });
 const brave = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
 browser = await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE || (existsSync(brave)?brave:undefined), headless:true});
 const context = await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
 await context.addInitScript(()=>localStorage.setItem("kurye35_score","4321"));
 const page = await context.newPage();
 page.setDefaultTimeout(15000);
 const errors=[]; page.on("pageerror",e=>errors.push(e.message));
 const requests=[]; page.on("request",r=>requests.push(r.url()));
 await page.goto("http://127.0.0.1:4173");
 await page.getByRole("heading",{name:"VARDİYA",exact:true}).waitFor();
 assert.equal(await page.title(),"Vardiya");
 assert.equal(await page.evaluate(()=>localStorage.getItem("vardiya_score")),"4321");
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:path.join(tmpdir(),"vardiya-menu.png")});
 await page.getByRole("button",{name:"VARDİYAYI BAŞLAT"}).click();
 for(let i=0;i<4;i++) await page.locator(".ui-primary").last().click();
 await page.waitForTimeout(1200);
 await page.keyboard.press("p");
 await page.getByRole("heading",{name:"DURAKLATILDI"}).waitFor();
 console.log("Gameplay started and paused");
 await page.screenshot({path:path.join(tmpdir(),"vardiya-game.png")});
 // Reach the genuine game-over UI with a deterministic engine result.
 await page.evaluate(()=>{
   const element = document.querySelector("canvas");
   const key = Object.keys(element).find(k=>k.startsWith("__reactFiber$"));
   let fiber = element[key];
   while(fiber) {
     let hook = fiber.memoizedState;
     while(hook && typeof hook === "object") {
       const value = hook.memoizedState;
       const engine = Array.isArray(value) ? value[0] : value;
       if (engine && typeof engine.endGame === "function") {
         engine.score = 5432; engine.deliveries = 7; engine.endGame("crash"); return;
       }
       hook = hook.next;
     }
     fiber = fiber.return;
   }
   throw new Error("Game engine instance not found");
 });
 await page.getByRole("button",{name:/paylaş/i}).click();
 await page.getByAltText("Skor Kartı Önizleme").waitFor();
 const png = await page.getByAltText("Skor Kartı Önizleme").getAttribute("src");
 assert.ok(png.startsWith("data:image/png;base64,"));
 writeFileSync(path.join(tmpdir(),"vardiya-card.png"),Buffer.from(png.split(",")[1],"base64"));
 const downloadEvent = page.waitForEvent("download");
 await page.getByRole("button",{name:/Instagram/i}).click();
 const download = await downloadEvent;
 assert.equal(download.suggestedFilename(),"vardiya-skor-5432.png");
 const downloaded = readFileSync(await download.path());
 assert.equal(downloaded.readUInt32BE(16),1080);
 assert.equal(downloaded.readUInt32BE(20),1920);
 assert.equal(await page.getByText("Görsel oluşturulamadı. Lütfen tekrar dene.",{exact:true}).count(),0);
 assert.equal(requests.some(u=>u.includes("/api/og?")),false);
 await page.screenshot({path:path.join(tmpdir(),"vardiya-share.png")});
 console.log("Score preview and 1080x1920 story PNG generated entirely in browser");
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await context.setOffline(true);
 await page.reload();
 await page.waitForTimeout(1500);
 await page.getByRole("heading",{name:"VARDİYA",exact:true}).waitFor();
 assert.equal(errors.length,0,errors.join("\n"));
 assert.equal(requests.some(u=>u.includes("/_next/image")),false);
 await context.setOffline(false);
 console.log("Mobile layout, gameplay, storage migration and offline reload passed");
} finally { await browser?.close();server.kill(); }
