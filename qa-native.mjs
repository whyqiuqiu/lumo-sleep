import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];const checks=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8081');await page.getByText('睡眠评估',{exact:true}).waitFor();
await page.screenshot({path:'test-results/native-home-390.png'});
await page.getByText('睡眠评估',{exact:true}).click();
await page.getByRole('button',{name:'开始评估 →'}).click();
await page.getByRole('alert').filter({hasText:'请输入 11 位手机号'}).waitFor();
await page.getByLabel('手机号',{exact:true}).fill('13900139000');
await page.getByRole('button',{name:'开始评估 →'}).click();
await page.getByRole('alert').filter({hasText:'请同意'}).waitFor();
await page.getByRole('checkbox').click();await page.getByRole('button',{name:'开始评估 →'}).click();checks.push('原生页面登录与隐私校验');
for(let i=0;i<13;i++){
 if(i===2){await page.getByRole('button',{name:'确认这个作息'}).click()}
 else{await page.getByRole(i===11?'checkbox':'radio').nth(1).click()}
 if(i===0){await page.screenshot({path:'test-results/native-question.png'});await page.getByRole('button',{name:'下一题 →'}).click();await page.getByRole('button',{name:'← 上一题'}).click();assert.equal(await page.getByRole('radio').nth(1).getAttribute('aria-checked'),'true');checks.push('原生返回保留答案')}
 await page.getByRole('button',{name:i===12?'生成画像 →':'下一题 →'}).click();
}
await page.getByText('睡眠有待改善',{exact:true}).waitFor();await page.screenshot({path:'test-results/native-result.png'});checks.push('React Native完整13题画像流程');
await page.getByRole('button',{name:'完成 →'}).click();await page.reload();await page.getByText('睡眠画像',{exact:true}).waitFor();checks.push('AsyncStorage刷新持久化');
await page.getByRole('tab',{name:'声音'}).click();await page.getByRole('button',{name:'▷ 开始播放'}).click();await page.getByRole('button',{name:'Ⅱ 暂停播放'}).waitFor();await page.waitForTimeout(1500);
await page.getByText(/已播放 [1-7] 秒/).waitFor();const audio=await page.getByText(/已播放 \d+ 秒/).innerText();checks.push('Expo音频资源加载与浏览器真实播放进度');
await page.getByText('缓缓海浪',{exact:true}).click();await page.waitForTimeout(1200);await page.getByRole('button',{name:'Ⅱ 暂停播放'}).click();checks.push('原生声音切换与暂停');
await page.getByRole('tab',{name:'助眠'}).click();await page.getByText('午间小憩',{exact:true}).click();await page.getByText('30',{exact:true}).click();await page.getByRole('button',{name:'开始小憩 →'}).click();await page.getByText('30:00',{exact:true}).waitFor();await page.getByRole('button',{name:'Ⅱ 暂停'}).click();await page.waitForTimeout(1100);await page.getByText('30:00',{exact:true}).waitFor();await page.getByRole('button',{name:'▷ 继续'}).click();await page.waitForTimeout(1200);await page.getByText('29:59',{exact:true}).waitFor();await page.getByRole('button',{name:'结束本次体验'}).click();checks.push('原生小憩计时暂停与继续');
await page.getByText('● 头环未连接  ›',{exact:true}).click();await page.getByRole('button',{name:'体验头环连接 ᛒ'}).click();await page.getByText('● 演示已连接 · 电量 82%（模拟）',{exact:true}).waitFor();await page.getByRole('button',{name:'断开演示头环'}).click();await page.getByRole('button',{name:'体验头环连接 ᛒ'}).waitFor();await page.getByLabel('关闭',{exact:true}).click();checks.push('原生头环模拟配对与断开');
await page.getByRole('tab',{name:'报告'}).click();await page.getByLabel('10月7日评分76').click();await page.getByText('分 · 10 月 7 日',{exact:false}).waitFor();checks.push('原生示例报告日期切换');
await page.getByRole('tab',{name:'我的'}).click();await page.getByText('隐私与数据',{exact:true}).click();await page.getByRole('button',{name:'清除我的本地数据'}).click();await page.getByRole('button',{name:'体验登录',exact:true}).waitFor();checks.push('原生清除本地数据');
assert.deepEqual(errors,[]);checks.push('React Native Web无运行时错误');await writeFile('test-results/qa-native.json',JSON.stringify({checks,errors,audio},null,2));console.log(JSON.stringify({passed:checks.length,checks,errors,audio},null,2));await browser.close();
