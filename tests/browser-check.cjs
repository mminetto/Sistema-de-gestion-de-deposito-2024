const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {}), headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto(require('url').pathToFileURL(process.cwd()+'/index.html').href);
 await page.locator('#ingresobtn').click();
 await page.locator('#generate-code').click();
 const code=await page.locator('#barcode').inputValue();
 await page.locator('#categoria').fill('Herramientas'); await page.locator('#modelo').fill('Martillo - escolar');
 await page.locator('#types').selectOption('Herramienta'); await page.locator('#states').selectOption('Nuevo');
 await page.locator('#locations').selectOption('Sector A'); await page.locator('#units').selectOption('Unidades');
 await page.locator('#cantidad').fill('10'); await page.locator('#stock_critico').fill('0');
 await page.locator('#addItem').click();
 assert.equal(await page.locator('.confirmed-item').count(),1);
 await page.locator('#confirmItems').click();
 for(const [key,val] of Object.entries({nombre:'Ana',apellido:'Pérez',telefono:'123456789',email:'ana@example.com',dni:'12345678'})) await page.locator('#'+key).fill(val);
 await page.locator('#seccion').selectOption('Sector 1'); await page.locator('#submitUserForm').click();
 await page.locator('#actionModal').waitFor({state:'hidden'});
 await page.reload();
 assert.equal(await page.evaluate(()=>DepositoStore.createStore(localStorage).read().items[0].cantidad),10);
 await page.locator('a[href="#busqueda"]').click();
 assert.match(await page.locator('#inventory-list').innerText(),/Martillo - escolar/);
 if (process.env.SCREENSHOT_PATH) await page.screenshot({path:process.env.SCREENSHOT_PATH,fullPage:true});
 await page.locator('#retirarbtn').click(); await page.locator('#barcode').fill(code);
 await page.locator('#cantidad').fill('11'); await page.locator('#addItem').click();
 assert.equal(await page.locator('.confirmed-item').count(),0);
 await page.locator('#cantidad').fill('10'); await page.locator('#addItem').click();
 await page.locator('#confirmItems').click(); await page.locator('#user-search').fill('12345678');
 await page.locator('#user-search-results button').click(); await page.locator('#submitUserForm').click();
 await page.locator('#actionModal').waitFor({state:'hidden'});
 assert.equal(await page.evaluate(()=>DepositoStore.createStore(localStorage).read().items[0].cantidad),0);
 await page.locator('a[href="#historial"]').click();
 await page.locator('#page-content .operation-item').nth(1).waitFor(); assert.equal(await page.locator('#page-content .operation-item').count(),2);
 await page.evaluate(()=>window.print=()=>{window.printCalled=true}); await page.getByRole('button',{name:'Remito'}).first().click();
 const pdfDownload = page.waitForEvent('download'); await page.locator('#receipt-pdf').click();
 const pdf = await pdfDownload; assert.match(pdf.suggestedFilename(), /^remito-.*\.pdf$/);
 if (process.env.PDF_TEST_DIR) await pdf.saveAs(require('path').join(process.env.PDF_TEST_DIR, 'remito.pdf'));
 const labelsDownload = page.waitForEvent('download'); await page.locator('#labels-pdf').click();
 const labels = await labelsDownload; assert.match(labels.suggestedFilename(), /^etiquetas-.*\.pdf$/);
 if (process.env.PDF_TEST_DIR) await labels.saveAs(require('path').join(process.env.PDF_TEST_DIR, 'etiquetas.pdf'));
 await page.locator('#receipt-print').click(); await page.waitForFunction(()=>window.printCalled);
 assert.equal(await page.locator('#print-area .receipt-label img').count(),1);
 const pagination = await page.evaluate(() => {
   const op = DepositoStore.createStore(localStorage).read().operations[0];
   const many = {...op, items: Array.from({length: 25}, (_, i) => ({...op.items[0], codigo_barras: String(i).padStart(12, '0')}))};
   const full = DepositoReceipts.createPDF(many), labels = DepositoReceipts.createPDF(many, true);
   let invalidRejected = false;
   try { DepositoReceipts.createPDF({...op, items: [{...op.items[0], codigo_barras: '工具'}]}); } catch (_) { invalidRejected = true; }
   return {full: full.getNumberOfPages(), labels: labels.getNumberOfPages(), invalidRejected};
 });
 assert.ok(pagination.full > pagination.labels && pagination.labels > 1); assert.equal(pagination.invalidRejected, true);
 await page.locator('#receipt-modal .btn-close').click(); await page.locator('#receipt-modal').waitFor({state:'hidden'});
 await page.locator('a[href="#configuracion"]').click();
 const downloadPromise=page.waitForEvent('download'); await page.locator('#export-backup').click(); const download=await downloadPromise;
 assert.match(download.suggestedFilename(),/deposito-respaldo/);
 assert.deepEqual(errors,[]);
 console.log('PASS: file:// startup, ingreso, stock cero, búsqueda, retiro inválido, persistencia, responsable, historial, impresión y exportación.');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});


