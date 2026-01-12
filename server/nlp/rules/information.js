/**
 * Information Rules
 * -------------------
 * Pattern matching for information-related commands (weather, news, jokes, time)
 */

module.exports = {
  weather(text) {
    if (/weather|raining|temperature|forecast/.test(text.toLowerCase())) {
      return { intent: "weather_check", confidence: 1, entities: {} };
    }
    return null;
  },

  joke(text) {
    if (/joke|funny|laugh/.test(text.toLowerCase())) {
      return { intent: "tell_joke", confidence: 1, entities: {} };
    }
    return null;
  },

  news(text) {
    if (/news|headlines/.test(text.toLowerCase())) {
      return { intent: "news_update", confidence: 1, entities: {} };
    }
    return null;
  },

  time(text) {
    if (/what time|tell.+time|current time|wats d time/.test(text.toLowerCase())) {
      return { intent: "tell_time", confidence: 1, entities: {} };
    }
    return null;
  },

  screenshot(text) {
    if (/screenshot|capture|screen.?shot/.test(text.toLowerCase())) {
      return { intent: "take_screenshot", confidence: 1, entities: {} };
    }
    return null;
  }
};
