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
import { lastValueFrom } from 'rxjs';
import { AxiService } from '../../services/axi.service';

@Component({
  selector: 'app-axi-interface',
  standalone: true,
  templateUrl: './axi-interface.component.html',
  styleUrls: ['./axi-interface.component.scss']
})
export class AxiInterfaceComponent implements OnInit {

  // Signals for UI reactive updates
  isListening = signal(false);
  transcript = signal('');
  response = signal('');

  private recognition!: SpeechRecognition;
  private restartTimeout: any;

  constructor(private axi: AxiService) { }

  ngOnInit() {
    this.initSpeechRecognition();
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
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    // Speech result event
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const index = event.resultIndex;
      const text = event.results[index][0].transcript.trim();

      if (!text) return;
      this.transcript.set(text);

      this.handleCommand(text);
    };

    // Error handler
    this.recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      this.transcript.set('Error: ' + event.error);
      this.isListening.set(false);
    };

    // Auto-restart when ended
    this.recognition.onend = () => {
      if (this.isListening()) {
        this.restartTimeout = setTimeout(() => {
          this.safeStart();
        }, 500);
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
  }

  private stopListening() {
    this.isListening.set(false);
    this.recognition.stop();

    if (this.restartTimeout) clearTimeout(this.restartTimeout);
  }

  private safeStart() {
    try {
      this.recognition.start();
    } catch (_) {
      // Chrome sometimes throws "recognition already started"
    }
  }

  // ------------------------------------------------------------
  // Process Voice Command
  // ------------------------------------------------------------
  private async handleCommand(text: string) {
    this.isListening.set(false);

    try {
      const result = await lastValueFrom(this.axi.sendCommand(text));

      this.response.set(result.response);

      // Speak response
      await this.axi.speak(result.response);

      // Auto restart listening after speaking
      setTimeout(() => {
        this.isListening.set(true);
        this.safeStart();
      }, 600);

    } catch (err) {
      console.error(err);
      this.response.set('Something went wrong. Try again.');
      this.isListening.set(false);
    }
  }
}
