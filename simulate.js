import {
  batch_add,
  multiply,
  subtract,
  subtractv,
  naiveMultiply,
  naiveMultiplyTranspose,
  naiveSolve,
  dotDivide,
} from "./matrix.js";

import { dopri } from "./dopri.js";

function normalize(v) {
  var len = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  return [v[0] / len, v[1] / len];
}

function wedge(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}

function pget(array, n) {
  return [array[2 * n], array[2 * n + 1]];
}

function pset(array, v, n) {
  array[2 * n] = v[0];
  array[2 * n + 1] = v[1];
}

function Rod(p1, p2, oneway) {
  this.p1 = p1;
  this.p2 = p2;
  this.oneway = oneway;
  this.name = "Rod";
}

function Rope(p1, p2, p3) {
  this.p1 = p1;
  this.p2 = JSON.parse(JSON.stringify(p2));
  this.p3 = p3;
  this.name = "Rope";
}

function F2k(reference, slide, base) {
  this.reference = reference;
  this.slide = slide;
  this.base = base;
  this.fatmode = false;
  this.name = "F2k";
}
function Colinear(reference, slide, base, oneway) {
  this.reference = reference;
  this.slide = slide;
  this.base = base;
  this.oneway = oneway;
  this.name = "Colinear";
}

function Slider(p, n, oneway) {
  this.p = p;
  this.n = normalize(n);
  this.oneway = oneway;
  this.name = "Slider";
}

function System(constraints, masses, positions, velocities) {
  this.forces = Array(masses.length).fill([0, -1]).flat(); // Assuming a default force
  this.constraints = constraints;
  this.masses = masses.flatMap((e) => [e, e]);
  this.positions = positions;
  this.velocities = velocities;
}

export function convert_back(sys_constraints) {
  let constraints = {
    rod: [],
    slider: [],
    colinear: [],
    f2k: [],
    rope: [],
  };

  for (let constraint of sys_constraints) {
    switch (constraint.name) {
      case "Rod":
        constraints.rod.push({
          p1: constraint.p1,
          p2: constraint.p2,
          oneway: constraint.oneway,
        });
        break;
      case "Slider":
        constraints.slider.push({
          p: constraint.p,
          normal: { x: constraint.n[0], y: constraint.n[1] },
          oneway: constraint.oneway,
        });
        break;
      case "Colinear":
        constraints.colinear.push({
          reference: constraint.reference,
          slider: constraint.slide,
          base: constraint.base,
          oneway: constraint.oneway,
        });
        break;
      case "F2k":
        constraints.f2k.push({
          reference: constraint.reference,
          slider: constraint.slide,
          base: constraint.base,
        });
        break;
      case "Rope":
        constraints.rope.push({
          p1: constraint.p1,
          pulleys: constraint.p2.filter(
            (p) => p.wrapping != "cw_drop" && p.wrapping != "ccw_drop",
          ),
          p3: constraint.p3,
        });
        break;
    }
  }

  return constraints;
}

export function simulate(
  particles,
  constraints,
  timestep,
  duration,
  terminate,
) {
  var start = Date.now();
  let masses = [];
  let positions = [];
  let sys_constraints = [];
  for (var particle of particles) {
    masses.push(particle.mass);
    positions.push(particle.x);
    positions.push(particle.y);
  }
  for (var rod of constraints.rod) {
    sys_constraints.push(new Rod(rod.p1, rod.p2, rod.oneway));
  }
  for (var slider of constraints.slider) {
    sys_constraints.push(
      new Slider(slider.p, [slider.normal.x, slider.normal.y], slider.oneway),
    );
  }
  for (var slider of constraints.pin) {
    sys_constraints.push(
      new Slider(slider.p, [0, 1], false),
    );
    sys_constraints.push(
      new Slider(slider.p, [1, 0], false),
    );
  }
  for (var colinear of constraints.colinear) {
    sys_constraints.push(
      new Colinear(
        colinear.reference,
        colinear.slider,
        colinear.base,
        colinear.oneway,
      ),
    );
  }
  for (var f2k of constraints.f2k) {
    sys_constraints.push(new F2k(f2k.reference, f2k.slider, f2k.base));
  }
  for (var rope of constraints.rope) {
    sys_constraints.push(new Rope(rope.p1, rope.pulleys.slice(), rope.p3));
  }

  var system = new System(
    sys_constraints,
    masses,
    positions,
    new Array(positions.length).fill(0),
  );
  system.terminate = terminate;
  let y_0 = system.positions.concat(system.velocities);
  let trajectory = rk45(system, y_0, timestep, duration);

  var end = Date.now();
  document.getElementById("simtime").innerText = end - start;
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
    var [k2, _] = dydt(system, batch_add([y, multiply(h / 2, k1)]));
    var [k3, _] = dydt(system, batch_add([y, multiply(h / 2, k2)]));
    var [k4, terminate] = dydt(system, batch_add([y, multiply(h, k3)]));

    y = batch_add([
      y,
      multiply(h / 6, batch_add([k1, multiply(2, k2), multiply(2, k3), k4])),
    ]);
    output.push(y);
  }

  return output;
}
export function rk45(system, y_0, timestep, tfinal) {
  var times = [];
  var constraint_log = [];
  var fprime = (t, y) => {
    while (t < times[times.length - 1]) {
      times.pop();
      var string = constraint_log.pop();
      system.constraints = JSON.parse(string);
      system.string_constraint = string;
    }
    times.push(t);
    if (1 || !system.string_constraint) {
      system.string_constraint = JSON.stringify(system.constraints);
    }
    constraint_log.push(system.string_constraint);

    return dydt(system, y)[0];
  };

  var res = dopri(0, tfinal, y_0, fprime, 1e-6, 10000);
  var output = [];
  var t = 0;

  while (t < tfinal) {
    output.push(res.at(t));
    t += timestep;
  }
  return [output, [times, constraint_log]];
}

