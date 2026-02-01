import { expect, test } from "vitest";
import { simulate } from "./simulate.js";
import { calculateEnergy, presets } from "./trebuchetsimulation.js";

test("all presets conserve energy", () => {
  // Loop over all presets
  for (const [presetName, presetJson] of Object.entries(presets)) {
    const data = JSON.parse(presetJson);

    // Create terminate function (don't terminate early for energy tests)
    function terminate(trajectories) {
      return false;
    }

    // Run simulation
    const [trajectories, constraintLog, forceLog] = simulate(
      data.particles,
      data.constraints,
      data.timestep,
      data.duration,
      terminate,
    );

    // Extract masses
    const masses = data.particles.map((p) => p.mass);

    // Calculate energy at multiple time steps
    const energies = trajectories.map((state) =>
      calculateEnergy(state, masses),
    );

    // The initial energy should be conserved throughout
    const initialEnergy = energies[0];

    // Check that energy is conserved (allowing for numerical errors)
    // Use relative tolerance of 1% for energy conservation
    const tolerance = Math.abs(initialEnergy) * 0.01;

    for (let i = 0; i < energies.length; i++) {
      const energyDifference = Math.abs(energies[i] - initialEnergy);
      expect(energyDifference).toBeLessThanOrEqual(tolerance);
    }
  }
});
