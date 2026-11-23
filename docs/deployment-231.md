# 231 /lumo 发布记录

日期：2026-10-13。

- 地址：`http://192.168.110.231:9600/lumo/`
- `/lumo` 自动重定向到 `/lumo/`。
- 发布内容：浏览器演示版，含毛玻璃首页和自动助眠模拟流程。
- 构建：`npm run build:lumo`，静态资源基路径 `/lumo/`。
- 产物目录：`dist-lumo/`。
- 服务器发布目录：`/home/web/lumo-demo/releases/20261013-refine1`。
- 当前发布链接：`/home/web/lumo-demo/current`。
- 发布包 SHA256：`071c48ceb6df45d60c3834120d681e3174db840ff783ecaf23d93255781e8c0c`。

本轮细化状态光团、阶段颜色过渡、图标线条、文字层级、卡片材质与模拟指标的小型趋势线。上一版保留在 `20261013-glass-auto`，可通过切换 current 回滚。本次更新使用 `deploy/update-static-release.sh` 原子切换静态目录，没有重启 9600 服务，并保留上一版哈希资源供已打开的浏览器页面使用。

## 服务挂载

9600 已运行沙盘项目，PM2 名为 `ai-digital-sandplay-9600`。没有新建公共端口或替换沙盘内容。

在原来的启动脚本 `/home/web/ai-digital-sandplay/releases/d708640/deploy-server.mjs` 中增加 `/lumo` 专用处理：从 Lumo 当前发布目录提供静态文件，其他请求继续交给原 Vinext 服务。

修改后的脚本保存在本项目 `deploy/sandplay-with-lumo.mjs`；原脚本备份在服务器 `/home/web/lumo-demo/backups/sandplay-deploy-server-20261013.mjs`。

直接将新目录复制到沙盘的静态目录未能提供页面，因此已撤回该挂载方式。最终方案不依赖这个临时目录。

HTML 使用 `no-store`，带哈希的 JS/CSS 使用长期缓存。后续更新可以上传新的 Lumo 发布目录，再切换 `/home/web/lumo-demo/current`。

**注意：后续重新发布沙盘时，新发布目录的启动脚本也须保留这个挂载处理，否则 `/lumo/` 将消失。**

## 回滚

恢复启动脚本并重启这一个进程：

```bash
cp /home/web/lumo-demo/backups/sandplay-deploy-server-20261013.mjs /home/web/ai-digital-sandplay/current/deploy-server.mjs
pm2 restart ai-digital-sandplay-9600 --update-env
```

回滚后沙盘服务继续运行，Lumo 路由停止提供。Lumo 发布目录保留，便于恢复。

## 验证

- 服务器内部检查 `/`、`/lumo/` 和 JS 资源。
- 本机浏览器直接访问远程地址，验证页面刷新、问卷和自动助眠。
- `deploy/verify-live.mjs` 读取实际音频增益，确认播放和音量渐弱。
- 验证原沙盘首页仍正常显示。

证据：`test-results/qa.json`、`test-results/231-live.json`、`test-results/231-lumo-home.png`、`test-results/231-lumo-auto.png`。

本次为演示版发布，疲劳度、紧张度和头环连接均为模拟。
