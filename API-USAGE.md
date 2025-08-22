# mdFury API Documentation

## Overview

The mdFury API allows you to programmatically manage your markdown documents. To use the API, you need to generate an API token from your settings page.

## Authentication

All API requests require authentication using your API token. Include your token in the `Authorization` header:

```bash
Authorization: Bearer your_api_token_here
```

## Base URL

```
http://localhost:3000/api
```

## API Endpoints

### Get User's Markdowns

Retrieve all markdowns belonging to the authenticated user.

**Endpoint:** `GET /markdowns`

**Headers:**
```
Authorization: Bearer your_api_token_here
```

**Response:**
```json
{
  "success": true,
  "markdowns": [
    {
      "id": "cm1x2y3z4",
      "binId": "abc123def",
      "title": "My Document",
      "content": "# Hello World\n\nThis is markdown content.",
      "isPrivate": true,
      "password": null,
      "createdAt": "2025-01-01T12:00:00.000Z",
      "updatedAt": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

### Create New Markdown

Create a new markdown document.

**Endpoint:** `POST /markdowns`

**Headers:**
```
Authorization: Bearer your_api_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My New Document",
  "content": "# Hello World\n\nThis is markdown content.",
  "isPrivate": true,
  "password": "optional_password"
}
```

**Response:**
```json
{
  "success": true,
  "markdown": {
    "id": "cm1x2y3z4",
    "binId": "abc123def",
    "title": "My New Document",
    "content": "# Hello World\n\nThis is markdown content.",
    "isPrivate": true,
    "password": null,
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

### Update Markdown

Update an existing markdown document.

**Endpoint:** `PUT /markdowns/{id}`

**Headers:**
```
Authorization: Bearer your_api_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "# Updated Content\n\nThis is updated markdown content.",
  "isPrivate": false,
  "password": null
}
```

**Response:**
```json
{
  "success": true,
  "markdown": {
    "id": "cm1x2y3z4",
    "binId": "abc123def",
    "title": "Updated Title",
    "content": "# Updated Content\n\nThis is updated markdown content.",
    "isPrivate": false,
    "password": null,
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:30:00.000Z"
  }
}
```

### Delete Markdown

Delete a markdown document.

**Endpoint:** `DELETE /markdowns/{id}`

**Headers:**
```
Authorization: Bearer your_api_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### Get Public Markdown

Get a public markdown document by bin ID (no authentication required for public documents).

**Endpoint:** `GET /public/{binId}`

**Query Parameters:**
- `password` (optional): Password for password-protected documents

**Response:**
```json
{
  "success": true,
  "markdown": {
    "id": "cm1x2y3z4",
    "binId": "abc123def",
    "title": "Public Document",
    "content": "# Public Content\n\nThis is public markdown content.",
    "isPrivate": false,
    "password": null,
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

## Example Usage

### Using cURL

```bash
# Get all markdowns
curl -H "Authorization: Bearer your_api_token_here" \
     http://localhost:3000/api/markdowns

# Create a new markdown
curl -X POST \
     -H "Authorization: Bearer your_api_token_here" \
     -H "Content-Type: application/json" \
     -d '{"title":"My API Document","content":"# Hello from API","isPrivate":false}' \
     http://localhost:3000/api/markdowns

# Get a public document
curl http://localhost:3000/api/public/abc123def
```

### Using JavaScript/Node.js

```javascript
const API_TOKEN = 'your_api_token_here';
const BASE_URL = 'http://localhost:3000/api';

// Get all markdowns
async function getAllMarkdowns() {
  const response = await fetch(`${BASE_URL}/markdowns`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  });
  const data = await response.json();
  return data.markdowns;
}

// Create a new markdown
async function createMarkdown(title, content, isPrivate = true) {
  const response = await fetch(`${BASE_URL}/markdowns`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title,
      content,
      isPrivate
    })
  });
  const data = await response.json();
  return data.markdown;
}

// Get a public document
async function getPublicMarkdown(binId) {
  const response = await fetch(`${BASE_URL}/public/${binId}`);
  const data = await response.json();
  return data.markdown;
}
```

### Using Python

```python
import requests

API_TOKEN = 'your_api_token_here'
BASE_URL = 'http://localhost:3000/api'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

# Get all markdowns
def get_all_markdowns():
    response = requests.get(f'{BASE_URL}/markdowns', headers=headers)
    return response.json()['markdowns']

# Create a new markdown
def create_markdown(title, content, is_private=True):
    data = {
        'title': title,
        'content': content,
        'isPrivate': is_private
    }
    response = requests.post(f'{BASE_URL}/markdowns', headers=headers, json=data)
    return response.json()['markdown']

# Get a public document
def get_public_markdown(bin_id):
    response = requests.get(f'{BASE_URL}/public/{bin_id}')
    return response.json()['markdown']
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid or missing API token
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `406 Not Acceptable`: Password required for protected document
- `500 Internal Server Error`: Server error

Error responses include a message:

```json
{
  "success": false,
  "message": "Error description here"
}
```

## Rate Limiting

Currently, there are no rate limits imposed on API requests. However, please use the API responsibly.

## Security Notes

1. **Keep your API token secure**: Never share your API token or commit it to version control
2. **Use HTTPS in production**: Always use HTTPS when making API requests in production
3. **Regenerate tokens regularly**: Consider regenerating your API token periodically for security
4. **Token scope**: API tokens have the same permissions as your user account

## Getting Your API Token

1. Log in to mdFury
2. Go to Settings
3. Scroll to the "API Access" section
4. Click "Generate API Token" if you don't have one
5. Copy the generated token and use it in your API requests

## Support

If you encounter any issues with the API, please check:
1. Your API token is correct and not expired
2. You're using the correct endpoint URLs
3. Request headers are properly formatted
4. Request body data is valid JSON (for POST/PUT requests)
