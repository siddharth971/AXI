import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AxiService } from '../../services/axi.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  facts: any[] = [];
  corrections: any[] = [];
  messages: any[] = [];

  constructor(private axi: AxiService) { }

  ngOnInit() {
    this.refreshAll();
  }

  refreshAll() {
    this.loadMemory();
    this.loadLearning();
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

  refreshNotifications() {
    this.axi.getNotifications().subscribe((res) => {
      this.messages = res.messages || [];
    });
  }
}
