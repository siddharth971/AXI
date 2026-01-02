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

import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectionStrategy,
  ElementRef,
  viewChild,
  effect,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import * as THREE from 'three';
import { OrbitControls, GLTFLoader } from 'three-stdlib';
import { AxiService } from '../../services/axi.service';

@Component({
  selector: 'app-axi-interface-3d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './axi-interface-3d.component.html',
  styleUrls: ['./axi-interface-3d.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AxiInterface3DComponent implements OnInit, AfterViewInit, OnDestroy {

  // Signals for UI reactive updates
  isListening = signal(false);
  isSpeaking = signal(false);
  transcript = signal('');
  response = signal('');
  volume = signal(0);
  emotion = signal('neutral');
  modelLoaded = signal(false);
  loadingProgress = signal(0);

  // System stats
  cpuUsage = signal(62);
  memoryUsage = signal(48);
  powerLevel = signal(100);
  connectionStatus = signal('ONLINE');
  currentTime = signal('');

  // Canvas reference
  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas3d');

  // Three.js core
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationId?: number;
  private clock = new THREE.Clock();

  // GLB Model
  private model!: THREE.Group;
  private mixer?: THREE.AnimationMixer;
  private gltfLoader = new GLTFLoader();
  private modelMeshes: THREE.Mesh[] = []; // Store meshes for animation

  // Body parts for animation
  private headBone?: THREE.Object3D;
  private leftArmBone?: THREE.Object3D;
  private rightArmBone?: THREE.Object3D;
  private spineBone?: THREE.Object3D;

  // Effects
  private hologramGlow!: THREE.PointLight;
  private scanLine!: THREE.Mesh;
  private circuitParticles!: THREE.Points;
  private hudRings: THREE.Mesh[] = [];

  // Speech recognition
  private recognition!: SpeechRecognition;
  private restartTimeout: any;
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private dataArray?: Uint8Array<ArrayBuffer>;
  private visualizerAnimationId?: number;

  constructor(private axi: AxiService) {
    effect(() => {
      const vol = this.volume();
      const emo = this.emotion();
      this.updateModelAppearance(vol, emo);
    });

    // Update time
    setInterval(() => {
      const now = new Date();
      this.currentTime.set(now.toLocaleTimeString('en-US', { hour12: false }));
      this.cpuUsage.set(45 + Math.floor(Math.random() * 30));
      this.memoryUsage.set(40 + Math.floor(Math.random() * 25));
    }, 1000);
  }

  getCurrentDate(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options).toUpperCase();
  }

  ngOnInit() {
    this.initSpeechRecognition();
  }

  ngAfterViewInit() {
    this.initThreeJS();
    this.loadGLBModel();
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.visualizerAnimationId) cancelAnimationFrame(this.visualizerAnimationId);
    this.renderer?.dispose();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  // ------------------------------------------------------------
  // Three.js Initialization
  // ------------------------------------------------------------
  private initThreeJS() {
    const canvas = this.canvasRef().nativeElement;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Disable tone mapping for accurate colors
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a12);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1, 4);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 10;
    this.controls.target.set(0, 0.8, 0);

    this.createLights();
    this.createBackground();
    this.createHUDElements();
    this.createEffects();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  // ------------------------------------------------------------
  // Load GLB Model
  // ------------------------------------------------------------
  private loadGLBModel() {
    // Use highres.glb (no textures) for pure wireframe
    const modelPath = 'assets/highres.glb';

    this.gltfLoader.load(
      modelPath,
      (gltf) => {
        this.model = gltf.scene;

        // Apply holographic wireframe material to ALL meshes
        const meshNames: string[] = [];

        this.model.traverse((child) => {
          // Log all names to find body parts
          if (child.name) meshNames.push(child.name);

          if (child instanceof THREE.Mesh) {
            // Dispose old material and textures
            if (child.material) {
              const oldMat = child.material as THREE.MeshStandardMaterial;
              if (oldMat.map) oldMat.map.dispose();
              if (oldMat.normalMap) oldMat.normalMap.dispose();
              oldMat.dispose();
            }

            // Apply pure cyan wireframe - no textures
            const wireframeMat = new THREE.MeshBasicMaterial({
              color: 0x00ffff, // Pure cyan
              wireframe: true,
              transparent: true,
              opacity: 1.0,
            });
            child.material = wireframeMat;
            this.modelMeshes.push(child); // Store for animation
          }

          // Find body parts for animation (check various naming conventions)
          const name = child.name.toLowerCase();
          if (name.includes('head') || name.includes('neck') || name.includes('skull')) {
            this.headBone = child;
          } else if (name.includes('arm') && (name.includes('left') || name.includes('l_') || name.includes('_l'))) {
            if (!this.leftArmBone) this.leftArmBone = child;
          } else if (name.includes('arm') && (name.includes('right') || name.includes('r_') || name.includes('_r'))) {
            if (!this.rightArmBone) this.rightArmBone = child;
          } else if (name.includes('hip') || name.includes('pelvis') || name.includes('root')) {
            if (!this.spineBone) this.spineBone = child;
          }
        });

        console.log('All mesh/bone names:', meshNames);

        console.log('Found bones:', {
          head: this.headBone?.name,
          leftArm: this.leftArmBone?.name,
          rightArm: this.rightArmBone?.name,
          spine: this.spineBone?.name
        });

        // Center and scale model
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.5 / maxDim; // Slightly larger
        this.model.scale.setScalar(scale);

        // Center the model
        this.model.position.x = -center.x * scale;
        this.model.position.y = -box.min.y * scale + 0.1;
        this.model.position.z = -center.z * scale;

        this.scene.add(this.model);
        this.modelLoaded.set(true);

        // Setup GLB animations if available
        if (gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model);
          gltf.animations.forEach((clip) => {
            const action = this.mixer!.clipAction(clip);
            action.play();
          });
        }

        console.log('Model loaded with', gltf.animations.length, 'animations');
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        this.loadingProgress.set(Math.round(percent));
        console.log(`Loading model: ${percent.toFixed(1)}%`);
      },
      (error) => {
        console.error('Error loading model:', error);
        // Try fallback to highres.glb
        this.loadFallbackModel();
      }
    );
  }

  private loadFallbackModel() {
    this.gltfLoader.load(
      'assets/highres.glb',
      (gltf) => {
        this.model = gltf.scene;
        this.applyHologramMaterial();
        this.centerModel();
        this.scene.add(this.model);
        this.modelLoaded.set(true);
      },
      undefined,
      (error) => {
        console.error('Failed to load fallback model:', error);
      }
    );
  }

  private applyHologramMaterial() {
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x00f3ff,
          wireframe: true,
          transparent: true,
          opacity: 0.6,
        });
      }
    });
  }

  private centerModel() {
    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    this.model.scale.setScalar(scale);
    this.model.position.x = -center.x * scale;
    this.model.position.y = -box.min.y * scale;
    this.model.position.z = -center.z * scale;
  }

  // ------------------------------------------------------------
  // Lights
  // ------------------------------------------------------------
  private createLights() {
    const ambient = new THREE.AmbientLight(0x001122, 0.5);
    this.scene.add(ambient);

    // Main cyan hologram light
    this.hologramGlow = new THREE.PointLight(0x00f3ff, 3, 15);
    this.hologramGlow.position.set(0, 2, 3);
    this.scene.add(this.hologramGlow);

    // Secondary orange accent
    const orangeLight = new THREE.PointLight(0xff6600, 1, 10);
    orangeLight.position.set(-2, 1, 2);
    this.scene.add(orangeLight);

    // Back rim light
    const rimLight = new THREE.PointLight(0x00f3ff, 1, 10);
    rimLight.position.set(0, 2, -3);
    this.scene.add(rimLight);
  }

  // ------------------------------------------------------------
  // Background
  // ------------------------------------------------------------
  private createBackground() {
    // Grid floor
    const gridGeometry = new THREE.PlaneGeometry(40, 40, 40, 40);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = 0;
    this.scene.add(grid);

    // Vertical back grid
    const backGrid = new THREE.Mesh(gridGeometry, gridMaterial.clone());
    backGrid.position.z = -10;
    this.scene.add(backGrid);

    // Stars
    const starCount = 800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 60;
      starPositions[i * 3 + 1] = Math.random() * 30;
      starPositions[i * 3 + 2] = -15 - Math.random() * 30;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.05,
      transparent: true,
      opacity: 0.4,
    }));
    this.scene.add(stars);
  }

  // ------------------------------------------------------------
  // HUD Elements
  // ------------------------------------------------------------
  private createHUDElements() {
    // Circular rings around the model
    for (let i = 0; i < 3; i++) {
      const radius = 1.5 + i * 0.3;
      const ringGeometry = new THREE.TorusGeometry(radius, 0.008, 8, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.4 - i * 0.1,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.1;
      this.scene.add(ring);
      this.hudRings.push(ring);
    }

    // Accent rings (orange)
    const accentRingGeometry = new THREE.TorusGeometry(1.8, 0.01, 8, 64);
    const accentRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.3,
    });
    const accentRing = new THREE.Mesh(accentRingGeometry, accentRingMaterial);
    accentRing.rotation.x = Math.PI / 2;
    accentRing.position.y = 0.1;
    this.scene.add(accentRing);
    this.hudRings.push(accentRing);
  }

  // ------------------------------------------------------------
  // Effects
  // ------------------------------------------------------------
  private createEffects() {
    // Scan line
    const scanGeometry = new THREE.PlaneGeometry(4, 0.02);
    const scanMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.4,
    });
    this.scanLine = new THREE.Mesh(scanGeometry, scanMaterial);
    this.scanLine.position.z = 0.5;
    this.scene.add(this.scanLine);

    // Floating particles
    const particleCount = 150;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.2 + Math.random() * 0.8;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = Math.random() * 3;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    this.circuitParticles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.circuitParticles);
  }

  // ------------------------------------------------------------
  // Animation Loop
  // ------------------------------------------------------------
  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    this.controls.update();

    // Update animation mixer
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Model animation
    if (this.model) {
      // Idle floating motion
      const baseY = this.model.userData['baseY'] || this.model.position.y;
      this.model.userData['baseY'] = baseY;
      this.model.position.y = baseY + Math.sin(time * 1.5) * 0.05;

      // Gentle body sway
      this.model.rotation.y = Math.sin(time * 0.5) * 0.15;
      this.model.rotation.z = Math.sin(time * 0.7) * 0.02;

      // When speaking or listening - more active
      const isActive = this.isListening() || this.isSpeaking();
      const activityMultiplier = isActive ? 2.5 : 1;

      // Head animation (looking around)
      if (this.headBone) {
        this.headBone.rotation.y = Math.sin(time * 0.8) * 0.2 * activityMultiplier;
        this.headBone.rotation.x = Math.sin(time * 0.6) * 0.1 * activityMultiplier;
      }

      // Left arm animation
      if (this.leftArmBone) {
        this.leftArmBone.rotation.z = Math.sin(time * 1.2) * 0.15 * activityMultiplier;
        this.leftArmBone.rotation.x = Math.sin(time * 0.9) * 0.1 * activityMultiplier;
      }

      // Right arm animation  
      if (this.rightArmBone) {
        this.rightArmBone.rotation.z = -Math.sin(time * 1.2 + 0.5) * 0.15 * activityMultiplier;
        this.rightArmBone.rotation.x = Math.sin(time * 0.9 + 0.5) * 0.1 * activityMultiplier;
      }

      // Spine/torso breathing
      if (this.spineBone) {
        this.spineBone.scale.y = 1 + Math.sin(time * 2) * 0.02;
      }

      // Hologram pulse/glitch effect on all meshes
      const pulseIntensity = 0.7 + Math.sin(time * 3) * 0.15 + (this.volume() / 200);
      const isGlitch = Math.random() > 0.98; // Occasional glitch

      this.modelMeshes.forEach((mesh, i) => {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (isGlitch) {
          mat.opacity = Math.random() * 0.5 + 0.5;
          mesh.position.x += (Math.random() - 0.5) * 0.02;
        } else {
          mat.opacity = pulseIntensity;
        }
      });
    }

    // HUD rings rotation
    this.hudRings.forEach((ring, i) => {
      ring.rotation.z += delta * (0.1 + i * 0.03) * (i % 2 === 0 ? 1 : -1);
    });

    // Scan line movement
    if (this.scanLine) {
      this.scanLine.position.y = Math.sin(time * 2) * 1.5 + 1;
      (this.scanLine.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(time * 3) * 0.15;
    }

    // Particles orbital movement
    if (this.circuitParticles) {
      this.circuitParticles.rotation.y += delta * 0.15;
      const positions = this.circuitParticles.geometry.attributes['position'] as THREE.BufferAttribute;
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.002;
      }
      positions.needsUpdate = true;
    }

    // Hologram glow intensity
    if (this.hologramGlow) {
      const intensity = 2 + (this.isListening() ? 1.5 : 0) + (this.isSpeaking() ? 1 : 0) + (this.volume() / 40);
      this.hologramGlow.intensity = intensity;
    }

    this.renderer.render(this.scene, this.camera);
  };

  // ------------------------------------------------------------
  // Update Model Appearance
  // ------------------------------------------------------------
  private updateModelAppearance(volume: number, emotion: string) {
    if (!this.model) return;

    let color: number;
    switch (emotion) {
      case 'happy': color = 0x39ff14; break;
      case 'angry': color = 0xff3e3e; break;
      case 'sad': color = 0x4488ff; break;
      case 'excited': color = 0xff00ff; break;
      case 'thinking': color = 0xffff00; break;
      default: color = 0x00f3ff;
    }

    // Update model material color
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshBasicMaterial;
        if (mat.wireframe) {
          mat.color.setHex(color);
          mat.opacity = 0.5 + (volume / 150);
        }
      }
    });

    // Update hologram glow color
    if (this.hologramGlow) {
      this.hologramGlow.color.setHex(color);
    }
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ------------------------------------------------------------
  // Audio Visualizer
  // ------------------------------------------------------------
  private async startVisualizer() {
    try {
      if (!this.audioContext) this.audioContext = new AudioContext();
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
        const sum = this.dataArray.reduce((a, b) => a + b, 0);
        this.volume.set(sum / this.dataArray.length);
        this.visualizerAnimationId = requestAnimationFrame(update);
      };
      update();
    } catch (err) {
      console.warn('Audio visualizer failed:', err);
    }
  }

  private stopVisualizer() {
    if (this.visualizerAnimationId) cancelAnimationFrame(this.visualizerAnimationId);
    this.volume.set(0);
  }

  // ------------------------------------------------------------
  // Speech Recognition
  // ------------------------------------------------------------
  private initSpeechRecognition() {
    const SpeechRecognitionConstructor = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognitionConstructor) {
      this.transcript.set('Speech Recognition not supported.');
      return;
    }

    this.recognition = new SpeechRecognitionConstructor();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-IN';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      if (final) { this.transcript.set(final); this.handleCommand(final); }
      else if (interim) this.transcript.set(interim + '...');
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      this.transcript.set('Error: ' + event.error);
      this.isListening.set(false);
      this.stopVisualizer();
    };

    this.recognition.onend = () => {
      if (this.isListening()) this.restartTimeout = setTimeout(() => this.safeStart(), 500);
      else this.stopVisualizer();
    };
  }

  toggleListening() {
    if (!this.recognition) { alert('Speech recognition requires Chrome.'); return; }
    if (this.isListening()) this.stopListening();
    else this.startListening();
  }

  private startListening() {
    this.isListening.set(true);
    this.transcript.set('Listening…');
    this.emotion.set('thinking');
    this.safeStart();
    this.startVisualizer();
  }

  private stopListening() {
    this.isListening.set(false);
    this.recognition.stop();
    this.stopVisualizer();
    this.emotion.set('neutral');
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
  }

  private safeStart() {
    try { this.recognition.start(); } catch (e) { console.warn('Recognition already running:', e); }
  }

  private async handleCommand(text: string) {
    this.isListening.set(false);
    this.recognition.stop();
    this.stopVisualizer();

    try {
      const result = await lastValueFrom(this.axi.sendCommand(text));
      this.response.set(result.response);
      this.isSpeaking.set(true);

      const lowText = text.toLowerCase();
      if (lowText.includes('angry') || lowText.includes('stop')) this.emotion.set('angry');
      else if (lowText.includes('happy') || lowText.includes('good')) this.emotion.set('happy');
      else if (lowText.includes('sad')) this.emotion.set('sad');
      else this.emotion.set('neutral');

      const speakInterval = setInterval(() => {
        if (!this.isSpeaking()) { clearInterval(speakInterval); this.volume.set(0); this.emotion.set('neutral'); }
        else { this.volume.set(15 + Math.random() * 25); if (this.volume() > 35) this.emotion.set('excited'); }
      }, 100);

      await this.axi.speak(result.response);
      this.isSpeaking.set(false);
      setTimeout(() => this.startListening(), 400);
    } catch (err) {
      console.error(err);
      this.response.set('Error occurred.');
      this.isListening.set(false);
      this.isSpeaking.set(false);
      this.emotion.set('sad');
    }
  }
}
