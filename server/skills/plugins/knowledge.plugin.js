/**
 * Knowledge Plugin
 * -----------------
 * Handles knowledge and utility operations:
 * - Mathematical calculations
 * - Unit conversions
 * - Currency conversions
 * - Date/time calculations
 * - Reminders
 */

"use strict";

// Conversion factors
const UNIT_CONVERSIONS = {
  // Length
  km_to_mi: 0.621371,
  mi_to_km: 1.60934,
  m_to_ft: 3.28084,
  ft_to_m: 0.3048,
  cm_to_in: 0.393701,
  in_to_cm: 2.54,

  // Weight
  kg_to_lb: 2.20462,
  lb_to_kg: 0.453592,
  g_to_oz: 0.035274,
  oz_to_g: 28.3495,

  // Temperature (special handling)
  c_to_f: (c) => (c * 9 / 5) + 32,
  f_to_c: (f) => (f - 32) * 5 / 9,

  // Volume
  l_to_gal: 0.264172,
  gal_to_l: 3.78541,
  ml_to_oz: 0.033814,
  oz_to_ml: 29.5735,

  // Data
  mb_to_gb: 0.001,
  gb_to_mb: 1000,
  gb_to_tb: 0.001,
  tb_to_gb: 1000
};

// Unit aliases
const UNIT_ALIASES = {
  kilometers: "km", kilometer: "km", km: "km",
  miles: "mi", mile: "mi", mi: "mi",
  meters: "m", meter: "m", m: "m",
  feet: "ft", foot: "ft", ft: "ft",
  centimeters: "cm", centimeter: "cm", cm: "cm",
  inches: "in", inch: "in", in: "in",
  kilograms: "kg", kilogram: "kg", kg: "kg", kilo: "kg",
  pounds: "lb", pound: "lb", lb: "lb", lbs: "lb",
  grams: "g", gram: "g", g: "g",
  ounces: "oz", ounce: "oz", oz: "oz",
  celsius: "c", c: "c",
  fahrenheit: "f", f: "f",
  liters: "l", liter: "l", l: "l",
  gallons: "gal", gallon: "gal", gal: "gal",
  milliliters: "ml", milliliter: "ml", ml: "ml",
  megabytes: "mb", megabyte: "mb", mb: "mb",
  gigabytes: "gb", gigabyte: "gb", gb: "gb",
  terabytes: "tb", terabyte: "tb", tb: "tb"
};

// Reminders storage (in-memory, would need persistence for production)
const reminders = new Map();

/**
 * Safe math evaluation (prevents code injection)
 * @param {string} expression - Math expression
 * @returns {number|null}
 */
