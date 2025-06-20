# Banten Storyteller - Progressive Web App

A modern Progressive Web App (PWA) that showcases inspiring stories from the Banten community through interactive mapping technology.

## 🌐 Live Demo
[Banten Storyteller Live Demo](https://bantenstoryteller.netlify.app/)

## 🌟 PWA Features

### 1. Application Shell Architecture

- **Static Content**: Core HTML, CSS, and JavaScript are cached for instant loading
- **Dynamic Content**: API data is fetched and cached with intelligent strategies
- **Offline-First**: App shell loads immediately, even without internet connection

### 2. Installable App

- **Add to Homescreen**: Users can install the app on their device
- **Native App Experience**: Runs in standalone mode without browser UI
- **App Icons**: High-quality icons for various device sizes
- **Splash Screen**: Custom loading screen during app startup

### 3. Offline Functionality

- **Complete Offline Support**: All essential UI components remain functional offline
- **Intelligent Caching**: Different caching strategies for different content types
- **Offline Fallback**: Graceful degradation when network is unavailable
- **Background Sync**: Queues actions for when connection is restored

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Banten-Storyteller-App

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 PWA Installation

### Desktop (Chrome/Edge)

1. Visit the app in Chrome or Edge
2. Look for the install icon in the address bar
3. Click "Install" to add to desktop

### Mobile (Android)

1. Open the app in Chrome
2. Tap the menu (⋮) and select "Add to Home screen"
3. Follow the prompts to install

### iOS (Safari)

1. Open the app in Safari
2. Tap the share button (□↑)
3. Select "Add to Home Screen"

## 🔧 PWA Configuration

### Service Worker

The app uses a custom service worker (`public/sw.js`) with:

- **Application Shell Caching**: Core UI components cached for instant loading
- **Runtime Caching**: Dynamic content cached with Network-First strategy
- **Offline Fallback**: Custom offline page for navigation requests
- **Push Notifications**: Support for real-time notifications

### Manifest

The PWA manifest (`public/manifest.json`) includes:

- App metadata and branding
- Icons for various device sizes
- Display modes and orientation
- App shortcuts for quick access

### Caching Strategies

- **Cache First**: Static assets (CSS, JS, images)
- **Network First**: Dynamic content (API responses)
- **Stale While Revalidate**: External resources (fonts, CDN)

## 🌐 Offline Experience

### What Works Offline

- ✅ App shell and navigation
- ✅ Previously viewed content
- ✅ Cached images and assets
- ✅ Core functionality
- ✅ Offline fallback pages

### What Requires Internet

- ❌ New content fetching
- ❌ Real-time updates
- ❌ User authentication
- ❌ Data submission

## 📊 Performance Features

### Lighthouse Scores

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 90+
- **PWA**: 100

### Optimization Techniques

- **Code Splitting**: Automatic chunking for faster loading
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Compressed images and minified code
- **Preloading**: Critical resources loaded early

## 🔔 Push Notifications

The app supports push notifications for:

- New story updates
- Community announcements
- User engagement reminders

### Notification Features

- Rich notifications with images
- Action buttons for quick responses
- Background sync for offline actions
- Custom notification sounds

## 🛠️ Development

### PWA Development Tools

- **Chrome DevTools**: PWA tab for debugging
- **Lighthouse**: Performance and PWA auditing
- **Workbox**: Service worker development

### Testing PWA Features

```bash
# Test offline functionality
1. Open DevTools → Application → Service Workers
2. Check "Offline" in Network tab
3. Refresh page and verify offline behavior

# Test installation
1. Open DevTools → Application → Manifest
2. Verify manifest is valid
3. Test install prompt in supported browsers
```

## 📱 Browser Support

### Full PWA Support

- Chrome 67+
- Edge 79+
- Firefox 67+
- Safari 11.1+

### Partial Support

- Older browsers fall back to standard web app behavior
- Graceful degradation for unsupported features

## 🔧 Configuration Files

### Key PWA Files

- `vite.config.js`: PWA plugin configuration
- `public/sw.js`: Service worker implementation
- `public/manifest.json`: PWA manifest
- `public/offline.html`: Offline fallback page
- `src/scripts/utils/sw-register.js`: Service worker registration
- `src/scripts/utils/offline-detector.js`: Offline state management

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deployment Checklist

- [ ] Service worker is generated
- [ ] Manifest is accessible
- [ ] Icons are properly sized
- [ ] HTTPS is enabled
- [ ] Offline functionality tested
- [ ] Installation prompt works

## 📈 Analytics & Monitoring

### PWA Metrics

- **Install Rate**: Track app installations
- **Offline Usage**: Monitor offline engagement
- **Performance**: Core Web Vitals tracking
- **User Engagement**: Session duration and interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test PWA functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For PWA-related issues or questions:

- Check the browser's DevTools PWA tab
- Verify service worker registration
- Test offline functionality
- Review manifest validation

---

**Banten Storyteller** - Bringing stories to life through technology 🌟
