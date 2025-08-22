# mdFury API Tester

Interactive command-line tool for testing mdFury API endpoints.

## Quick Start

```bash
node api-tester.js
```

## Features

- 🔧 **Configuration Management**: Set base URL, API tokens, and invite keys
- 🔐 **Authentication**: Register, login, profile management
- 📝 **Markdown Operations**: CRUD operations for markdown documents
- 🎫 **Invite System**: Generate and validate invite codes
- 🛠️ **Utilities**: Connection testing, JSON formatting, response inspection

## Menu Structure

### 1. Configuration
- Set base URL (default: http://localhost:3000/api)
- Set API token for authenticated requests
- Set invite key for admin operations
- Save/load configuration

### 2. Authentication
- Register new user (with optional invite code)
- Login existing user
- View user profile
- Update profile (display name, language, theme)
- Generate API token

### 3. Markdown Management
- List all markdowns
- Create new markdown
- Get markdown by ID
- Update existing markdown
- Delete markdown
- Get public markdown by bin ID

### 4. Invite System
- Validate invite codes
- Admin: Verify invite key
- Admin: Generate new invite codes
- Admin: View statistics and history

### 5. Utilities
- Check public mode status
- View last API response
- Pretty print JSON
- Test server connection

## Configuration File

The tool saves configuration in `api-tester-config.json`:

```json
{
  "baseUrl": "http://localhost:3000/api",
  "apiToken": "your-api-token",
  "inviteKey": "your-invite-key"
}
```

## Example Workflow

1. Start the tester: `node api-tester.js`
2. Set configuration (base URL, tokens)
3. Register or login a user
4. Generate API token for authenticated requests
5. Create and manage markdown documents
6. Test invite system functionality

## API Endpoints Covered

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PATCH /auth/profile` - Update profile
- `POST /auth/token` - Generate API token

### Markdowns
- `GET /markdowns` - List user markdowns
- `POST /markdowns` - Create markdown
- `GET /markdowns/:id` - Get specific markdown
- `PATCH /markdowns/:id` - Update markdown
- `DELETE /markdowns/:id` - Delete markdown
- `GET /public/:binId` - Get public markdown

### Invite System
- `POST /invite/validate` - Validate invite code
- `POST /admin/invite/verify` - Verify admin key
- `POST /admin/invite/generate` - Generate invite code
- `POST /admin/invite/stats` - Get invite statistics

### Configuration
- `GET /config/public-mode` - Check public mode status

## Tips

- Use colored output to easily distinguish request/response data
- Configuration is automatically saved and loaded
- Set API token once for all authenticated requests
- Use the utilities menu to test connectivity and format JSON
- Exit anytime with Ctrl+C

## Requirements

- Node.js
- Running mdFury server (default: localhost:3000)
