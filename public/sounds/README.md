# Sound Effects Setup Guide

This guide explains how to set up sound effects for the TypeMetric racing game.

## Audio Files Required

Place these files in `public/sounds/` folder:

1. **countdown-tick.mp3** (200ms)
   - Short beep sound when countdown is 3, 2, 1
   - Volume: normalized to prevent ear harassment
   - Format: MP3, 16-bit, 44.1kHz

2. **race-start.mp3** (500ms)
   - Horn or whoosh sound when race starts (countdown reaches 0)
   - Should be energetic and clear
   - Format: MP3, 16-bit, 44.1kHz

3. **cheering.mp3** (1-2 seconds)
   - Crowd cheering sound during race
   - Plays every 10 seconds to encourage players
   - Keep moderate volume to not distract
   - Format: MP3, 16-bit, 44.1kHz

4. **victory.mp3** (2-3 seconds)
   - Victory fanfare or winning sound when race finishes
   - Should be celebratory and impactful
   - Format: MP3, 16-bit, 44.1kHz

## How to Obtain Audio Files

### Option 1: Use Free Audio Resources

- **Freesound.org** - High-quality user-contributed sounds
- **Zapsplat.com** - Free sound effects library
- **Pixabay Sounds** - Free, royalty-free audio
- **OpenGameArt.org** - Game-specific free assets

Search for:
- "Beep" or "notification" sound → countdown-tick
- "Start" or "whoosh" sound → race-start
- "Cheering" or "crowd" sound → cheering
- "Victory" or "fanfare" sound → victory

### Option 2: Generate Programmatically

Use the `audioGenerator.ts` utility which contains functions to generate sounds using Web Audio API:

```typescript
import { generateSoundEffects } from "@/features/multiplayer/utils/audioGenerator";

// In browser console or a component:
generateSoundEffects();
```

This generates basic sound effects, but quality may be limited.

### Option 3: Purchase Licensed Audio

- **AudioJungle** - Professional sound effects
- **Epidemic Sound** - Stock music and effects
- **Pond5** - Diverse media assets

## Installation Steps

1. Download or generate audio files
2. Convert to MP3 format if needed (use ffmpeg or online converter)
3. Place files in `public/sounds/` with exact names:
   ```
   public/
   └── sounds/
       ├── countdown-tick.mp3
       ├── race-start.mp3
       ├── cheering.mp3
       └── victory.mp3
   ```
4. Test in browser - sounds should play during racing

## Audio File Optimization for Web

### Best Practices for Web Audio

1. **Format**: Use MP3 for broad browser support
2. **Sample Rate**: 44.1kHz is standard and sufficient
3. **Bit Depth**: 16-bit is good quality
4. **Compression**: Use reasonable compression (128-192 kbps)
5. **Mono for SFX**: Use mono (1 channel) for sound effects to reduce file size

### File Size Guidelines

Each file should be approximately:
- countdown-tick: 10-30 KB
- race-start: 30-80 KB
- cheering: 80-200 KB
- victory: 100-250 KB

Use ffmpeg to convert and compress:

```bash
# Convert and optimize for web
ffmpeg -i input.wav -b:a 192k -sr 44100 output.mp3

# Or for mono:
ffmpeg -i input.wav -ac 1 -b:a 128k -sr 44100 output.mp3
```

## Performance Considerations

The implementation uses:

- **Lazy Loading**: Sounds load on first use, not on page load
- **Caching**: Audio elements are cached after first load
- **Debouncing**: Sounds can't overlap (prevents overlapping beeps)
- **Volume Control**: Default 0.3 (30%) to not startle users
- **Autoplay Policy**: Requires user interaction before playing sound

## Customizing Volume

To change the default volume, edit `MultiplayerRaceView.tsx`:

```typescript
const { ... } = useSoundEffects({ 
  enabled: true, 
  volume: 0.3  // Change this value (0.0 - 1.0)
});
```

## Disabling Sounds

To disable sounds for testing or user preference:

```typescript
const { ... } = useSoundEffects({ 
  enabled: false  // Disable all sounds
});
```

Or add a user preference toggle in the UI.

## Browser Compatibility

- Chrome/Edge/Firefox: Full support
- Safari: Requires user interaction before autoplay
- Mobile browsers: May have autoplay restrictions (handled by the hook)

## Testing

1. Join a multiplayer room
2. Click "Start Race" to trigger countdown
3. Listen for:
   - Beep sounds (3, 2, 1)
   - Start horn/whoosh when race begins
   - Cheer sounds every 10 seconds during race
   - Victory fanfare when race finishes

## Troubleshooting

### Sounds Not Playing

1. Check browser console for errors
2. Verify audio files exist in `public/sounds/`
3. Ensure file names match exactly (case-sensitive on Linux)
4. Check browser autoplay settings
5. Verify volume is not muted

### Audio is Choppy

1. Reduce file size by increasing compression
2. Use MP3 format instead of WAV
3. Lower sample rate if acceptable

### Performance Issues

- Sounds are lazy-loaded and cached, so minimal impact
- Check if browser is under heavy load
- Monitor Network tab for slow audio downloads

## Future Improvements

- Add user preference for sound volume in settings
- Add toggle to enable/disable sounds
- Implement sound variations (multiple cheering sounds)
- Add background music option
- Add sound effect for user mistakes/corrections (optional)
