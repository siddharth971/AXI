import { Component, ElementRef, OnInit, OnDestroy, ViewChild, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceService, AxiState } from 'app/services/voice.service';

@Component({
  selector: 'app-axi-orb',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orb-container" (click)="toggleListening()">
      <!-- Outer glow layers -->
      <div class="glow-outer" [class.listening]="state() === 'listening'" [class.speaking]="state() === 'speaking'" [class.thinking]="state() === 'thinking'"></div>
      <div class="glow-middle" [class.listening]="state() === 'listening'" [class.speaking]="state() === 'speaking'" [class.thinking]="state() === 'thinking'"></div>
      
      <!-- Main orb canvas -->
      <canvas #orbCanvas class="orb-canvas"></canvas>
      
      <!-- Waveform overlay -->
      <canvas #waveCanvas class="wave-canvas" [class.active]="state() === 'listening' || state() === 'speaking'"></canvas>
      
      <!-- Inner core glow -->
      <div class="core-glow" 
           [class.listening]="state() === 'listening'" 
           [class.speaking]="state() === 'speaking'" 
           [class.thinking]="state() === 'thinking'"
           [style.transform]="'scale(' + (1 + audioLevel() * 0.8) + ')'"></div>
      
      <!-- Click hint -->
      <div class="click-hint" [class.visible]="state() === 'idle'">
        <span>Click to speak</span>
      </div>
    </div>
  `,
  styles: [`
    .orb-container {
      width: 400px;
      height: 400px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    .orb-container:hover {
      transform: scale(1.02);
    }
    
    .orb-container:active {
      transform: scale(0.98);
    }
    
    .orb-canvas {
      width: 320px;
      height: 320px;
      position: absolute;
      z-index: 2;
    }
    
    .wave-canvas {
      width: 280px;
      height: 100px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 3;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .wave-canvas.active {
      opacity: 1;
    }
    
    .glow-outer {
      position: absolute;
      width: 380px;
      height: 380px;
      border-radius: 50%;
      background: radial-gradient(circle, 
        rgba(147, 51, 234, 0.15) 0%, 
        rgba(236, 72, 153, 0.1) 30%,
        rgba(59, 130, 246, 0.05) 60%,
        transparent 80%);
      filter: blur(40px);
      z-index: 0;
      transition: all 0.5s ease;
      animation: pulse-glow 4s ease-in-out infinite;
    }
    
    .glow-outer.listening {
      background: radial-gradient(circle, 
        rgba(6, 182, 212, 0.35) 0%, 
        rgba(59, 130, 246, 0.2) 40%,
        transparent 70%);
      animation: pulse-glow-fast 1.5s ease-in-out infinite;
    }
    
    .glow-outer.speaking {
      background: radial-gradient(circle, 
        rgba(236, 72, 153, 0.25) 0%, 
        rgba(147, 51, 234, 0.15) 40%,
        transparent 70%);
    }
    
    .glow-outer.thinking {
      background: radial-gradient(circle, 
        rgba(147, 51, 234, 0.3) 0%, 
        rgba(59, 130, 246, 0.2) 40%,
        transparent 70%);
      animation: pulse-glow-fast 0.8s ease-in-out infinite;
    }
    
    .glow-middle {
      position: absolute;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      background: radial-gradient(circle, 
        rgba(236, 72, 153, 0.2) 0%, 
        rgba(147, 51, 234, 0.1) 50%,
        transparent 70%);
      filter: blur(25px);
      z-index: 1;
      transition: all 0.5s ease;
    }
    
    .glow-middle.listening {
      background: radial-gradient(circle, 
        rgba(6, 182, 212, 0.4) 0%, 
        rgba(59, 130, 246, 0.2) 50%,
        transparent 70%);
    }
    
    .core-glow {
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: radial-gradient(circle, 
        rgba(255, 255, 255, 0.3) 0%, 
        rgba(236, 72, 153, 0.2) 40%,
        transparent 70%);
      filter: blur(15px);
      z-index: 4;
      transition: transform 0.05s ease, background 0.3s ease;
    }
    
    .core-glow.listening {
      width: 120px;
      height: 120px;
      background: radial-gradient(circle, 
        rgba(6, 182, 212, 0.6) 0%, 
        rgba(59, 130, 246, 0.4) 40%,
        transparent 70%);
    }
    
    .core-glow.speaking {
      animation: core-pulse 0.5s ease-in-out infinite;
    }
    
    .click-hint {
      position: absolute;
      bottom: -50px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.4);
      opacity: 0;
      transition: opacity 0.3s ease;
      white-space: nowrap;
      pointer-events: none;
    }
    
    .click-hint.visible {
      opacity: 1;
    }
    
    .orb-container:hover .click-hint.visible {
      color: rgba(6, 182, 212, 0.8);
    }
    
    @keyframes pulse-glow {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.05); opacity: 1; }
    }
    
    @keyframes pulse-glow-fast {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.1); opacity: 1; }
    }
    
    @keyframes core-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
    
    .arrow-right {
      animation-name: arrow-pulse-right;
    }
    
    @keyframes arrow-pulse-right {
      0%, 100% { opacity: 0.4; transform: translateX(0); }
      50% { opacity: 0.8; transform: translateX(3px); }
    }
  `]
})
export class AxiOrbComponent implements OnInit, OnDestroy {
  @ViewChild('orbCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('waveCanvas', { static: true }) waveCanvasRef!: ElementRef<HTMLCanvasElement>;

  private voiceService = inject(VoiceService);
  state = this.voiceService.state;
  audioLevel = this.voiceService.audioLevel;
  frequencyData = this.voiceService.frequencyData;

  private ctx!: CanvasRenderingContext2D;
  private waveCtx!: CanvasRenderingContext2D;
  private particles: PlasmaParticle[] = [];
  private wisps: Wisp[] = [];
  private animationId?: number;
  private time = 0;

  constructor() {
    effect(() => {
      const currentState = this.state();
      this.updateVisualsForState(currentState);
    });
  }

  ngOnInit() {
    this.initOrbCanvas();
    this.initWaveCanvas();
    this.initParticles();
    this.initWisps();
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  toggleListening() {
    this.voiceService.toggleListening();
  }

  private initOrbCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = 320;
    canvas.height = 320;
    this.ctx = canvas.getContext('2d')!;
  }

  private initWaveCanvas() {
    const canvas = this.waveCanvasRef.nativeElement;
    canvas.width = 280;
    canvas.height = 100;
    this.waveCtx = canvas.getContext('2d')!;
  }

  private initParticles() {
    const particleCount = 3000;
    const centerX = 160;
    const centerY = 160;
    const radius = 120;

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = radius * (0.7 + Math.random() * 0.3);

      const x = centerX + r * Math.sin(phi) * Math.cos(theta);
      const y = centerY + r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const colorType = Math.random();
      let color: { r: number; g: number; b: number };

      if (colorType < 0.33) {
        color = { r: 236, g: 72, b: 153 };  // Pink
      } else if (colorType < 0.66) {
        color = { r: 147, g: 51, b: 234 };  // Purple
      } else {
        color = { r: 59, g: 130, b: 246 };   // Blue
      }

      this.particles.push({
        x, y, z,
        baseX: x,
        baseY: y,
        baseZ: z,
        color,
        size: 1 + Math.random() * 2,
        speed: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  private initWisps() {
    const wispCount = 8;
    for (let i = 0; i < wispCount; i++) {
      this.wisps.push({
        angle: (i / wispCount) * Math.PI * 2,
        radius: 80 + Math.random() * 40,
        speed: 0.5 + Math.random() * 0.5,
        amplitude: 20 + Math.random() * 30,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.5
          ? { r: 236, g: 72, b: 153 }
          : { r: 147, g: 51, b: 234 }
      });
    }
  }

  private updateVisualsForState(state: AxiState) {
    const speedMultiplier = state === 'listening' ? 2 : state === 'thinking' ? 3 : state === 'speaking' ? 1.5 : 1;
    this.particles.forEach(p => {
      p.speed = (0.3 + Math.random() * 0.7) * speedMultiplier;
    });
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.time += 0.016;

    this.drawOrb();
    this.drawWaveform();
  };

  private drawOrb() {
    const ctx = this.ctx;
    const width = 320;
    const height = 320;
    const centerX = width / 2;
    const centerY = height / 2;
    const orbRadius = 140;  // Define orb boundary radius

    // Clear canvas with transparency
    ctx.clearRect(0, 0, width, height);

    // Create circular clipping mask to keep orb round
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, orbRadius + 20, 0, Math.PI * 2);
    ctx.clip();

    const currentState = this.state();
    const currentAudioLevel = this.audioLevel();
    const rotationSpeed = currentState === 'thinking' ? 0.03 : currentState === 'listening' ? 0.02 : 0.008;

    // Audio-reactive breathing - orb expands/contracts with audio level
    const audioReactiveScale = currentState === 'listening' ? (1 + currentAudioLevel * 0.15) : 1;
    const breatheScale = (1 + Math.sin(this.time * 2) * 0.03) * audioReactiveScale;

    // Draw wisps (plasma trails) - react to audio
    this.wisps.forEach((wisp, index) => {
      const audioBoost = currentState === 'listening' ? currentAudioLevel * 0.8 : 0;
      wisp.angle += (wisp.speed + audioBoost) * 0.02;

      const wispRadius = wisp.radius + (currentState === 'listening' ? currentAudioLevel * 20 : 0);
      const wispX = centerX + Math.cos(wisp.angle) * Math.min(wispRadius, orbRadius - 20);
      const wispY = centerY + Math.sin(wisp.angle + Math.sin(this.time * 2) * 0.3) * Math.min(wispRadius, orbRadius - 20) * 0.8;

      const wispSize = 30 + (currentState === 'listening' ? currentAudioLevel * 25 : 0);
      const gradient = ctx.createRadialGradient(wispX, wispY, 0, wispX, wispY, wispSize);
      const alpha = 0.4 + (currentState === 'listening' ? currentAudioLevel * 0.6 : 0);
      gradient.addColorStop(0, `rgba(${wisp.color.r}, ${wisp.color.g}, ${wisp.color.b}, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(${wisp.color.r}, ${wisp.color.g}, ${wisp.color.b}, ${alpha * 0.25})`);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(wispX, wispY, wispSize, 0, Math.PI * 2);
      ctx.fill();
    });

    // Sort and draw particles
    this.particles.sort((a, b) => a.z - b.z);

    // Get frequency data for particle coloring
    const freqData = this.frequencyData();

    this.particles.forEach((particle, index) => {
      // Audio-reactive rotation speed
      const audioSpeedBoost = currentState === 'listening' ? currentAudioLevel * 0.02 : 0;
      const angle = this.time * (rotationSpeed + audioSpeedBoost) * particle.speed + particle.phase;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const dx = particle.baseX - centerX;
      const dz = particle.baseZ;

      const rotatedX = centerX + dx * cosA - dz * sinA;
      const rotatedZ = dx * sinA + dz * cosA;

      // Apply breathing scale with audio reaction
      const finalX = centerX + (rotatedX - centerX) * breatheScale;
      const finalY = centerY + (particle.baseY - centerY) * breatheScale;

      // Perspective projection
      const perspective = 300;
      const scale = perspective / (perspective + rotatedZ);
      const projectedX = centerX + (finalX - centerX) * scale;
      const projectedY = centerY + (finalY - centerY) * scale;

      // Audio-reactive particle size
      const freqIndex = Math.floor((index / this.particles.length) * freqData.length);
      const freqValue = freqData[freqIndex] || 0;
      const audioSizeBoost = currentState === 'listening' ? (freqValue / 255) * 1.5 : 0;
      const projectedSize = (particle.size + audioSizeBoost) * scale;

      // Depth-based opacity with audio boost
      const depthOpacity = (rotatedZ + 120) / 240;
      const audioOpacityBoost = currentState === 'listening' ? currentAudioLevel * 0.3 : 0;
      const opacity = Math.max(0.1, Math.min(0.95, depthOpacity + audioOpacityBoost));

      // Dynamic color based on state and audio
      let { r, g, b } = particle.color;
      if (currentState === 'listening') {
        // Shift towards cyan when listening, intensity based on audio
        const shift = 0.15 + currentAudioLevel * 0.4;
        r = Math.round(r * (1 - shift) + 6 * shift);
        g = Math.round(g * (1 - shift) + 182 * shift);
        b = Math.round(b * (1 - shift) + 212 * shift);
      }

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.beginPath();
      ctx.arc(projectedX, projectedY, projectedSize, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw mesh/grid lines for structure - react to audio
    const gridOpacity = 0.1 + (currentState === 'listening' ? currentAudioLevel * 0.15 : 0);
    ctx.strokeStyle = `rgba(147, 51, 234, ${gridOpacity})`;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + this.time * 0.1;
      const innerRadius = 60 - (currentState === 'listening' ? currentAudioLevel * 10 : 0);
      const outerRadius = 100 + (currentState === 'listening' ? currentAudioLevel * 10 : 0);
      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * outerRadius;
      const y2 = centerY + Math.sin(angle) * outerRadius;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Restore canvas state (remove clipping)
    ctx.restore();
  }

  private drawWaveform() {
    const ctx = this.waveCtx;
    const width = 280;
    const height = 100;
    const currentState = this.state();

    ctx.clearRect(0, 0, width, height);

    if (currentState !== 'listening' && currentState !== 'speaking') {
      return;
    }

    const freqData = this.frequencyData();
    const audioLevel = this.audioLevel();

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0)');
    gradient.addColorStop(0.2, 'rgba(6, 182, 212, 0.8)');
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 1)');
    gradient.addColorStop(0.8, 'rgba(6, 182, 212, 0.8)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const centerY = height / 2;
    const centerX = width / 2;

    // Use actual frequency data for waveform when listening
    if (currentState === 'listening' && freqData.length > 0) {
      // Calculate overall audio intensity from first quarter of frequency data (where voice is)
      let voiceEnergy = 0;
      const voiceRange = Math.floor(freqData.length / 4);
      for (let i = 0; i < voiceRange; i++) {
        voiceEnergy += freqData[i];
      }
      voiceEnergy = (voiceEnergy / voiceRange) / 255;  // Normalize to 0-1

      for (let x = 0; x < width; x++) {
        const progress = x / width;  // 0 to 1

        // Create centered symmetric amplitude - strongest in middle, fades at edges
        const distFromCenter = Math.abs(progress - 0.5) * 2;  // 0 at center, 1 at edges
        const centerFade = 1 - distFromCenter * distFromCenter;  // Parabolic fade

        // Base amplitude driven by voice energy
        const baseAmplitude = voiceEnergy * 40 * centerFade;

        // Multiple wave frequencies for organic look
        const wavePhase = this.time * 6;
        const y = centerY +
          Math.sin(x * 0.05 + wavePhase) * baseAmplitude +
          Math.sin(x * 0.1 + wavePhase * 1.3) * baseAmplitude * 0.3 +
          Math.sin(x * 0.02 + wavePhase * 0.7) * baseAmplitude * 0.2;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
    } else {
      // Fallback animated waveform for speaking state
      const amplitude = 20;

      for (let x = 0; x < width; x++) {
        const progress = x / width;  // 0 to 1

        // Fade amplitude at edges for centered look
        const distFromCenter = Math.abs(progress - 0.5) * 2;
        const centerFade = 1 - distFromCenter * distFromCenter;

        const y = centerY +
          Math.sin(x * 0.04 + this.time * 5) * amplitude * centerFade * Math.sin(this.time * 3) +
          Math.sin(x * 0.08 + this.time * 3) * (amplitude * 0.4) * centerFade +
          Math.sin(x * 0.02 + this.time * 7) * (amplitude * 0.3) * centerFade;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
    }

    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

interface PlasmaParticle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  color: { r: number; g: number; b: number };
  size: number;
  speed: number;
  phase: number;
}

interface Wisp {
  angle: number;
  radius: number;
  speed: number;
  amplitude: number;
  phase: number;
  color: { r: number; g: number; b: number };
}
