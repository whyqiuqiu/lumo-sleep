import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'msedge'});
const results=[];
await Promise.all([5173,8081].map(async port=>{
 const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.__audio=[];const Original=window.Audio;window.Audio=function(...args){const a=new Original(...args);window.__audio.push(a);return a};window.Audio.prototype=Original.prototype;if(window.AudioContext){const Gain=AudioContext.prototype.createGain,Filter=AudioContext.prototype.createBiquadFilter;AudioContext.prototype.createGain=function(){const node=Gain.call(this);window.__gain=node;window.__ctx=this;return node};AudioContext.prototype.createBiquadFilter=function(){const node=Filter.call(this);window.__filter=node;return node}}});
 await p.goto(`http://127.0.0.1:${port}`);assert.equal(await p.getByText('今日',{exact:true}).count(),0);
 await p.getByRole('button',{name:port===5173?'开始助眠':'☾ 开始助眠 →',exact:true}).click();
 await p.getByText('佩戴确认',{exact:true}).waitFor();await p.getByText('状态感知',{exact:true}).waitFor();
 await p.waitForTimeout(1800);
 const initial=await p.evaluate(()=>window.__gain?{gain:window.__gain.gain.value,cutoff:window.__filter.frequency.value,state:window.__ctx.state}:window.__audio.map(a=>({volume:a.volume,time:a.currentTime,paused:a.paused,readyState:a.readyState})));
 if(port===5173){assert.ok(initial.gain>0);assert.equal(initial.state,'running')}else{assert.ok(initial.some(a=>a.time>0&&!a.paused&&a.volume>0))}
 await p.getByRole('button',{name:port===5173?'暂停助眠':'Ⅱ 暂停助眠',exact:true}).click();await p.getByText('已暂停',{exact:true}).waitFor();
 const time=port===5173?p.locator('.auto-time'):p.getByText(/^00:\d{2}$/);const paused=await time.innerText();await p.waitForTimeout(1200);assert.equal(await time.innerText(),paused);
 await p.getByRole('button',{name:port===5173?'继续助眠':'▷ 继续助眠',exact:true}).click();await p.getByText('自适应助眠',{exact:true}).waitFor({timeout:20000});await p.getByText('低频海浪',{exact:true}).waitFor();
 await p.getByText('渐弱陪伴',{exact:true}).waitFor({timeout:22000});await p.waitForTimeout(2300);
 const final=await p.evaluate(()=>window.__gain?{gain:window.__gain.gain.value,cutoff:window.__filter.frequency.value,state:window.__ctx.state}:window.__audio.map(a=>({volume:a.volume,time:a.currentTime,paused:a.paused,readyState:a.readyState})));
 if(port===5173){assert.ok(final.gain<initial.gain);assert.ok(final.cutoff<initial.cutoff)}else{assert.ok(final.some(a=>a.time>0&&!a.paused&&a.volume>0&&a.volume<.16))}
 await p.screenshot({path:`test-results/auto-${port}.png`});await p.getByLabel('结束助眠',{exact:true}).click();await p.getByRole('button',{name:port===5173?'开始助眠':'☾ 开始助眠 →',exact:true}).waitFor();
 assert.deepEqual(errors,[]);results.push({port,initial,final,checks:['蓝框标题行已删除','一键进入模拟助眠','自动播放','暂停冻结计时','继续恢复','自动切换声景','渐弱音量','退出返回首页','无运行时错误']});await p.close();
}));
await writeFile('test-results/qa-auto.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();
