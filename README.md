# Video Platform - White-Label Video Conferencing

Your own Zoom/Meet - white-labeled, in your SaaS, your domain.

## Features

- **HD Video Calls** - Crystal clear up to 1080p
- **Screen Sharing** - One-click screen share
- **In-Call Chat** - Built-in messaging
- **No Download Required** - Works in browser (WebRTC)
- **Guest Access** - No account needed to join
- **White-Label Ready** - Your branding, your domain
- **Recording** (coming soon) - Record and store meetings

## Quick Start

### 1. Get Daily.co API Key

1. Go to [Daily.co](https://dashboard.daily.co/signup)
2. Sign up for free (10,000 participant-minutes/month free)
3. Go to Developers > API Keys
4. Copy your API key

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
DAILY_API_KEY=your_api_key_here
DAILY_DOMAIN=your_domain_here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Create a Meeting
1. Enter your name
2. Click "Create New Meeting"
3. Share the link with participants

### Join a Meeting
1. Click the invite link
2. Enter your name
3. Click "Join Meeting"

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Your SaaS     │────▶│  This App    │────▶│  Daily.co   │
│   Frontend      │     │  (Next.js)   │     │  (WebRTC)   │
└─────────────────┘     └──────────────┘     └─────────────┘
```

- **Your SaaS** - Links to meeting rooms
- **This App** - Manages rooms, tokens, UI
- **Daily.co** - Handles actual video/audio infrastructure

## API Routes

- `POST /api/rooms` - Create a new room
- `GET /api/rooms?name=xxx` - Get room details
- `POST /api/token` - Generate meeting token

## Customization

### Branding
Edit `src/app/page.tsx` to customize:
- Logo
- Colors (Tailwind)
- Company name
- Feature descriptions

### Daily.co Theme
Edit the `theme` object in `src/app/room/[roomId]/page.tsx`:
```javascript
theme: {
  colors: {
    accent: '#7c3aed',  // Your brand color
    // ... other colors
  },
}
```

## Pricing

Daily.co free tier includes:
- 10,000 participant-minutes/month
- Up to 200 participants per room
- HD video
- Screen sharing
- Chat

Paid: ~$0.004/min per participant

## Coming Soon

- [ ] Recording support
- [ ] Meeting transcription
- [ ] Calendar integration
- [ ] Waiting room
- [ ] Breakout rooms
- [ ] Virtual backgrounds

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Daily.co WebRTC
