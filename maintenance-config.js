/* Every maintenance window is entered in Beijing time, with explicit +08:00.
 * Example format only: "2026-10-19T20:00:00+08:00".
 * Set BOTH values for each maintenance event. null means not scheduled yet.
 * Keep the object below valid JSON (quoted keys, no trailing commas or inline comments).
 * Hosted pages re-read this file every 60 seconds; publish changes to update existing visitors.
 */
window.MPA_MAINTENANCE_CONFIG = Object.freeze({
  "startsAt": "2026-10-20T05:00:00+08:00",
  "expectedEndsAt": "2026-10-20T09:00:00+08:00"
});
