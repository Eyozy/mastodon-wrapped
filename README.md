# Mastodon Wrapped

<p align="center">
  <img src="./public/og.jpg" alt="Mastodon Wrapped Banner" width="800">
</p>

<p align="center">Generate your personalized Mastodon year-end wrapped report. Like Spotify Wrapped, but for the decentralized social network!
</p>

## Features

### Comprehensive Statistics

- **Social Impact Score**: Calculate your influence with dynamic ranking from Top 1% to 50%
- **Posting Analytics**: View activity trends, content distribution, and posting rhythm throughout the year
- **Persona Classification**: Discover your posting personality - whether you're a Broadcaster, Curator, or Balancer
- **Chronotype Analysis**: Find out your activity pattern - Night Owl, Early Bird, Slacker, or Regular
- **Activity Calendar**: Interactive heatmap showing your posting patterns across the entire year

### Multi-Year Support

- **Year Selection**: Switch between different years to compare your activity over time
- **Smart Detection**: Automatically detects available years based on your account registration date
- **Timezone Modes**: View statistics in local time or UTC for accurate cross-timezone analysis

### Privacy-First

- **No Login Required**: Simply enter your Mastodon handle to get started
- **Public Data Only**: We only access publicly available posts
- **Local Processing**: Your data never leaves your browser
- **Zero Tracking**: No analytics or data collection whatsoever

### Internationalization

- **English & Chinese**: Full support for both languages
- **Auto-detection**: Automatically detects your browser language

### Export & Share

- **PNG Export**: Download your wrapped report as a high-quality image
- **CORS Proxy Fallback**: Multiple proxy support ensuring reliable image export

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Eyozy/mastodon-wrapped.git
cd mastodon-wrapped

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Project Structure

```
mastodon-wrapped/
├── public/
│   └── og.jpg                       # Static assets
├── src/
│   ├── components/                  # React components
│   │   ├── LandingPage.jsx          # Entry page with input form
│   │   ├── StatsDisplay.jsx         # Statistics dashboard (12 cards + 3 charts)
│   │   ├── StatsReport.jsx          # Individual report cards
│   │   ├── ActivityHeatmap.jsx      # Activity heatmap
│   │   ├── ErrorBoundary.jsx        # Error boundary
│   │   └── ui/                      # Reusable UI components
│   │       ├── icons.jsx            # Icon components
│   │       ├── loading-modal.jsx
│   │       ├── loading-spinner.jsx
│   │       └── progress.jsx
│   ├── services/                    # API services
│   │   └── mastodonApi.js           # Mastodon API (timeout, retry, SSRF protection)
│   ├── utils/                       # Utility functions
│   │   ├── dataAnalyzer.js          # Statistics calculation (XSS protection)
│   │   ├── translations.js          # i18n strings (en/zh)
│   │   └── imageDownloader.js       # PNG export (CORS proxy fallback)
│   ├── lib/                         # Core utilities and constants
│   │   └── utils.js                 # App state, timezone modes, constants
│   ├── App.jsx                      # Main app component
│   └── main.jsx                     # Entry point
├── test/                            # Unit tests
│   └── analyzeStatuses.test.js      # Data analyzer tests
├── index.html                       # HTML template
└── README.md
```

## Scoring Rules

### Social Impact Score

Formula:

```
Score = Reblogs × 2 + Favorites + Posts × 0.1 + Longest Streak × 5
```

Ranking thresholds:

- 10,000 and above → Top 1%
- 5,000 and above → Top 5%
- 1,000 and above → Top 15%
- 500 and above → Top 30%
- 100 and above → Top 50%
- Below 100 → Growing

### Persona Classification

Automatically classified based on your posting behavior:

- **The Broadcaster**: More than 60% original content
- **The Curator**: More than 60% boosts
- **The Balancer**: A mix of both

### Chronotype Analysis

Identified based on your posting hours:

- **Night Owl**: More than 15% posts between midnight and 5am
- **Early Bird**: More than 30% posts between 5am and 10am
- **Slacker**: More than 60% posts during work hours (10am to 6pm)
- **The Regular**: Balanced posting schedule

## API Reference

The application uses Mastodon's public API:

- **Account Lookup**: `/api/v1/accounts/lookup?acct={handle}`
- **Fetch Statuses**: `/api/v1/accounts/{id}/statuses`

Rate limiting includes a 50ms delay between pagination requests with automatic retry when receiving HTTP 429.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and sign in with GitHub
3. Click **Add New Project** and import your repository
4. Vercel auto-detects Vite. Verify these settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy** and wait for the build to complete
6. Your site will be available at `https://your-project.vercel.app`

### Netlify

1. Go to [Netlify](https://netlify.com) and sign in with GitHub
2. Click **Add new site** → **Import an existing project**
3. Select GitHub as your provider
4. Choose the `mastodon-wrapped` repository
5. Configure build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
6. Deploy and get your site address

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

This project is licensed under the [MIT](LICENSE) License.
