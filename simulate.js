import {
  multiplyBSparse,
  batchAdd,
  multiply,
  subtract,
  subtractv,
  naiveMultiply,
  multiplyTransposeSameSparsity,
  naiveSolve,
  dotDivide,
  sparseDotDivide,
  store,
} from "./matrix.js";

import { dopri } from "./dopri.js";

const RELEASED = 2;

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

function sparsepset(array, v, n) {
  array[0] |= 3 << (2 * n);
  array[2 * n + 1] = v[0];
  array[2 * n + 2] = v[1];
}

class Rod {
  constructor(p1, p2, oneway) {
    this.p1 = p1;
    this.p2 = p2;
    this.oneway = oneway;
    this.name = "rod";
  }
  static computeEffect(result, rod, system) {
    let direction = normalize(
      subtract(pget(system.positions, rod.p1), pget(system.positions, rod.p2)),
    );
    sparsepset(result, direction, rod.p2);
    sparsepset(result, [-direction[0], -direction[1]], rod.p1);
    return result;
  }
  static computeAcceleration(rod, system) {
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
}

class Rope {
  constructor(p1, pulleys, p3, oneway) {
    this.p1 = p1;
    this.pulleys = JSON.parse(JSON.stringify(pulleys));
    this.p3 = p3;
    this.name = "rope";
    if (oneway) {
      this.oneway = oneway;
    }
  }
  static computeEffect(result, rope, system) {
    var positions = [];
    positions.push(rope.p1);
    for (var pulley of rope.pulleys) {
      positions.push(pulley.idx);
    }
    positions.push(rope.p3);

    for (var i = 1; i < positions.length - 1; i++) {
      if (
        rope.pulleys[i - 1].wrapping == "ccw_drop" ||
        rope.pulleys[i - 1].wrapping == "cw_drop"
      ) {
        // turn on pulleys as they drop onto the rope

        // check for dropping on based on the shape of the rope through the activated pulleys
        var pulley_before = i - 1;
        while (
          pulley_before > 0 &&
          (rope.pulleys[pulley_before - 1].wrapping == "ccw_drop" ||
            rope.pulleys[pulley_before - 1].wrapping == "cw_drop")
        ) {
          pulley_before -= 1;
        }
        var pulley_after = i + 1;
        while (
          pulley_after < positions.length - 2 &&
          (rope.pulleys[pulley_after - 1].wrapping == "ccw_drop" ||
            rope.pulleys[pulley_after - 1].wrapping == "cw_drop")
        ) {
          pulley_after += 1;
        }
        //
        var p1 = pget(system.positions, positions[pulley_before]);
        var p2 = pget(system.positions, positions[i]);
        var p3 = pget(system.positions, positions[pulley_after]);
        var wedge_ = wedge(subtract(p1, p2), subtract(p2, p3));

        if (
          (wedge_ > 0 && rope.pulleys[i - 1].wrapping == "ccw_drop") ||
          (wedge_ < 0 && rope.pulleys[i - 1].wrapping == "cw_drop")
        ) {
          rope.pulleys[i - 1].wrapping = "both";
          system.stringConstraint = null;
          break;
        }
      }
    }

    positions = [];
    positions.push(rope.p1);
    var index_in_pulleys = 0;
    var indices_in_pulleys = [-1];
    for (var pulley of rope.pulleys) {
      if (!(pulley.wrapping == "ccw_drop") && !(pulley.wrapping == "cw_drop")) {
        positions.push(pulley.idx);
        indices_in_pulleys.push(index_in_pulleys);
      }
      index_in_pulleys += 1;
    }
    positions.push(rope.p3);
    for (var i = 1; i < positions.length - 1; i++) {
      var p1 = pget(system.positions, positions[i - 1]);
      var p2 = pget(system.positions, positions[i]);
      var p3 = pget(system.positions, positions[i + 1]);
      var wedge_ = wedge(subtract(p1, p2), subtract(p2, p3));
      if (
        (wedge_ > 0 && rope.pulleys[indices_in_pulleys[i]].wrapping == "ccw") ||
        (wedge_ < 0 && rope.pulleys[indices_in_pulleys[i]].wrapping == "cw")
      ) {
        rope.pulleys.splice(indices_in_pulleys[i], 1);
        system.stringConstraint = null;
        break;
      }
    }
    positions = [];
    positions.push(rope.p1);
    for (var pulley of rope.pulleys) {
      if (!(pulley.wrapping == "ccw_drop") && !(pulley.wrapping == "cw_drop")) {
        positions.push(pulley.idx);
      }
    }
    positions.push(rope.p3);
    result.fill(0);
    for (var i = 0; i < positions.length - 1; i++) {
      let p1 = positions[i];
      let p2 = positions[i + 1];

      let direction = normalize(
        subtract(pget(system.positions, p2), pget(system.positions, p1)),
      );
      let old = pget(result, p1 + 0.5);
      sparsepset(result, subtract(old, direction), p1);
      sparsepset(result, direction, p2);
    }
    return result;
  }
  static computeAcceleration(rope, system) {
    var sum = 0;
    var positions = [];
    positions.push(rope.p1);
    for (var pulley of rope.pulleys) {
      if (!(pulley.wrapping == "ccw_drop") && !(pulley.wrapping == "cw_drop")) {
        positions.push(pulley.idx);
      }
    }
    positions.push(rope.p3);
    for (var i = 0; i < positions.length - 1; i++) {
      let p1 = positions[i];
      let p2 = positions[i + 1];

      let r = subtract(pget(system.positions, p1), pget(system.positions, p2));
      let v = subtract(
        pget(system.velocities, p1),
        pget(system.velocities, p2),
      );
      let l = Math.sqrt(r[0] * r[0] + r[1] * r[1]);
      sum += Math.pow(wedge(r, v), 2) / (l * l * l);
    }

    return -sum;
  }
}

class F2k {
  constructor(reference, slide, base) {
    this.reference = reference;
    this.slide = slide;
    this.base = base;
    this.fatmode = false;
    this.name = "f2k";
  }

