# Vector Converter iOS App

Transform your artwork into scalable vector graphics with AI-powered precision. This React Native app uses your existing Railway API for seamless vector conversion.

## Features

- 📱 **Native iOS Experience** - Dark theme, smooth animations
- 🎨 **AI Vector Conversion** - Powered by your Railway API
- 📷 **Camera & Gallery** - Select images from anywhere
- 🔄 **Real-time Processing** - Live conversion status
- 📤 **Share Results** - Export and share vector files
- ✨ **Professional UI** - Supacolor-inspired dark design

## Quick Start

### Prerequisites

- Mac with Xcode installed
- Node.js 18+
- iOS Simulator or physical iPhone
- CocoaPods installed

### Installation

1. **Clone and setup:**
   ```bash
   git clone https://github.com/fastmikey99/vector-converter-ios.git
   cd vector-converter-ios
   npm install
   ```

2. **Install iOS dependencies:**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Run on iOS:**
   ```bash
   npm run ios
   ```

## Testing the App

### On iOS Simulator:
1. Run `npm run ios`
2. App will open in iOS Simulator
3. Use sample images to test conversion

### On Physical iPhone:
1. Connect iPhone to Mac
2. Open `ios/VectorConverterApp.xcworkspace` in Xcode
3. Select your device and run

## API Integration

The app connects to your Railway API at:
```
https://zucchini-truth-production.up.railway.app/vectorize
```

All conversion settings are configured to match your Shopify implementation:
- Production mode
- 16 color optimization
- SVG output with Adobe compatibility
- Full curve type support

## Project Structure

```
├── App.tsx                 # Main app component
├── package.json           # Dependencies
├── ios/                   # iOS-specific files
├── android/              # Android files (future)
└── README.md             # This file
```

## Customization

### Adding Your Logo:
1. Add logo image to `ios/VectorConverterApp/Images.xcassets/`
2. Update the logo placeholder in `App.tsx`

### Branding:
- Colors can be modified in the StyleSheet
- Current theme matches Supacolor's dark aesthetic
- Orange accent color: `#ff9c40`

## App Store Deployment

Ready for App Store submission! The app includes:
- ✅ Professional dark theme
- ✅ Proper iOS navigation
- ✅ Native sharing functionality
- ✅ TypeScript for reliability
- ✅ Error handling and loading states

### Next Steps for App Store:
1. Create Apple Developer Account ($99/year)
2. Generate app icons (1024x1024 main icon)
3. Create screenshots for different device sizes
4. Write App Store description
5. Submit for review

## Troubleshooting

### Common Issues:

**Metro bundler issues:**
```bash
npx react-native start --reset-cache
```

**Pod install problems:**
```bash
cd ios && pod install --repo-update && cd ..
```

**Build errors:**
- Make sure Xcode Command Line Tools are installed
- Clean and rebuild: Product → Clean Build Folder in Xcode

### Testing Image Picker:
- iOS Simulator: Use Photos app to add test images
- Physical device: Grant camera/photo permissions when prompted

## Railway API Features

The app supports all Railway API features:
- Multiple image formats (JPG, PNG, GIF, BMP, WEBP)
- Advanced vectorization settings
- Editor URL integration
- Image token for editing sessions

## Contributing

This is your private app repository. To make changes:
1. Create feature branch
2. Test on iOS simulator
3. Commit and push
4. Deploy via Xcode for App Store

## License

Private repository - All rights reserved.

---

**Ready to test?** Run `npm run ios` and start converting images! 🚀