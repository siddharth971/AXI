import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';

export interface Notification {
  id: number;
  text: string;
  timestamp: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly SERVER_URL = 'http://localhost:5000';

  // Real-time signals
  isConnected = signal<boolean>(false);
  notifications = signal<Notification[]>([]);

  constructor() {
    this.socket = io(this.SERVER_URL, {
      transports: ['websocket', 'polling'], // Prioritize WebSocket
      reconnectionAttempts: 5
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('connect', () => {
      console.log('🟢 Socket.IO Connected');
      this.isConnected.set(true);
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 Socket.IO Disconnected');
      this.isConnected.set(false);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err);
    });

    // Handle Proactive Notifications
    this.socket.on('notification', (data: Notification) => {
      console.log('🔔 Notification Received:', data);

      // Update signal with new notification at top
      this.notifications.update(current => [data, ...current]);

      // Optional: Play a sound here
      this.playNotificationSound();
    });
  }

  private playNotificationSound() {
    try {
      const audio = new Audio('/assets/notification.mp3');
      // Need asset, skipping for now to avoid 404
      // audio.play().catch(() => {});
    } catch (e) { }
  }

  /**
   * Emit a custom event (e.g. for testing)
   */
  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }
}
