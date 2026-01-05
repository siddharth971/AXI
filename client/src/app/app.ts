import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxiOrbComponent } from './components/core/axi-orb.component';
import { CommandHistoryComponent } from './components/chat/command-history.component';
import { SkillContextComponent } from './components/skills/skill-context.component';
import { VoiceService } from './services/voice.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    AxiOrbComponent,
    CommandHistoryComponent,
    SkillContextComponent
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
        <!-- Left Panel: Recent Command History -->
        <aside class="panel panel-left">
          <div class="panel-glass">
            <div class="panel-header">
              <lucide-icon name="clock" class="panel-icon"></lucide-icon>
              <span class="panel-title">Recent Command History</span>
            </div>
            <div class="command-list">
              @for (cmd of commandHistory; track cmd.id) {
                <div class="command-item">
                  <lucide-icon [name]="cmd.icon" class="command-icon"></lucide-icon>
                  <span class="command-text">{{ cmd.text }}</span>
                </div>
              }
              @if (commandHistory.length === 0) {
                <div class="empty-state">
                  <lucide-icon name="message-square" class="empty-icon"></lucide-icon>
                  <span>No commands yet</span>
                </div>
              }
            </div>
          </div>
        </aside>

        <!-- Center: Orb Visualizer -->
        <section class="orb-section">
          <div class="orb-wrapper">
            <app-axi-orb />
          </div>
          
          <!-- Status text below orb -->
          <div class="status-text" [class.visible]="state() !== 'idle'">
            <p class="state-label">
              {{ state() === 'listening' ? 'Listening...' : (state() === 'thinking' ? 'Processing...' : state() === 'speaking' ? 'Speaking...' : '') }}
            </p>
          </div>
        </section>

        <!-- Right Panel: Active Skill Context -->
        <aside class="panel panel-right">
          <div class="panel-glass">
            <div class="panel-header">
              <lucide-icon name="zap" class="panel-icon"></lucide-icon>
              <span class="panel-title">Active Skill Context</span>
            </div>
            
            <!-- Weather Card -->
            <div class="context-card">
              <div class="context-row">
                <lucide-icon name="cloud" class="context-icon weather"></lucide-icon>
                <lucide-icon name="sun" class="context-icon sun"></lucide-icon>
                <span class="context-value">25°C, Sunny</span>
              </div>
            </div>
            
            <!-- YouTube Card -->
            <div class="context-card youtube-card">
              <div class="context-row">
                <lucide-icon name="youtube" class="context-icon youtube"></lucide-icon>
                <span class="context-label">YouTube.com - Trending</span>
              </div>
              <button class="action-btn">
                Open Site
              </button>
            </div>
          </div>
        </aside>
      </main>

      <!-- Bottom: Status Bar -->
      <footer class="footer">
        <div class="status-bar">
          <div class="transcript-display" [class.visible]="lastTranscript()">
            <lucide-icon name="quote" class="quote-icon"></lucide-icon>
            <span class="transcript-text">{{ lastTranscript() || 'Click the orb to start speaking' }}</span>
          </div>
          
          <div class="footer-actions">
            <div class="state-indicator" [class.active]="state() !== 'idle'">
              <span class="indicator-dot" [class.listening]="state() === 'listening'" [class.thinking]="state() === 'thinking'" [class.speaking]="state() === 'speaking'"></span>
              <span class="indicator-text">{{ state() === 'idle' ? 'Ready' : (state() === 'listening' ? 'Listening' : state() === 'thinking' ? 'Processing' : 'Speaking') }}</span>
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

    /* Panels */
    .panel {
      width: 280px;
      flex-shrink: 0;
      z-index: 5;
    }

    .panel-glass {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.25rem;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .panel-icon {
      width: 18px;
      height: 18px;
      color: #06b6d4;
    }

    .panel-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
      letter-spacing: 0.02em;
    }

    /* Command List */
    .command-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      flex: 1;
      overflow-y: auto;
    }

    .command-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .command-item:hover {
      background: rgba(6, 182, 212, 0.1);
      border-color: rgba(6, 182, 212, 0.2);
    }

    .command-icon {
      width: 18px;
      height: 18px;
      color: #06b6d4;
    }

    .command-text {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.85);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem;
      color: rgba(255, 255, 255, 0.3);
      font-size: 0.8rem;
    }

    .empty-icon {
      width: 32px;
      height: 32px;
      opacity: 0.5;
    }

    /* Context Cards */
    .context-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }

    .context-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .context-icon {
      width: 20px;
      height: 20px;
    }

    .context-icon.weather {
      color: #94a3b8;
    }

    .context-icon.sun {
      color: #fbbf24;
    }

    .context-icon.youtube {
      color: #ef4444;
    }

    .context-value {
      font-size: 0.9rem;
      font-weight: 500;
      color: white;
      margin-left: 0.25rem;
    }

    .context-label {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .youtube-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
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

    /* Orb Section */
    .orb-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
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

    .transcript-display {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      opacity: 0.6;
      transition: opacity 0.3s ease;
    }

    .transcript-display.visible {
      opacity: 1;
    }

    .quote-icon {
      width: 16px;
      height: 16px;
      color: rgba(6, 182, 212, 0.6);
    }

    .transcript-text {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
      max-width: 500px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
  state = this.voiceService.state;
  lastTranscript = this.voiceService.lastTranscript;

  // Sample command history data
  commandHistory = [
    { id: 1, icon: 'globe', text: 'Open YouTube' },
    { id: 2, icon: 'volume-2', text: 'Set volume to 50%' },
    { id: 3, icon: 'tv', text: "What's the weather?" }
  ];
}
