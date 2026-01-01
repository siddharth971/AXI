// client/src/app/services/jarvis.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' }) // ✅ Auto-provided
export class AxiService {
  private apiUrl = 'http://localhost:5000/api/command';

  constructor(private http: HttpClient) { }

  sendCommand(text: string): Observable<{ response: string }> {
    console.log('Sending command:', text);
    return this.http.post<{ response: string }>(this.apiUrl, { text });
  }

  speak(text: string): Promise<void> {
    console.log('Speaking:', text);
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      const setBestVoice = () => {
        const voices = speechSynthesis.getVoices();

        // Priority ranking for natural-sounding voices
        const voice =
          // 1. Indian English specific (matching the recognition language)
          voices.find(v => v.lang === 'en-IN') ||
          // 2. Edge/Windows "Natural" voices (Best quality)
          voices.find(v => v.name.includes('Natural') && v.lang.startsWith('en')) ||
          // 3. Google High-Quality Online voices
          voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
          // 4. Any English Female voice (usually clearer for assistants)
          voices.find(v => v.name.includes('Female') && v.lang.startsWith('en')) ||
          // 5. Any English UK (typically sounds more "Jarvis-like")
          voices.find(v => v.lang.startsWith('en-GB')) ||
          // 6. Fallback to any English US
          voices.find(v => v.lang.startsWith('en-US')) ||
          voices[0];

        if (voice) {
          utterance.voice = voice;
        }
      };

      // Safety timeout: browsers sometimes fail to fire onend
      const timeout = setTimeout(() => {
        console.warn('Speech synthesis timed out');
        resolve();
      }, 10000); // 10 second max per response

      const handleEnd = () => {
        clearTimeout(timeout);
        resolve();
      };

      // In many browsers, voices are loaded asynchronously
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = () => {
          setBestVoice();
          utterance.onend = handleEnd;
          utterance.onerror = handleEnd;
          speechSynthesis.speak(utterance);
        };
      } else {
        setBestVoice();
        utterance.onend = handleEnd;
        utterance.onerror = handleEnd;
        speechSynthesis.speak(utterance);
      }
    });
  }
}