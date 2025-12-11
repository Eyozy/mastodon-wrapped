# Mastodon Wrapped

<p align="center">
  <img src="./public/og.jpg" alt="Mastodon Wrapped Banner" width="600">
</p>

<p align="center">
  📊 Generate your personalized Mastodon year-end wrapped report
</p>

## Overview

Mastodon Wrapped is a web application that generates personalized annual reports for Mastodon users. Discover your posting patterns, most popular content, engagement metrics, and yearly highlights in a beautiful, shareable format. Like Spotify Wrapped, but for the decentralized social network!

## ✨ Features

### 📊 Comprehensive Statistics
- **Social Impact Score**: Calculate your influence based on engagement metrics
- **Posting Analytics**: View your activity trends, content distribution, and rhythm
- **Top Content**: Discover your most liked and boosted posts
- **Activity Calendar**: See your posting patterns throughout the year
- **Popular Hashtags**: Find your most-used tags

### 🎨 Beautiful Visualizations
- Interactive charts built with Recharts
- Activity heatmaps
- Responsive design for all devices
- Modern, clean interface

### 💾 Export & Share
- **Download as Image**: Save your report as a high-quality PNG
- **Shareable Format**: Perfect for social media sharing
- **Local Processing**: All data processed locally in your browser

### 🔒 Privacy-First
- **No Login Required**: Simply enter your Mastodon handle
- **Public Data Only**: We only access publicly available posts
- **Local Processing**: Your data never leaves your browser

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
   - We fetch your public posts from the past year
   - All processing happens in your browser

3. **Explore Your Report**
   - View your statistics and insights
   - Discover your top posts and patterns
   - Switch between languages

4. **Share Your Results**
   - Download your report as an image
   - Share on social media

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS + CSS Modules
- **Charts**: Recharts
- **Data Visualization**: Activity Heatmap
- **Image Export**: html2canvas
- **API**: Mastodon REST API
- **Icons**: Remix Icon

## 📁 Project Structure

```
mastodon-warp/
├── public/                 # Static assets
│   ├── og.jpg            # OpenGraph image
│   └── logo.svg          # App logo
├── src/
│   ├── components/        # React components
│   │   ├── LandingPage.jsx
│   │   ├── StatsDisplay.jsx
│   │   └── ActivityHeatmap.jsx
│   ├── services/         # API services
│   │   └── mastodonApi.js
│   ├── utils/            # Utility functions
│   │   ├── dataAnalyzer.js
│   │   ├── translations.js
│   │   └── imageDownloader.js
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── index.html            # HTML template
└── README.md            # This file
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

## 🎯 Key Components

### Data Analysis
The application analyzes your Mastodon activity including:
- Total posts and engagement metrics
- Posting frequency and patterns
- Content type distribution
- Top performing posts
- Hashtag usage

### Persona Classification
Based on your posting behavior, we determine your Mastodon persona:
- **The Broadcaster**: Original content focused
- **The Curator**: Boost-heavy user
- **The Socialite**: Reply-focused
- **The Balancer**: Mixed posting style

### Activity Patterns
- **Chronotype**: Your most active hours
- **Peak Days**: Most active days of the week
- **Posting Trends**: Monthly activity graph
- **Activity Calendar**: Daily posting heatmap

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder
3. Configure build settings

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Add tests** if applicable
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Use meaningful commit messages
- Update documentation as needed
- Test thoroughly before submitting

## 📊 API Endpoints

The application uses the public Mastodon API:
- **Account lookup**: `/api/v1/accounts/search`
- **Status fetching**: `/api/v1/accounts/{id}/statuses`
- **Rate limiting**: Respect Mastodon's rate limits

## 🔒 Privacy

- We only access public posts
- No personal data is stored or transmitted
- All processing happens client-side
- No login or authentication required

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Kate Deyneka](https://x.com/i/status/1998855377409159457)
- Built with [Mastodon](https://joinmastodon.org/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons by [Remix Icon](https://remixicon.com/)