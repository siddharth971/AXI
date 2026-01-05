import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-skill-context',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="glass h-full p-4 flex flex-col gap-4 overflow-hidden rounded-xl">
      <div class="flex items-center gap-2 mb-2">
        <lucide-icon name="zap" class="text-axi-cyan w-5 h-5"></lucide-icon>
        <span class="text-sm font-semibold uppercase tracking-wider text-gray-400">Context Intelligence</span>
      </div>

      <!-- Weather Card -->
      <div class="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
        <div class="flex justify-between items-center mb-2">
          <lucide-icon name="cloud-sun" class="text-yellow-400 w-8 h-8"></lucide-icon>
          <span class="text-2xl font-bold">28°C</span>
        </div>
        <div class="text-sm font-medium">New Delhi, IN</div>
        <div class="text-xs text-gray-400">Partly Cloudy • High 31° • Low 22°</div>
      </div>

      <!-- YouTube Card -->
      <div class="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
        <div class="flex items-center gap-3 mb-2">
          <lucide-icon name="youtube" class="text-red-500 w-6 h-6"></lucide-icon>
          <span class="text-sm font-semibold">YouTube Insights</span>
        </div>
        <div class="text-xs text-gray-300 line-clamp-2 mb-3">
          DeepSeek-V3: The most powerful open-weight model yet?
        </div>
        <button class="w-full py-1.5 px-3 rounded-lg bg-axi-cyan/10 hover:bg-axi-cyan/20 border border-axi-cyan/30 text-axi-cyan text-xs flex items-center justify-center gap-2 transition-all">
          View Video <lucide-icon name="external-link" class="w-3 h-3"></lucide-icon>
        </button>
      </div>

      <div class="flex-1"></div>

      <!-- System Status -->
      <div class="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold border-t border-white/5 pt-4">
        Neural Engine: <span class="text-axi-cyan">Active</span><br>
        Uptime: <span class="text-gray-400">04:21:05</span>
      </div>
    </div>
  `,
  styles: []
})
export class SkillContextComponent {
}
