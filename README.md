# Research-Bee

A cross-platform application for collaborative research management and organization.

## Project Structure

This is a monorepo built with Turborepo containing:

- `apps/expo`: React Native app built with Expo
- `apps/next`: Next.js web app
- `packages/ui`: Shared UI components using Tamagui
- `packages/api`: Shared API layer and business logic

## Tech Stack

- **Frontend**: React Native (Expo) and Next.js
- **UI Framework**: Tamagui
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Backend Services**: Supabase
- **Payments**: Stripe
- **Internationalization**: i18next and expo-localization
- **Monorepo Management**: Turborepo

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- Expo CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/research-bee.git
cd research-bee

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
```

### Development

```bash
# Start web development server
yarn web

# Start Expo development server
yarn native

# Build the UI package
yarn build:ui
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the required variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
```

## Features

- Cross-platform sharing of components between web and mobile
- Authentication with Supabase
- Research project management
- Collaboration tools
- Document storage and organization
- Subscription management with Stripe

## License

MIT

# Trigger new Vercel Build
