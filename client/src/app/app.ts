import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AxiOrbComponent } from './components/core/axi-orb.component';
import { VoiceService } from './services/voice.service';
import { SkillContextService } from './services/skill-context.service';
import { LucideAngularModule, LUCIDE_ICONS, LucideIconProvider, Bot, User, PlayCircle, Plus, Trash2, MessageCircle, Send, Zap, Cloud, Sun, Youtube, Clock, Globe, CloudSun, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AxiOrbComponent
  ],
  providers: [
    { provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ Bot, User, PlayCircle, Plus, Trash2, MessageCircle, Send, Zap, Cloud, Sun, Youtube, Clock, Globe, CloudSun, RefreshCw }) }
  ],
  template: `
    <div class="app-container">
      <!-- Animated star background -->
      <div class="stars-container">
        <div class="stars"></div>
        <div class="stars stars-2"></div>
        <div class="stars stars-3"></div>
      </div>
      
      <!-- Top Header -->
      <header class="header">
        <div class="header-left">
          <div class="logo">
            <span class="logo-text">AXI</span>
          </div>
          <div class="title-group">
            <h1 class="title">Voice Assistant Server</h1>
          </div>
        </div>
        
        <div class="header-right">
          <div class="status-badge" [class.listening]="state() === 'listening'">
            <span class="status-dot"></span>
            <span class="status-text">{{ state() === 'listening' ? 'LISTENING' : 'ONLINE' }}</span>
          </div>
          <button class="settings-btn">
            <lucide-icon name="play-circle" class="icon"></lucide-icon>
          </button>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Left Panel: Your Chats (ChatGPT-style) -->
        <aside class="panel panel-left">
          <div class="panel-glass sessions-container">
            <div class="sessions-header">
              <div class="header-title">Your chats</div>
              <button class="new-chat-btn" (click)="createNewSession()">
                <lucide-icon name="plus" class="btn-icon"></lucide-icon>
              </button>
            </div>
            <div class="sessions-list">
              @for (session of sessions(); track session.id) {
                <div class="session-item" 
                     [class.active]="session.id === activeSessionId()"
                     (click)="selectSession(session.id)">
                  <span class="session-title">{{ session.title }}</span>
                  <button class="session-delete-btn" (click)="deleteSession($event, session.id)">
                    <lucide-icon name="trash-2" class="delete-icon"></lucide-icon>
                  </button>
                </div>
              }
              @if (sessions().length === 0) {
                <div class="empty-sessions-state">
                  <lucide-icon name="message-circle" class="empty-icon"></lucide-icon>
                  <span class="empty-text">No chats yet</span>
                  <span class="empty-subtext">Start a new conversation</span>
                </div>
              }
            </div>
          </div>
        </aside>

        <!-- Center: Orb Section -->
        <section class="center-section">
          <!-- Orb Section -->
          <div class="orb-section">
            <div class="orb-wrapper">
              <app-axi-orb />
            </div>
            
            <!-- Status text below orb -->
            <div class="status-text" [class.visible]="state() !== 'idle'">
              <p class="state-label">
                {{ state() === 'listening' ? 'Listening...' : (state() === 'thinking' ? 'Processing...' : state() === 'speaking' ? 'Speaking...' : '') }}
              </p>
            </div>
            
            <!-- Simple AXI Response Text - White text below orb -->
            @if (lastResponse()) {
              <div class="axi-response-text">
                <p>{{ lastResponse() }}</p>
              </div>
            }
          </div>
        </section>

        <!-- Right Panel: Active Skill Context -->
        <aside class="panel panel-right">
          <div class="panel-glass">
            <div class="panel-header">
              <lucide-icon name="zap" class="panel-icon"></lucide-icon>
              <span class="panel-title">Active Skill Context</span>
              <button class="refresh-btn" (click)="refreshContext()">
                <lucide-icon name="refresh-cw" class="refresh-icon" [class.spinning]="skillContextService.isLoading()"></lucide-icon>
              </button>
            </div>
            
            <!-- Dynamic Context Items -->
            @for (item of skillContextService.contextItems(); track item.id) {
              <div class="context-card" [class.action-card]="item.type === 'action'">
                <div class="context-row">
                  <lucide-icon [name]="getIconName(item.icon)" class="context-icon" [class]="'color-' + item.color"></lucide-icon>
                  <div class="context-info">
                    <span class="context-title">{{ item.title }}</span>
                    <span class="context-value">{{ item.value }}</span>
                  </div>
                </div>
                @if (item.type === 'action' && item.actionLabel) {
                  <button class="action-btn" (click)="executeContextAction(item)">
                    {{ item.actionLabel }}
                  </button>
                }
              </div>
            }
            
            @if (skillContextService.contextItems().length === 0) {
              <div class="empty-context">
                <lucide-icon name="zap" class="empty-icon"></lucide-icon>
                <span>No active context</span>
              </div>
            }
          </div>
        </aside>
      </main>

      <!-- Bottom: Command Input Bar -->
      <footer class="footer">
        <div class="status-bar">
          <div class="command-input-wrapper">
            <input 
              type="text" 
              class="command-input"
              [(ngModel)]="commandInput"
              [placeholder]="state() === 'listening' ? (lastTranscript() || 'Listening...') : 'Type a command or click the orb to speak'"
              (keyup.enter)="submitCommand()"
              [disabled]="state() === 'thinking' || state() === 'speaking'"
            />
            <button 
              class="send-btn" 
              (click)="submitCommand()" 
              [disabled]="!commandInput.trim() || state() === 'thinking' || state() === 'speaking'"
            >
              <lucide-icon name="send" class="send-icon"></lucide-icon>
            </button>
          </div>
          
          <div class="footer-actions">
            <div class="state-indicator" [class.active]="state() !== 'idle'">
              <span class="indicator-dot" [class.listening]="state() === 'listening'" [class.thinking]="state() === 'thinking'" [class.speaking]="state() === 'speaking'"></span>
              <span class="indicator-text">{{ state() === 'idle' ? 'READY' : (state() === 'listening' ? 'LISTENING' : state() === 'thinking' ? 'PROCESSING' : 'SPEAKING') }}</span>
            </div>
          </div>
        </div>
      </footer>

      <!-- Corner decorations -->
      <div class="corner-logo corner-bl">
        <svg viewBox="0 0 24 24" class="axi-logo">
          <path d="M12 2L2 19h20L12 2z" fill="none" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </div>
      <div class="corner-logo corner-br">
        <svg viewBox="0 0 24 24" class="axi-logo">
          <path d="M12 2L2 19h20L12 2z" fill="none" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }

    .app-container {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0a0a1a 0%, #0d1221 50%, #0a0a1a 100%);
      color: white;
      position: relative;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Star Background */
    .stars-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .stars {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: 
        radial-gradient(2px 2px at 20px 30px, rgba(6, 182, 212, 0.8), transparent),
        radial-gradient(2px 2px at 40px 70px, rgba(147, 51, 234, 0.6), transparent),
        radial-gradient(1px 1px at 90px 40px, rgba(255, 255, 255, 0.6), transparent),
        radial-gradient(2px 2px at 160px 120px, rgba(6, 182, 212, 0.5), transparent),
        radial-gradient(1px 1px at 230px 80px, rgba(255, 255, 255, 0.4), transparent),
        radial-gradient(2px 2px at 300px 150px, rgba(147, 51, 234, 0.4), transparent);
      background-size: 350px 200px;
      animation: twinkle 8s ease-in-out infinite;
    }

    .stars-2 {
      background-image: 
        radial-gradient(1px 1px at 50px 60px, rgba(255, 255, 255, 0.5), transparent),
        radial-gradient(2px 2px at 120px 90px, rgba(6, 182, 212, 0.4), transparent),
        radial-gradient(1px 1px at 200px 40px, rgba(147, 51, 234, 0.5), transparent);
      background-size: 280px 180px;
      animation: twinkle 12s ease-in-out infinite;
      animation-delay: -4s;
    }

    .stars-3 {
      background-image: 
        radial-gradient(1px 1px at 80px 100px, rgba(255, 255, 255, 0.3), transparent),
        radial-gradient(2px 2px at 180px 60px, rgba(6, 182, 212, 0.3), transparent);
      background-size: 400px 220px;
      animation: twinkle 16s ease-in-out infinite;
      animation-delay: -8s;
    }

    @keyframes twinkle {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.7; }
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      z-index: 10;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo {
      display: flex;
      align-items: center;
    }

    .logo-text {
      font-size: 1.75rem;
      font-weight: 800;
      background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
    }

    .title {
      font-size: 1.25rem;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      letter-spacing: 0.02em;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 9999px;
      transition: all 0.3s ease;
    }

    .status-badge.listening {
      background: rgba(34, 197, 94, 0.15);
      border-color: rgba(34, 197, 94, 0.4);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: #06b6d4;
      border-radius: 50%;
      animation: pulse-dot 2s ease-in-out infinite;
    }

    .status-badge.listening .status-dot {
      background: #22c55e;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.9); }
    }

    .status-text {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      color: rgba(6, 182, 212, 0.9);
    }

    .status-badge.listening .status-text {
      color: rgba(34, 197, 94, 0.9);
    }

    .settings-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .settings-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .settings-btn .icon {
      width: 20px;
      height: 20px;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      display: flex;
      padding: 0 2rem;
      gap: 2rem;
      min-height: 0;
    }

    /* Panel */
    .panel {
      width: 260px;
      flex-shrink: 0;
      z-index: 5;
    }

    .panel-glass {
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Sessions Header (ChatGPT-style) */
    .sessions-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .header-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .new-chat-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .new-chat-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .btn-icon {
      width: 14px;
      height: 14px;
    }

    /* Sessions List (ChatGPT-style) */
    .sessions-list {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .session-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.65rem 0.75rem;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;
      margin-bottom: 2px;
    }

    .session-item:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .session-item.active {
      background: rgba(255, 255, 255, 0.12);
    }

    .session-title {
      flex: 1;
      font-size: 0.85rem;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.85);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .session-item.active .session-title {
      color: white;
    }

    .session-delete-btn {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      opacity: 0;
      transition: all 0.15s ease;
    }

    .session-item:hover .session-delete-btn {
      opacity: 1;
    }

    .session-delete-btn:hover {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    .delete-icon {
      width: 13px;
      height: 13px;
    }

    .empty-sessions-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      text-align: center;
      color: rgba(255, 255, 255, 0.3);
    }

    /* Center Section */
    .center-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-width: 0;
    }

    .chat-area {
      flex: 1;
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 1.5rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .chat-messages-wrapper {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column-reverse;
      gap: 1.5rem;
      padding-right: 0.5rem;
    }

    /* Panel & Chat Container */
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    /* Chat Messages */
    .chat-messages {
      display: flex;
      flex-direction: column-reverse;
      gap: 1.5rem;
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0.5rem 1rem 0;
    }

    .chat-message-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .chat-message {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
    }

    /* Message Avatars */
    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-avatar {
      background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    }

    .axi-avatar {
      background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
    }

    .avatar-icon {
      width: 18px;
      height: 18px;
      color: white;
    }

    /* Message Content */
    .message-content {
      flex: 1;
      min-width: 0;
    }

    .message-header {
      margin-bottom: 0.35rem;
    }

    .message-sender {
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      letter-spacing: 0.02em;
    }

    .message-bubble {
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.85rem;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.95);
      word-wrap: break-word;
      animation: messageSlideIn 0.3s ease;
    }

    @keyframes messageSlideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .user-bubble {
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid rgba(6, 182, 212, 0.3);
    }

    .axi-bubble {
      background: rgba(147, 51, 234, 0.12);
      border: 1px solid rgba(147, 51, 234, 0.25);
    }

    /* Empty Chat State */
    .empty-chat-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      text-align: center;
      color: rgba(255, 255, 255, 0.3);
    }

    .empty-icon {
      width: 48px;
      height: 48px;
      opacity: 0.4;
    }

    .empty-text {
      font-size: 0.95rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.5);
    }

    .empty-subtext {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.3);
    }

    /* Typing Indicator */
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 1rem 1.25rem;
      background: rgba(147, 51, 234, 0.12);
      border: 1px solid rgba(147, 51, 234, 0.25);
      border-radius: 12px;
      width: fit-content;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9333ea;
      animation: typingDot 1.4s infinite;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typingDot {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.7;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }

    /* Context Cards */
    .context-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 0.75rem;
      transition: all 0.2s ease;
    }

    .context-card:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .context-card.action-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .context-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .context-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    /* Dynamic color classes */
    .context-icon.color-cyan { color: #06b6d4; }
    .context-icon.color-purple { color: #9333ea; }
    .context-icon.color-red { color: #ef4444; }
    .context-icon.color-yellow { color: #fbbf24; }
    .context-icon.color-green { color: #22c55e; }
    .context-icon.color-blue { color: #3b82f6; }

    .context-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .context-title {
      font-size: 0.7rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .context-value {
      font-size: 0.9rem;
      font-weight: 500;
      color: white;
    }

    .context-label {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .action-btn {
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 8px;
      padding: 0.5rem 1rem;
      color: #06b6d4;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: rgba(6, 182, 212, 0.25);
    }

    /* Refresh Button */
    .refresh-btn {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;
      margin-left: auto;
    }

    .refresh-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
    }

    .refresh-icon {
      width: 14px;
      height: 14px;
    }

    .refresh-icon.spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .empty-context {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      color: rgba(255, 255, 255, 0.3);
      gap: 0.5rem;
    }

    .empty-context .empty-icon {
      width: 32px;
      height: 32px;
      opacity: 0.4;
    }

    /* Orb Section */
    .orb-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      min-height: 300px;
    }

    .orb-wrapper {
      position: relative;
      z-index: 2;
    }

    .status-text {
      margin-top: 1rem;
      text-align: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .status-text.visible {
      opacity: 1;
    }

    .state-label {
      font-size: 0.9rem;
      color: rgba(6, 182, 212, 0.8);
      font-weight: 500;
      letter-spacing: 0.05em;
      margin: 0;
    }

    /* Simple AXI Response Text */
    .axi-response-text {
      margin-top: 1.5rem;
      text-align: center;
      max-width: 600px;
      animation: fadeInUp 0.4s ease;
    }

    .axi-response-text p {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      margin: 0;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Footer */
    .footer {
      padding: 1.5rem 2rem 2rem;
      display: flex;
      justify-content: center;
      z-index: 10;
    }

    .status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 800px;
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
    }

    .command-input-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      max-width: 600px;
    }

    .command-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
      color: white;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
    }

    .command-input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .command-input:focus {
      border-color: rgba(6, 182, 212, 0.5);
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.15);
    }

    .command-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .send-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 8px;
      color: #06b6d4;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .send-btn:hover:not(:disabled) {
      background: rgba(6, 182, 212, 0.25);
      transform: scale(1.05);
    }

    .send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .send-icon {
      width: 18px;
      height: 18px;
    }

    .footer-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .state-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 9999px;
    }

    .indicator-dot {
      width: 8px;
      height: 8px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .indicator-dot.listening {
      background: #06b6d4;
      box-shadow: 0 0 8px rgba(6, 182, 212, 0.6);
      animation: dot-pulse 1s ease-in-out infinite;
    }

    .indicator-dot.thinking {
      background: #a855f7;
      box-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
      animation: dot-pulse 0.5s ease-in-out infinite;
    }

    .indicator-dot.speaking {
      background: #ec4899;
      box-shadow: 0 0 8px rgba(236, 72, 153, 0.6);
      animation: dot-pulse 0.8s ease-in-out infinite;
    }

    @keyframes dot-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.2); }
    }

    .indicator-text {
      font-size: 0.75rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Corner Logos */
    .corner-logo {
      position: absolute;
      width: 24px;
      height: 24px;
      color: rgba(6, 182, 212, 0.3);
      z-index: 1;
    }

    .corner-bl {
      bottom: 1.5rem;
      left: 2rem;
    }

    .corner-br {
      bottom: 1.5rem;
      right: 2rem;
    }

    .axi-logo {
      width: 100%;
      height: 100%;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 4px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(6, 182, 212, 0.2);
      border-radius: 10px;
    }
  `]
})
export class App {
  private voiceService = inject(VoiceService);
  private http = inject(HttpClient);
  skillContextService = inject(SkillContextService);

