# 專案 API 與頁面路由文檔

本文檔詳細介紹了 mdFury 專案中的所有 API 路由和頁面，解釋了它們各自的功能和用途。

## 📋 頁面 (Pages)

以下是應用程式中的主要頁面及其功能：

### `src/app/page.tsx`

- **路由:** `/`
- **功能:** 應用程式的主要進入點。此頁面渲染核心的 `App` 元件，其中包含了 Markdown 編輯器的主介面。

### `src/app/login/page.tsx`

- **路由:** `/login`
- **功能:** 提供使用者登入介面。此頁面渲染 `LoginForm` 元件，讓使用者可以輸入帳號密碼進行登入。

### `src/app/settings/page.tsx`

- **路由:** `/settings`
- **功能:** 使用者設定頁面。已登入的使用者可以在此頁面中修改個人資料、主題、背景等偏好設定。

### `src/app/docs/page.tsx`

- **路由:** `/docs`
- **功能:** 使用者文件列表頁面。此頁面會顯示已登入使用者所儲存的所有 Markdown 文件列表。

### `src/app/bin/[id]/page.tsx`

- **路由:** `/bin/:id`
- **功能:** 顯示單一 Markdown 文件（"Bin"）。此頁面用於公開或私密地展示一個文件。它會處理密碼保護邏輯，並根據權限獲取文件內容。包含密碼表單 (`PasswordForm`) 用於處理密碼保護的文件。

### `src/app/bin/[id]/edit/page.tsx`

- **路由:** `/bin/:id/edit`
- **功能:** 編輯 Markdown 文件。如果使用者是該文件的擁有者，此頁面將允許他們對文件進行編輯。

---

## 🚀 API 路由 (API Routes)

以下是專案後端的 API 路由及其詳細說明。

### `src/app/api/auth/login/route.ts`

- **路由:** `POST /api/auth/login`
- **功能:** 使用者登入。
- **請求 Body:**
  ```json
  {
    "username": "your-username",
    "password": "your-password"
  }
  ```
- **成功回應 (200):**
  ```json
  {
    "success": true,
    "token": "jwt-token",
    "user": { ... }
  }
  ```
- **失敗回應 (401):**
  ```json
  {
    "success": false,
    "message": "Invalid credentials"
  }
  ```

### `src/app/api/auth/verify/route.ts`

- **路由:** `GET /api/auth/verify`
- **功能:** 驗證使用者的 JWT。
- **請求 Headers:**
  ```
  Authorization: Bearer your-jwt-token
  ```
- **成功回應 (200):**
  ```json
  {
    "success": true,
    "user": { ... }
  }
  ```
- **失敗回應 (401):**
  ```json
  {
    "success": false,
    "message": "Invalid token"
  }
  ```

### `src/app/api/auth/profile/route.ts`

- **路由:** `PUT /api/auth/profile`
- **功能:** 更新已登入使用者的個人資料。
- **請求 Headers:**
  ```
  Authorization: Bearer your-jwt-token
  ```
- **請求 Body:** 包含要更新的欄位，例如：
  ```json
  {
    "displayName": "New Name",
    "theme": "dark"
  }
  ```
- **成功回應 (200):**
  ```json
  {
    "success": true,
    "user": { ... } // 更新後的使用者資料
  }
  ```

### `src/app/api/auth/profile/[userId]/route.ts`

- **路由:** `GET /api/auth/profile/:userId`
- **功能:** 獲取指定使用者的公開個人資料。
- **成功回應 (200):**
  ```json
  {
    "success": true,
    "user": {
      "id": "user-id",
      "username": "username",
      "displayName": "Display Name",
      // ... 其他公開欄位
    }
  }
  ```
- **失敗回應 (404):**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```

### `src/app/api/markdowns/route.ts`

- **路由:** `GET /api/markdowns`
- **功能:** 獲取已登入使用者的所有 Markdown 文件。
- **請求 Headers:**
  ```
  Authorization: Bearer your-jwt-token
  ```
- **成功回應 (200):**
  ```json
  {
    "success": true,
    "markdowns": [ ... ] // 文件列表
  }
  ```

- **路由:** `POST /api/markdowns`
- **功能:** 建立一個新的 Markdown 文件。
- **請求 Headers:**
  ```
  Authorization: Bearer your-jwt-token
  ```
- **請求 Body:**
  ```json
  {
    "title": "New Document",
    "content": "# Hello World"
  }
  ```
- **成功回應 (200):**
  ```json
  {
    "success": true,
    "markdown": { ... } // 新建立的文件資料
  }
  ```

### `src/app/api/public/[binId]/route.ts`

- **路由:** `GET /api/public/:binId`
- **功能:** 獲取一個公開的 Markdown 文件。如果文件有密碼，需要在查詢參數中提供。
- **查詢參數:** `?password=your-password` (如果需要)
- **成功回應 (200):**
  ```json
  {
    "success": true,
    "markdown": { ... }
  }
  ```
- **失敗回應 (404):** 文件未找到。
- **失敗回應 (423):** 需要密碼 (Locked)。
- **失敗回應 (403):** 密碼錯誤或無權限 (Access Denied)。

---

## 🔒 安全性與權限邏輯

### 密碼保護與私人文件限制

專案實作了以下安全邏輯：

1. **密碼保護的文件必須是公開的**: 如果一個文件設定了密碼保護，它不能同時設定為私人文件。這個邏輯在以下地方實作：
   - 前端 UI：當啟用密碼保護時，會自動將文件設定為公開，並阻止使用者將其設定為私人
   - 後端 API：在儲存和更新文件時會驗證這個邏輯
   - 資料庫層：確保資料一致性

2. **私人文件權限檢查**: 
   - 只有文件擁有者可以查看私人文件
   - 未登入使用者嘗試存取私人文件時會要求登入
   - 已登入但非擁有者的使用者會被拒絕存取

3. **密碼表單組件** (`PasswordForm`):
   - 提供美觀的密碼輸入介面
   - 支援顯示/隱藏密碼
   - 包含錯誤處理和載入狀態

---

## 🗂️ 元件說明

### `PasswordForm` 元件

位置：`src/components/PasswordForm.tsx`

此元件用於處理密碼保護文件的密碼輸入：

**Props:**
- `title`: 表單標題
- `onSubmit`: 密碼提交回調函數
- `error`: 錯誤訊息
- `isLoading`: 載入狀態
- `onCancel`: 取消回調函數

**功能:**
- 密碼顯示/隱藏切換
- 表單驗證
- 錯誤顯示
- 響應式設計

---

## 📝 已棄用或重定向的路由

- `src/app/[binId]/page.tsx`: 此路由會將舊版的 `/[binId]` URL 重定向到新的 `/bin/[binId]` 結構。
- `src/app/[binId]/edit/page.tsx`: 此路由會將舊版的 `/[binId]/edit` URL 重定向到新的 `/bin/[binId]/edit` 結構。

