/**
 * Audio Generation Helper Script
 * 
 * This script generates sound effects for the racing game using Web Audio API.
 * Run this once to generate audio files and save them to the public/sounds folder.
 * 
 * For production, you may want to use pre-recorded audio files instead.
 * Place MP3 files in public/sounds/ with names matching:
 * - countdown-tick.mp3 (beep sound, ~200ms)
 * - race-start.mp3 (whoosh/horn sound, ~500ms)
 * - cheering.mp3 (crowd cheering, ~1-2s)
 * - victory.mp3 (victory fanfare, ~2-3s)
 */

export async function generateSoundEffects() {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  // Countdown tick - simple beep
  function generateCountdownTick(): AudioBuffer {
    const duration = 0.2;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    const frequency = 800;
    const now = audioContext.currentTime;

    for (let i = 0; i < buffer.length; i++) {
      const t = i / audioContext.sampleRate;
      const sine = Math.sin((2 * Math.PI * frequency * t));
      const envelope = Math.exp(-5 * t); // Quick decay
      data[i] = sine * envelope * 0.3;
    }

    return buffer;
  }

  // Race start - whoosh sound
  function generateRaceStart(): AudioBuffer {
    const duration = 0.5;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / audioContext.sampleRate;
      const frequency = 200 + t * 400; // Sweep up
      const sine = Math.sin((2 * Math.PI * frequency * t));
      const envelope = 1 - t * 2; // Linear decay
      data[i] = sine * envelope * 0.4;
    }

    return buffer;
  }

  // Cheering - noise burst
  function generateCheering(): AudioBuffer {
    const duration = 1.5;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / audioContext.sampleRate;
      const noise = Math.random() * 2 - 1;
      const envelope = Math.sin(t * Math.PI) * (1 - t * 0.5); // Sine envelope
      data[i] = noise * envelope * 0.2;
    }

    return buffer;
  }

  // Victory - ascending notes
  function generateVictory(): AudioBuffer {
    const duration = 2;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    const notes = [523, 659, 784, 1047]; // C, E, G, C notes
    const noteLength = duration / notes.length;

    let sampleIndex = 0;
    for (const frequency of notes) {
      const noteSamples = audioContext.sampleRate * noteLength;
      for (let i = 0; i < noteSamples && sampleIndex < buffer.length; i++, sampleIndex++) {
        const t = i / audioContext.sampleRate;
        const sine = Math.sin((2 * Math.PI * frequency * t));
        const envelope = 1 - (t / noteLength) * 2;
        data[sampleIndex] = sine * envelope * 0.25;
      }
    }

    return buffer;
  }

  // Convert AudioBuffer to WAV and download
  async function downloadAudio(buffer: AudioBuffer, filename: string) {
    const offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
    const source = offlineContext.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineContext.destination);
    source.start();

    const result = await offlineContext.startRendering();
    const wav = audioBufferToWav(result);
    const blob = new Blob([wav], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  // Helper function: Convert AudioBuffer to WAV format
  function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // RIFF chunk descriptor
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    // FMT sub-chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // chunk length
    setUint16(1); // PCM
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // avg. byte rate
    setUint16(buffer.numberOfChannels * 2); // block-align
    setUint16(16); // 16-bit

    // Data sub-chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4); // chunk length

    // Write PCM samples
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const s = Math.max(-1, Math.min(1, channels[i][offset]));
        view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        pos += 2;
      }
      offset++;
    }

    return arrayBuffer;
  }

  console.log("Generating sound effects...");
  console.log("Note: For production, use high-quality MP3 files instead.");
  console.log("Place these files in public/sounds/:");
  console.log("- countdown-tick.wav");
  console.log("- race-start.wav");
  console.log("- cheering.wav");
  console.log("- victory.wav");

  // Note: You would call these functions to generate, but we can't download in a module
  // const countdownBuffer = generateCountdownTick();
  // const raceStartBuffer = generateRaceStart();
  // const cheeringBuffer = generateCheering();
  // const victoryBuffer = generateVictory();
}
