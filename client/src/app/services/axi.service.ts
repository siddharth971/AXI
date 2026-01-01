// client/src/app/services/jarvis.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' }) // ✅ Auto-provided
export class AxiService {
  private apiUrl = 'http://localhost:5000/api/command';

  constructor(private http: HttpClient) { }

  sendCommand(text: string): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(this.apiUrl, { text });
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v =>
        v.name.includes('Google UK English Female') ||
        v.name.includes('UK English Female') ||
        v.lang.startsWith('en-GB')
      ) || voices[0];

      if (voice) utterance.voice = voice;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve(); // Prevent hanging

      speechSynthesis.speak(utterance);
    });
  }
}