/* Every maintenance window is entered in Beijing time, with explicit +08:00.
 * Example format only: "2026-10-19T20:00:00+08:00".
 * Set BOTH values for each maintenance event. null means not scheduled yet.
 * A reload is required after changing this file.
 */
window.MPA_MAINTENANCE_CONFIG = Object.freeze({
  startsAt: "2026-10-19T18:00:00+08:00",
  expectedEndsAt: "2026-10-19T21:00:00+08:00"
});