function dvdt(system) {
  var interactions = system.constraints.map((constraint) => {
    if (constraint.name === "Rod") {
      return compute_effect_rod(constraint, system);
    }
    if (constraint.name === "Slider") {
      return compute_effect_slider(constraint, system);
    }
    if (constraint.name === "Colinear") {
      return compute_effect_colinear(constraint, system);
    }
    if (constraint.name === "F2k") {
      return compute_effect_f2k(constraint, system);
    }
    if (constraint.name === "Rope") {
      return compute_effect_rope(constraint, system);
    }
  });
  var interactions2 = dotDivide(interactions, system.masses);
  interactions2 = naiveMultiplyTranspose(interactions2, interactions);
  var desires = system.constraints.map((constraint) => {
    if (constraint.name === "Rod") {
      return compute_acceleration_rod(constraint, system);
    }
    if (constraint.name === "Slider") {
      return compute_acceleration_slider(constraint, system);
    }
    if (constraint.name === "Colinear") {
      return compute_acceleration_colinear(constraint, system);
    }
    if (constraint.name === "F2k") {
      return compute_acceleration_f2k(constraint, system);
    }
    if (constraint.name === "Rope") {
      return compute_acceleration_rope(constraint, system);
    }
  });
  let constraint_forces = naiveSolve(interactions2, desires);
  for (var i = 0; i < constraint_forces.length; i++) {
    system.constraints[i].force = constraint_forces[i];
  }
  let acc = subtractv(
    dotDivide(
      naiveMultiply([constraint_forces], interactions),
      system.masses,
    )[0],
    system.forces,
  );
  for (var i = 0; i < constraint_forces.length; i++) {
    if (constraint_forces[i] > 0 && system.constraints[i].oneway === true) {
      system.constraints.splice(i, 1);
      system.string_constraint = null;
      break;
    }
  }
  //var acc = new Array(system.positions.length).fill(0);
  return [acc, false];
}
function dydt(system, y) {
  system.positions = y.slice(0, system.positions.length);
  system.velocities = y.slice(system.positions.length, y.length);
  let [dv, terminate] = dvdt(system);
  if (system.terminate(y)) {
    var proj = window.data.projectile;
    for (var i = 0; i < system.constraints.length; i++) {
      if (
        system.constraints[i].p1 === proj ||
        system.constraints[i].p2 === proj ||
        system.constraints[i].p3 === proj
      ) {
        system.constraints.splice(i, 1);
        system.string_constraint = null;
        break;
      }
    }
  }
  return [system.velocities.concat(dv), false];
}

function compute_effect_rod(rod, system) {
  let direction = normalize(
    subtract(pget(system.positions, rod.p1), pget(system.positions, rod.p2)),
  );
  let result = new Array(system.positions.length).fill(0);
  pset(result, direction, rod.p2);
  pset(result, [-direction[0], -direction[1]], rod.p1);
  return result;
}
function compute_effect_slider(slider, system) {
  let result = new Array(system.positions.length).fill(0);
  pset(result, slider.n, slider.p);
  return result;
}

