/**
 * Media Rules
 * -------------
 * Pattern matching for media-related commands (music, video control)
 * Returns valid intent names that match the media.plugin.js handlers
 */

module.exports = {
  /**
   * Volume control - increase
   */
  volumeUp(text) {
    if (/\b(volume up|increase volume|louder|turn up|raise volume|volume badao|volume badha)\b/i.test(text)) {
      return { intent: "system.volume_up", confidence: 1, entities: {} };
    }
    return null;
  },

  /**
   * Volume control - decrease
   */
  volumeDown(text) {
    if (/\b(volume down|decrease volume|quieter|turn down|lower volume|volume kam)\b/i.test(text)) {
      return { intent: "system.volume_down", confidence: 1, entities: {} };
    }
    return null;
  },

  /**
   * Mute system
   */
  mute(text) {
    const msg = text.toLowerCase().trim();
    if (/\b(mute|unmute|silence|awaaz band)\b/.test(msg)) {
      if (/unmute/.test(msg)) {
        return { intent: "system.unmute", confidence: 1, entities: {} };
      }
      return { intent: "system.mute", confidence: 1, entities: {} };
    }
    return null;
  },

  /**
   * Play music/media
   */
  play(text) {
    if (/\b(play|paly|ply|play music|play gaana|play song|resume|start music|music play|gaana chalao|relax with.*music|hear songs|hear music)\b/i.test(text)) {
      return { intent: "play", confidence: 1, entities: {} };
    }
    return null;
  },

  /**
   * Pause media
   */
  pause(text) {
    if (/\b(pause|pause music|ruk|pause karo|hold playback)\b/i.test(text)) {
      return { intent: "pause", confidence: 1, entities: {} };
    }
    return null;
  },

  /**
   * Next track
   */
  next(text) {
    if (/\b(next song|next track|skip|agla gaana|skip song)\b/i.test(text)) {
      return { intent: "next", confidence: 1, entities: {} };
    }
    return null;
  },

  /**
   * Previous track
   */
  previous(text) {
    if (/\b(previous song|previous track|last song|pichla gaana|go back)\b/i.test(text)) {
      return { intent: "previous", confidence: 1, entities: {} };
    }
    return null;
  },

  /**
   * Stop media
   */
  stop(text) {
    if (/\b(stop music|stop playing|music band|gaana band|stop song|stop it|stop that)\b/i.test(text)) {
      return { intent: "stop", confidence: 1, entities: {} };
    }
    return null;
  }
};
