# Calendar App

A Vue.js calendar application with weather integration for reminders.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd calendar-app-vue
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp env.example .env
```

4. Add your OpenWeatherMap API key to `.env`

```env
VITE_OPENWEATHER_API_KEY=your-api-key-here
```

Get your free API key at: https://openweathermap.org/api

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Monthly calendar view with navigation
- Create, edit, and delete reminders
- Weather integration for reminder locations
- Smart caching to minimize API calls

## Demo

_Live demo will be available soon_

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Pinia (State Management)
- OpenWeatherMap API
