# mdFury API Documentation

This document provides an overview of the available API endpoints for the mdFury application. All endpoints are relative to the base URL.

Authentication for protected routes is handled via a Bearer token in the `Authorization` header:

```bash
Authorization: Bearer <your_jwt_token>
```

## Table of Contents

- [mdFury API Documentation](#mdfury-api-documentation)
  - [Table of Contents](#table-of-contents)
  - [Markdown API](#markdown-api)
    - [Get All Markdowns](#get-all-markdowns)
    - [Create New Markdown](#create-new-markdown)
    - [Get Specific Markdown](#get-specific-markdown)
    - [Update Markdown](#update-markdown)
    - [Delete Markdown](#delete-markdown)
  - [Public API (Bins)](#public-api-bins)
    - [Get Public Markdown](#get-public-markdown)
  - [Error Response Format](#error-response-format)
  - [Notes](#notes)

## Markdown API

These endpoints are for managing user-specific markdown documents. All routes under `/api/markdowns` are protected and require authentication.

### Get All Markdowns

**Endpoint**: `GET /api/markdowns`

**Description**: Retrieves a list of all markdown documents owned by the authenticated user.

**Authentication**: Required

**Response Example**:

```json
{
  "success": true,
  "markdowns": [
    {
      "id": "clx...",
      "title": "My First Document",
      "content": "# Hello World",
      "tags": ["welcome", "tutorial"],
      "isPublic": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Status Codes**:

- `200` - Success
- `401` - Unauthorized (authentication required)
- `500` - Internal server error

### Create New Markdown

**Endpoint**: `POST /api/markdowns`

**Description**: Creates a new markdown document for the authenticated user.

**Authentication**: Required

**Request Body**:

```json
{
  "title": "New Document Title",
  "content": "## Markdown Content",
  "tags": ["new", "draft"],
  "isPublic": true,
  "password": null
}
```

**Validation Rules**:

- Password-protected documents must also be public (`isPublic: true`)

**Status Codes**:

- `200` - Success (returns newly created markdown object)
- `400` - Bad Request (validation fails)
- `401` - Unauthorized (authentication required)
- `500` - Internal server error

### Get Specific Markdown

**Endpoint**: `GET /api/markdowns/{id}`

**Description**: Retrieves a single markdown document by its ID. For private documents, only the owner can access them.

**Authentication**: Required (for private documents)

**URL Parameters**:

- `id` (string) - The ID of the markdown document

**Status Codes**:

- `200` - Success (returns markdown object)
- `404` - Not Found (document doesn't exist or no access)
- `500` - Internal server error

### Update Markdown

**Endpoint**: `PUT /api/markdowns/{id}`

**Description**: Updates an existing markdown document. The user must be the owner.

**Authentication**: Required

**URL Parameters**:

- `id` (string) - The ID of the markdown document to update

**Request Body**: Same structure as POST request with fields to update

**Status Codes**:

- `200` - Success (returns updated markdown object)
- `400` - Bad Request (validation fails)
- `401` - Unauthorized (authentication required)
- `404` - Not Found (document not found or not owner)
- `500` - Internal server error

### Delete Markdown

**Endpoint**: `DELETE /api/markdowns/{id}`

**Description**: Deletes a markdown document. The user must be the owner.

**Authentication**: Required

**URL Parameters**:

- `id` (string) - The ID of the markdown document to delete

**Status Codes**:

- `200` - Success (returns `{"success": true}`)
- `401` - Unauthorized (authentication required)
- `404` - Not Found (document not found or not owner)
- `500` - Internal server error

## Anonymous API

This endpoint allows anonymous users to create markdown documents when public mode is enabled.

### Create Anonymous Markdown

**Endpoint**: `POST /api/markdowns/anonymous`

**Description**: Creates a new public markdown document without authentication. Only available when `PUBLIC_MODE=true` in environment variables.

**Authentication**: None required

**Request Body**:

```json
{
  "title": "Anonymous Document Title",
  "content": "## Markdown Content",
  "tags": ["anonymous", "public"],
  "binId": "custom-id",
  "password": "optional-password"
}
```

**Validation Rules**:

- `title` and `content` are required
- Documents are always public (`isPublic: true`)
- `binId` is optional (auto-generated if not provided)
- `password` is optional for password protection

**Response Example**:

```json
{
  "success": true,
  "markdown": {
    "id": "clx...",
    "userId": "cmemxl3g70000etrk3htjffmf",
    "title": "Anonymous Document Title",
    "content": "## Markdown Content",
    "tags": ["anonymous", "public"],
    "isPublic": true,
    "binId": "custom-id",
    "password": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes**:

- `200` - Success (returns newly created markdown object)
- `400` - Bad Request (validation fails or missing required fields)
- `403` - Forbidden (public mode is disabled)
- `500` - Internal server error

## Public API (Bins)

This endpoint is for accessing public or password-protected markdown documents ("bins").

### Get Public Markdown

**Endpoint**: `GET /api/public/{binId}`

**Description**: Retrieves a public or password-protected document.

**Authentication**: Optional (if provided, checks if user is owner for private bins)

**URL Parameters**:

- `binId` (string) - The ID of the public markdown document

**Query Parameters**:

- `password` (string, optional) - Password for password-protected bins

**Response Example**:

```json
{
  "success": true,
  "markdown": {
    "id": "clx...",
    "title": "Public Document",
    "content": "# Hello World",
    "tags": ["public"],
    "isPublic": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes**:

- `200` - Success
- `401` - Unauthorized (private bin requires ownership)
- `403` - Forbidden (user authenticated but not owner of private bin)
- `404` - Not Found (bin doesn't exist or is private without access)
- `406` - Not Acceptable (password required but missing/incorrect)
- `500` - Internal server error

## Configuration API

These endpoints provide information about system configuration.

### Check Public Mode Status

**Endpoint**: `GET /api/config/public-mode`

**Description**: Checks if public mode is enabled, allowing anonymous users to create markdown documents.

**Authentication**: None required

**Response Example**:

```json
{
  "enabled": true
}
```

**Status Codes**:

- `200` - Success (returns public mode status)

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Notes

- All timestamps are in ISO 8601 format
- Document IDs are generated using Prisma's default ID generation
- Tags are stored as an array of strings
- Content supports full Markdown syntax including GFM (GitHub Flavored Markdown)
- Public documents can be accessed without authentication
- Private documents require the owner to be authenticated
- Password-protected documents must be public but require a password to access
- **Public Mode**: When `PUBLIC_MODE=true` is set in environment variables, anonymous users can create markdown documents without authentication
- Anonymous documents are linked to a special anonymous user account (`anonymous@mdfury.local`)
- Anonymous users cannot edit or delete their documents after creation (no ownership tracking)
- The anonymous user account is automatically created when the first anonymous document is saved
- Public documents can be accessed without authentication
- Private documents require the owner to be authenticated
- Password-protected documents must be public but require a password to access