  state = this.voiceService.state;
  lastTranscript = this.voiceService.lastTranscript;
  lastResponse = this.voiceService.lastResponse;
  commands = this.voiceService.commands;

  // Sessions
  sessions = signal<any[]>([]);
  activeSessionId = signal<string | null>(null);

  // Command input field
  commandInput = '';

  constructor() {
    this.loadSessions();
  }

  async loadSessions() {
    try {
      const response = await firstValueFrom(
        this.http.get<{ sessions: any[]; currentSessionId: string }>('http://localhost:5000/api/sessions')
      );
      this.sessions.set(response.sessions);
      this.activeSessionId.set(response.currentSessionId);

      // Load messages for current session
      if (response.currentSessionId) {
        await this.loadSessionMessages(response.currentSessionId);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }

  async loadSessionMessages(sessionId: string) {
    try {
      const response = await firstValueFrom(
        this.http.get<{ session: any }>(`http://localhost:5000/api/sessions/${sessionId}`)
      );

      // Map session messages to commands format
      const messages = response.session.messages.map((msg: any) => ({
        text: msg.userInput,
        response: msg.aiResponse,
        timestamp: new Date(msg.timestamp)
      }));

      this.voiceService.commands.set(messages);
    } catch (error) {
      console.error('Failed to load session messages:', error);
    }
  }

  async createNewSession() {
    try {
      const response = await firstValueFrom(
        this.http.post<{ session: any }>('http://localhost:5000/api/sessions', {})
      );

      await this.loadSessions();
      this.activeSessionId.set(response.session.id);
      this.voiceService.commands.set([]);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }

  async selectSession(sessionId: string) {
    try {
      await firstValueFrom(
        this.http.post(`http://localhost:5000/api/sessions/${sessionId}/activate`, {})
      );

      this.activeSessionId.set(sessionId);
      await this.loadSessionMessages(sessionId);
    } catch (error) {
      console.error('Failed to select session:', error);
    }
  }

  async deleteSession(event: Event, sessionId: string) {
    event.stopPropagation(); // Prevent session selection when deleting

    try {
      await firstValueFrom(
        this.http.delete(`http://localhost:5000/api/sessions/${sessionId}`)
      );

      await this.loadSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  submitCommand() {
    const command = this.commandInput.trim();
    // Allow submit when idle or listening (not when thinking/speaking)
    if (command && (this.state() === 'idle' || this.state() === 'listening')) {
      console.log('Submitting command:', command);
      this.voiceService.processCommand(command);
      this.commandInput = '';

      // Reload sessions after command to update timestamps
      setTimeout(() => this.loadSessions(), 1000);
    }
  }

  // Skill Context Methods
  getIconName(iconName: string): string {
    // Map icon names to lucide icon names (kebab-case)
    const iconMap: Record<string, string> = {
      'cloud-sun': 'cloud-sun',
      'clock': 'clock',
      'globe': 'globe',
      'zap': 'zap',
      'cloud': 'cloud',
      'sun': 'sun',
      'youtube': 'youtube'
    };
    return iconMap[iconName] || 'zap';
  }

  refreshContext() {
    this.skillContextService.refresh();
  }

  executeContextAction(item: any) {
    this.skillContextService.executeAction(item);
  }
}
