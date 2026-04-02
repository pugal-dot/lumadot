# luma.dot

Bloomberg-style AI news reader. Dark. Minimal. Live.

---

## Quick Start

```bash
npm install
npx expo start
```

Scan QR with Expo Go on iPhone.

---

## Add Your API Keys

Open `src/services/api.ts` and replace:

```ts
const NEWS_API_KEY = 'YOUR_NEWSAPI_KEY';
const GROQ_API_KEY = 'YOUR_GROQ_KEY';
```

### Get NewsAPI key (free)
1. Go to newsapi.org
2. Click "Get API Key"
3. Sign up with email
4. Copy the key

### Get Groq key (free)
1. Go to console.groq.com
2. Sign in with Google
3. Click "API Keys" → "Create API Key"
4. Copy the key

---

## Project Structure

```
lumadot/
├── App.tsx                        ← Root, font loader, screen switcher
├── src/
│   ├── constants/theme.ts         ← Colors, fonts, field data
│   ├── services/
│   │   ├── api.ts                 ← NewsAPI + Groq calls
│   │   └── bookmarks.ts          ← AsyncStorage bookmarks
│   ├── components/
│   │   ├── Logo.tsx               ← luma•dot logo with pulse
│   │   └── NewsCard.tsx           ← Animated news card
│   ├── screens/
│   │   ├── SplashScreen.tsx       ← Animated splash
│   │   ├── FieldSelectorScreen.tsx ← 3D tilt field grid
│   │   ├── NewsFeedScreen.tsx     ← Live news feed
│   │   └── BookmarksScreen.tsx    ← Saved articles
│   └── navigation/
│       └── MainNavigator.tsx      ← Bottom tab nav
```

---

## Build for TestFlight

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile preview
```

Upload the .ipa to App Store Connect → TestFlight.
