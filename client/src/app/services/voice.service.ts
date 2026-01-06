import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type AxiState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface CommandHistoryItem {
  text: string;
  response: string;
  timestamp: Date;
}

// TTS Provider configuration
export type TTSProvider = 'browser' | 'elevenlabs' | 'openai';

export interface TTSConfig {
  provider: TTSProvider;
  elevenLabsApiKey?: string;
  elevenLabsVoiceId?: string;  // Voice ID from ElevenLabs
  elevenLabsModel?: string;    // 'eleven_monolingual_v1' or 'eleven_multilingual_v2'
  openaiApiKey?: string;
  openaiVoice?: string;  // alloy, echo, fable, onyx, nova, shimmer
}

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/command';
  private historyApiUrl = 'http://localhost:5000/api/history';
  private ttsApiUrl = 'http://localhost:5000/api/tts';  // Backend TTS endpoint

  state = signal<AxiState>('idle');
  commands = signal<CommandHistoryItem[]>([]);
  lastTranscript = signal<string>('');
  lastResponse = signal<string>('');

  // Audio analysis data for orb visualization
  audioLevel = signal<number>(0);
  frequencyData = signal<Uint8Array>(new Uint8Array(64));

  // TTS Configuration - Using ElevenLabs with Indian voice for AXI
  ttsConfig = signal<TTSConfig>({
    provider: 'elevenlabs',  // ElevenLabs for natural human-like voice
    elevenLabsApiKey: 'sk_c7ffd91e4fe94bbac7e159ef4f032e3ce64ef42796ff8782',
    elevenLabsVoiceId: 'pFZP5JQG7iQjIQuC4Bku',  // Lily - Natural Indian accent female voice
    elevenLabsModel: 'eleven_multilingual_v2',  // Multilingual model for better accent support
    openaiApiKey: '',
    openaiVoice: 'nova'
  });

  private recognition: any;
  private synthesis = window.speechSynthesis;
  private currentAudio: HTMLAudioElement | null = null;

  // Audio analysis
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animationFrameId: number | null = null;

  constructor() {
    this.initSpeechRecognition();
    this.fetchHistory();
  }

  /**
   * Fetch command history from the backend API
   */
  async fetchHistory() {
    try {
      const response = await firstValueFrom(
        this.http.get<{ history: { input: string; intent: string; response: string; timestamp: string }[] }>(this.historyApiUrl)
      );

      if (response.history && response.history.length > 0) {
        const mappedHistory = response.history.map(item => ({
          text: item.input,
          response: item.response,
          timestamp: new Date(item.timestamp)
        }));
        this.commands.set(mappedHistory);

        // Set the last response from history
        if (mappedHistory.length > 0) {
          this.lastResponse.set(mappedHistory[0].response);
        }
      }
    } catch (error) {
      console.log('Could not fetch history from backend:', error);
    }
  }

  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;  // Keep listening
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN';

      this.recognition.onresult = (event: any) => {
        const results = Array.from(event.results);
        const transcript = results
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        this.lastTranscript.set(transcript);

        // Check if we have a final result
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          this.processCommand(transcript);
        }
      };

      this.recognition.onend = () => {
        // Only restart if still in listening state
        if (this.state() === 'listening') {
          try {
            this.recognition.start();
          } catch (e) {
            // Already started
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          this.stopListening();
        }
      };
    }
  }

  async toggleListening() {
    if (this.state() === 'listening') {
      this.stopListening();
    } else if (this.state() === 'idle') {
      await this.startListening();
    }
  }

  async startListening() {
    if (this.recognition && this.state() === 'idle') {
      this.state.set('listening');
      this.lastTranscript.set('');

      // Start audio analysis
      await this.startAudioAnalysis();

      try {
        this.recognition.start();
      } catch (e) {
        console.error('Recognition start error:', e);
      }
    }
  }

  stopListening() {
    if (this.recognition) {
      this.state.set('idle');
      try {
        this.recognition.stop();
      } catch (e) {
        // Already stopped
      }
      this.stopAudioAnalysis();
    }
  }

  private async startAudioAnalysis() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;  // More frequency bins for better visualization
      this.analyser.smoothingTimeConstant = 0.4;  // Less smoothing = more responsive
      this.analyser.minDecibels = -90;  // Lower threshold to pick up quieter sounds
      this.analyser.maxDecibels = -10;  // Upper limit

      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.microphone.connect(this.analyser);

      this.analyzeAudio();
    } catch (error) {
      console.error('Error starting audio analysis:', error);
    }
  }

  private analyzeAudio = () => {
    if (!this.analyser || this.state() !== 'listening') {
      return;
    }

    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frequencyData);

    // Calculate average audio level with moderate boost for normal speaking volume
    const sum = frequencyData.reduce((acc, value) => acc + value, 0);
    const average = sum / frequencyData.length;

    // Moderate boost - use power curve for smoother response
    const boostedLevel = Math.pow(average / 255, 0.7) * 1.8;
    const normalizedLevel = Math.min(1, boostedLevel);  // Cap at 1

    this.audioLevel.set(normalizedLevel);
    this.frequencyData.set(frequencyData);

    this.animationFrameId = requestAnimationFrame(this.analyzeAudio);
  };

  private stopAudioAnalysis() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.analyser = null;
    this.audioLevel.set(0);
  }

  async processCommand(text: string) {
    if (!text.trim()) {
      return;
    }

    // Stop listening while processing
    this.stopListening();
    this.state.set('thinking');
    this.lastTranscript.set(text);

    try {
      const response = await firstValueFrom(this.http.post<{ response: string }>(this.apiUrl, { text }));

      this.commands.update(prev => [
        { text, response: response.response, timestamp: new Date() },
        ...prev
      ].slice(0, 10));

      // Set last response for display below orb
      this.lastResponse.set(response.response);

      await this.speak(response.response);
    } catch (error) {
      console.error('Error sending command', error);
      // Fallback response when backend is not available
      const fallbackResponse = `I received your command: "${text}". However, the backend server is not running. Please start the server to get full responses.`;

      this.commands.update(prev => [
        { text, response: fallbackResponse, timestamp: new Date() },
        ...prev
      ].slice(0, 10));

      // Set fallback response for display below orb
      this.lastResponse.set(fallbackResponse);

      await this.speak(fallbackResponse);
    }
  }

  private async speak(text: string): Promise<void> {
    this.state.set('speaking');

    const config = this.ttsConfig();

    try {
      switch (config.provider) {
        case 'elevenlabs':
          await this.speakWithElevenLabs(text);
          break;
        case 'openai':
          await this.speakWithOpenAI(text);
          break;
        default:
          await this.speakWithBrowser(text);
      }
    } catch (error) {
      console.error('TTS error, falling back to browser:', error);
      await this.speakWithBrowser(text);
    }

    this.state.set('idle');
  }

  /**
   * ElevenLabs TTS - Very natural human-like voices
   * Get API key from: https://elevenlabs.io
   */
  private async speakWithElevenLabs(text: string): Promise<void> {
    const config = this.ttsConfig();

    if (!config.elevenLabsApiKey) {
      console.warn('ElevenLabs API key not set, using browser TTS');
      return this.speakWithBrowser(text);
    }

    const voiceId = config.elevenLabsVoiceId || 'pFZP5JQG7iQjIQuC4Bku';
    const modelId = config.elevenLabsModel || 'eleven_multilingual_v2';
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': config.elevenLabsApiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: modelId,
        voice_settings: {
          stability: 0.15,           // Higher = more measured, slower pace
          similarity_boost: 0.6,     // Slightly lower for natural variation
          style: 0.3,                // Lower style = calmer, steadier delivery
          use_speaker_boost: true    // Clearer voice
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    await this.playAudioBlob(audioBlob);
  }

  /**
   * OpenAI TTS - High quality voices
   * Get API key from: https://platform.openai.com
   */
  private async speakWithOpenAI(text: string): Promise<void> {
    const config = this.ttsConfig();

    if (!config.openaiApiKey) {
      console.warn('OpenAI API key not set, using browser TTS');
      return this.speakWithBrowser(text);
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: config.openaiVoice || 'nova'  // nova, alloy, echo, fable, onyx, shimmer
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    await this.playAudioBlob(audioBlob);
  }

  /**
   * Browser TTS - Free but robotic
   */
  private speakWithBrowser(text: string): Promise<void> {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);

      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find(v =>
        v.name.includes('Google') && v.lang.includes('en')
      ) || voices.find(v =>
        v.name.includes('Microsoft') && v.lang.includes('en')
      ) || voices.find(v =>
        v.lang.includes('en-US') || v.lang.includes('en-GB')
      ) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synthesis.cancel();
      this.synthesis.speak(utterance);
    });
  }

  /**
   * Play audio blob (used for cloud TTS)
   */
  private playAudioBlob(blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      this.currentAudio = new Audio(url);

      this.currentAudio.onended = () => {
        URL.revokeObjectURL(url);
        this.currentAudio = null;
        resolve();
      };

      this.currentAudio.onerror = (error) => {
        URL.revokeObjectURL(url);
        this.currentAudio = null;
        reject(error);
      };

      this.currentAudio.play();
    });
  }

  /**
   * Configure TTS provider
   * @example setTTSConfig({ provider: 'elevenlabs', elevenLabsApiKey: 'your-key' })
   */
  setTTSConfig(config: Partial<TTSConfig>) {
    this.ttsConfig.update(current => ({ ...current, ...config }));
  }

  /**
   * Stop current speech
   */
  stopSpeaking() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.synthesis.cancel();
    if (this.state() === 'speaking') {
      this.state.set('idle');
    }
  }

  // Get available browser voices for UI selection
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices().filter(v => v.lang.includes('en'));
  }
}

