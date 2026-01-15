## 商家端小程序（Merchant-side）

目录说明：
- `app.js / app.json / app.wxss`：小程序入口与全局样式
- `utils/api.js`：请求封装（自动附带 `Authorization: Bearer {merchant_token}`）
- `api/`：按业务模块封装后端接口
- `pages/`：登录、礼品列表、兑换管理、积分管理页面

启动方式：
1. 用微信开发者工具导入本目录 `Merchant-side`
2. 如需切换后端域名，在 `utils/api.js` 修改 `BASE_URL`


