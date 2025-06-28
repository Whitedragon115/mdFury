<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Markdown Previewer Project Instructions

This is a modern markdown previewer built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui components.

## Project Structure
- Built with Next.js 15 App Router
- Uses TypeScript for type safety
- Styled with Tailwind CSS v4
- Uses shadcn/ui components for consistent UI
- Markdown parsing with react-markdown, remark-gfm, and rehype plugins
- Syntax highlighting with highlight.js

## Code Style Guidelines
- Use functional components with hooks
- Prefer TypeScript interfaces over types where appropriate
- Follow Next.js 15 App Router conventions
- Use shadcn/ui components when possible
- Implement responsive design with Tailwind CSS
- Use proper semantic HTML elements

## Key Features
- Live markdown preview with split-pane view
- Dark/Light mode toggle
- Copy to clipboard functionality
- Download markdown as file
- Responsive design with mobile-first approach
- Syntax highlighting for code blocks
- GitHub Flavored Markdown support

## Dependencies
- react-markdown: For markdown rendering
- remark-gfm: GitHub Flavored Markdown support
- rehype-highlight: Code syntax highlighting
- rehype-raw: HTML support in markdown
- lucide-react: Icons
- shadcn/ui components: UI components

When making changes:
1. Ensure components are accessible
2. Maintain consistent styling with the existing design system
3. Test both light and dark modes
4. Ensure responsive behavior on all screen sizes
5. Follow React best practices for performance
