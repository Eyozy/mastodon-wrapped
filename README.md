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
- **Persona Classification**: Discover if you're a Broadcaster, Curator, Socialite, or Balancer
- **Chronotype Analysis**: Find out if you're a Night Owl, Early Bird, or Slacker
- **Activity Calendar**: Interactive heatmap showing your posting patterns
- **Popular Hashtags**: Find your most-used tags

### 🎨 Beautiful Visualizations
- Interactive charts built with Recharts
- Activity heatmaps with react-calendar-heatmap
- Smooth animations with Framer Motion
- Responsive design for all devices
- Modern, clean interface

### 💾 Export & Share
- **Download as Image**: Save your report as a high-quality PNG (2x scale)
- **Clean Export**: Buttons hidden in downloaded images
- **CORS Proxy Support**: Cross-origin images handled automatically
- **Local Processing**: All data processed locally in your browser

### 🔒 Privacy-First
- **No Login Required**: Simply enter your Mastodon handle
- **Public Data Only**: We only access publicly available posts
- **Local Processing**: Your data never leaves your browser
- **No Tracking**: Zero analytics or data collection

### 🌐 Internationalization
- **English & Chinese**: Full support for both languages
- **Auto-detection**: Automatically detects browser language

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

## 📱 Usage

1. **Enter Your Mastodon Handle**
   - Format: `username@instance.social`
   - Example: `Gargron@mastodon.social`

2. **Wait for Analysis**
   - We fetch your public posts from the current year
   - Progress bar shows fetch status

3. **Explore Your Report**
   - View your statistics and insights
   - See your activity calendar heatmap
   - Discover your persona and chronotype

4. **Share Your Results**
   - Click download to save as PNG image
   - Share on social media

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19 + Vite 7 |
| Styling | Tailwind CSS 4 + CSS Modules |
| Charts | Recharts |
| Heatmap | react-calendar-heatmap |
| Animations | Framer Motion |
| Image Export | @zumer/snapdom |
| Icons | Remix Icon |
| API | Mastodon REST API |

## 📁 Project Structure

```
mastodon-wrapped/
├── public/                 # Static assets
│   └── og.jpg             # OpenGraph image
├── src/
│   ├── components/        # React components
│   │   ├── LandingPage.jsx
│   │   ├── StatsDisplay.jsx
│   │   ├── ActivityHeatmap.jsx
│   │   └── ui/            # UI components
│   ├── services/          # API services
│   │   └── mastodonApi.js # Mastodon API with timeout
│   ├── utils/             # Utility functions
│   │   ├── dataAnalyzer.js    # Statistics calculation
│   │   ├── translations.js    # i18n strings
│   │   └── imageDownloader.js # PNG export with CORS proxy
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── index.html             # HTML template
└── README.md              # This file
```

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🎯 Key Features

### Social Impact Ranking
Your score is calculated based on:
- Reblogs × 2
- Favorites
- Total posts × 0.1
- Longest streak × 5

Ranking thresholds:
| Score | Ranking |
|-------|---------|
| ≥10,000 | Top 1% |
| ≥5,000 | Top 5% |
| ≥1,000 | Top 15% |
| ≥500 | Top 30% |
| ≥100 | Top 50% |
| <100 | Growing |

### Persona Classification
Based on your posting behavior:
- **The Broadcaster**: >60% original content
- **The Curator**: >60% boosts
- **The Socialite**: >50% replies
- **The Balancer**: Mixed posting style

### Chronotype Analysis
Based on posting hours:
- **Night Owl**: >15% posts between 0-5am
- **Early Bird**: >30% posts between 5-10am
- **Slacker**: >60% posts during work hours (10am-6pm)
- **The Regular**: Balanced posting schedule

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder
3. Configure build settings

## 🔒 Security

- **API Timeout**: All fetch requests have a 15-second timeout
- **XSS Protection**: HTML stripping uses regex, not innerHTML
- **CORS Handling**: Multiple proxy fallbacks for cross-origin images

## 📊 API Endpoints

The application uses the public Mastodon API:
- **Account lookup**: `/api/v1/accounts/lookup?acct={handle}`
- **Status fetching**: `/api/v1/accounts/{id}/statuses`
- **Rate limiting**: 200ms delay between requests

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by [Kate Deyneka](https://x.com/i/status/1998855377409159457)
- Built for [Mastodon](https://joinmastodon.org/)
- Charts powered by [Recharts](https://recharts.org/)
- Image export by [@zumer/snapdom](https://github.com/nicxgao/snapDOM)
- Icons by [Remix Icon](https://remixicon.com/)