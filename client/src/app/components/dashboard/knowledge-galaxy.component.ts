import { Component, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

@Component({
  selector: 'app-knowledge-galaxy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="galaxy-container" [class.fullscreen]="fullscreen" #rendererContainer>
      <div *ngIf="loading" class="loading-overlay">Initializing Neural Map...</div>
      
      <!-- Integrated Detail Overlay (Optional fallback) -->
      @if (selectedNode) {
        <div class="node-tooltip" [style.left.px]="tooltipPos.x" [style.top.px]="tooltipPos.y">
          <h3>{{ selectedNode.brand }}</h3>
          <p>{{ selectedNode.domain }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .galaxy-container {
      width: 100%;
      height: 400px; /* Fixed height for the window */
      position: relative;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
    }
    .galaxy-container.fullscreen {
      width: 100vw;
      height: 100vh;
      border-radius: 0;
      position: fixed;
      top: 0; left: 0;
      z-index: 0; /* Behind UI overlay */
    }
    .loading-overlay {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      color: #06b6d4;
      font-family: monospace;
      z-index: 10;
    }
    .node-tooltip {
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid #06b6d4;
      padding: 10px;
      border-radius: 8px;
      pointer-events: none;
      transform: translate(-50%, -100%);
      margin-top: -15px;
      z-index: 20;
    }
    .node-tooltip h3 { margin: 0; color: #fff; font-size: 0.9rem; }
    .node-tooltip p { margin: 0; color: #aaa; font-size: 0.75rem; }
  `]
})
export class KnowledgeGalaxyComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;
  @Input() blueprints: any[] = [];
  @Input() fullscreen: boolean = false;
  @Output() nodeSelect = new EventEmitter<any>();

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId: number = 0;

  private particles: THREE.Group = new THREE.Group();
  private connections: THREE.Group = new THREE.Group();

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  loading = true;
  selectedNode: any = null;
  tooltipPos = { x: 0, y: 0 };

  constructor() { }

  ngAfterViewInit() {
    this.initThree();
    this.createGalaxy();
    this.animate();
    this.loading = false;
  }

  @HostListener('window:resize')
  onResize() {
    this.onWindowResize();
  }

  // Handle click interaction
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.renderer || !this.camera) return;

    // Calculate mouse position in normalized device coordinates
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.particles.children);

    if (intersects.length > 0) {
      const target: any = intersects[0].object;
      if (target.userData && target.userData.id !== undefined) {
        const bp = this.blueprints[target.userData.id];
        this.selectedNode = bp;
        this.tooltipPos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        this.nodeSelect.emit(bp);

        // Highlight effect
        // (Optional: Implement glow mesh)
      }
    } else {
      this.selectedNode = null;
    }
  }

  ngOnChanges() {
    // If blueprints update, recreate galaxy
    if (this.scene) {
      this.createGalaxy();
    }
  }

  private initThree() {
    const container = this.rendererContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050510); // Deep dark blue/black
    this.scene.fog = new THREE.FogExp2(0x050510, 0.002);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.z = this.fullscreen ? 30 : 50;
    this.camera.position.y = 20;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 100);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);
  }

  private createGalaxy() {
    // Clear previous
    this.scene.remove(this.particles);
    this.scene.remove(this.connections);
    this.particles = new THREE.Group();
    this.connections = new THREE.Group();

    // Central Core (The AI)
    const coreGeo = new THREE.IcosahedronGeometry(2, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    this.particles.add(core);

    // Texture Loader
    const loader = new THREE.TextureLoader();

    // Create particles
    this.blueprints.forEach((bp, i) => {
      // Layout
      const r = Math.random() * 40 + 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = (r * Math.sin(phi) * Math.sin(theta)) * 0.5;
      const z = r * Math.cos(phi);

      // Generate Totally Unique Color (Random HSL for max variety)
      const color = new THREE.Color().setHSL(Math.random(), 1.0, 0.6); // Full saturation
      const colorHex = '#' + color.getHexString();

      // Determine Texture
      let material;
      if (bp.image) {
        const tex = loader.load(bp.image);
        material = new THREE.SpriteMaterial({ map: tex, color: 0xffffff });
      } else {
        const tex = this.generateTextTexture(bp, colorHex);
        material = new THREE.SpriteMaterial({ map: tex, color: 0xffffff, transparent: true, opacity: 0.9 });
      }

      const sprite = new THREE.Sprite(material);
      sprite.position.set(x, y, z);

      // Scale down (Text is smaller now inside texture, but we keep sprite reasonable)
      const scale = bp.image ? 6 : 8;
      sprite.scale.set(scale, scale, scale);

      (sprite as any).userData = { id: i, name: bp.domain };
      this.particles.add(sprite);

      // Connections with matching color
      if (r < 25) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)]);
        const lineMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
        this.connections.add(new THREE.Line(lineGeo, lineMat));
      }
    });

    this.scene.add(this.particles);
    this.scene.add(this.connections);
  }

  private generateTextTexture(bp: any, colorHex: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const cx = size / 2;
      const cy = size / 2;

      // Text Label Only (No Ball)
      ctx.font = 'bold 32px Arial'; // Larger for visibility
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outer Glow (Blue/Cyan for readability or matching color?)
      // User said "color want in node taxt".
      // So text itself should be the unique color.

      ctx.shadowColor = 'rgba(0,0,0,0.8)'; // Black outline for contrast against starfield
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // For extra "neon" pop, we can draw it twice or use a colored shadow
      // Let's use the colorHex for the text fill
      ctx.fillStyle = colorHex;

      let label = bp?.brand || bp?.domain || '?';
      if (label.length > 15) label = label.substring(0, 12) + '..';

      ctx.fillText(label, cx, cy);

      // Optional: Subtle glow of same color
      ctx.shadowColor = colorHex;
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillText(label, cx, cy);
    }
    return new THREE.CanvasTexture(canvas);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    // Rotate galaxy
    if (this.particles) {
      this.particles.rotation.y += 0.001;
      this.connections.rotation.y += 0.001;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize = () => {
    if (this.camera && this.renderer && this.rendererContainer) {
      const width = this.rendererContainer.nativeElement.clientWidth;
      const height = this.rendererContainer.nativeElement.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onWindowResize);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
