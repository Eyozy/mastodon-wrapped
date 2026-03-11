# Mastodon Wrapped

<p align="center">
  <img src="./public/og.jpg" alt="Mastodon Wrapped Banner">
</p>

<p align="center">
  📊 Generate your personalized Mastodon year-end wrapped report
</p>

## Overview

Mastodon Wrapped is a web application that generates personalized annual reports for Mastodon users. Discover your posting patterns, engagement metrics, and yearly highlights in a beautiful, shareable format. Like Spotify Wrapped, but for the decentralized social network!

## ✨ Features

### 📊 Comprehensive Statistics

- **Social Impact Score**: Calculate your influence with dynamic ranking (Top 1% - 50%)
- **Posting Analytics**: View activity trends, content distribution, and posting rhythm
- **Persona Classification**: Discover if you're a Broadcaster, Curator, or Balancer
- **Chronotype Analysis**: Find out if you're a Night Owl, Early Bird, Slacker, or Regular
- **Activity Calendar**: Interactive heatmap showing your posting patterns throughout the year

### 📅 Multi-Year Support

- **Year Selection**: Switch between different years to compare your activity
- **Smart Detection**: Automatically detects available years from your account registration date
- **Timezone Modes**: View statistics in local time or UTC for accurate cross-timezone analysis

### 🔒 Privacy-First

- **No Login Required**: Simply enter your Mastodon handle
- **Public Data Only**: We only access publicly available posts
- **Local Processing**: Your data never leaves your browser
- **No Tracking**: Zero analytics or data collection

### 🌐 Internationalization

- **English & Chinese**: Full support for both languages
- **Auto-detection**: Automatically detects browser language

### 📤 Export & Share

- **PNG Export**: Download your wrapped report as a high-quality image
- **CORS Proxy Fallback**: Multiple proxy support for reliable image export

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Eyozy/mastodon-wrapped.git
   cd mastodon-wrapped
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
mastodon-wrapped/
├── public/                     # Static assets
│   └── og.jpg                  # OpenGraph image
├── src/
│   ├── components/             # React components
│   │   ├── LandingPage.jsx     # Input form and landing UI
│   │   ├── StatsDisplay.jsx    # Statistics dashboard (12 stat cards + 3 charts)
│   │   ├── ActivityHeatmap.jsx # Calendar heatmap with unified color config
│   │   ├── ErrorBoundary.jsx   # Error handling wrapper
│   │   └── ui/                 # Reusable UI components
│   ├── services/               # API services
│   │   └── mastodonApi.js      # Mastodon API with timeout, retry, and SSRF protection
│   ├── utils/                  # Utility functions
│   │   ├── dataAnalyzer.js     # Statistics calculation with XSS protection
│   │   ├── translations.js     # i18n strings (en/zh)
│   │   └── imageDownloader.js  # PNG export with CORS proxy fallback
│   ├── App.jsx                 # Main app component with state management
│   └── main.jsx                # Entry point
├── index.html                  # HTML template
└── README.md
```

## 🎯 Key Features

### Social Impact Ranking

Your score is calculated based on:

- Reblogs received × 2
- Favorites received
- Total posts × 0.1
- Longest streak × 5

| Score   | Ranking |
| ------- | ------- |
| ≥10,000 | Top 1%  |
| ≥5,000  | Top 5%  |
| ≥1,000  | Top 15% |
| ≥500    | Top 30% |
| ≥100    | Top 50% |
| <100    | Growing |

### Persona Classification

Based on your posting behavior:

| Persona         | Criteria              |
| --------------- | --------------------- |
| The Broadcaster | >60% original content |
| The Curator     | >60% boosts           |
| The Balancer    | Mixed posting style   |

### Chronotype Analysis

Based on posting hours:

| Chronotype  | Criteria                                |
| ----------- | --------------------------------------- |
| Night Owl   | >15% posts between 0-5am                |
| Early Bird  | >30% posts between 5-10am               |
| Slacker     | >60% posts during work hours (10am-6pm) |
| The Regular | Balanced posting schedule               |

## 📊 API Reference

The application uses the public Mastodon API:

| Endpoint                                | Purpose             |
| --------------------------------------- | ------------------- |
| `/api/v1/accounts/lookup?acct={handle}` | Account lookup      |
| `/api/v1/accounts/{id}/statuses`        | Fetch user statuses |

**Rate limiting**: 50ms delay between pagination requests with automatic retry on HTTP 429.

## 🌐 Deployment

### Vercel (Recommended)

1. Fork or push your code to GitHub

2. Go to [Vercel](https://vercel.com) and sign in with GitHub

3. Click **"Add New Project"** and import your repository

4. Vercel will auto-detect Vite. Verify the settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Click **"Deploy"** and wait for the build to complete

6. Your site will be available at `https://your-project.vercel.app`

### Netlify

1. Go to [Netlify](https://netlify.com) and sign in with GitHub

2. Click **"Add new site"** → **"Import an existing project"**

3. Select **GitHub** as your Git provider and authorize Netlify to access your repositories

4. Choose your `mastodon-wrapped` repository from the list

5. Configure the build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`

6. Click **"Deploy site"** and wait for the build to complete

7. Your site will be live with a random subdomain (e.g., `random-name.netlify.app`)

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the [MIT](LICENSE) License.

## 🙏 Acknowledgments

- Inspired by [Kate Deyneka](https://x.com/i/status/1998855377409159457)
- Built for [Mastodon](https://joinmastodon.org/)
- UI powered by [React](https://react.dev/) + [Vite](https://vite.dev/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Animations by [Framer Motion](https://motion.dev/)
- Activity calendar by [react-calendar-heatmap](https://github.com/kevinsqi/react-calendar-heatmap)
- Image export by [@zumer/snapdom](https://github.com/nicxgao/snapDOM)
- Icons by [Remix Icon](https://remixicon.com/)
