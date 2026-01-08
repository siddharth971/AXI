/**
 * Media Plugin
 * -------------
 * Handles media playback control:
 * - Play/pause
 * - Track navigation
 * - Volume control
 * - Mute/unmute
 */

"use strict";

const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

/**
 * Send media key using PowerShell
 * @param {string} key - Virtual key code
 * @returns {Promise<void>}
 */
async function sendMediaKey(key) {
  const script = `
    $signature = @"
    [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
    public static extern void keybd_event(byte bVk, byte bScan, int dwFlags, int dwExtraInfo);
"@
    $SendKey = Add-Type -MemberDefinition $signature -Name "Win32SendKeys" -Namespace Win32Functions -PassThru
    $SendKey::keybd_event(${key}, 0, 0, 0)
    $SendKey::keybd_event(${key}, 0, 2, 0)
  `;

  await execAsync(`powershell -Command "${script.replace(/\n/g, " ").replace(/"/g, '\\"')}"`, {
    shell: "powershell.exe"
  });
}

/**
 * Send keyboard shortcut using SendKeys
 * @param {string} keys - SendKeys format
 * @returns {Promise<void>}
 */
async function sendKeys(keys) {
  const script = `
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.SendKeys]::SendWait("${keys}")
  `;

  await execAsync(`powershell -Command "${script.replace(/\n/g, " ")}"`);
}

// Virtual Key Codes for Media Keys
const VK_MEDIA_PLAY_PAUSE = "0xB3";
const VK_MEDIA_NEXT_TRACK = "0xB0";
const VK_MEDIA_PREV_TRACK = "0xB1";
const VK_MEDIA_STOP = "0xB2";
const VK_VOLUME_MUTE = "0xAD";
const VK_VOLUME_DOWN = "0xAE";
const VK_VOLUME_UP = "0xAF";

module.exports = {
  name: "media",
  description: "Media playback and volume control operations",

  intents: {
    play: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        try {
          await sendMediaKey(VK_MEDIA_PLAY_PAUSE);
          return "Playing media, sir.";
        } catch (error) {
          return "I couldn't control media playback. Make sure a media player is active.";
        }
      }
    },

    pause: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        try {
          await sendMediaKey(VK_MEDIA_PLAY_PAUSE);
          return "Pausing media, sir.";
        } catch (error) {
          return "I couldn't pause the media. Make sure a media player is active.";
        }
      }
    },

    play_pause: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        try {
          await sendMediaKey(VK_MEDIA_PLAY_PAUSE);
          return "Toggling play/pause, sir.";
        } catch (error) {
          return "I couldn't toggle playback. Make sure a media player is active.";
        }
      }
    },

    stop: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        try {
          await sendMediaKey(VK_MEDIA_STOP);
          return "Stopping media playback, sir.";
        } catch (error) {
          return "I couldn't stop the media.";
        }
      }
    },

    next: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        try {
          await sendMediaKey(VK_MEDIA_NEXT_TRACK);
          return "Playing next track, sir.";
        } catch (error) {
          return "I couldn't skip to the next track.";
        }
      }
    },

    previous: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        try {
          await sendMediaKey(VK_MEDIA_PREV_TRACK);
          return "Playing previous track, sir.";
        } catch (error) {
          return "I couldn't go to the previous track.";
        }
      }
    },

    volume_up: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const times = params.times || params.amount || 3;

        try {
          for (let i = 0; i < times; i++) {
            await sendMediaKey(VK_VOLUME_UP);
          }
          return "Increasing volume, sir.";
        } catch (error) {
          return "I couldn't increase the volume.";
        }
      }
    },

    volume_down: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const times = params.times || params.amount || 3;

        try {
          for (let i = 0; i < times; i++) {
            await sendMediaKey(VK_VOLUME_DOWN);
          }
          return "Decreasing volume, sir.";
        } catch (error) {
          return "I couldn't decrease the volume.";
        }
      }
    },

    mute: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        try {
          await sendMediaKey(VK_VOLUME_MUTE);
          return "System muted, sir.";
        } catch (error) {
          return "I couldn't mute the system.";
        }
      }
    },

    unmute: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        try {
          await sendMediaKey(VK_VOLUME_MUTE);
          return "System unmuted, sir.";
        } catch (error) {
          return "I couldn't unmute the system.";
        }
      }
    },

    set_volume: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const level = parseInt(params.level || params.volume || "50", 10);

        if (isNaN(level) || level < 0 || level > 100) {
          return "Please specify a volume level between 0 and 100.";
        }

        try {
          // Use nircmd if available, otherwise use PowerShell
          const script = `
            $wshShell = New-Object -ComObject WScript.Shell
            # First mute to reset, then set volume
            $signature = @"
            [DllImport("winmm.dll")]
            public static extern int waveOutSetVolume(IntPtr hwo, uint dwVolume);
"@
            $obj = Add-Type -MemberDefinition $signature -Name "Win32Volume" -Namespace Win32Functions -PassThru
            $volume = [int](${level} / 100 * 65535)
            $volumeFull = ($volume -bor ($volume -shl 16))
            $obj::waveOutSetVolume([IntPtr]::Zero, $volumeFull)
          `;

          await execAsync(`powershell -Command "${script.replace(/\n/g, " ").replace(/"/g, '\\"')}"`, {
            shell: "powershell.exe"
          });

          return `Volume set to ${level}%, sir.`;
        } catch (error) {
          return `I couldn't set the volume: ${error.message}`;
        }
      }
    },

    open_spotify: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        try {
          await execAsync("start spotify:");
          return "Opening Spotify, sir.";
        } catch (error) {
          // Try web version
          try {
            await execAsync("start https://open.spotify.com");
            return "Opening Spotify in your browser, sir.";
          } catch {
            return "I couldn't open Spotify. Please ensure it's installed.";
          }
        }
      }
    }
  }
};
