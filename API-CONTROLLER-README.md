# mdFury API Interactive Controller

這是一個互動式的 API 控制工具，讓你可以手動測試和控制 mdFury 的所有 API 功能。

## 🚀 使用方法

```bash
node api-controller.js
```

## 📋 功能列表

### 1. 📄 Get User Markdowns
- 取得目前用戶的所有文件列表
- 顯示文件 ID、標題、類型等資訊

### 2. ➕ Create New Markdown
- 建立新的 markdown 文件
- 可設定標題、內容、私人性質、密碼保護

### 3. 🌍 Get Public Markdown
- 透過 binId 取得公開文件
- 支援密碼保護文件存取
- 可選擇是否使用認證

### 4. ✏️ Update Markdown
- 更新現有文件
- 可修改標題、內容、私人設定

### 5. 🗑️ Delete Markdown
- 刪除指定文件
- 需要確認操作

### 6. 🔐 Test Authentication
- 測試 API token 認證功能
- 包含有效、無效、缺少 token 的測試

### 7. ⚡ Custom API Request
- 自定義 API 請求
- 可指定 HTTP 方法、端點、請求體等

### 8. 🔄 Refresh Menu
- 重新顯示選單

### 9. ❌ Exit
- 退出程式

## 🔧 設定

在 `api-controller.js` 的頂部，你可以修改：

```javascript
const API_TOKEN = 'your_api_token_here';
const BASE_URL = 'http://localhost:3000/api';
```

## 💡 使用技巧

1. **文件 ID vs BinID**：
   - 文件 ID：用於更新、刪除操作
   - BinID：用於公開存取

2. **私人文件測試**：
   - 建立私人文件後，嘗試不使用認證存取
   - 應該會收到 401 錯誤

3. **密碼保護測試**：
   - 建立有密碼的文件
   - 嘗試不提供密碼存取
   - 嘗試錯誤密碼存取

4. **錯誤處理測試**：
   - 使用不存在的文件 ID
   - 使用無效的 API token
   - 應該會收到相應的錯誤回應

## 🎯 範例操作流程

1. 啟動控制器：`node api-controller.js`
2. 選擇 "1" 查看現有文件
3. 選擇 "2" 建立新文件
4. 記錄返回的文件 ID 和 BinID
5. 選擇 "3" 用 BinID 測試公開存取
6. 選擇 "4" 用文件 ID 更新文件
7. 選擇 "5" 刪除文件

## 🔍 調試功能

每個 API 請求都會顯示：
- HTTP 狀態碼
- 成功/失敗狀態
- 完整的回應數據
- 錯誤訊息（如果有）

## ⌨️ 快捷鍵

- `Ctrl+C`：立即退出
- `Enter`：繼續操作
- `q`：退出到主選單

這個工具讓你可以完全控制每個 API 操作，非常適合測試和調試！
