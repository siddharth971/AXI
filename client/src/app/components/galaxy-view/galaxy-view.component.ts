import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KnowledgeGalaxyComponent } from '../dashboard/knowledge-galaxy.component';
import { AxiService } from '../../services/axi.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-galaxy-view',
  standalone: true,
  imports: [CommonModule, RouterModule, KnowledgeGalaxyComponent, LucideAngularModule],
  template: `
    <div class="galaxy-page">
      <app-knowledge-galaxy 
        [blueprints]="blueprints" 
        [fullscreen]="true"
        (nodeSelect)="onNodeSelect($event)"
      ></app-knowledge-galaxy>

      <!-- Overlay UI -->
      <div class="ui-layer">
        <a routerLink="/dashboard" class="back-btn">
          &larr; Back to Dashboard
        </a>
        
        <div class="info-panel" *ngIf="selectedNode">
          <div class="panel-header">
            <h2>{{ selectedNode.brand }}</h2>
            <div class="close-btn" (click)="selectedNode = null">&times;</div>
          </div>
          
          <div class="preview-container" *ngIf="selectedNode.image">
            <img [src]="selectedNode.image" class="preview-img" alt="Capture">
          </div>
          
          <p class="domain">{{ selectedNode.domain }}</p>
          
          <div class="meta-row">
            <span class="label">Explored</span>
            <span class="value">{{ selectedNode.generated_at | date:'mediumDate' }}</span>
          </div>
          
          <div class="divider"></div>

          <!-- Description placeholder (If available in blueprint) -->
          <div class="blue-box">
             <p>Full neural blueprint available.</p>
             <button class="action-btn">View Details</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .galaxy-page { 
      width: 100vw; 
      height: 100vh; 
      position: relative; 
      background: #000; 
      overflow: hidden;
    }
    
    .ui-layer { 
      position: absolute; 
      top: 0; 
      left: 0; 
      width: 100%; 
      height: 100%; 
      pointer-events: none; 
      z-index: 10; 
    }
    
    .back-btn {
      position: absolute; 
      top: 2rem; 
      left: 2rem;
      pointer-events: auto;
      display: flex; 
      align-items: center;
      gap: 0.5rem; 
      color: rgba(255,255,255,0.8);
      font-family: 'Inter', sans-serif;
      text-decoration: none;
      background: rgba(20, 20, 35, 0.6); 
      backdrop-filter: blur(10px);
      padding: 0.75rem 1.25rem;
      border-radius: 8px; 
      border: 1px solid rgba(255,255,255,0.1);
      transition: all 0.2s;
    }
    
    .back-btn:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .info-panel {
      position: absolute; 
      right: 2rem; 
      top: 2rem; 
      bottom: 2rem;
      width: 350px;
      background: rgba(20, 20, 35, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 2rem;
      pointer-events: auto;
      color: white;
      font-family: 'Inter', sans-serif;
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: -10px 0 30px rgba(0,0,0,0.5);
    }
    
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    .panel-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    h2 { margin: 0; font-size: 1.5rem; color: #fff; line-height: 1.2; }
    
    .close-btn { 
      font-size: 1.5rem; cursor: pointer; opacity: 0.5; transition: 0.2s; 
      line-height: 1;
    }
    .close-btn:hover { opacity: 1; }

    .domain { color: #06b6d4; font-size: 0.9rem; margin-bottom: 2rem; opacity: 0.8; }

    .meta-row {
      display: flex; justify-content: space-between;
      margin-bottom: 1rem;
      font-size: 0.85rem;
    }
    
    .label { color: rgba(255,255,255,0.4); }
    .value { color: white; font-weight: 500; }
    
    .divider { height: 1px; background: rgba(255,255,255,0.1); margin: 2rem 0; }
    
    .blue-box {
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.2);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }
    
    .action-btn {
      margin-top: 1rem;
      background: #06b6d4;
      color: black;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
    }
    
    .preview-container {
      margin-bottom: 1rem;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
    }
    
    .preview-img {
      width: 100%;
      height: auto;
      display: block;
      transition: transform 0.5s;
    }
    
    .preview-container:hover .preview-img {
      transform: scale(1.05);
    }
  `]
})
export class GalaxyViewComponent {
  private axi = inject(AxiService);
  blueprints: any[] = [];
  selectedNode: any = null;

  constructor() {
    this.axi.getKnowledge().subscribe(res => {
      this.blueprints = res.blueprints || [];
    });
  }

  onNodeSelect(node: any) {
    this.selectedNode = node;
  }
}
