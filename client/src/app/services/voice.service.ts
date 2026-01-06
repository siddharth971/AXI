import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type AxiState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface CommandHistoryItem {
  text: string;
  response: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/command';
  private historyApiUrl = 'http://localhost:5000/api/history';

  state = signal<AxiState>('idle');
  commands = signal<CommandHistoryItem[]>([]);
  lastTranscript = signal<string>('');
  lastResponse = signal<string>('');

  // Audio analysis data for orb visualization
  audioLevel = signal<number>(0);
  frequencyData = signal<Uint8Array>(new Uint8Array(64));

  private recognition: any;
  private synthesis = window.speechSynthesis;

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

  private speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.state.set('speaking');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        this.state.set('idle');
        resolve();
      };
      utterance.onerror = () => {
        this.state.set('idle');
        resolve();
      };
      this.synthesis.speak(utterance);
    });
  }
}
