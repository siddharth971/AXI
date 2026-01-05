import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceService } from '../../services/voice.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-command-history',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="glass h-full p-4 flex flex-col gap-4 overflow-hidden rounded-xl">
      <div class="flex items-center gap-2 mb-2">
        <lucide-icon name="message-square" class="text-axi-cyan w-5 h-5"></lucide-icon>
        <span class="text-sm font-semibold uppercase tracking-wider text-gray-400">Interaction Log</span>
      </div>
      
      <div class="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        @for (cmd of history(); track cmd.timestamp) {
          <div class="space-y-2">
            <!-- User Message -->
            <div class="flex items-start gap-3">
              <div class="p-1 px-2.5 rounded-lg bg-white/5 border border-white/10">
                <lucide-icon name="user" class="w-4 h-4 text-axi-cyan"></lucide-icon>
              </div>
              <div class="text-sm text-gray-300">{{ cmd.text }}</div>
            </div>
            
            <!-- AI Response -->
            <div class="flex items-start gap-3 pl-4">
              <div class="p-1 px-2.5 rounded-lg bg-axi-cyan/10 border border-axi-cyan/20">
                <lucide-icon name="bot" class="w-4 h-4 text-axi-cyan"></lucide-icon>
              </div>
              <div class="text-sm text-axi-cyan/80 italic">{{ cmd.response }}</div>
            </div>
          </div>
        }
        
        @if (history().length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
            <lucide-icon name="message-square" class="w-12 h-12 mb-2"></lucide-icon>
            <p class="text-xs">Waiting for commands...</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0, 242, 255, 0.2);
      border-radius: 10px;
    }
  `]
})
export class CommandHistoryComponent {
  private voiceService = inject(VoiceService);
  history = this.voiceService.commands;
}
