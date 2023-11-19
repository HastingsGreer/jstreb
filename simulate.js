// Import the math.js library

import * as math from "mathjs";

import {subtract, naiveMultiply, naiveMultiplyTranspose, naiveSolve, dotDivide} from "./matrix.js"

function normalize(v) {
	var len = Math.sqrt(v[0] * v[0] + v[1] * v[1])
  return [v[0] / len, v[1] / len]
}

function wedge(a, b) {
  return math.subtract(math.multiply(a[0], b[1]), math.multiply(a[1], b[0]));
}

function pget(array, n) {
  return [array[2 * n], array[2 * n + 1]];
}

function pset(array, v, n) {
  array[2 * n] = v[0];
  array[2 * n + 1] = v[1];
}

// Since we do not have types like in Julia, we will use simple objects in JavaScript
function Rod(p1, p2, oneway) {
  this.p1 = p1;
  this.p2 = p2;
  this.oneway = oneway;
}

function Rope(p1, p2, p3) {
  this.p1 = p1;
  this.p2 = p2;
  this.p3 = p3;
}

function F2k(reference, slide, base) {
  this.reference = reference;
  this.slide = slide;
  this.base = base;
  this.fatmode = false;
}
function Colinear(reference, slide, base, oneway) {
  this.reference = reference;
  this.slide = slide;
  this.base = base;
  this.oneway = oneway;
}

function Slider(p, n, oneway) {
  this.p = p;
  this.n = normalize(n);
  this.oneway = oneway;
}

function System(constraints, masses, positions, velocities) {
  this.forces = Array(masses.length).fill([0, -1]).flat(); // Assuming a default force
  this.constraints = constraints;
  this.masses = masses.flatMap((e) => [e, e]);
  this.positions = positions;
  this.velocities = velocities;
}

export function simulate(
  particles,
  constraints,
  timestep,
  duration,
  terminate,
) {
	var start = Date.now()
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
    sys_constraints.push(new Rope(rope.p1, rope.p2, rope.p3));
  }

  console.log(sys_constraints);

  var system = new System(
    sys_constraints,
    masses,
    positions,
    math.zeros(positions.length),
  );
  system.terminate = terminate;
  let y_0 = math.concat(system.positions, system.velocities);
  let trajectory = rk4(system, y_0, timestep, duration);
	
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
    if (constraint instanceof Colinear) {
      return compute_effect_colinear(constraint, system);
    }
    if (constraint instanceof F2k) {
      return compute_effect_f2k(constraint, system);
    }
    if (constraint instanceof Rope) {
      return compute_effect_rope(constraint, system);
    }
  });
  var interactions2 = dotDivide(interactions, system.masses);
  interactions2 = naiveMultiplyTranspose(interactions2, interactions);
  var desires = system.constraints.map((constraint) => {
    if (constraint instanceof Rod) {
      return compute_acceleration_rod(constraint, system);
    }
    if (constraint instanceof Slider) {
      return compute_acceleration_slider(constraint, system);
    }
    if (constraint instanceof Colinear) {
      return compute_acceleration_colinear(constraint, system);
    }
    if (constraint instanceof F2k) {
      return compute_acceleration_f2k(constraint, system);
    }
    if (constraint instanceof Rope) {
      return compute_acceleration_rope(constraint, system);
    }
  });
  let constraint_forces = naiveSolve(interactions2, desires);
  let acc = math.subtract(
    math.dotDivide(
      math.multiply(math.transpose(constraint_forces), interactions),
    system.masses,
    ),
    system.forces,
  );
  for (var i = 0; i < constraint_forces.length; i++) {
    if (constraint_forces[i] > 0 && system.constraints[i].oneway === true) {
      system.constraints.splice(i, 1);
      break;
    }
  }
  //var acc = new Array(system.positions.length).fill(0);
  return [acc, false];
}
function dydt(system, y) {
  system.positions = y._data.slice(0, system.positions.length);
  system.velocities = y._data.slice(system.positions.length, y.length);
  let [dv, terminate] = dvdt(system);
  if (system.terminate(y)) {
    for (var i = 0; i < system.constraints.length; i++) {
      if (
        system.constraints[i].p1 === 3 ||
        system.constraints[i].p2 === 3 ||
        system.constraints[i].p3 === 3
      ) {
        system.constraints.splice(i, 1);
        break;
      }
    }
  }
  return [math.concat(system.velocities, dv), false];
}

function compute_effect_rod(rod, system) {
  let direction = normalize(
    subtract(
      pget(system.positions, rod.p1),
      pget(system.positions, rod.p2),
    ),
  );
  let result = new Array(system.positions.length).fill(0);
  pset(result, direction, rod.p2);
  pset(result, math.multiply(-1, direction), rod.p1);
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
  let direction = normalize(
    subtract(
      pget(system.positions, rope.p1),
      pget(system.positions, rope.p2),
    ),
  );
  let direction1 = normalize(
    subtract(
      pget(system.positions, rope.p2),
      pget(system.positions, rope.p3),
    ),
  );
  let result = new Array(system.positions.length).fill(0);
  pset(result, math.multiply(-1, direction), rope.p1);
  pset(result, math.add(direction, math.multiply(-1, direction1)), rope.p2);
  pset(result, direction1, rope.p3);
  return result;
}
function compute_acceleration_rope(rod, system) {
  let r = subtract(
    pget(system.positions, rod.p1),
    pget(system.positions, rod.p2),
  );
  let v = subtract(
    pget(system.velocities, rod.p1),
    pget(system.velocities, rod.p2),
  );
  let l = math.sqrt(math.sum(math.dotMultiply(r, r)));
  let r1 = subtract(
    pget(system.positions, rod.p2),
    pget(system.positions, rod.p3),
  );
  let v1 = subtract(
    pget(system.velocities, rod.p2),
    pget(system.velocities, rod.p3),
  );
  let l1 = math.sqrt(math.sum(math.dotMultiply(r1, r1)));

  return (
    Math.pow(wedge(r, v), 2) / (l * l * l) +
    Math.pow(wedge(r1, v1), 2) / (l1 * l1 * l1)
  );
}
function compute_acceleration_slider(slider, system) {
  return math.sum(math.dotMultiply(pget(system.forces, slider.p), slider.n));
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