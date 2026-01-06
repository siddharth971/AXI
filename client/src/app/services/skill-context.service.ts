import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, switchMap, startWith, catchError, of } from 'rxjs';

export interface SkillContextItem {
  id: string;
  type: 'info' | 'action';
  icon: string;
  title: string;
  value: string;
  color?: string;
  actionLabel?: string;
}

export interface SkillContext {
  items: SkillContextItem[];
  activeSkill: string | null;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class SkillContextService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api';

  // Signals for reactive state
  contextItems = signal<SkillContextItem[]>([]);
  activeSkill = signal<string | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    // Start polling for context updates every 5 seconds
    this.startPolling();
  }

  private startPolling() {
    interval(5000).pipe(
      startWith(0),
      switchMap(() => this.fetchContext())
    ).subscribe();
  }

  private fetchContext() {
    this.isLoading.set(true);

    return this.http.get<SkillContext>(`${this.apiUrl}/skill-context`).pipe(
      switchMap((data) => {
        this.contextItems.set(data.items);
        this.activeSkill.set(data.activeSkill);
        this.isLoading.set(false);
        this.error.set(null);
        return of(data);
      }),
      catchError((err) => {
        this.isLoading.set(false);
        this.error.set('Failed to load context');
        // Set default fallback data
        this.contextItems.set([
          {
            id: 'weather',
            type: 'info',
            icon: 'cloud-sun',
            title: 'Weather',
            value: '25°C, Sunny',
            color: 'cyan'
          },
          {
            id: 'time',
            type: 'info',
            icon: 'clock',
            title: 'Current Time',
            value: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            color: 'purple'
          }
        ]);
        return of(null);
      })
    );
  }

  // Manual refresh
  refresh() {
    this.fetchContext().subscribe();
  }

  // Execute action (e.g., open website)
  executeAction(item: SkillContextItem) {
    if (item.type === 'action') {
      if (item.id === 'website') {
        window.open(`https://${item.value}`, '_blank');
      }
    }
  }
}
