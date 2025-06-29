> ok so because someone is too lazy to write ReadMe.md with his shitty english skill by him self, so he just leave it to AI

# 📝 mdFury - Modern Markdown Editor & Previewer

## Project Still Under Developement!

<div align="center">

![mdFury Logo](https://img.shields.io/badge/mdFury-Modern%20Markdown%20Editor-blue?style=for-the-badge&logo=markdown&logoColor=white)

A powerful, beautiful markdown editor with real-time preview, built with Next.js 15, TypeScript, and modern web technologies ✨

[![GitHub](https://img.shields.io/github/license/Whitedragon115/mdFury?style=flat-square)](https://github.com/Whitedragon115/mdFury)
[![GitHub stars](https://img.shields.io/github/stars/Whitedragon115/mdFury?style=flat-square)](https://github.com/Whitedragon115/mdFury/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Whitedragon115/mdFury?style=flat-square)](https://github.com/Whitedragon115/mdFury/issues)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[🚀 Live Demo](https://mdFury.vercel.app) • [📖 Documentation](#-features) • [⚡ Quick Start](#-quick-start) • [🤝 Contributing](#-contributing)

</div>

---

## 🎯 Overview

mdFury is a state-of-the-art markdown editor that combines the power of modern web technologies with an intuitive, beautiful interface. Whether you're a developer documenting code, a writer crafting content, or a student taking notes, mdFury provides the perfect environment for markdown editing with real-time preview capabilities.

## 🌟 Features

### ✨ Core Features

- 🔥 **Real-time Live Preview** - Instant markdown rendering with responsive split-pane view
- 📱 **Fully Responsive Design** - Seamless experience across desktop, tablet, and mobile devices
- 🌓 **Dark/Light Mode Toggle** - Beautiful themes with automatic system preference detection
- ⚡ **Blazing Fast Performance** - Built with Next.js 15 App Router and optimized for speed
- 🎭 **Guest Mode Support** - Use instantly without authentication for quick edits
- 🎯 **Modern UI/UX** - Clean, intuitive interface built with shadcn/ui components

### 📝 Editor Features

- 🎯 **GitHub Flavored Markdown (GFM)** - Complete support for tables, code blocks, strikethrough, task lists
- 🎨 **Advanced Syntax Highlighting** - Beautiful code highlighting powered by highlight.js
- 📊 **Rich Table Support** - Easy table creation, editing, and formatting
- 🔗 **Smart Auto-linking** - Automatic URL and email address detection
- 💾 **Auto-save Functionality** - Never lose your work with intelligent auto-saving
- 📋 **One-click Copy to Clipboard** - Instant content copying with toast notifications
- 📥 **Download as Markdown File** - Export your content instantly as .md files
- 🔍 **Word Wrapping in Code Blocks** - Improved readability with proper text wrapping
- 📏 **Multiple View Modes** - Split view, editor-only, and preview-only modes

### 🔐 User Management & Authentication

- 👤 **Secure User Authentication** - Robust login system powered by NextAuth.js
- 💾 **Document Management System** - Save, organize, and manage your markdown documents
- 🏷️ **Tags & Categorization** - Organize documents with custom tags and categories
- 🔒 **Privacy Controls** - Public/private document visibility settings
- ⚙️ **Customizable User Settings** - Personalize your editing experience
- 📂 **Document History** - Track and manage document versions
- 🔄 **Cloud Synchronization** - Access your documents from anywhere

### 🌍 Internationalization

- 🇺🇸 **English** - Complete English language support
- 🇨🇳 **Chinese (Simplified)** - Full Chinese localization with traditional character support
- 🔄 **Dynamic Language Switching** - Switch languages without page reload
- 🌐 **Extensible i18n Framework** - Easy to add more languages

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ installed on your system
- **Package Manager**: npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Whitedragon115/mdFury.git
   cd mdFury
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see mdFury in action!

### Environment Setup (Optional)

For authentication and database features, create a `.env.local` file:

```bash
# NextAuth.js configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database configuration (if using)
DATABASE_URL=your-database-url
```

## 🛠️ Tech Stack

### Frontend Framework & Language
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5+](https://www.typescriptlang.org/)
- **React**: [React 19](https://react.dev/)

### Styling & UI
- **CSS Framework**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)

### Markdown Processing
- **Core**: [react-markdown](https://github.com/remarkjs/react-markdown)
- **GitHub Flavored Markdown**: [remark-gfm](https://github.com/remarkjs/remark-gfm)
- **Syntax Highlighting**: [rehype-highlight](https://github.com/rehypejs/rehype-highlight)
- **HTML Support**: [rehype-raw](https://github.com/rehypejs/rehype-raw)
- **Highlighter**: [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)

### Authentication & Internationalization
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/)
- **Internationalization**: [react-i18next](https://react.i18next.com/)
- **Language Detection**: [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector)

### Development Tools
- **Linting**: [ESLint 9](https://eslint.org/)
- **Package Management**: npm/yarn/pnpm/bun
- **Fonts**: [Geist Font Family](https://vercel.com/font)

## 📖 Usage Guide

### Basic Usage

1. **Create a New Document**: Click on the mdFury logo to start with a fresh document
2. **Write Markdown**: Use the left panel to write your markdown content
3. **Live Preview**: See real-time preview in the right panel
4. **Toolbar Actions**: Use toolbar buttons for copy, download, and save operations

### View Modes

- **Split View (Default)**: Edit and preview side by side for optimal workflow
- **Editor Mode**: Full-width editor for focused writing
- **Preview Mode**: Full-width preview for reading and reviewing

### User Features (Authentication Required)

1. **Document Management**: 
   - Save documents with custom names and descriptions
   - Access your document library via the account menu
   - Organize documents with tags and categories

2. **Settings & Preferences**:
   - Customize editor preferences
   - Manage account settings
   - Configure privacy options

3. **Document Sharing**:
   - Share documents via public URLs
   - Set privacy levels (public/private)
   - Collaborate with others

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save Document | `Ctrl/Cmd + S` |
| Copy Content | `Ctrl/Cmd + C` |
| Toggle Theme | `Ctrl/Cmd + Shift + T` |
| Toggle View Mode | `Ctrl/Cmd + Shift + V` |

## 🎨 Screenshots & Demo

### 🌅 Light Mode Interface
*Clean, modern interface perfect for daytime work*

### 🌙 Dark Mode Interface
*Eye-friendly dark theme for comfortable late-night coding*

### 📱 Mobile Responsive Design
*Seamless experience across all device sizes*

### ⚡ Live Preview in Action
*Real-time markdown rendering as you type*

## 🏗️ Project Structure

```
mdFury/
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── docs/          # Documents management page
│   │   ├── login/         # Authentication page
│   │   ├── settings/      # User settings page
│   │   └── layout.tsx     # Root layout
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── ...           # Custom components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utility functions
│   └── locales/          # i18n translations
├── components.json       # shadcn/ui configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Project dependencies
```

## 🧪 Development

### Running Tests

```bash
npm run test
# or
yarn test
```

### Building for Production

```bash
npm run build
npm start
```

### Code Quality

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help make mdFury even better:

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
4. **Make your changes** following our guidelines
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request** with a detailed description

### Development Guidelines

- **Code Style**: Follow the existing TypeScript and React patterns
- **Responsive Design**: Ensure all changes work on desktop, tablet, and mobile
- **Accessibility**: Maintain WCAG 2.1 AA compliance
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update documentation for new features
- **i18n**: Add translations for new user-facing text

### Areas for Contribution

- 🌐 **Translations**: Help us support more languages
- 🎨 **UI/UX**: Improve the interface and user experience
- 🐛 **Bug Fixes**: Report and fix bugs
- ✨ **Features**: Add new functionality
- 📚 **Documentation**: Improve guides and examples
- 🧪 **Testing**: Increase test coverage

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

The MIT License allows you to:
- ✅ Use the software for any purpose
- ✅ Modify and distribute the software
- ✅ Include in commercial products
- ✅ Grant sublicenses

## 🙏 Acknowledgments

We extend our gratitude to the amazing open-source community and the following projects:

- **[Next.js](https://nextjs.org/)** - The React framework that powers mdFury
- **[Tailwind CSS](https://tailwindcss.com/)** - For the beautiful utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - For the elegant and accessible UI components
- **[react-markdown](https://github.com/remarkjs/react-markdown)** - For powerful markdown rendering
- **[Lucide](https://lucide.dev/)** - For the beautiful, consistent icons
- **All contributors** who help make this project better

## 📞 Support & Community

### Get Help
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Whitedragon115/mdFury/issues)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/Whitedragon115/mdFury/issues)
- 📚 **Documentation**: Check our [Wiki](https://github.com/Whitedragon115/mdFury/wiki)

### Connect with Us
- 💬 **Discord**: `darkingfury` (Direct messages open)
- 🐙 **GitHub**: [@Whitedragon115](https://github.com/Whitedragon115)
- ☕ **Support the Project**: [Buy me a coffee](https://buymeacoffee.com/darklightfury)

### Join the Community
- ⭐ **Star the repository** if you find it helpful
- 🍴 **Fork the project** to contribute
- 📢 **Share mdFury** with your friends and colleagues
- 💝 **Sponsor development** to help us grow

## 📊 Project Metrics

- 🚀 **Launched**: June 29, 2025
- 📦 **Version**: 1.0.0
- 🏗️ **Built with**: Next.js 15, TypeScript, Tailwind CSS
- 📱 **Platform Support**: Web (Desktop & Mobile)
- 🌐 **Languages**: English, Chinese (Simplified)
- ⚡ **Performance**: Lighthouse Score 95+

---

<div align="center">

**Made with ❤️ by [Whitedragon115](https://github.com/Whitedragon115)**

*If you find mdFury helpful, please consider giving it a ⭐ on GitHub!*

**[⬆ Back to Top](#-mdFury---modern-markdown-editor--previewer)**

</div>