function compute_acceleration_rod(rod, system) {
  let r = subtract(
    pget(system.positions, rod.p1),
    pget(system.positions, rod.p2),
  );
  let v = subtract(
    pget(system.velocities, rod.p1),
    pget(system.velocities, rod.p2),
  );
  let l = Math.sqrt(r[0] * r[0] + r[1] * r[1]);

  return (v[0] * v[0] + v[1] * v[1]) / l;
}
function compute_effect_rope(rope, system) {
  var positions = [];
  positions.push(rope.p1);
  for (var pulley of rope.p2) {
    positions.push(pulley.idx);
  }
  positions.push(rope.p3);

  for (var i = 1; i < positions.length - 1; i++) {
    var p1 = pget(system.positions, positions[i - 1]);
    var p2 = pget(system.positions, positions[i]);
    var p3 = pget(system.positions, positions[i + 1]);
    var wedge_ = wedge(subtract(p1, p2), subtract(p2, p3));
    if (
      (wedge_ > 0 && rope.p2[i - 1].wrapping == "ccw_drop") ||
      (wedge_ < 0 && rope.p2[i - 1].wrapping == "cw_drop")
    ) {
      rope.p2[i - 1].wrapping = "both";
      system.string_constraint = null;
      break;
    }
  }

  positions = [];
  positions.push(rope.p1);
  for (var pulley of rope.p2) {
    if (!(pulley.wrapping == "ccw_drop") && !(pulley.wrapping == "cw_drop")) {
      positions.push(pulley.idx);
    }
  }
  positions.push(rope.p3);
  for (var i = 1; i < positions.length - 1; i++) {
    var p1 = pget(system.positions, positions[i - 1]);
    var p2 = pget(system.positions, positions[i]);
    var p3 = pget(system.positions, positions[i + 1]);
    var wedge_ = wedge(subtract(p1, p2), subtract(p2, p3));
    if (
      (wedge_ > 0 && rope.p2[i - 1].wrapping == "ccw") ||
      (wedge_ < 0 && rope.p2[i - 1].wrapping == "cw")
    ) {
      rope.p2.splice(i - 1, 1);
      system.string_constraint = null;
      break;
    }
  }
  positions = [];
  positions.push(rope.p1);
  for (var pulley of rope.p2) {
    if (!(pulley.wrapping == "ccw_drop") && !(pulley.wrapping == "cw_drop")) {
      positions.push(pulley.idx);
    }
  }
  positions.push(rope.p3);
  let result = new Array(system.positions.length).fill(0);
  for (var i = 0; i < positions.length - 1; i++) {
    let p1 = positions[i];
    let p2 = positions[i + 1];

    let direction = normalize(
      subtract(pget(system.positions, p1), pget(system.positions, p2)),
    );
    let old = pget(result, p1);
    pset(result, subtract(old, direction), p1);
    pset(result, direction, p2);
  }
  return result;
}
function compute_acceleration_rope(rope, system) {
  var sum = 0;
  var positions = [];
  positions.push(rope.p1);
  for (var pulley of rope.p2) {
    if (!(pulley.wrapping == "ccw_drop") && !(pulley.wrapping == "cw_drop")) {
      positions.push(pulley.idx);
    }
  }
  positions.push(rope.p3);
  for (var i = 0; i < positions.length - 1; i++) {
    let p1 = positions[i];
    let p2 = positions[i + 1];

    let r = subtract(pget(system.positions, p1), pget(system.positions, p2));
    let v = subtract(pget(system.velocities, p1), pget(system.velocities, p2));
    let l = Math.sqrt(r[0] * r[0] + r[1] * r[1]);
    sum += Math.pow(wedge(r, v), 2) / (l * l * l);
  }

  return sum;
}
function compute_acceleration_slider(slider, system) {
  var f = pget(system.forces, slider.p);
  return slider.n[0] * f[0] + slider.n[1] * f[1];
}

