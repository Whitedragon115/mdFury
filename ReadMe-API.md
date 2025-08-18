# mdFury API Documentation

This document provides an overview of the available API endpoints for the mdFury application. All endpoints are relative to the base URL.

Authentication for protected routes is handled via a Bearer token in the `Authorization` header.

`Authorization: Bearer <your_jwt_token>`

## Markdown API

These endpoints are for managing user-specific markdown documents. All routes under `/api/markdowns` are protected and require authentication.

---

### 1. Get All Markdowns for a User

- **Endpoint**: `GET /api/markdowns`
- **Description**: Retrieves a list of all markdown documents owned by the authenticated user.
- **Authentication**: Required.
- **Responses**:
  - `200 OK`: Success. Returns a JSON object with `success: true` and a `markdowns` array.

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
          "createdAt": "...",
          "updatedAt": "..."
        }
      ]
    }
    ```

  - `401 Unauthorized`: If the user is not authenticated.
  - `500 Internal Server Error`: On server-side errors.

---

### 2. Create a New Markdown

-   **Endpoint**: `POST /api/markdowns`
-   **Description**: Creates a new markdown document for the authenticated user.
-   **Authentication**: Required.
-   **Request Body**:
    ```json
    {
      "title": "New Document Title",
      "content": "## Markdown Content",
      "tags": ["new", "draft"],
      "isPublic": true,
      "password": null
    }
    ```
-   **Validation**:
    -   Password-protected documents must also be public (`isPublic: true`).
-   **Responses**:
    -   `200 OK`: Success. Returns the newly created markdown object.
    -   `400 Bad Request`: If validation fails (e.g., private and password-protected).
    -   `401 Unauthorized`: If the user is not authenticated.
    -   `500 Internal Server Error`: On server-side errors.

---

### 3. Get a Specific Markdown

-   **Endpoint**: `GET /api/markdowns/{id}`
-   **Description**: Retrieves a single markdown document by its ID. If the document is not public, it only returns it if the authenticated user is the owner.
-   **Authentication**: Required (for private documents).
-   **URL Parameters**:
    -   `id` (string): The ID of the markdown document.
-   **Responses**:
    -   `200 OK`: Success. Returns the markdown object.
    -   `404 Not Found`: If the document doesn't exist or the user doesn't have access.
    -   `500 Internal Server Error`: On server-side errors.

---

### 4. Update a Markdown

-   **Endpoint**: `PUT /api/markdowns/{id}`
-   **Description**: Updates an existing markdown document. The user must be the owner.
-   **Authentication**: Required.
-   **URL Parameters**:
    -   `id` (string): The ID of the markdown document to update.
-   **Request Body**: Same as the `POST /api/markdowns` body, containing the fields to update.
-   **Responses**:
    -   `200 OK`: Success. Returns the updated markdown object.
    -   `400 Bad Request`: If validation fails.
    -   `401 Unauthorized`: If the user is not authenticated.
    -   `404 Not Found`: If the document is not found or the user is not the owner.
    -   `500 Internal Server Error`: On server-side errors.

---

### 5. Delete a Markdown

-   **Endpoint**: `DELETE /api/markdowns/{id}`
-   **Description**: Deletes a markdown document. The user must be the owner.
-   **Authentication**: Required.
-   **URL Parameters**:
    -   `id` (string): The ID of the markdown document to delete.
-   **Responses**:
    -   `200 OK`: Success. Returns `{ "success": true }`.
    -   `401 Unauthorized`: If the user is not authenticated.
    -   `404 Not Found`: If the document is not found or the user is not the owner.
    -   `500 Internal Server Error`: On server-side errors.

## Public API (Bins)

This endpoint is for accessing public or password-protected markdown documents ("bins").

---

### 1. Get a Public Markdown (Bin)

-   **Endpoint**: `GET /api/public/{binId}`
-   **Description**: Retrieves a public or password-protected document.
-   **Authentication**: Optional. If provided, it checks if the user is the owner to grant access even if the bin is private.
-   **URL Parameters**:
    -   `binId` (string): The ID of the public markdown document.
-   **Query Parameters**:
    -   `password` (string, optional): The password for password-protected bins.
-   **Responses**:
    -   `200 OK`: Success. Returns the public markdown object.
        ```json
        {
          "success": true,
          "markdown": { ... }
        }
        ```
    -   `401 Unauthorized`: If the bin is private and requires ownership, but the user is not authenticated.
    -   `403 Forbidden`: If the user is authenticated but is not the owner of a private bin.
    -   `404 Not Found`: If the bin does not exist or is private without proper access.
    -   `406 Not Acceptable`: If the bin requires a password and it's missing or incorrect.
    -   `500 Internal Server Error`: On server-side errors.