  static computeEffect(result, f2k, system) {
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

    if (yref < 0) {
      if (!f2k.fatmode) {
        var baselength = x;
        var tiplength = xref - x;

        f2k.ratio = baselength / tiplength;
      }
      f2k.fatmode = true;
      system.stringConstraint = null;
    }
    if (f2k.fatmode) {
      sparsepset(result, [0, 1], f2k.base);
      sparsepset(result, [0, f2k.ratio], f2k.reference);
      return result;
    }

    var denom = Math.sqrt(xref * xref + yref * yref);
    var denom3 = denom * denom * denom;

    var eX = -yref / denom;
    var eY = xref / denom;

    var eXref = (x * xref * yref + y * yref * yref) / denom3;
    var eYref = -(x * xref * xref + xref * y * yref) / denom3;

    var eXbase = -eX - eXref;
    var eYbase = -eY - eYref;

    sparsepset(result, [eX, eY], f2k.slide);
    sparsepset(result, [eXref, eYref], f2k.reference);
    sparsepset(result, [eXbase, eYbase], f2k.base);
    return result;
  }
  static computeAcceleration(f2k, system) {
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
}
class Colinear {
  constructor(reference, slide, base, oneway) {
    this.reference = reference;
    this.slide = slide;
    this.base = base;
    this.oneway = oneway;
    this.name = "colinear";
  }

