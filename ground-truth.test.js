import { expect, test } from "vitest";
import { simulate } from "./simulate.js";
import {
  calculatePeakLoad,
  calculateRange,
  presets,
} from "./trebuchetsimulation.js";

test("ground truth values for default preset (Hinged Counterweight)", () => {
  // Default preset: "Hinged Counterweight"
  const data = JSON.parse(presets["Hinged Counterweight"]);

  // Fill in missing constraint types

  function terminate(trajectories) {
    var trajectory = trajectories[trajectories.length - 1];
    var projectileY = -trajectory[2 * data.projectile + 1];
    var projectileVY =
      -trajectory[2 * data.particles.length + 2 * data.projectile + 1];
    return projectileY < 0 || projectileVY < 0;
  }

  const [trajectories, constraintLog, forceLog] = simulate(
    data.particles,
    data.constraints,
    data.timestep,
    data.duration,
    terminate,
  );

  // Calculate peakLoad
  const peakLoad = calculatePeakLoad(forceLog);

  // Calculate range
  const range = calculateRange(trajectories, data, constraintLog);

  // Verify ground truth values (same as Playwright test with ±5 tolerance)
  // Expected values: Range = 331.2 ft, Peak Force = 1020.3 lbf
  expect(range).toBeGreaterThanOrEqual(331.2 - 5);
  expect(range).toBeLessThanOrEqual(331.2 + 5);
  expect(peakLoad).toBeGreaterThanOrEqual(1020.3 - 5);
  expect(peakLoad).toBeLessThanOrEqual(1020.3 + 5);
});
