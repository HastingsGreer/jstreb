import { expect, test } from "vitest";
import { simulate } from "./simulate.js";
import { fillEmptyConstraints, presets } from "./trebuchetsimulation.js";

/**
 * Calculate total energy (kinetic + potential) for a given state
 * @param {Array} state - The state array [positions..., velocities...]
 * @param {Array} masses - Array of particle masses
 * @returns {number} Total energy
 */
function calculateEnergy(state, masses) {
  const numParticles = masses.length;

  let kineticEnergy = 0;
  let potentialEnergy = 0;
  const g = 1; // gravity magnitude (from simulate.js forces = [0, -1])

  for (let i = 0; i < numParticles; i++) {
    const mass = masses[i];

    // Position: y is at index 2*i + 1 (negative because y-axis points down)
    const y = -state[2 * i + 1];

    // Velocity components at indices after all positions
    const vx = state[2 * numParticles + 2 * i];
    const vy = state[2 * numParticles + 2 * i + 1];
    const vSquared = vx * vx + vy * vy;

    // KE = 0.5 * m * v^2
    kineticEnergy += 0.5 * mass * vSquared;

    // PE = m * g * h (height)
    potentialEnergy += mass * g * y;
  }

  return kineticEnergy + potentialEnergy;
}

test("all presets conserve energy", () => {
  // Loop over all presets
  for (const [presetName, presetJson] of Object.entries(presets)) {
    const data = JSON.parse(presetJson);

    // Fill in missing constraint types
    fillEmptyConstraints(data);

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
      terminate
    );

    // Extract masses
    const masses = data.particles.map(p => p.mass);

    // Calculate energy at multiple time steps
    const energies = trajectories.map(state => calculateEnergy(state, masses));

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
