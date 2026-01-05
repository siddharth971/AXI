/**
 * Helper Functions for Responses
 */

/**
 * Pick a random item from an array
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  pickRandom
};