  static computeEffect(result, colinear, system) {
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

    var eX = -yref / denom;
    var eY = xref / denom;

    var eXref = (x * xref * yref + y * yref * yref) / denom3;
    var eYref = -(x * xref * xref + xref * y * yref) / denom3;

    var eXbase = -eX - eXref;
    var eYbase = -eY - eYref;

    sparsepset(result, [eX, eY], colinear.slide);
    sparsepset(result, [eXref, eYref], colinear.reference);
    sparsepset(result, [eXbase, eYbase], colinear.base);
    return result;
  }
  static computeAcceleration(colinear, system) {
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
}

class Slider {
  constructor(p, n, oneway) {
    this.p = p;
    this.n = normalize(n);
    this.oneway = oneway;
    this.name = "slider";
  }
  static computeEffect(result, slider, system) {
    sparsepset(result, slider.n, slider.p);
    return result;
  }
  static computeAcceleration(slider, system) {
    var f = pget(system.forces, slider.p);
    return slider.n[0] * f[0] + slider.n[1] * f[1];
  }
}

const constraintTypes = {
  rope: Rope,
  rod: Rod,
  colinear: Colinear,
  slider: Slider,
  f2k: F2k,
};

function System(constraints, masses, positions, velocities) {
  this.forces = Array(masses.length).fill([0, -1]).flat(); // Assuming a default force
  this.constraints = constraints;
  this.masses = masses.flatMap((e) => [e, e]);
  this.positions = positions;
  this.velocities = velocities;
}

export function convertBack(sysConstraints) {
  let constraints = [];

  for (let constraint of sysConstraints) {
    if (constraint.oneway == RELEASED) {
      continue;
    }
    switch (constraint.name) {
      case "slider":
        constraints.push({
          p: constraint.p,
          normal: { x: constraint.n[0], y: constraint.n[1] },
          oneway: constraint.oneway,
          name: "slider",
        });
        break;
      case "rope":
        constraints.push({
          p1: constraint.p1,
          pulleys: constraint.pulleys.filter(
            (p) => p.wrapping != "cw_drop" && p.wrapping != "ccw_drop",
          ),
          p3: constraint.p3,
          name: "rope",
        });
        break;
      default:
        constraints.push(JSON.parse(JSON.stringify(constraint)));
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
  let masses = [];
  let positions = [];
  let sysConstraints = [];
  for (var particle of particles) {
    masses.push(particle.mass);
    positions.push(particle.x);
    positions.push(particle.y);
  }
  for (var rod of constraints) {
    if (rod.name === "slider") {
      sysConstraints.push(
        new Slider(rod.p, [rod.normal.x, rod.normal.y], rod.oneway),
      );
    } else if (rod.name === "pin") {
      sysConstraints.push(new Slider(rod.p, [0, 1], false));
      sysConstraints.push(new Slider(rod.p, [1, 0], false));
    } else if (rod.name === "body") {
      var pulleys = rod.pulleys.map((x) => x.idx);
      sysConstraints.push(new Rod(pulleys[0], pulleys[1]));
      for (var index = 2; index < pulleys.length; index++) {
        sysConstraints.push(new Rod(pulleys[index], pulleys[index - 1]));
        sysConstraints.push(new Rod(pulleys[index], pulleys[index - 2]));
      }
    } else {
      sysConstraints.push(JSON.parse(JSON.stringify(rod)));
    }
  }

  var system = new System(
    sysConstraints,
    masses,
    positions,
    new Array(positions.length).fill(0),
  );
  system.terminate = terminate;
  let y_0 = system.positions.concat(system.velocities);
  let trajectory = rk45(system, y_0, timestep, duration);

  return trajectory;
}

export function rk45(system, y_0, timestep, tfinal) {
  var times = [];
  var constraintLog = [];
  var forceLog = [];
  var fprime = (t, y) => {
    store.clear();
    while (t < times[times.length - 1]) {
      times.pop();
      forceLog.pop();
      var string = constraintLog.pop();
      system.constraints = JSON.parse(string);
      system.stringConstraint = string;
    }
    times.push(t);
    if (0 | !system.stringConstraint) {
      system.stringConstraint = JSON.stringify(system.constraints);
    }
    constraintLog.push(system.stringConstraint);
    forceLog.push(system.constraintForces);

    return dydt(system, y)[0];
  };

  var res = dopri(0, tfinal, y_0, fprime, 1e-6, 10000);
  var output = [];
  var t = 0;

  while (t < tfinal) {
    output.push(res.at(t));
    t += timestep;
  }
  return [output, [times, constraintLog], forceLog];
}

function dvdt(system) {
  var interactions = store.getMat(
    system.constraints.length,
    system.masses.length + 1,
  );
  for (var constr = 0; constr < system.constraints.length; constr++) {
    var constraint = system.constraints[constr];
    var row = interactions[constr];
    row[0] = 0;
    if (constraint.oneway === RELEASED) {
      continue;
    }
    constraintTypes[constraint.name].computeEffect(row, constraint, system);
  }
  var interactions2 = sparseDotDivide(interactions, system.masses);
  interactions2 = multiplyTransposeSameSparsity(interactions2, interactions);
  for (var i = 0; i < interactions2.length; i++) {
    if (interactions2[i][i] == 0) {
      interactions2[i][i] = 1;
    }
  }
  var desires = store.getVec(system.constraints.length);
  for (var constr = 0; constr < system.constraints.length; constr++) {
    var constraint = system.constraints[constr];
    desires[constr] = constraintTypes[constraint.name].computeAcceleration(
      constraint,
      system,
    );
  }
  let constraintForces = naiveSolve(interactions2, desires);
  system.constraintForces = constraintForces;
  for (var i = 0; i < constraintForces.length; i++) {
    system.constraints[i].force = constraintForces[i];
  }
  let acc = subtractv(
    dotDivide(
      multiplyBSparse([constraintForces], interactions),
      system.masses,
    )[0],
    system.forces,
  );
  for (var i = 0; i < constraintForces.length; i++) {
    if (constraintForces[i] > 0 && system.constraints[i].oneway === true) {
      system.constraints[i].oneway = RELEASED;
      system.stringConstraint = null;
      break;
    }
  }
  //var acc = new Array(system.positions.length).fill(0);
  return [acc, false];
}
function dydt(system, y) {
  system.positions = y.slice(0, system.positions.length);
  system.velocities = y.slice(system.positions.length, y.length);
  let [dv, _] = dvdt(system);
  if (system.terminate(y)) {
    var proj = window.data.projectile;
    for (var i = 0; i < system.constraints.length; i++) {
      if (
        system.constraints[i].p1 === proj ||
        system.constraints[i].p2 === proj ||
        system.constraints[i].p3 === proj
      ) {
        system.constraints.splice(i, 1);
        system.stringConstraint = null;
        break;
      }
    }
  }
  return [system.velocities.concat(dv), false];
}
