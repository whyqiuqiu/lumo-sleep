import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'msedge'});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const checks=[];const ok=name=>checks.push(name);
await page.goto(process.env.LUMO_URL || 'http://127.0.0.1:5173');
await page.getByRole('button',{name:'开启睡眠评估',exact:true}).click();
await page.getByRole('button',{name:'开始评估'}).click();
await page.getByRole('alert').filter({hasText:'请输入 11 位手机号'}).waitFor();ok('手机号空值校验');
await page.getByPlaceholder('请输入手机号').fill('13800138000');
await page.getByRole('button',{name:'开始评估'}).click();
await page.getByRole('alert').filter({hasText:'请先阅读'}).waitFor();ok('隐私同意校验');
await page.getByRole('checkbox').check();
await page.getByRole('button',{name:'开始评估'}).click();
await page.getByRole('button',{name:'下一题',exact:true}).click();
await page.getByRole('alert').filter({hasText:'先选一个'}).waitFor();ok('未答题拦截');
for(let i=0;i<13;i++){
 if(i===2){await page.getByLabel('就寝时间',{exact:true}).fill('22:30');await page.getByLabel('起床时间',{exact:true}).fill('07:30')}
 else {await page.locator('.options button').nth(1).click();if(i===11){await page.locator('.options button').nth(2).click();await page.locator('.options button').nth(2).click();assert.equal(await page.locator('.options .selected').count(),1);ok('多选添加与取消')}}
 if(i===0){await page.getByRole('button',{name:'下一题',exact:true}).click();await page.getByRole('button',{name:'上一题'}).click();assert.equal(await page.locator('.options button.selected').innerText(),'还不错，偶尔有些困倦');ok('上一题保留答案');await page.screenshot({path:'test-results/question-mobile.png'})}
 await page.getByRole('button',{name:i===12?'生成我的画像':'下一题',exact:true}).click();
}
await page.getByRole('heading',{name:'睡眠有待改善'}).waitFor();
await page.screenshot({path:'test-results/result-mobile.png'});ok('13题到分析与画像完整流程');
await page.getByRole('button',{name:'完成'}).click();await page.reload();await page.getByRole('button',{name:'查看睡眠画像'}).waitFor();ok('刷新后画像持久化');
await page.getByRole('button',{name:'头环未连接'}).click();await page.getByRole('button',{name:'体验头环连接'}).click();await page.getByText('演示已连接',{exact:false}).waitFor();await page.getByRole('button',{name:'断开演示头环'}).click();await page.getByRole('button',{name:'体验头环连接'}).waitFor();ok('设备演示连接与断开');await page.getByRole('button',{name:'关闭',exact:true}).click();
await page.getByRole('button',{name:/午间小憩/}).click();await page.getByRole('button',{name:'30',exact:true}).click();await page.getByRole('button',{name:'开始小憩',exact:true}).click();await page.getByRole('heading',{name:'30:00'}).waitFor();await page.getByRole('button',{name:'暂停',exact:true}).click();const paused=await page.locator('.session h2').innerText();await page.waitForTimeout(1100);assert.equal(await page.locator('.session h2').innerText(),paused);await page.getByRole('button',{name:'继续',exact:true}).click();await page.waitForTimeout(1100);assert.notEqual(await page.locator('.session h2').innerText(),paused);ok('午休时长与暂停继续计时');await page.getByRole('button',{name:'结束本次体验'}).click();
await page.locator('.mobile-nav').getByRole('button',{name:'声音'}).click();await page.getByRole('button',{name:'开始播放',exact:true}).click();await page.getByRole('button',{name:'暂停播放',exact:true}).waitFor();await page.getByRole('button',{name:'收藏窗边细雨'}).click();assert.match(await page.getByRole('button',{name:'收藏窗边细雨'}).getAttribute('class'),/liked/);await page.getByRole('button',{name:'收藏窗边细雨'}).click();await page.getByRole('combobox').selectOption('15');await page.getByRole('button',{name:'缓缓海浪 低沉绵延',exact:true}).click();await page.getByRole('heading',{name:'缓缓海浪',exact:true}).waitFor();await page.getByRole('button',{name:'暂停播放',exact:true}).click();ok('音频播放暂停、换曲、收藏与定时设置');
await page.locator('.mobile-nav').getByRole('button',{name:'报告'}).click();await page.getByRole('button',{name:'10月7日睡眠评分76'}).click();await page.getByRole('heading',{name:/76/}).waitFor();ok('报告日期选择');
await page.locator('.mobile-nav').getByRole('button',{name:'我的',exact:true}).click();await page.getByRole('button',{name:'隐私与数据'}).click();await page.getByRole('button',{name:'清除我的本地数据'}).click();await page.getByRole('button',{name:'体验登录'}).waitFor();await page.reload();await page.locator('.mobile-nav').getByRole('button',{name:'我的',exact:true}).click();await page.getByRole('button',{name:'体验登录'}).waitFor();ok('清除数据及刷新确认');
for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await page.locator(width>820?'.sidebar':'.mobile-nav').getByRole('button',{name:'助眠',exact:true}).click();const fit=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);assert.ok(fit,`viewport overflow ${width}`);await page.screenshot({path:`test-results/home-${width}.png`,fullPage:true});ok(`${width}px无横向溢出`)}
assert.deepEqual(errors,[]);ok('无页面运行时错误');
await writeFile('test-results/qa.json',JSON.stringify({checks,errors,date:new Date().toISOString()},null,2));
console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));await browser.close();
