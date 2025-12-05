import { expect, test } from "vitest";
import { simulate } from "./simulate.js";
import {
  fillEmptyConstraints,
  calculatePeakLoad,
  calculateRange,
} from "./trebuchetsimulation.js";

test("ground truth values for default preset (Hinged Counterweight)", () => {
  // Default preset: "Hinged Counterweight"
  const data = JSON.parse(
    '{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3, "duration":35, "particles":[{"x":536,"y":472.7,"mass":1},{"x":346,"y":657.6,"mass":4},{"x":588,"y":440.7,"mass":10},{"x":668,"y":673.6,"mass":1},{"x":586,"y":533.7,"mass":100}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":1}},{"p":3,"normal":{"x":0,"y":1},"oneway":true}]}}'
  );

  // Fill in missing constraint types
  fillEmptyConstraints(data);

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
    terminate
  );

  // Calculate peakLoad
  const peakLoad = calculatePeakLoad(forceLog);

  // Calculate range
  const range = calculateRange(trajectories, data);

  // Verify ground truth values (same as Playwright test with ±5 tolerance)
  // Expected values: Range = 331.2 ft, Peak Force = 1020.3 lbf
  expect(range).toBeGreaterThanOrEqual(331.2 - 5);
  expect(range).toBeLessThanOrEqual(331.2 + 5);
  expect(peakLoad).toBeGreaterThanOrEqual(1020.3 - 5);
  expect(peakLoad).toBeLessThanOrEqual(1020.3 + 5);
});
