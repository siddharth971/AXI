import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AxiService } from '../../services/axi.service';
import { HttpClientModule } from '@angular/common/http';
import { SocketService } from '../../services/socket.service';
import { KnowledgeGalaxyComponent } from './knowledge-galaxy.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, KnowledgeGalaxyComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  facts: any[] = [];
  corrections: any[] = [];
  // We'll use a local array that combines both sources
  messages: any[] = [];
  blueprints: any[] = [];

  constructor(
    private axi: AxiService,
    public socket: SocketService
  ) {
    // Reactively update messages whenever socket notifications change
    effect(() => {
      const live = this.socket.notifications();
      // Combine live messages with existing ones, removing duplicates by ID if needed.
      // For simplicity, we'll just prepend live messages to the initial load.
      // But initially messages is empty.

      this.messages = [...live, ...this.messages.filter(m => !live.find(l => l.id === m.id))];
    });
  }

  ngOnInit() {
    this.refreshAll();
  }

  refreshAll() {
    this.loadMemory();
    this.loadLearning();
    this.loadKnowledge();
    this.refreshNotifications();
  }

  loadMemory() {
    this.axi.getMemory().subscribe((res) => {
      this.facts = res.facts || [];
    });
  }

  deleteFact(key: string) {
    if (confirm('Forget this fact?')) {
      this.axi.deleteMemory(key).subscribe(() => {
        this.loadMemory(); // Reload
      });
    }
  }

  loadLearning() {
    this.axi.getLearning().subscribe((res) => {
      this.corrections = res.corrections || [];
    });
  }

  loadKnowledge() {
    this.axi.getKnowledge().subscribe((res) => {
      this.blueprints = res.blueprints || [];
    });
  }

  refreshNotifications() {
    this.axi.getNotifications().subscribe((res) => {
      const history = res.messages || [];
      // Merge: Live (Socket) + History (HTTP)
      const live = this.socket.notifications();
      this.messages = [...live, ...history.filter(h => !live.find(l => l.id === h.id))];
    });
  }
}
