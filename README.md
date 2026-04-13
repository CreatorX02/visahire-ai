# VisaHire AI 🌍✈️

> **AI-autonomous visa-sponsored job scraper mobile app** — Find your dream job with visa sponsorship, powered by AI.

## Overview

VisaHire AI is a React Native / Expo mobile app that helps international job seekers discover and apply to visa-sponsored roles worldwide. The AI assistant scrapes 200+ career portals daily and matches jobs to your profile.

## Features

- 🤖 **AI-Powered Job Matching** — Personalized job scores based on your skills, visa status, and preferences
- 🛡️ **Visa Sponsorship Filter** — One tap to see only visa-sponsored roles (H-1B, EU Blue Card, Tier 2, etc.)
- 🌐 **Global Coverage** — Jobs from US, UK, Canada, Germany, Netherlands, Sweden, Australia, Singapore and more
- ⚡ **Auto-Scraped Daily** — 200+ career portals scraped and aggregated every hour
- 💬 **AI Career Coach** — Chat assistant for visa guidance, resume tips, and interview prep
- 📊 **Application Tracker** — Track the status of every application in one place
- 🔖 **Saved Jobs** — Bookmark jobs for later, with status badges (Applied, Interview, Offer, etc.)
- 👤 **Profile & Preferences** — Set your visa status, preferred locations, and categories

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 54 + React Native 0.77 |
| Navigation | [Expo Router](https://expo.github.io/router) v6 (file-based) |
| State Management | [Zustand](https://github.com/pmndrs/zustand) v5 |
| Styling | React Native StyleSheet + [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) |
| Icons | [@expo/vector-icons](https://docs.expo.dev/guides/icons/) (Ionicons) |
| Language | TypeScript (strict mode) |

## Project Structure

```
visahire-ai/
├── app/
│   ├── _layout.tsx          # Root layout (GestureHandler, StatusBar, SplashScreen)
│   ├── index.tsx            # Entry redirect (onboarding → auth → tabs)
│   ├── onboarding.tsx       # 4-step onboarding carousel
│   ├── (auth)/
│   │   ├── login.tsx        # Login screen
│   │   └── register.tsx     # Register screen (with visa status picker)
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab bar with icons + badge
│   │   ├── index.tsx        # Home/Dashboard
│   │   ├── search.tsx       # Job search + filters
│   │   ├── saved.tsx        # Saved jobs + application tracker
│   │   ├── assistant.tsx    # AI chat assistant
│   │   └── profile.tsx      # Profile + settings
│   └── job/
│       └── [id].tsx         # Job detail (overview / requirements / benefits tabs)
├── components/
│   ├── JobCard.tsx          # Reusable job card with AI match score
│   ├── SearchBar.tsx        # Search input component
│   ├── FilterChip.tsx       # Toggle chip for filters
│   ├── AIChatBubble.tsx     # Chat message bubble
│   └── ScreenHeader.tsx     # Reusable header with back/badge
├── constants/
│   ├── theme.ts             # Colors, Spacing, Radius, FontSize, Shadow
│   └── data.ts              # Mock jobs, user, notifications, AI prompts
├── store/
│   └── useStore.ts          # Zustand store (auth, jobs, search, chat, saved)
└── types/
    └── index.ts             # TypeScript types (Job, User, SearchFilters, etc.)
```

## Screens

| Screen | Description |
|---|---|
| Onboarding | 4-slide carousel introducing the app |
| Login | Email/password login with "Continue with Google" |
| Register | Sign up with name, email, password, and visa status |
| Home | Dashboard with AI banner, categories, featured jobs, country picker, notifications |
| Search | Full-text search + visa/remote/type/level/sort filters |
| Job Detail | Company info, salary, AI match score, overview/requirements/benefits tabs, apply CTA |
| Saved Jobs | Bookmarked jobs with application status badges |
| AI Assistant | Chat interface with quick prompts and AI responses |
| Profile | User stats, skills, preferred locations, settings toggles, logout |

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/client) app on your phone, OR Android Emulator / iOS Simulator

### Installation

```bash
git clone https://github.com/CreatorX02/visahire-ai.git
cd visahire-ai
npm install --legacy-peer-deps
```

### Running

```bash
# Start development server
npm start

# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

### Type Check

```bash
npx tsc --noEmit
```

## Design System

The app uses a dark theme with a purple/teal accent palette:

- **Background**: `#0A0F1E` (deep navy)
- **Cards**: `#141929`
- **Primary**: `#6C63FF` (indigo/purple)
- **Secondary**: `#00D4AA` (teal — used for visa sponsorship badges)
- **Accent**: `#FF6B6B` (coral red)

## License

MIT — see [LICENSE](./LICENSE)

