// ------------------------------------------------------------
// SpeechRecognition Type Fix (Required for Angular + TypeScript)
// ------------------------------------------------------------
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;

  onerror: ((event: any) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

// ------------------------------------------------------------

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { AxiService } from '../../services/axi.service';

@Component({
  selector: 'app-axi-interface',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './axi-interface.component.html',
  styleUrls: ['./axi-interface.component.scss']
})
export class AxiInterfaceComponent implements OnInit {

  // Signals for UI reactive updates
  isListening = signal(false);
  isSpeaking = signal(false);
  transcript = signal('');
  response = signal('');
  volume = signal(0); // For audio visualization
  emotion = signal('neutral'); // neutral, happy, angry, thinking

  private recognition!: SpeechRecognition;
  private restartTimeout: any;
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private dataArray?: Uint8Array<ArrayBuffer>;
  private animationId?: number;

  constructor(private axi: AxiService) { }

  ngOnInit() {
    this.initSpeechRecognition();
  }

  // ------------------------------------------------------------
  // Audio Visualizer Logic
  // ------------------------------------------------------------
  private async startVisualizer() {
    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      const update = () => {
        if (!this.analyser || !this.dataArray) return;
        this.analyser.getByteFrequencyData(this.dataArray as Uint8Array<ArrayBuffer>);

        // Calculate average volume
        const sum = this.dataArray.reduce((a, b) => a + b, 0);
        const avg = sum / this.dataArray.length;
        this.volume.set(avg);

        this.animationId = requestAnimationFrame(update);
      };

      update();
    } catch (err) {
      console.warn('Audio visualizer failed:', err);
    }
  }

  private stopVisualizer() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.volume.set(0);
  }

  // ------------------------------------------------------------
  // Initialize Speech Recognition
  // ------------------------------------------------------------
  private initSpeechRecognition() {
    const SpeechRecognitionConstructor =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      this.transcript.set('Speech Recognition not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognitionConstructor();
    this.recognition.continuous = true;
    this.recognition.interimResults = true; // Show text as you speak
    this.recognition.lang = 'en-IN';

    // Speech result event
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        console.log('Final Speech Result:', finalTranscript);
        this.transcript.set(finalTranscript);
        this.handleCommand(finalTranscript);
      } else if (interimTranscript) {
        // Just Update UI for feedback
        this.transcript.set(interimTranscript + '...');
      }
    };

    // Error handler
    this.recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event.error, event);

      // 'no-speech' and 'aborted' are common and shouldn't kill the session
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }

      this.transcript.set('Error: ' + event.error);
      this.isListening.set(false);
      this.stopVisualizer();
    };

    // Auto-restart when ended
    this.recognition.onend = () => {
      console.log('Speech Recognition Ended');
      if (this.isListening()) {
        this.restartTimeout = setTimeout(() => {
          this.safeStart();
        }, 500);
      } else {
        this.stopVisualizer();
      }
    };
  }

  // ------------------------------------------------------------
  // Start / Stop Listening
  // ------------------------------------------------------------
  toggleListening() {
    if (!this.recognition) {
      alert('Speech recognition requires Google Chrome.');
      return;
    }

    if (this.isListening()) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  private startListening() {
    this.isListening.set(true);
    this.transcript.set('Listening…');
    this.safeStart();
    this.startVisualizer();
  }

  private stopListening() {
    this.isListening.set(false);
    this.recognition.stop();
    this.stopVisualizer();

    if (this.restartTimeout) clearTimeout(this.restartTimeout);
  }

  private safeStart() {
    console.log('Attempting to start speech recognition...');
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start failed or already running:', e);
    }
  }

  // ------------------------------------------------------------
  // Process Voice Command
  // ------------------------------------------------------------
  private async handleCommand(text: string) {
    this.isListening.set(false);
    this.recognition.stop(); // Explicitly stop session
    this.stopVisualizer();

    try {
      const result = await lastValueFrom(this.axi.sendCommand(text));

      this.response.set(result.response);

      // Speak response
      this.isSpeaking.set(true);

      // Update emotion based on text
      const lowText = text.toLowerCase();
      if (lowText.includes('angry') || lowText.includes('stop') || lowText.includes('hate')) {
        this.emotion.set('angry');
      } else if (lowText.includes('happy') || lowText.includes('love') || lowText.includes('good')) {
        this.emotion.set('happy');
      } else {
        this.emotion.set('neutral');
      }

      // Simulate volume jitter for AXI speaking
      const speakInterval = setInterval(() => {
        if (!this.isSpeaking()) {
          clearInterval(speakInterval);
          this.volume.set(0);
          this.emotion.set('neutral');
        } else {
          const vol = 15 + Math.random() * 25;
          this.volume.set(vol);

          // If very loud, show "intense" emotion
          if (vol > 35) this.emotion.set('excited');
        }
      }, 100);

      await this.axi.speak(result.response);
      this.isSpeaking.set(false);


      // Auto restart listening after speaking
      setTimeout(() => {
        this.startListening();
      }, 400);

    } catch (err) {
      console.error(err);
      this.response.set('Something went wrong. Try again.');
      this.isListening.set(false);
      this.isSpeaking.set(false);
    }
  }
}