function safeEval(expression) {
  // Clean the expression
  const cleaned = expression
    .replace(/[^0-9+\-*/().^%\s]/g, "")
    .replace(/\^/g, "**")
    .replace(/x/gi, "*")
    .trim();

  if (!cleaned) return null;

  try {
    // Use Function constructor for safer evaluation
    const result = Function(`"use strict"; return (${cleaned})`)();

    if (typeof result !== "number" || !isFinite(result)) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}

/**
 * Parse unit from string
 * @param {string} unit - Unit string
 * @returns {string} Normalized unit
 */
function parseUnit(unit) {
  if (!unit) return null;
  return UNIT_ALIASES[unit.toLowerCase().trim()] || unit.toLowerCase().trim();
}

/**
 * Format number for display
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
function formatNumber(num, decimals = 2) {
  if (Number.isInteger(num)) return num.toString();
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

module.exports = {
  name: "knowledge",
  description: "Knowledge utilities: calculations, conversions, and reminders",

  intents: {
    calculate: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const expression = params.expression || params.query || params.math;

        if (!expression) {
          return "What would you like me to calculate?";
        }

        const result = safeEval(expression);

        if (result === null) {
          return `I couldn't calculate "${expression}". Please check the expression.`;
        }

        return `${expression} = ${formatNumber(result)}, sir.`;
      }
    },

    unit_convert: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const value = parseFloat(params.value || params.amount);
        const fromUnit = parseUnit(params.from || params.fromUnit);
        const toUnit = parseUnit(params.to || params.toUnit);

        if (isNaN(value)) {
          return "What value would you like me to convert?";
        }

        if (!fromUnit || !toUnit) {
          return "Please specify both the source and target units.";
        }

        // Find conversion
        const conversionKey = `${fromUnit}_to_${toUnit}`;
        const conversion = UNIT_CONVERSIONS[conversionKey];

        if (!conversion) {
          return `I don't know how to convert from ${fromUnit} to ${toUnit}.`;
        }

        let result;
        if (typeof conversion === "function") {
          result = conversion(value);
        } else {
          result = value * conversion;
        }

        return `${formatNumber(value)} ${fromUnit} = ${formatNumber(result)} ${toUnit}, sir.`;
      }
    },

    currency_convert: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const amount = parseFloat(params.amount || params.value);
        const from = (params.from || "USD").toUpperCase();
        const to = (params.to || "INR").toUpperCase();

        if (isNaN(amount)) {
          return "What amount would you like me to convert?";
        }

        // Note: In production, use a real currency API
        // These are approximate rates for demonstration
        const rates = {
          USD: 1,
          EUR: 0.85,
          GBP: 0.73,
          INR: 83.12,
          JPY: 149.50,
          AUD: 1.53,
          CAD: 1.36,
          CHF: 0.88,
          CNY: 7.24
        };

        if (!rates[from] || !rates[to]) {
          return `I don't have exchange rates for ${!rates[from] ? from : to}.`;
        }

        // Convert through USD as base
        const inUSD = amount / rates[from];
        const result = inUSD * rates[to];

        return `${formatNumber(amount)} ${from} ≈ ${formatNumber(result)} ${to}, sir. (Note: Rates are approximate)`;
      }
    },

    date_math: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const operation = (params.operation || params.op || "add").toLowerCase();
        const amount = parseInt(params.amount || params.value || "1", 10);
        const unit = (params.unit || "days").toLowerCase();
        const fromDate = params.from ? new Date(params.from) : new Date();

        if (isNaN(fromDate.getTime())) {
          return "I couldn't understand the date. Please use a valid date format.";
        }

        const result = new Date(fromDate);
        const multiplier = operation === "subtract" ? -1 : 1;

        switch (unit) {
          case "days":
          case "day":
            result.setDate(result.getDate() + (amount * multiplier));
            break;
          case "weeks":
          case "week":
            result.setDate(result.getDate() + (amount * 7 * multiplier));
            break;
          case "months":
          case "month":
            result.setMonth(result.getMonth() + (amount * multiplier));
            break;
          case "years":
          case "year":
            result.setFullYear(result.getFullYear() + (amount * multiplier));
            break;
          default:
            return `I don't understand the unit "${unit}". Use days, weeks, months, or years.`;
        }

        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        const formattedResult = result.toLocaleDateString("en-IN", options);

        if (operation === "subtract") {
          return `${amount} ${unit} before would be ${formattedResult}, sir.`;
        }

        return `${amount} ${unit} from now would be ${formattedResult}, sir.`;
      }
    },

    days_between: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const date1 = params.from ? new Date(params.from) : new Date();
        const date2 = params.to ? new Date(params.to) : null;

        if (!date2 || isNaN(date2.getTime())) {
          return "Please specify the target date.";
        }

        if (isNaN(date1.getTime())) {
          return "I couldn't understand the start date.";
        }

        const diffTime = date2.getTime() - date1.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          return "Those dates are the same day!";
        }

        const absDays = Math.abs(diffDays);
        const direction = diffDays > 0 ? "from now" : "ago";

        return `There are ${absDays} days ${direction}, sir.`;
      }
    },

    set_reminder: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const message = params.message || params.text || params.reminder;
        const timeStr = params.time || params.in || params.at;

        if (!message) {
          return "What should I remind you about?";
        }

        if (!timeStr) {
          return "When should I remind you?";
        }

        // Parse relative time (e.g., "5 minutes", "1 hour")
        let delayMs = 0;
        const match = timeStr.match(/(\d+)\s*(second|minute|hour|min|sec|hr)s?/i);

        if (match) {
          const value = parseInt(match[1], 10);
          const unit = match[2].toLowerCase();

          switch (unit) {
            case "second":
            case "sec":
              delayMs = value * 1000;
              break;
            case "minute":
            case "min":
              delayMs = value * 60 * 1000;
              break;
            case "hour":
            case "hr":
              delayMs = value * 60 * 60 * 1000;
              break;
          }
        }

        if (delayMs === 0) {
          return `I couldn't understand the time "${timeStr}". Try something like "5 minutes" or "1 hour".`;
        }

        const reminderId = `reminder_${Date.now()}`;
        const triggerTime = new Date(Date.now() + delayMs);

        // Store reminder (in production, this would be persisted)
        reminders.set(reminderId, {
          message,
          triggerTime,
          sessionId: context.sessionId
        });

        // Set timeout (note: won't persist across restarts)
        setTimeout(() => {
          reminders.delete(reminderId);
          // In production, this would trigger a notification
          console.log(`[REMINDER] ${message}`);
        }, delayMs);

        const timeFormatted = triggerTime.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit"
        });

        return `I'll remind you "${message}" at ${timeFormatted}, sir.`;
      }
    },

    what_day: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const dateStr = params.date;
        const date = dateStr ? new Date(dateStr) : new Date();

        if (isNaN(date.getTime())) {
          return "I couldn't understand that date. Please use a valid date format.";
        }

        const options = { weekday: "long" };
        const day = date.toLocaleDateString("en-IN", options);

        if (!dateStr) {
          return `Today is ${day}, sir.`;
        }

        const fullDate = date.toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        return `That date is a ${fullDate}, sir.`;
      }
    },

    define_word: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const word = params.word || params.term;

        if (!word) {
          return "Which word would you like me to define?";
        }

        // In production, this would call a dictionary API
        return `I don't have a dictionary integrated yet, but you can search for "${word}" on Google or ask a language model for its definition.`;
      }
    }
  }
};
