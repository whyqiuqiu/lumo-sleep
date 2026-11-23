# Lumo 眠感

围绕脑电头环的睡眠与放松 App 第一版。正式工程采用 **React Native + Expo，面向 iOS 和 Android**；根目录另外提供视觉设计预览，方便对照桌面与手机布局。

当前产品主线为 **自动助眠**：首页直接开始，体验佩戴确认、状态感知、声音调整、音量渐弱的连续流程。手动声音列表作为辅助入口；正念页退出主导航。界面使用半透明卡片与悬浮导航，原生首页及控件使用 `expo-blur`；这是毛玻璃风格实现，不是 Apple 系统 Liquid Glass 控件。

自动助眠使用明确标记的模拟信号，约 32 秒进入渐弱阶段。`shared/adaptive.js` 生成加速演示状态；浏览器通过 Web Audio 平滑调整滤波频率与增益，React Native 在雨声和海浪之间做音量淡出/淡入。尚未将真实 EEG 疲劳度、紧张度或睡眠趋势接入控制逻辑，不能将此演示视为睡眠判定或疗效验证。

视觉参考：[Apple 材质设计指南](https://developer.apple.com/design/human-interface-guidelines/materials)、[StressWatch 官方展示](https://stresswatch.app/)。

## 运行

服务器演示地址：[231 /lumo](http://192.168.110.231:9600/lumo/)。发布与回滚说明见 `docs/deployment-231.md`。

### React Native 工程

```powershell
cd native
npm install
npm start
```

通过 Expo 开发服务器在兼容 SDK 的设备运行，或按 `a` 打开已配置的 Android 模拟器、按 `w` 查看 React Native Web。Windows 无法运行 iOS Simulator；iOS 构建和真机安装需要对应开发环境与签名。

本机也可以直接运行根目录 `start-native.ps1`。默认端口为 8081。

### 视觉设计预览

```powershell
npm install
npm run dev
```

本机也可以直接运行 `start-preview.ps1`。默认端口为 5173。

## 已实现

- 首页突出头环概念外观，采用浅鼠尾草绿、克制留白与缓慢的呼吸/浮动动画。
- 本地体验登录 → 13 题睡眠问卷 → 回答分析 → 睡眠画像 → 三天起步计划。
- 单选、多选、作息时间编辑、上一题保留答案、未答题校验。
- 本地保存手机号与问卷；刷新后恢复；隐私页可清除。
- 头环佩戴流程及模拟连接/断开，明确标记模拟状态。
- 午休 20/25/30/35/40 分钟；晚间放松；正念练习计时；暂停、继续与退出。
- 四种合成声景、播放/暂停、切换、当前会话收藏和定时关闭。
- 示例睡眠报告与每日评分选择。

## 当前边界

这是一版可运行的交互原型，不是已完成医疗或硬件验证的正式产品。

| 能力 | 当前实现 |
| --- | --- |
| 登录 | 本地手机号体验；没有短信验证码、真实认证或云端账户 |
| 评估 | 自定义 13 题与简单建议规则；不是 PSQI/ISI 或临床量表，不输出临床分数 |
| 头环 | 概念 SVG 外观；演示连接与电量，没有 BLE 访问 |
| 睡眠报告 | 清楚标记的示例数据，没有 EEG/PPG 分期算法 |
| 声音 | 程序生成声景，无自然录音或冥想语音 |
| 正念 | 呼吸动画与计时；身体扫描/感恩冥想只有静心计时 |
| 计时提醒 | 原生版按时间戳校正前后台时间；未实现系统闹钟、后台唤醒通知 |
| 收藏 | 当前会话有效，不长期保存 |
| 隐私 | 原生 AsyncStorage / 浏览器 localStorage 保存体验数据；正式版须设计安全存储与授权 |

未复制参考截图中的疗效百分比、用户排名和改善承诺。StressWatch 参考其友好、克制的状态表达；Easleep 截图参考一屏一题、进度反馈及问卷后计划流程。

## 工程目录

```text
native/                 React Native / Expo 正式技术路线
  App.js                原生页面、交互与本地状态
  assets/               四种合成 WAV 声景
  generate_audio.py     可重复生成音频的脚本
shared/questions.js     两个前端共用的问卷定义
src/                    浏览器视觉原型
qa.mjs                  浏览器交互检查
qa-native.mjs           React Native Web 核心流程检查
docs/acceptance.md      验收记录与硬件接入事项
```

## 构建与检查

```powershell
npm run build
node qa.mjs
node qa-native.mjs
cd native
npm run export
```

自动化脚本使用本机 Edge，依赖预览服务器分别运行于 5173 和 8081。

当前机器默认 npm 环境存在 `minipass-flush` 加载错误。开发时使用已有 `D:\soft\NVM\v24.10.0\node.exe` 与同目录 npm；启动脚本直接调用已安装的本地 CLI，不修改机器的全局 Node 设置。

## 下一步

1. 确认真实头环型号、产品照片、厂商 SDK 与 BLE 协议。
2. 用真实连接、设备信息、电量和佩戴质量替换演示链路。
3. 接入验证码登录、用户授权、数据存储与服务端。
4. 接入经过验证的 EEG/PPG 处理及报告；进行 iOS / Android 真机验收。

开发文档中帧头、长度、CRC 与电量帧示例存在布局不一致，CRC 参数、大小端、设备服务 UUID、控制命令和异常状态也需要厂商明确，不能直接当作可用协议实现。
