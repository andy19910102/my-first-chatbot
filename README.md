# React Starter

這是一個使用 React.js + Next.js 建立的示範空白專案。

利用終端機 Terminal 執行以下指令開啟專案。

1. 安裝套件
```
npm install
```

2. 啟動開發伺服器
```
npm run dev
```

3. 開啟網頁預覽網址
```
http://localhost:3000
```

--------

## 專案結構

```
專案目錄/
├── app/              # Next.js 13 的 App Router 目錄
│   ├── page.tsx      # 首頁
│   ├── layout.tsx    # 全域版面配置
│   ├── globals.css   # 全域樣式
│   └── api/          # API 路由
│       └── food/     # 食物相關 API
├── components/       # React 元件目錄(可重複使用的UI元件)
├── services/         # 服務層：串接第三方服務，例如：OpenAI、Firebase雲端資料庫、Stripe...等
└── public/           # 靜態資源目錄（圖片、字體等）
```

# 初次傳送code到github

git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/andy19910102/my-first-chatbot.git
git push -u origin main