function compute_effect_colinear(colinear, system) {
  var [x, y] = pget(system.positions, colinear.slide);
  var [h, v] = pget(system.velocities, colinear.slide);

  var [xref, yref] = pget(system.positions, colinear.reference);
  var [href, vref] = pget(system.velocities, colinear.reference);

  var [xbase, ybase] = pget(system.positions, colinear.base);
  var [hbase, vbase] = pget(system.velocities, colinear.base);

  x = x - xbase;
  y = y - ybase;
  h = h - hbase;
  v = v - vbase;

  xref = xref - xbase;
  yref = yref - ybase;
  href = href - hbase;
  vref = vref - vbase;

  var denom = Math.sqrt(xref * xref + yref * yref);
  var denom3 = denom * denom * denom;

  var e_x = -yref / denom;
  var e_y = xref / denom;

  var e_xref = (x * xref * yref + y * yref * yref) / denom3;
  var e_yref = -(x * xref * xref + xref * y * yref) / denom3;

  var e_xbase = -e_x - e_xref;
  var e_ybase = -e_y - e_yref;
  let result = new Array(system.positions.length).fill(0);

  pset(result, [e_x, e_y], colinear.slide);
  pset(result, [e_xref, e_yref], colinear.reference);
  pset(result, [e_xbase, e_ybase], colinear.base);
  return result;
}
function compute_acceleration_colinear(colinear, system) {
  var [x, y] = pget(system.positions, colinear.slide);
  var [h, v] = pget(system.velocities, colinear.slide);

  var [xref, yref] = pget(system.positions, colinear.reference);
  var [href, vref] = pget(system.velocities, colinear.reference);

  var [xbase, ybase] = pget(system.positions, colinear.base);
  var [hbase, vbase] = pget(system.velocities, colinear.base);

  x = x - xbase;
  y = y - ybase;
  h = h - hbase;
  v = v - vbase;

  xref = xref - xbase;
  yref = yref - ybase;
  href = href - hbase;
  vref = vref - vbase;

  var denom = Math.sqrt(xref * xref + yref * yref);

  var xrefh = xref / denom;
  var yrefh = yref / denom;

  var accel =
    (vref * xrefh - href * yrefh) *
    (((2 * href * x - vref * y) * xrefh * xrefh +
      (vref * x + href * y) * 3 * xrefh * yrefh +
      (2 * vref * y - href * x) * yrefh * yrefh) /
      (denom * denom) -
      (2 * (h * xrefh + v * yrefh)) / denom);

  return -accel;
}

function compute_effect_f2k(f2k, system) {
  var [x, y] = pget(system.positions, f2k.slide);
  var [h, v] = pget(system.velocities, f2k.slide);

  var [xref, yref] = pget(system.positions, f2k.reference);
  var [href, vref] = pget(system.velocities, f2k.reference);

  var [xbase, ybase] = pget(system.positions, f2k.base);
  var [hbase, vbase] = pget(system.velocities, f2k.base);

  x = x - xbase;
  y = y - ybase;
  h = h - hbase;
  v = v - vbase;

  xref = xref - xbase;
  yref = yref - ybase;
  href = href - hbase;
  vref = vref - vbase;

  let result = new Array(system.positions.length).fill(0);

  if (yref < 0) {
    if (!f2k.fatmode) {
      var baselength = x;
      var tiplength = xref - x;

      f2k.ratio = baselength / tiplength;
    }
    f2k.fatmode = true;
    system.string_constraint = null;
  }
  if (f2k.fatmode) {
    pset(result, [0, 1], f2k.base);
    pset(result, [0, f2k.ratio], f2k.reference);
    return result;
  }

  var denom = Math.sqrt(xref * xref + yref * yref);
  var denom3 = denom * denom * denom;

  var e_x = -yref / denom;
  var e_y = xref / denom;

  var e_xref = (x * xref * yref + y * yref * yref) / denom3;
  var e_yref = -(x * xref * xref + xref * y * yref) / denom3;

  var e_xbase = -e_x - e_xref;
  var e_ybase = -e_y - e_yref;

  pset(result, [e_x, e_y], f2k.slide);
  pset(result, [e_xref, e_yref], f2k.reference);
  pset(result, [e_xbase, e_ybase], f2k.base);
  return result;
}
function compute_acceleration_f2k(f2k, system) {
  if (f2k.fatmode) {
    return -1 - f2k.ratio;
  }
  var [x, y] = pget(system.positions, f2k.slide);
  var [h, v] = pget(system.velocities, f2k.slide);

  var [xref, yref] = pget(system.positions, f2k.reference);
  var [href, vref] = pget(system.velocities, f2k.reference);

  var [xbase, ybase] = pget(system.positions, f2k.base);
  var [hbase, vbase] = pget(system.velocities, f2k.base);

  x = x - xbase;
  y = y - ybase;
  h = h - hbase;
  v = v - vbase;

  xref = xref - xbase;
  yref = yref - ybase;
  href = href - hbase;
  vref = vref - vbase;

  var denom = Math.sqrt(xref * xref + yref * yref);

  var accel =
    ((2 * href * x * xref * xref -
      2 * h * xref * xref * xref -
      vref * xref * xref * y +
      3 * vref * x * xref * yref -
      2 * v * xref * xref * yref +
      3 * href * xref * y * yref -
      href * x * yref * yref -
      2 * h * xref * yref * yref +
      2 * vref * y * yref * yref -
      2 * v * yref * yref * yref) *
      (vref * xref - href * yref)) /
    (denom * denom * denom * denom * denom);

  return -accel;
}
