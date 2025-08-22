# mdFury — Modern Markdown Editor & Document Management

> This is a Vibe Project, so the bugs goes brrrrr

A modern Markdown editor built with Next.js 15, TypeScript, and Tailwind CSS, featuring live preview, document storage/sharing, dark/light/system themes, internationalization, and OAuth login (Google/GitHub).

## ✨ Features

-   Live preview with a split-pane view (Editor/Preview/Split)
-   GitHub Flavored Markdown (remark-gfm) and code syntax highlighting (rehype-highlight)
-   Document management: Create, update, copy, delete, search, and tag
-   Sharing/public links, private/password-protected documents (Bin pages)
-   OAuth (Google/GitHub) and local credentials login (NextAuth)
-   Dark/Light/System themes, with customizable background image, blur, brightness, and opacity
-   Internationalization (i18next + react-i18next), with built-in support for `en` and `zh`
-   User-friendly UI (shadcn/ui + Tailwind v4), React 19, and a great developer experience with Turbopack

## 🧱 Tech Stack

-   **Frontend**: Next.js 15 (App Router), React 19, TypeScript
-   **Styling**: Tailwind CSS v4, shadcn/ui, lucide-react
-   **Markdown**: react-markdown, remark-gfm, rehype-raw, rehype-highlight
-   **State/Tools**: react-hot-toast, next-themes, i18next
-   **Authentication**: NextAuth (OAuth + Credentials), Prisma Adapter
-   **Database**: Prisma ORM, MySQL

## 📁 Project Structure (Excerpt)

-   `src/app`: App Router pages (including `/bin/[id]`, `/bin/[id]/edit`, `/login`, `/settings`)
-   `src/components`: UI and page components (`MarkdownPreviewer`, `SettingsPanel`, `AccountDropdown`, etc.)
-   `src/contexts`: `AuthContext`, `NextAuthContext`
-   `src/hooks`: `useIntegratedAuth`, `useBackgroundPreview`
-   `src/lib`: Auth configuration, API clients, Prisma initialization
-   `prisma/schema.prisma`: Prisma models (User, Markdown, Account, Session)

## 🚀 Quick Start

### Prerequisites

-   Node.js 18+ (20 recommended)
-   MySQL (provide a connection string)

### Install Dependencies

```bash
npm install
```

### Set Up Environment Variables

Create a `.env` file (you can reference `.env.example`):

```bash
DATABASE_URL="mysql://<user>:<password>@<host>:<port>/<db>?sslaccept=strict"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<your-random-secret>"

# OAuth (enable as needed)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

For detailed Google OAuth setup steps, please see `GOOGLE_OAUTH_SETUP.md`.

### Initialize Database (Prisma)

```bash
# Generate/apply migrations and generate Prisma Client
npx prisma migrate dev
```

Optional: Create a demo user (if the script is available):

```bash
node scripts/setup-demo.js
```

### Start the Development Server

```bash
npm run dev
```

Default URL: [http://localhost:3000](http://localhost:3000)

## 🔐 Login & Accounts

-   Supports local credential login and OAuth (Google/GitHub).
-   On the first OAuth login, the provider's name/avatar will be synced to the user's profile.
-   Users can adjust theme, background preferences, and language on the settings page.
-   A "Guest Mode" is available for users who are not logged in (documents cannot be saved).

## 📝 Main Features Overview

-   **Editor**: Live preview, copy, download, save, title, and tags.
-   **My Documents**: List, search, filter by tags, set public/private, delete, and copy.
-   **Bin Page**: Share via `/bin/[id]`; can be password-protected; authors can edit at `/bin/[id]/edit`.
-   **Appearance**: Dark/Light/System themes, with adjustments for background image blur, brightness, and opacity.
-   **Internationalization**: Switch languages (en/zh) in the top-right corner; text is managed in `src/locales`.

## 📜 NPM Scripts

-   `npm run dev`: Run in development mode (Turbopack)
-   `npm run build`: Build for production
-   `npm run start`: Start the production server
-   `npm run lint`: Run ESLint checks

VS Code users can run the "Dev Server" task from the Tasks menu.

## 🧭 Development Recommendations

-   Use functional components with React Hooks.
-   Prefer TypeScript interfaces where appropriate.
-   Maintain a consistent design with shadcn/ui + Tailwind v4.
-   Ensure components are accessible (a11y) and follow a mobile-first approach.
-   Test in both light and dark modes.

## ☁️ Deployment Highlights

-   Set `NEXTAUTH_URL` to your production domain.
-   Configure the production `DATABASE_URL`.
-   Set the correct "Authorized redirect URIs" in your OAuth provider's settings.
-   Run `prisma migrate deploy` before starting the service.

## 🛠️ Troubleshooting

-   **OAuth Errors**: The project has a built-in error dialog (`OAuthErrorDialog`). Common issues include unlinked accounts or callback failures.
-   **Login Display Issues**: Clear your browser cache and cookies, and verify your `NEXTAUTH` environment variables.
-   **Database Errors**: Check your `DATABASE_URL` and ensure migrations have been applied correctly.
-   **Styling Issues**: Verify your Tailwind v4 and PostCSS configurations.

---
For more assistance, please open an Issue with reproduction steps, your browser version, and excerpts from server/terminal logs.
