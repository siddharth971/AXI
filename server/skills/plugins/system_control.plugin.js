/**
 * System Control Skill
 * --------------------
 * Controls local device hardware and operating system features.
 * Handles power, applications, connectivity, audio, and display.
 * 
 * Platform: Windows (Powershell/CMD)
 */

const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const screenshot = require("screenshot-desktop");
const path = require("path");
const fs = require("fs");

// Common App Map (Name -> Executable)
const APP_MAP = {
  "chrome": "chrome",
  "google chrome": "chrome",
  "firefox": "firefox",
  "edge": "msedge",
  "notepad": "notepad",
  "calculator": "calc",
  "calc": "calc",
  "settings": "start ms-settings:",
  "control panel": "control",
  "task manager": "taskmgr",
  "explorer": "explorer",
  "file explorer": "explorer",
  "cmd": "start cmd",
  "terminal": "wt",
  "spotify": "spotify",
  "vlc": "vlc",
  "word": "winword",
  "excel": "excel",
  "powerpoint": "powerpnt",
  "vscode": "code",
  "vs code": "code",
  "code": "code",
  "visual studio code": "code"
};

// Helper: safe execution
async function runCommand(command) {
  try {
    const { stdout, stderr } = await execAsync(command);
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Helper: PowerShell command wrapper
async function runPowerShell(script) {
  return runCommand(`powershell -Command "${script}"`);
}

module.exports = {
  name: "system_control",
  description: "Controls PC/Laptop power, apps, volume, brightness, and connectivity.",

  intents: {
    "take_screenshot": {
      handler: async (params, context) => {
        try {
          const screenshotsDir = path.join(__dirname, "../../../screenshots");

          if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
          }

          const filename = `screenshot-${Date.now()}.png`;
          const filepath = path.join(screenshotsDir, filename);

          await screenshot({ filename: filepath });
          return `Screenshot saved as ${filename} 📸`;
        } catch (error) {
          return "Sorry, I couldn't take the screenshot.";
        }
      },
      confidence: 0.9,
      requiresConfirmation: false
    },

    // 🔴 CRITICAL POWER CONTROLS
    "system.shutdown": {
      handler: async (params, context) => {
        // This runs AFTER confirmation
        runCommand("shutdown /s /t 5"); // 5s delay to allow TTS to finish
        return "Shutting down system in 5 seconds. Goodbye!";
      },
      confidence: 0.9,
      requiresConfirmation: true
    },

    "system.restart": {
      handler: async (params, context) => {
        runCommand("shutdown /r /t 5");
        return "Restarting system in 5 seconds.";
      },
      confidence: 0.9,
      requiresConfirmation: true
    },

    "system.sleep": {
      handler: async (params, context) => {
        //rundll32 powrprof.dll,SetSuspendState 0,1,0 returns immediately, TTS might get cut off.
        setTimeout(() => {
          runCommand("rundll32.exe powrprof.dll,SetSuspendState 0,1,0");
        }, 3000);
        return "Going to sleep mode. Goodnight!";
      },
      confidence: 0.9,
      requiresConfirmation: true
    },

    "system.lock": {
      handler: async (params, context) => {
        setTimeout(() => {
          runCommand("rundll32.exe user32.dll,LockWorkStation");
        }, 2000);
        return "Locking the screen. 🔒";
      },
      confidence: 0.95,
      requiresConfirmation: true
    },

    "system.shutdown_cancel": {
      handler: async (params, context) => {
        const res = await runCommand("shutdown /a");
        if (res.success) return "Shutdown cancelled.";
        return "No scheduled shutdown found to cancel.";
      },
      confidence: 0.9,
      requiresConfirmation: false
    },

    // 🟠 APPLICATION CONTROL
    "app.open": {
      handler: async (params, context) => {
        const appName = extractAppName(params);
        if (!appName) return "Which app should I open?";

        const cmd = APP_MAP[appName.toLowerCase()] || appName;

        // Save to context for "close it" type follow-ups
        context.memory.updateGlobalContext({ lastOpenedApp: appName });

        const result = await runCommand(`start ${cmd}`); // 'start' effectively launches
        if (result.success) {
          return `Opening ${appName} 🚀`;
        } else {
          return `I couldn't open ${appName}. It might not be installed or added to path.`;
        }
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "app.close": {
      handler: async (params, context) => {
        let appName = extractAppName(params);

        // Contextual handling: "close it"
        if (!appName) {
          const globalCtx = context.memory.getGlobalContext();
          if (globalCtx && globalCtx.lastOpenedApp) {
            appName = globalCtx.lastOpenedApp;
          }
        }

        if (!appName) return "Which app do you want me to close?";

        const exeName = APP_MAP[appName.toLowerCase()] || appName;
        // Strip .exe if present to avoid double .exe
        const cleanName = exeName.replace(".exe", "");

        const result = await runCommand(`taskkill /IM "${cleanName}.exe" /F`);
        if (result.success) {
          return `Closing ${appName}.`;
        } else {
          // Try exact name if map failed
          const result2 = await runCommand(`taskkill /IM "${appName}.exe" /F`);
          if (result2.success) return `Closing ${appName}.`;
          return `I couldn't find ${appName} running.`;
        }
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "app.minimize": {
      handler: async () => {
        // PowerShell to minimize foreground window
        await runPowerShell("(New-Object -ComObject WScript.Shell).SendKeys('% n')");
        // Alt + Space + n 
        return "Minimized.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "app.maximize": {
      handler: async () => {
        await runPowerShell("(New-Object -ComObject WScript.Shell).SendKeys('% x')");
        return "Maximized.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    // 🟡 WINDOW CONTROL
    "window.switch": {
      handler: async () => {
        await runPowerShell("(New-Object -ComObject WScript.Shell).SendKeys('%{TAB}')");
        return "Switched window.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "window.close": {
      handler: async () => {
        // Alt+F4
        await runPowerShell("(New-Object -ComObject WScript.Shell).SendKeys('%{F4}')");
        return "Closing window.";
      },
      confidence: 0.9,
      requiresConfirmation: true // Alt+F4 is destructive
    },

    // 🔊 AUDIO CONTROL
    "system.volume_up": {
      handler: async () => {
        // Send VolUp key 5 times for noticeable change
        for (let i = 0; i < 5; i++) {
          await runPowerShell("(New-Object -ComObject WScript.Shell).SendKeys([char]175)");
        }
        return "Volume increased 🔊";
      },
      confidence: 0.9,
      requiresConfirmation: false
    },

    "system.volume_down": {
      handler: async () => {
        for (let i = 0; i < 5; i++) {
          await runPowerShell("(New-Object -ComObject WScript.Shell).SendKeys([char]174)");
        }
        return "Volume decreased 🔉";
      },
      confidence: 0.9,
      requiresConfirmation: false
    },

    "system.mute": {
      handler: async () => {
        await runPowerShell("(New-Object -ComObject WScript.Shell).SendKeys([char]173)");
        return "Muted.";
      },
      confidence: 0.9,
      requiresConfirmation: false
    },

    "system.unmute": {
      handler: async () => {
        // Toggle mute key (173) acts as unmute if muted
        await runPowerShell("(New-Object -ComObject WScript.Shell).SendKeys([char]173)");
        return "Unmuted.";
      },
      confidence: 0.9,
      requiresConfirmation: false
    },

    "audio.output_switch": {
      handler: async () => {
        // Cannot reliably do this via CLI without third party tools. 
        // Best effort: Open sound settings.
        await runCommand("start ms-settings:sound");
        return "Opening sound settings for you to switch output.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    // 🖥 DISPLAY CONTROL
    "display.brightness_up": {
      handler: async () => {
        // Using PowerShell WmiMonitorBrightnessMethods (Might not work on all monitors/desktops)
        // This gets current brightness => adds 20 => sets it.
        const script = `
        $brightness = Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightness
        $methods = Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods
        $curr = $brightness.CurrentBrightness
        $new = $curr + 20
        if ($new -gt 100) { $new = 100 }
        $methods.WmiSetBrightness(1, $new)
        `;
        const res = await runPowerShell(script);
        if (res.success && res.stderr.length < 5) return "Brightness increased ☀️";
        return "I tried, but I can't control brightness on this display.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "display.brightness_down": {
      handler: async () => {
        const script = `
          $brightness = Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightness
          $methods = Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods
          $curr = $brightness.CurrentBrightness
          $new = $curr - 20
          if ($new -lt 0) { $new = 0 }
          $methods.WmiSetBrightness(1, $new)
          `;
        const res = await runPowerShell(script);
        if (res.success && res.stderr.length < 5) return "Brightness decreased 🌑";
        return "I tried, but I can't control brightness on this display.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "display.night_mode_on": {
      handler: async () => {
        await runCommand("start ms-settings:display");
        return "Opening default display settings to enable Night Light.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "display.night_mode_off": {
      handler: async () => {
        await runCommand("start ms-settings:display");
        return "Opening default display settings to disable Night Light.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    // 🔌 POWER & BATTERY
    "system.battery_status": {
      handler: async () => {
        const res = await runCommand("WMIC Path Win32_Battery Get EstimatedChargeRemaining");
        if (res.success) {
          // Output format usually: "EstimatedChargeRemaining \n 95 "
          const match = res.stdout.match(/\d+/);
          if (match) return `Battery is at ${match[0]}% 🔋`;
          return "I can't read the battery level. You might be on desktop power.";
        }
        return "I couldn't check the battery.";
      },
      confidence: 0.9,
      requiresConfirmation: false
    },

    "system.power_connected": {
      handler: async () => {
        const res = await runCommand("WMIC Path Win32_Battery Get BatteryStatus");
        // 1=Discharging, 2=AC, 6=Charging, etc.
        if (res.success) {
          const status = parseInt(res.stdout.match(/\d+/)?.[0] || "0");
          if (status === 2 || status === 6 || status === 7 || status === 8 || status === 9) {
            return "Yes, charger is connected. 🔌";
          }
          return "No, running on battery power.";
        }
        return "I couldn't detect power status.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "system.power_saver_on": {
      handler: async () => {
        // Set power scheme to 'Power Saver' (GUID varies, but we can try to switch active scheme)
        // Or simpler: open settings
        await runCommand("start ms-settings:powersleep");
        return "Opening power settings.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "system.power_saver_off": {
      handler: async () => {
        await runCommand("start ms-settings:powersleep");
        return "Opening power settings.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    // 🌐 CONNECTIVITY
    "system.wifi_on": {
      handler: async () => {
        // Requires admin usually. Prompting opening settings is safer.
        // Or `netsh wlan set global autoconfig=yes`
        await runCommand("start ms-settings:network-wifi");
        return "Opening WiFi settings. I cannot toggle hardware switches directly without Admin.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "system.wifi_off": {
      handler: async () => {
        await runCommand("start ms-settings:network-wifi");
        return "Opening WiFi settings.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "system.bluetooth_on": {
      handler: async () => {
        await runCommand("start ms-settings:bluetooth");
        return "Opening Bluetooth settings.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "system.bluetooth_off": {
      handler: async () => {
        await runCommand("start ms-settings:bluetooth");
        return "Opening Bluetooth settings.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "system.airplane_mode_on": {
      handler: async () => {
        await runCommand("start ms-settings:network-airplanemode");
        return "Opening Airplane Mode settings.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    },

    "system.airplane_mode_off": {
      handler: async () => {
        await runCommand("start ms-settings:network-airplanemode");
        return "Opening Airplane Mode settings.";
      },
      confidence: 0.8,
      requiresConfirmation: false
    }
  }
};

/**
 * Extract application name from parameters or entities
 */
function extractAppName(params) {
  // Check params first
  if (params && params.app_name) return params.app_name;

  // Fallback to iterating keys if mapped poorly
  // (In a real NLP setup, 'app_name' should come from slot filling)
  for (const key in params) {
    if (typeof params[key] === 'string') return params[key];
  }

  return null;
}
