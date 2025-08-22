# Public Mode Feature Implementation

## Overview

Successfully implemented a **Public Mode** feature that allows anonymous users to create markdown documents without requiring authentication.

## Environment Configuration

Added the following setting to `.env`:

```bash
PUBLIC_MODE=true
```

When `PUBLIC_MODE=true`, anonymous users can:

- Create new markdown documents without logging in
- Set custom bin IDs and titles
- Add tags to their documents
- Set optional passwords for document protection
- Access the full markdown editor interface

## Key Features

### 1. Anonymous Document Creation

- Anonymous users can create documents via `/api/markdowns/anonymous`
- Documents are automatically set to public visibility
- Documents are associated with `userId: "anonymous"`
- No ownership tracking (users cannot edit/delete after creation)

### 2. Frontend Support

- Modified `MarkdownPreviewer` to detect public mode status
- Shows document creation controls to anonymous users when public mode is enabled
- Hides privacy controls for anonymous users (documents are always public)
- Displays helpful notice: "Anonymous documents are always public"

### 3. API Integration

- New API endpoint: `POST /api/markdowns/anonymous`
- Configuration endpoint: `GET /api/config/public-mode`
- Enhanced `IntegratedMarkdownService` with anonymous support methods

### 4. UI/UX Improvements

- Modified `BinControls` component to support anonymous mode
- Added `isAnonymous` prop to hide privacy controls
- Maintained consistent user experience between authenticated and anonymous modes

## Security Considerations

- Anonymous documents cannot be made private
- No user data collection for anonymous users
- Password protection still available for anonymous documents
- No ability to track or manage anonymous documents after creation

## Technical Implementation

### Files Modified

1. `.env` - Added `PUBLIC_MODE` setting
2. `src/app/api/markdowns/anonymous/route.ts` - New API endpoint
3. `src/app/api/config/public-mode/route.ts` - Configuration endpoint
4. `src/lib/api/markdown-storage.ts` - Added `saveAnonymousMarkdown` method
5. `src/lib/api/integrated-markdown.ts` - Added client-side anonymous support
6. `src/components/MarkdownPreviewer.tsx` - Added public mode detection and anonymous save logic
7. `src/components/forms/BinControls.tsx` - Added anonymous mode UI support
8. `API-README.md` - Updated documentation with new endpoints

### Database Impact

- Anonymous documents are linked to a special anonymous user (`anonymous@mdfury.local`)
- All anonymous documents have `isPublic: true`
- Bin IDs follow same validation rules as authenticated users
- Anonymous user is automatically created when first anonymous document is saved

### Setup Requirements

1. Set `PUBLIC_MODE=true` in `.env`
2. The anonymous user will be created automatically on first use, or you can pre-create it by running:

   ```bash
   node scripts/create-anonymous-user.js
   ```

## Usage

1. Set `PUBLIC_MODE=true` in `.env`
2. Restart the application
3. Visit the home page without logging in
4. Create and save markdown documents anonymously
5. Share the generated bin links with others

## Benefits

- Lower barrier to entry for new users
- Allows testing the editor without account creation
- Useful for quick document sharing scenarios
- Maintains security while providing accessibility
