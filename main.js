// Import the math.js library

import * as math from "mathjs";

function normalize(v) {
  return math.divide(v, math.sqrt(math.sum(math.dotMultiply(v, v))));
}

function wedge(a, b) {
  return math.subtract(math.multiply(a[0], b[1]), math.multiply(a[1], b[0]));
}

function pget(array, n) {
  return [array[2 * n], array[2 * n + 1]];
}

function pset(array, v, n) {
  array._data[2 * n] = v[0];
  array._data[2 * n + 1] = v[1];
}

// Since we do not have types like in Julia, we will use simple objects in JavaScript
function Rod(p1, p2) {
  this.p1 = p1;
  this.p2 = p2;
}

function Prop(p1, p2) {
  this.p1 = p1;
  this.p2 = p2;
}

function Rope(p1, p2, p3) {
  this.p1 = p1;
  this.p2 = p2;
  this.p3 = p3;
}

function Slider(p, n) {
  this.p = p;
  this.n = normalize(n);
}

function Shelf(p, n) {
  this.p = p;
  this.n = normalize(n);
}

function System(constraints, masses, positions, velocities) {
  this.forces = Array(masses.length).fill([0, -1]).flat(); // Assuming a default force
  this.constraints = constraints;
  this.masses = masses.flatMap((e) => [e, e]);
  this.positions = positions;
  this.velocities = velocities;
}

export function simulate(particles, constraints, timestep, duration) {
  let masses = [];
  let positions = [];
  let sys_constraints = [];
  for (var particle of particles) {
    masses.push(particle.mass);
    positions.push(particle.x);
    positions.push(particle.y);
  }
  for (var rod of constraints.rod) {
    sys_constraints.push(new Rod(rod.p1, rod.p2));
  }
  for (var slider of constraints.slider) {
    sys_constraints.push(
      new Slider(slider.p, [slider.normal.x, slider.normal.y]),
    );
  }

  var system = new System(
    sys_constraints,
    masses,
    positions,
    math.zeros(positions.length),
  );
  let y_0 = math.concat(system.positions, system.velocities);
  let trajectory = rk4(system, y_0, timestep, duration);
  return trajectory;
}

function rk4(system, y_0, timestep, tfinal) {
  var y = y_0;
  var t = 0;
  var h = timestep;
  var output = [];
  var terminate = false;
  while (t < tfinal && !terminate) {
    t += h;
    var [k1, _] = dydt(system, y);
    var [k2, _] = dydt(system, math.add(y, math.multiply(h / 2, k1)));
    var [k3, _] = dydt(system, math.add(y, math.multiply(h / 2, k2)));
    var [k4, terminate] = dydt(system, math.add(y, math.multiply(h, k3)));

    y = math.add(
      y,
      math.multiply(
        h / 6,
        math.add(
          k1,
          math.add(math.multiply(2, k2), math.add(math.multiply(2, k3), k4)),
        ),
      ),
    );
    output.push(y);
  }

  return output;
}
function dvdt(system) {
  var interactions = system.constraints.map((constraint) => {
    if (constraint instanceof Rod) {
      return compute_effect_rod(constraint, system);
    }
    if (constraint instanceof Slider) {
      return compute_effect_slider(constraint, system);
    }
  });
  var interactions2 = math.dotDivide(interactions, [system.masses]);
  interactions2 = math.multiply(interactions2, math.transpose(interactions));
  var desires = system.constraints.map((constraint) => {
    if (constraint instanceof Rod) {
      return compute_acceleration_rod(constraint, system);
    }
    if (constraint instanceof Slider) {
      return compute_acceleration_slider(constraint, system);
    }
  });
  let constraint_forces = math.multiply(math.inv(interactions2), desires);
  let acc = math.subtract(
    math.dotDivide(
      math.multiply(math.transpose(constraint_forces), interactions),
      system.masses,
    ),
    system.forces,
  );
  return [acc, false];
}
function dydt(system, y) {
  system.positions = y._data.slice(0, system.positions.length);
  system.velocities = y._data.slice(system.positions.length, y.length);
  let [dv, terminate] = dvdt(system);
  return [math.concat(system.velocities, dv), terminate];
}

function compute_effect_rod(rod, system) {
  let direction = normalize(
    math.subtract(
      pget(system.positions, rod.p1),
      pget(system.positions, rod.p2),
    ),
  );
  let result = math.zeros(system.positions.length);
  pset(result, direction, rod.p2);
  pset(result, math.multiply(-1, direction), rod.p1);
  return result;
}
function compute_effect_slider(slider, system) {
  let result = math.zeros(system.positions.length);
  pset(result, slider.n, slider.p);
  return result;
}

function compute_acceleration_rod(rod, system) {
  let r = math.subtract(
    pget(system.positions, rod.p1),
    pget(system.positions, rod.p2),
  );
  let v = math.subtract(
    pget(system.velocities, rod.p1),
    pget(system.velocities, rod.p2),
  );
  let l = math.sqrt(math.sum(math.dotMultiply(r, r)));

  return math.sum(math.dotMultiply(v, v)) / l;
}
function compute_acceleration_slider(slider, system) {
  return math.sum(math.dotMultiply(pget(system.forces, slider.p), slider.n));
}
