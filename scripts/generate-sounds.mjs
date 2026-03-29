import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const soundsDir = path.join(__dirname, "../public/sounds");

/**
 * Generate simple MP3 sound files using ffmpeg
 * Make sure ffmpeg is installed: npm install -g ffmpeg
 */

const sounds = {
  "countdown-tick.mp3": {
    duration: 0.2,
    frequency: 800,
    description: "Short beep for countdown",
  },
  "race-start.mp3": {
    duration: 0.8,
    frequencies: [523, 659, 784], // C, E, G chord
    description: "Exciting race start sound",
  },
  "cheering.mp3": {
    duration: 2,
    frequencies: [440, 494, 523, 587], // A, B, C, D chord
    description: "Crowd cheering",
  },
  "victory.mp3": {
    duration: 2.5,
    frequencies: [523, 659, 784, 1047], // C major arpeggio
    description: "Victory fanfare",
  },
};

console.log("🎵 Generating sound effects...\n");

// Create sounds directory if it doesn't exist
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

let successCount = 0;
let errorCount = 0;

for (const [filename, config] of Object.entries(sounds)) {
  const filepath = path.join(soundsDir, filename);

  try {
    // Check if ffmpeg is installed
    try {
      execSync("ffmpeg -version", { stdio: "ignore" });
    } catch {
      throw new Error("ffmpeg is required. Install with: npm install -g ffmpeg");
    }

    // Generate audio using FFmpeg sine wave
    const frequency = Array.isArray(config.frequencies)
      ? config.frequencies[0]
      : config.frequency;

    const cmd = `ffmpeg -f lavfi -i sine=f=${frequency}:d=${config.duration} -q:a 5 -map a "${filepath}" -y`;

    execSync(cmd, { stdio: "pipe" });

    console.log(`✅ ${filename} (${config.description})`);
    successCount++;
  } catch (error) {
    console.error(`❌ ${filename}: ${error instanceof Error ? error.message : String(error)}`);
    errorCount++;
  }
}

console.log(`\n📊 Generated ${successCount}/${Object.keys(sounds).length} sounds`);

if (errorCount > 0) {
  console.log(`\n⚠️  ${errorCount} sounds failed to generate.`);
  console.log(
    "Alternative: Download free sounds from Freesound.org or Zapsplat.com\n"
  );
}

if (successCount === Object.keys(sounds).length) {
  console.log("\n🎉 All sounds generated successfully!");
}
