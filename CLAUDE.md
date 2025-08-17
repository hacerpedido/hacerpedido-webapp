# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# HacerPedido WebApp - Claude Development Guide

## Overview
HacerPedido is a Next.js web application built with React Native Web that allows local businesses to receive orders via WhatsApp. It's a marketplace platform where customers can browse local shops by category and place orders directly through WhatsApp integration.

## Tech Stack

### Core Framework
- **Next.js 10.0.8** - React framework with SSR/SSG capabilities
- **React 16.13.1** - UI library
- **React Native Web 0.13.14** - Cross-platform component library for web
- **Redux Toolkit** - State management with Redux Persist for persistence

### Key Dependencies
- **Bootstrap 4.5.3** + **react-bootstrap** - UI components and styling
- **axios** - HTTP client for API requests
- **PostgreSQL** via **knex.js** - Database ORM
- **AWS SDK** - File uploads (S3 integration)
- **Sentry** - Error monitoring and performance tracking
- **Handsontable** - Spreadsheet-like data editing
- **react-hook-form** - Form handling
- **slugify** - URL slug generation

### Development Tools
- **Jest** - Testing framework
- **ESLint** + **Prettier** - Code linting and formatting
- **Babel** - JavaScript transpilation with React Native Web plugin

## Available Scripts

```bash
# Development
npm run dev           # Start development server (PORT=3001 npm run dev for custom port)
npm run build         # Production build
npm run start         # Start production server

# Code Quality
npm test              # Run Jest tests
npm run lint          # Run ESLint
npm run prettier      # Format code with Prettier

# Data Management
npm run import-data   # Import shop/product data
npm run svg           # Convert SVGs to React components
```

## Project Structure

### Core Directories
- **`pages/`** - Next.js pages and API routes
  - `pages/api/` - Backend API endpoints
  - `pages/[slug].jsx` - Dynamic shop pages
  - `pages/cart.jsx` - Shopping cart page
  - `pages/index.jsx` - Home page with shop listings

- **`components/`** - Reusable React components
  - `Cart/` - Shopping cart components
  - `Home/` - Homepage components (header, filter bar, shop cards)
  - `Shop/` - Individual shop view components
  - `EditShop/` - Shop management interface

- **`lib/`** - Core application logic
  - `lib/api/` - API client functions
  - `lib/reducers/` - Redux slices and store configuration
  - `lib/utils/` - Utility functions and helpers
  - `lib/hooks/` - Custom React hooks

- **`assets/`** - Static assets and styling
  - Theme configuration, colors, and icon components

### Key Configuration Files
- **`next.config.js`** - Next.js config with Sentry and React Native Web setup
- **`babel.config.js`** - Babel configuration for React Native Web
- **`jsconfig.json`** - JavaScript project configuration with baseUrl
- **`sentry.*.config.js`** - Sentry error monitoring setup

## Architecture Overview

### State Management (Redux)
The application uses Redux Toolkit with the following slices:
- **`appSlice`** - Global app state (loading, etc.)
- **`cartSlice`** - Shopping cart state
- **`homeSlice`** - Homepage state (shops, filters)
- **`shopSlice`** - Individual shop state
- **`shopEditSlice`** - Shop editing interface state

State is persisted using redux-persist, excluding app, shopEdit, and shop slices.

### Database Schema
Uses PostgreSQL with the following key tables:
- **`shops`** - Business listings with details like name, category, contact info, visibility
- **`products`** - Shop products (linked to shops)

### API Structure
- **Internal APIs** (`pages/api/`):
  - `/api/shop/home` - Get shops by category
  - `/api/shop/[slug]` - Get shop by slug
  - `/api/shop/by-token` - Shop management by token
  - `/api/image-upload` - Handle image uploads
  - `/api/image-delete` - Handle image deletion

- **External API**: `https://backend-restapi.hacerpedido.com:5001`

### React Native Web Integration
The app uses React Native Web components (View, Text, StyleSheet, FlatList, etc.) for cross-platform compatibility. Key configurations:
- Webpack alias maps `react-native` to `react-native-web`
- File extension resolution prioritizes `.web.js` files
- Babel plugin handles React Native Web transformations

## Key Features

### Shop Management
- Create and edit shop profiles
- Upload images (AWS S3 integration)
- Manage product catalogs with categories
- Set delivery costs, hours, contact information

### Customer Experience
- Browse shops by category (bebida, cafe, cerveceria, comida, farmacia, etc.)
- Filter and search functionality
- Add products to cart
- Generate WhatsApp messages for orders
- Mobile-responsive design

### WhatsApp Integration
Core functionality generates formatted WhatsApp messages including:
- Customer name and address
- Product list with quantities
- Order notes
- Direct links to WhatsApp with pre-filled messages

## Development Guidelines

### Component Patterns
- Use React Native Web components (View, Text, StyleSheet) instead of HTML elements
- StyleSheet.create() for component styling
- Functional components with hooks
- Redux hooks (useSelector, useDispatch) for state management

### API Patterns
- Use axios for HTTP requests
- Error handling with try/catch
- Sentry integration for error tracking
- Environment variables for configuration

### Styling Approach
- React Native StyleSheet objects
- Bootstrap classes for grid and utilities
- Custom colors defined in `assets/colors.js`
- Theme system in `assets/theme.js`
- Google Fonts: Barlow (primary) and Roboto Slab

### File Naming Conventions
- React components: PascalCase (.jsx extension)
- API routes: kebab-case (.js extension)
- Utilities: camelCase (.js extension)
- Pages follow Next.js conventions

## Environment Setup

### Required Environment Variables
- `PG_CONNECTION_STRING` - PostgreSQL database connection
- `SENTRY_DSN` or `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking
- AWS credentials for S3 uploads

### Local Development
1. Install dependencies: `npm install`
2. Set up PostgreSQL database
3. Configure environment variables
4. Run development server: `npm run dev`

### Important Notes
- **Node.js Compatibility**: This project uses Next.js 10.x which requires the `--openssl-legacy-provider` flag for Node.js 17+. This is already configured in package.json scripts.
- **Sentry**: Sentry is disabled in development mode to avoid authentication issues. It will only run in production when NODE_ENV is not 'development'.
- **Port Configuration**: Default port is 3000. Use `PORT=3001 npm run dev` to run on a different port if needed.

## Testing
- Jest configuration for unit testing
- Test files: `*.test.js` pattern
- Example tests in `lib/utils/`

## Special Considerations

### WhatsApp Number Formatting
The app includes special logic for Argentine phone numbers:
- Handles country code formatting (+54)
- Adds/removes the '9' for WhatsApp compatibility
- See `sanitizeWhatsAppNumber()` in utils

### Image Handling
- AWS S3 integration for image uploads
- Image cropping functionality
- Automatic image optimization

### SEO & Metadata
- OpenGraph meta tags configured
- Custom meta descriptions for shop pages
- Favicon and app icons configured

## Common Tasks

### Adding New Shop Categories
1. Update `lib/utils/categories.js`
2. Add corresponding background image in `public/images/backgrounds/`
3. Update filter UI in Home components

### Modifying Shop Fields
1. Update database schema
2. Modify API endpoints in `pages/api/shop/`
3. Update Redux slices
4. Update UI components

### Adding New Pages
1. Create page in `pages/` directory
2. Follow Next.js routing conventions
3. Add Redux state if needed
4. Update navigation components

This guide provides the essential context for understanding and working with the HacerPedido codebase efficiently.