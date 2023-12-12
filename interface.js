import { simulate, convert_back } from "./simulate.js";

var ctypes = ["rod", "pin", "slider", "colinear", "f2k", "rope"];
// Prevent scrolling when touching the canvas
/*
document.body.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });
document.body.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });
document.body.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });
*/

const canvas = document.getElementById("mechanism");
canvas.addEventListener("touchstart", function (e) {
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
  canvas.dispatchEvent(mouseEvent);
});
canvas.addEventListener("touchend", function (_) {
  var mouseEvent = new MouseEvent("mouseup", {});
  canvas.dispatchEvent(mouseEvent);
});
canvas.addEventListener("touchmove", function (e) {
  if (e.touches.length > 1) {
    return;
  }
  if (draggedParticleIndex === null) {
    return;
  }
  e.preventDefault();
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
  canvas.dispatchEvent(mouseEvent);
});
const ctx = canvas.getContext("2d");
window.data = {
  duration: 50,
  timestep: 1,
  projectile: 3,
  mainaxle: 0,
  armtip: 1,
  axleheight: 8,
  particles: [{ x: 100, y: 100, mass: 1, hovered: false }],
  constraints: { rod: [], slider: [] },
};
var iterations = 0;
async function doit() {
  for (var x = 0; x < 600; x += 5) {
    for (var y = 300; y < 900; y += 5) {
      window.data.particles[5].x = x;
      window.data.particles[5].y = y;

      var [_, range, __, ___] = simulate_and_range();

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      var r2 = (256 * range) / 40000;
      ctx.fillStyle = `rgb(${r2}, ${256 * Math.sin(r2 / 10)}, ${r2})`;
      ctx.fill();
      if (y % 50 == 0) {
        await window.waitForAnimationFrame();
      }
    }
  }
}
async function wait() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1); // waits for 10 milliseconds
  });
}
async function waitForAnimationFrame() {
  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

async function doAnimate() {
  if (window.data.timestep == 0) {
    return;
  }
  var reset = JSON.stringify(window.data);
  var [trajectories, constraint_log] = simulate(
    window.data.particles,
    window.data.constraints,
    window.data.timestep,
    window.data.duration,
    terminate,
  );
  var ts = window.data.timestep;
  window.data.timestep = 0;

  var t = 0;
  var constraint_i = 0;
  for (var traj of trajectories) {
    while (constraint_log[0][constraint_i + 1] < t) {
      constraint_i += 1;
    }
    t += ts;
    var current_constraints = JSON.parse(constraint_log[1][constraint_i]);
    window.data.constraints = convert_back(current_constraints);
    for (var i = 0; i < window.data.particles.length; i++) {
      window.data.particles[i].x = traj[2 * i];
      window.data.particles[i].y = traj[2 * i + 1];
    }
    drawMechanism();
    await waitForAnimationFrame();
  }
  window.data = JSON.parse(reset);
  drawMechanism();
}
function terminate(state) {
  var slingx =
    state[2 * window.data.armtip] - state[2 * window.data.projectile];
  var slingy =
    state[2 * window.data.armtip + 1] - state[2 * window.data.projectile + 1];

  var norms = Math.sqrt(slingx * slingx + slingy * slingy);

  slingx = slingx / norms;
  slingy = slingy / norms;

  var armx = state[2 * window.data.armtip] - state[2 * window.data.mainaxle];
  var army =
    state[2 * window.data.armtip + 1] - state[2 * window.data.mainaxle + 1];
  var norma = Math.sqrt(armx * armx + army * army);

  armx /= norma;
  army /= norma;

  //return armx * slingy - slingx * army < 0;
  var vx = state[2 * window.data.projectile + 2 * window.data.particles.length];
  var vy =
    state[2 * window.data.projectile + 2 * window.data.particles.length + 1];
  return vx > 40 && vy > -15;
}
function simulate_and_range() {
  const [trajectories, constraint_log] = simulate(
    window.data.particles,
    window.data.constraints,
    window.data.timestep,
    window.data.duration,
    terminate,
  );
  window.constraint_log = constraint_log;
  var peakLoad = Math.max(
    ...constraint_log[1]
      .map(JSON.parse)
      .map((y) => Math.max(...y.map((x) => Math.abs(x.force))))
      .slice(1),
  );

  var axlecoord = -window.data.particles[window.data.mainaxle].y;
  var mincoord = -window.data.particles[window.data.mainaxle].y;
  var range = 0;
  for (var trajectory of trajectories) {
    for (
      var part_index = 0;
      part_index < window.data.particles.length;
      part_index++
    ) {
      if (trajectory[2 * part_index] < 2000) {
        mincoord = Math.min(mincoord, -trajectory[2 * part_index + 1]);
      }
      axlecoord = Math.max(
        axlecoord,
        -trajectory[2 * window.data.mainaxle + 1],
      );
    }

    range = Math.max(
      range,
      2 *
        Math.max(
          0,
          -trajectory[
            2 * window.data.particles.length + 2 * window.data.projectile + 1
          ],
        ) *
        trajectory[
          2 * window.data.particles.length + 2 * window.data.projectile
        ],
    );
  }
  var height1 = axlecoord - mincoord;
  var height2 = Math.sqrt(
    Math.pow(
      window.data.particles[window.data.armtip].x -
        window.data.particles[window.data.mainaxle].x,
      2,
    ) +
      Math.pow(
        window.data.particles[window.data.armtip].y -
          window.data.particles[window.data.projectile].y,
        2,
      ),
  );
  range = (range / Math.max(height1, 0.75 * height2)) * window.data.axleheight;
  return [trajectories, range, constraint_log, peakLoad];
}

function drawMechanism() {
  saveMechanism();
  ctx.save();

  // Reset the transform to the default state
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Clear the entire canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Restore the original state which contains our zoom and pan settings
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (
    window.data.particles.length > 1 &&
    window.data.constraints.rod.length + window.data.constraints.slider.length >
      1 &&
    window.data.timestep > 0 &&
    typeof window.data.timestep === "number"
  ) {
    var [trajectories, range, constraint_log, peakLoad] = simulate_and_range();
    document.getElementById("range").innerText = range.toFixed(1);
    document.getElementById("peakLoad").innerText = peakLoad.toFixed(1);
    var t = 0;
    var constraint_i = 0;
    trajectories.forEach((trajectory) => {
      while (constraint_log[0][constraint_i + 1] < t) {
        constraint_i += 1;
      }
      t += window.data.timestep;
      // Draw the trajectories for the rod constraints
      for (let i = 0; i < window.data.constraints.rod.length; i++) {
        if (!(window.data.constraints.rod[i].oneway == true)) {
          const rod = window.data.constraints.rod[i];
          const p1Index = rod.p1 * 2; // Index in trajectory array for p1.x and p1.y
          const p2Index = rod.p2 * 2; // Index in trajectory array for p2.x and p2.y

          // Draw the line for the rod's trajectory
          ctx.beginPath();
          ctx.moveTo(trajectory[p1Index], trajectory[p1Index + 1]);
          ctx.lineTo(trajectory[p2Index], trajectory[p2Index + 1]);
          ctx.strokeStyle = "rgba(255, 0, 0, 0.2)"; // Light red color
          ctx.stroke();
        }
      }
      for (let i = 0; i < window.data.constraints.rope.length; i++) {
        if (!(window.data.constraints.rope[i].oneway == true)) {
          const rope = window.data.constraints.rope[i];
          const p1Index = rope.p1 * 2; // Index in trajectory array for p1.x and p1.y
          const p3Index = rope.p3 * 2; // Index in trajectory array for p2.x and p2.y

          // Draw the line for the rope's trajectory
          ctx.beginPath();
          ctx.moveTo(trajectory[p1Index], trajectory[p1Index + 1]);
          for (var pulley of window.data.constraints.rope[i].pulleys) {
            var p2Index = pulley.idx * 2;
            ctx.lineTo(trajectory[p2Index], trajectory[p2Index + 1]);
          }
          ctx.lineTo(trajectory[p3Index], trajectory[p3Index + 1]);
          ctx.strokeStyle = "rgba(255, 0, 0, 0.2)"; // Light red color
          ctx.stroke();
        }
      }
    });

    ctx.strokeStyle = "black";
    //} catch {
    //  ctx.fillText("Inconsistent Constraints (Duplicate Sliders?)", 300, 100);
    //}
  }

  // Set a thicker line width for rods and sliders
  ctx.lineWidth = 3; // Increase the line width as desired

  // Draw rods
  window.data.constraints.rod.forEach((c) => {
    const p1 = window.data.particles[c.p1];
    const p2 = window.data.particles[c.p2];
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = c.hovered ? "yellow" : "black"; // Change stroke style if hovered
    ctx.stroke();
  });
  window.data.constraints.rope.forEach((c) => {
    const p1 = window.data.particles[c.p1];
    const p3 = window.data.particles[c.p3];
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    for (var pulley of c.pulleys) {
      const p2 = window.data.particles[pulley.idx];
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.lineTo(p3.x, p3.y);
    ctx.strokeStyle = c.hovered ? "yellow" : "black"; // Change stroke style if hovered
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Draw sliders
  window.data.constraints.slider
    .concat(
      window.data.constraints.pin.flatMap((x) => [
        { p: x.p, normal: { x: 0, y: 1 } },
        { p: x.p, normal: { x: 1, y: 0 } },
      ]),
    )
    .forEach((c) => {
      const p = window.data.particles[c.p];
      const sliderLength = 40; // Length of the slider line
      const angle = Math.atan2(c.normal.y, c.normal.x) + Math.PI / 2; // Angle of the slider line
      ctx.beginPath();
      ctx.moveTo(
        p.x - sliderLength * Math.cos(angle),
        p.y - sliderLength * Math.sin(angle),
      );
      ctx.lineTo(
        p.x + sliderLength * Math.cos(angle),
        p.y + sliderLength * Math.sin(angle),
      );
      ctx.strokeStyle = c.hovered ? "yellow" : "black"; // Change stroke style if hovered
      ctx.stroke();
    });

  window.data.constraints.colinear
    .concat(window.data.constraints.f2k)
    .forEach((c) => {
      const base = window.data.particles[c.base];
      const reference = window.data.particles[c.reference];
      const slider = window.data.particles[c.slider];
      const length = Math.sqrt(
        (base.x - reference.x) * (base.x - reference.x) +
          (base.y - reference.y) * (base.y - reference.y),
      );

      const sx = (base.x - reference.x) / length;
      const sy = (base.y - reference.y) / length;

      const r = Math.abs(sx * (base.y - slider.y) - sy * (base.x - slider.x));
      ctx.beginPath();
      ctx.arc(slider.x, slider.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = "grey";

      ctx.stroke();
    });

  // Reset line width to default if needed elsewhere
  ctx.lineWidth = 1;
  // Draw particles
  window.data.particles.forEach((p, index) => {
    const radius = Math.cbrt(p.mass) * 4; // Arbitrary scaling factor for visualization
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = p.hovered ? "yellow" : "black"; // Change fill style if hovered
    ctx.strokeStyle = "black";

    if (index == window.data.projectile) {
      ctx.fillStyle = "lightblue";
      ctx.strokeStyle = "blue";
    }
    ctx.fill();
    ctx.stroke();

    // Draw label
    ctx.font = "18px Arial"; // You can change the size and font if you like
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black"; // Text color
    ctx.fillText(`P${index + 1}`, p.x, p.y - radius - 10); // Adjust label position as needed
  });
  // Simulate the trajectory and get the results
}

function createParticle() {
  const particle = { x: 100, y: 100, mass: 1, hovered: false }; // Default values
  window.data.particles.push(particle);
  updateUI();
}

function updateParticle(index, property, value) {
  window.data.particles[index][property] = Number(value);
  drawMechanism();
}

function deleteParticle(index) {
  window.data.particles.splice(index, 1);
  for (var type1 in window.data.constraints) {
    var type = window.data.constraints[type1];
    var done = false;
    while (!done) {
      done = true;
      for (var i = 0; i < type.length; i++) {
        var constraint = type[i];
        var present = false;
        for (var name of [
          "p",
          "p1",
          "p2",
          "p3",
          "reference",
          "base",
          "slider",
        ]) {
          if (constraint[name] === index) {
            present = true;
          }
        }
        if (present) {
          done = false;
          type.splice(i, 1);
        }
      }
    }
  }

  for (var name of ["projectile", "armtip", "mainaxle"]) {
    if (window.data[name] === index) {
      window.data[name] = 0;
    }
  }
  updateUI();
}
function createConstraint(type) {
  let constraint = {};

  // Depending on the type, create a different constraint
  if (type === "rod") {
    if (window.data.particles.length < 2) {
      alert("At least two particles are required to create a rod constraint.");
      return;
    }
    var indices = [];
    for (let i = window.data.particles.length - 1; i >= 0; i--) {
      for (let j = window.data.particles.length - 1; j >= 0; j--) {
        if (!constraintExists(i, j)) {
          indices.push([i, j]);
        }
      }
    }
    constraint = { p1: indices[0][0], p2: indices[0][1], hovered: false }; // Default to the first two window.data.particles
    window.data.constraints.rod.push(constraint);
  } else if (type === "slider") {
    if (window.data.particles.length < 1) {
      alert("At least one particle is required to create a slider constraint.");
      return;
    }
    var sliders = window.data.constraints.slider;
    var last_particle = window.data.particles.length - 1;
    if (
      sliders.length > 0 &&
      sliders[sliders.length - 1].p == last_particle &&
      sliders[sliders.length - 1].normal.x == 0 &&
      sliders[sliders.length - 1].normal.y == 1
    ) {
      constraint = { p: last_particle, normal: { x: 1, y: 0 }, hovered: false }; // Default to the first particle and a vertical normal
    } else {
      constraint = { p: last_particle, normal: { x: 0, y: 1 }, hovered: false }; // Default to the first particle and a vertical normal
    }
    window.data.constraints.slider.push(constraint);
  } else if (type === "colinear") {
    constraint = { reference: 0, slider: 1, base: 2 };
    window.data.constraints.colinear.push(constraint);
  } else if (type === "pin") {
    constraint = { p: window.data.particles.length - 1 };
    window.data.constraints.pin.push(constraint);
  } else if (type === "f2k") {
    constraint = { reference: 0, slider: 1, base: 2 };
    window.data.constraints.f2k.push(constraint);
  } else if (type === "rope") {
    constraint = { p1: 0, pulleys: [], p3: 2 };
    window.data.constraints.rope.push(constraint);
  } else {
    console.error("Unknown constraint type:", type);
    return;
  }
  updateUI();
}
function updatePulley(element, index, pulleyindex) {
  const value = +element.value;
  const constraint = window.data.constraints.rope[index];
  constraint.pulleys[pulleyindex].idx = value;
  updateUI();
}
function updatePulleyDirection(element, index, pulleyindex) {
  const value = element.value;
  const constraint = window.data.constraints.rope[index];
  constraint.pulleys[pulleyindex].wrapping = value;
  updateUI();
}
function removePulley(index) {
  window.data.constraints.rope[index].pulleys.pop();
  updateUI();
}
function addPulley(index) {
  window.data.constraints.rope[index].pulleys.push({
    idx: 0,
    wrapping: "both",
  });
  updateUI();
}
function updateConstraint(element, type, index, property) {
  const value = property.includes("normal")
    ? parseFloat(element.value)
    : parseInt(element.value);
  const constraint = window.data.constraints[type][index];

  if (property === "p1" || property === "p2" || property === "p") {
    constraint[property] = value;
    updateUI(); // Reflect changes in the UI
  } else if (property === "normalX" || property === "normalY") {
    constraint.normal[property.slice(-1).toLowerCase()] = value;
    drawMechanism();
  } else {
    constraint[property] = value;
    updateUI();
  }
}

function deleteConstraint(type, index) {
  window.data.constraints[type].splice(index, 1);
  updateUI();
}

function resizeCanvas() {
  var wwidth = Math.min(window.screen.width, window.innerWidth);
  console.log(wwidth);

  if (wwidth > 1040) {
    wwidth -= 440;
  }

  wwidth = Math.min(wwidth, window.innerHeight - 90);
  wwidth = Math.max(wwidth, 400);

  canvas.width = 600 * 1.9;
  canvas.height = 600 * 1.9;

  // ensure all drawing operations are scaled

  // scale everything down using CSS
  canvas.style.width = wwidth + "px";
  canvas.style.height = wwidth + "px";

  if (window.innerWidth - wwidth > 840) {
    document.getElementById("allcontrols").style.flexDirection = "row";
  } else {
    document.getElementById("allcontrols").style.flexDirection = "column";
  }

  updateUI();
}

function updateUI() {
  // Clear the canvas and redraw the mechanism
  drawMechanism();
  document.getElementById("timestep").value = window.data.timestep;
  document.getElementById("duration").value = window.data.duration;

  // Update Particle Controls UI
  const particlesControl = document.getElementById("particlesControl");
  // Clear current particle controls except the 'Add Particle' button
  while (particlesControl.children.length > 1) {
    particlesControl.removeChild(particlesControl.lastChild);
  }
  // Re-create particle control boxes
  window.data.particles.forEach((_, index) => createParticleControlBox(index));

  // Update Constraint Controls UI
  const constraintsControl = document.getElementById("constraintsControl");
  // Clear current constraint controls except the 'Add' buttons
  while (constraintsControl.children.length > 1) {
    constraintsControl.removeChild(constraintsControl.lastChild);
  }
  // Re-create constraint control boxes
  for (var ctype of ctypes) {
    window.data.constraints[ctype].forEach((_, index) =>
      createConstraintControlBox(ctype, index),
    );
  }
  const presetsbox = document.getElementById("presets");
  while (presetsbox.children.length > 0) {
    presetsbox.removeChild(presetsbox.lastChild);
  }
  const title = document.createElement("option");
  title.selected = "true";
  title.innerHTML = "Presets";
  presetsbox.appendChild(title);
  for (var key of Object.keys(presets)) {
    const choice = document.createElement("option");
    choice.innerHTML = key;
    choice.value = key;
    presetsbox.appendChild(choice);
  }
  for (var name of ["armtip", "projectile", "mainaxle"]) {
    var selectbox = document.getElementById(name);
    while (selectbox.children.length > 0) {
      selectbox.removeChild(selectbox.lastChild);
    }
    for (var i = 0; i < window.data.particles.length; i++) {
      const poption = document.createElement("option");
      poption.selected = window.data[name] == i;
      poption.innerHTML = `P ${i + 1}`;
      poption.value = i;
      selectbox.appendChild(poption);
    }
  }
  document.getElementById("axleheight").value = window.data.axleheight;
}
function fill_empty_constraints(data) {
  for (var ctype of ctypes) {
    if (data.constraints[ctype] === undefined) {
      data.constraints[ctype] = [];
    }
  }
  var slider_counts = data.particles.map(() => 0);
  data.constraints.slider.forEach((x) => {
    if (!x.oneway) {
      slider_counts[x.p] += 1;
    }
  });
  data.constraints.slider = data.constraints.slider.filter(
    (x, i) => slider_counts[x.p] < 2,
  );
  data.constraints.pin = data.constraints.pin.concat(
    slider_counts
      .flatMap((x, i) => [{ count: x, p: i }])
      .filter((x) => x.count > 1),
  );
}
function loadPreset(element) {
  window.data = JSON.parse(presets[element.value]);
  fill_empty_constraints(window.data);
  updateUI();
}

function createParticleControlBox(index) {
  const box = document.createElement("div");
  box.className = "control-box";
  box.innerHTML = `
                P ${
                  1 + index
                } <label>Mass <input type="text" min="1" max="500" value="${
                  window.data.particles[index].mass
                }" oninput="updateParticle(${index}, 'mass', this.value)"></label>
                <label>X <input type="text" min="0" max="${
                  canvas.width
                }" value="${
                  window.data.particles[index].x
                }" oninput="updateParticle(${index}, 'x', this.value)"></label>
                <label>Y <input type="text" min="0" max="${
                  canvas.height
                }" value="${
                  window.data.particles[index].y
                }" oninput="updateParticle(${index}, 'y', this.value)"></label>
                ${
                  index == data.particles.length - 1
                    ? `<button class=delete onclick="deleteParticle(${index})">X</button>`
                    : ``
                }
              `;
  box.addEventListener("mouseenter", () => {
    window.data.particles[index].hovered = true;
    drawMechanism();
  });
  box.addEventListener("mouseleave", () => {
    window.data.particles[index].hovered = false;
    drawMechanism();
  });
  document.getElementById("particlesControl").appendChild(box);
}
function constraintExists(p1, p2) {
  if (p1 == p2) {
    return true;
  }
  for (var rod of window.data.constraints.rod) {
    if (
      (rod.p1 == p1 && rod.p2 == p2) ||
      (rod.p1 == p2 && rod.p2 == p1) ||
      p1 == p2
    ) {
      return true;
    }
  }
  return false;
}

function createConstraintControlBox(type, index) {
  const box = document.createElement("div");
  box.className = "control-box";
  box.dataset.type = type;
  box.dataset.index = index;

  if (type === "rod") {
    box.innerHTML = `Rod
                    <select name="p1" onchange="updateConstraint(this, 'rod', ${index}, 'p1')">
            	   ${window.data.particles
                   .map((_, i) => i)
                   .filter(
                     (i) =>
                       !constraintExists(
                         window.data.constraints.rod[index].p2,
                         i,
                       ) || i == window.data.constraints.rod[index].p1,
                   )
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === window.data.constraints.rod[index].p1
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
                    <select name="p2" onchange="updateConstraint(this, 'rod', ${index}, 'p2')">
            	   ${window.data.particles
                   .map((_, i) => i)
                   .filter(
                     (i) =>
                       !constraintExists(
                         window.data.constraints.rod[index].p1,
                         i,
                       ) || i == window.data.constraints.rod[index].p2,
                   )
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === window.data.constraints.rod[index].p2
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
		    One way
            			<input type="checkbox" oninput="window.data.constraints.rod[${index}].oneway=this.checked;updateUI()" ${
                    window.data.constraints.rod[index].oneway ? "checked" : ""
                  }></input>
                  <button class=delete onclick="deleteConstraint('rod', ${index})">X</button>
                `;
  } else if (type === "slider") {
    const slider = window.data.constraints.slider[index];
    box.innerHTML = `
                  <label>
            		Slider
                    <select name="p" onchange="updateConstraint(this, 'slider', ${index}, 'p')">
                      ${window.data.particles
                        .map(
                          (_, i) =>
                            `<option value="${i}" ${
                              i === slider.p ? "selected" : ""
                            }>P ${i + 1}</option>`,
                        )
                        .join("")}
                    </select>
                  </label>
                  <label>Normal X <input type="range" name="normalX" min="-1" max="1" step="0.1" value="${
                    slider.normal.x
                  }" oninput="updateConstraint(this, 'slider', ${index}, 'normalX')"></label>
                  <label>Normal Y <input type="range" name="normalY" min="-1" max="1" step="0.1" value="${
                    slider.normal.y
                  }" oninput="updateConstraint(this, 'slider', ${index}, 'normalY')"></label>
		  One way
            			<input type="checkbox" oninput="window.data.constraints.slider[${index}].oneway=this.checked;updateUI()" ${
                    window.data.constraints.slider[index].oneway
                      ? "checked"
                      : ""
                  }></input>
                  <button class=delete onclick="deleteConstraint('slider', ${index})">X</button>
                `;
  } else if (type === "colinear") {
    box.innerHTML = `Roller Track1
                    <select name="reference" onchange="updateConstraint(this, 'colinear', ${index}, 'reference')">
            	   ${window.data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === window.data.constraints.colinear[index].reference
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
		    Slide
                    <select name="slider" onchange="updateConstraint(this, 'colinear', ${index}, 'slider')">

            	   ${window.data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === window.data.constraints.colinear[index].slider
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
		    Track2
                    <select name="base" onchange="updateConstraint(this, 'colinear', ${index}, 'base')">

            	   ${window.data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === window.data.constraints.colinear[index].base
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
            			<input type="checkbox" oninput="window.data.constraints.colinear[${index}].oneway=this.checked;updateUI()" ${
                    window.data.constraints.colinear[index].oneway
                      ? "checked"
                      : ""
                  }></input>
                  <button class=delete onclick="deleteConstraint('colinear', ${index})">X</button>
                `;
  } else if (type === "pin") {
    box.innerHTML = `Pin <select onchange="updateConstraint(this, 'pin', ${index}, 'p')">${window.data.particles
      .map(
        (_, i) =>
          `<option value="${i}" ${
            i === window.data.constraints.pin[index].p ? "selected" : ""
          }>P ${i + 1}</option>`,
      )
      .join("")}</select>

                  <button class=delete onclick="deleteConstraint('pin', ${index})">X</button>
		  `;
  } else if (type === "f2k") {
    box.innerHTML = `F2k <label>Arm Tip
                    <select name="reference" onchange="updateConstraint(this, 'f2k', ${index}, 'reference')">
            	   ${window.data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === window.data.constraints.f2k[index].reference
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
		    </label> <label>
		    Roller 
                    <select name="slider" onchange="updateConstraint(this, 'f2k', ${index}, 'slider')">

            	   ${window.data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === window.data.constraints.f2k[index].slider
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
		    </label> <label>
		    Arm Base
                    <select name="base" onchange="updateConstraint(this, 'f2k', ${index}, 'base')">

            	   ${window.data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === window.data.constraints.f2k[index].base
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
		    </label> <label>
		    One way
            			<input type="checkbox" oninput="window.data.constraints.f2k[${index}].oneway=this.checked;updateUI()" ${
                    window.data.constraints.f2k[index].oneway ? "checked" : ""
                  }></input></label>
                  <button class=delete onclick="deleteConstraint('f2k', ${index})">X</button>
                `;
  } else if (type === "rope") {
    box.innerHTML = `
				Rope and pulley.
				<label>
				Fixed end:
				<select name="p1" onchange="updateConstraint(this, 'rope', ${index}, 'p1')">
								${window.data.particles
                  .map((_, i) => i)
                  .map(
                    (i) =>
                      `<option value="${i}" ${
                        i === window.data.constraints.rope[index].p1
                          ? "selected"
                          : ""
                      }>P ${i + 1}</option>`,
                  )
                  .join("")}
				</select></label>
${window.data.constraints.rope[index].pulleys
  .map(
    (pulley, j) => `
<label>Pulley
<select name="p2" onchange="updatePulley(this, ${index}, ${j})">

${window.data.particles
  .map((_, i) => i)
  .map(
    (i) =>
      `<option value="${i}" ${i === pulley.idx ? "selected" : ""}>P ${
        i + 1
      }</option>`,
  )
  .join("")}
</select>
<select onchange="updatePulleyDirection(this, ${index}, ${j})">
${["both", "cw", "ccw", "cw_drop", "ccw_drop"]
  .map(
    (str) =>
      `<option value=${str} ${
        str == pulley.wrapping ? "selected" : ""
      }>${str}</option>`,
  )
  .join("")}
</select></label>
`,
  )
  .join("")}
<button onclick="addPulley(${index})">+</button>
<button onclick="removePulley(${index})">-</button>
<label>Fixed end
<select name="p3" onchange="updateConstraint(this, 'rope', ${index}, 'p3')">

${window.data.particles
  .map((_, i) => i)
  .map(
    (i) =>
      `<option value="${i}" ${
        i === window.data.constraints.rope[index].p3 ? "selected" : ""
      }>P ${i + 1}</option>`,
  )
  .join("")}
</select>
</label>
<button class=delete onclick="deleteConstraint('rope', ${index})">X</button>
<input type="checkbox" oninput="window.data.constraints.rope[${index}].oneway=this.checked;updateUI()" ${
      window.data.constraints.rope[index].oneway ? "checked" : ""
    }></input>
`;
  }

  box.addEventListener("mouseenter", () => {
    window.data.constraints[type][index].hovered = true;
    drawMechanism();
  });
  box.addEventListener("mouseleave", () => {
    window.data.constraints[type][index].hovered = false;
    drawMechanism();
  });
  document.getElementById("constraintsControl").appendChild(box);
}
// Global variable to track the currently dragged particle, if any
let draggedParticleIndex = null;

// Function to check if a mouse position is over a particle
function getParticleAtPosition(x, y) {
  var result = window.data.particles.findIndex((p) => {
    const distance = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
    const radius = Math.cbrt(p.mass) * 10; // Same scaling as used in drawMechanism
    return distance < radius; // The mouse is over the particle if its within its radius
  });
  if (result == -1) {
    result = window.data.particles.findIndex((p) => {
      const distance = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      const radius = 15 + Math.cbrt(p.mass) * 10; // Same scaling as used in drawMechanism
      return distance < radius; // The mouse is over the particle if its within its radius
    });
  }
  return result;
}

// Set up the event listeners on the canvas
canvas.addEventListener("mousedown", function (event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width; // relationship bitmap vs. element for X
  const scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const particleIndex = getParticleAtPosition(x, y);

  if (particleIndex !== -1) {
    draggedParticleIndex = particleIndex;
    canvas.style.cursor = "move";
  } else {
    //isPanning = true;
    startX = event.clientX - canvas.offsetLeft;
    startY = event.clientY - canvas.offsetTop;
  }
});
canvas.addEventListener("mousemove", function (event) {
  if (draggedParticleIndex !== null) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    window.data.particles[draggedParticleIndex].x = x;
    window.data.particles[draggedParticleIndex].y = y;
    drawMechanism(); // Redraw the mechanism with updated particle position
  }
});

canvas.addEventListener("mouseup", function (_) {
  if (draggedParticleIndex !== null) {
    updateUI(); // Update the entire UI to reflect the new position of the dragged particle
    draggedParticleIndex = null;
    canvas.style.cursor = "default";
  }
});

canvas.addEventListener("mouseleave", function (_) {
  // If the user drags the mouse outside the canvas, release the dragged particle
  if (draggedParticleIndex !== null) {
    updateUI();
    draggedParticleIndex = null;
    canvas.style.cursor = "default";
  }
});
function saveMechanism() {
  localStorage.setItem("mechanismData", JSON.stringify(window.data));
}

function loadMechanism() {
  const savedData = localStorage.getItem("mechanismData");
  if (savedData) {
    window.data = JSON.parse(savedData);
    fill_empty_constraints(window.data);
    try {
      updateUI();
    } catch {
      loadPreset({ value: "Hinged Counterweight" });
    }
  } else {
    loadPreset({ value: "Hinged Counterweight" });
  }
}

window.addEventListener("resize", resizeCanvas);
window.onload = () => {
  loadMechanism();
  resizeCanvas();
  fetch("https://apj.hgreer.com/jstreb", {
    method: "GET",
    cache: "no-store",
    mode: "no-cors",
  });
  //doit();
  //optimize();
  //	setTimeout(optimize, 1000);
};
var presets = {
  "Hinged Counterweight":
    '{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3, "duration":35, "particles":[{"x":536,"y":472.7,"mass":1},{"x":346,"y":657.6,"mass":4},{"x":588,"y":440.7,"mass":10},{"x":668,"y":673.6,"mass":1},{"x":586,"y":533.7,"mass":100}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":1}},{"p":3,"normal":{"x":0,"y":1},"oneway":true}]}}',
  "Fixed Counterweight":
    '{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3, "duration":35, "particles":[{"x":536,"y":472.7,"mass":1},{"x":346,"y":657.6,"mass":4},{"x":589,"y":444.7,"mass":100},{"x":668,"y":673.6,"mass":1}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":1}},{"p":3,"normal":{"x":0,"y":1},"oneway":true}]}}',
  "Floating Arm Trebuchet":
    '{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3, "duration":35, "particles":[{"x":487.0,"y":517.0,"mass":1},{"x":346,"y":657.6,"mass":4},{"x":589,"y":444.7,"mass":100},{"x":589,"y":673.6,"mass":1}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":2,"normal":{"x":0.6,"y":0}},{"p":3,"normal":{"x":0,"y":1},"oneway":true}]}}',
  F2k: '{"projectile":3,"mainaxle":0,"armtip":1,"axleheight":8,"timestep":0.6,"duration":35,"particles":[{"x":454,"y":516,"mass":1},{"x":436.6,"y":513.0,"mass":4},{"x":560.3,"y":211.5,"mass":100},{"x":652.9,"y":621.8,"mass":1}],"constraints":{"rod":[{"p1":1,"p2":3},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":1,"y":1}},{"p":2,"normal":{"x":0.6,"y":0}},{"p":3,"normal":{"x":0,"y":1},"oneway":true},{"p":0,"normal":{"x":0,"y":1}}],"colinear":[],"f2k":[{"reference":1,"slider":0,"base":2}],"rope":[]}}',
  "Floating Arm Whipper (NASAW)":
    '{"projectile":3,"mainaxle":0,"armtip":1,"axleheight":8,"timestep":0.2,"duration":37,"particles":[{"x":496.3,"y":477.6,"mass":1},{"x":677.5,"y":471.0,"mass":4},{"x":468.0,"y":453.5,"mass":10},{"x":557.0,"y":431.8,"mass":1},{"x":563.0,"y":340.7,"mass":200}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2},{"p1":0,"p2":3,"oneway":true},{"p1":0,"p2":4,"oneway":true}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":4,"normal":{"x":0.6,"y":0}}],"colinear":[]}}',
  Whipper:
    '{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3,"duration":60,"particles":[{"x":536,"y":472.7,"mass":1},{"x":759,"y":451,"mass":4},{"x":483,"y":498,"mass":10},{"x":551,"y":434,"mass":1},{"x":560,"y":368,"mass":200}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2},{"p1":0,"p2":3,"oneway":true},{"p1":0,"p2":4,"oneway":true}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":0}}]}}',
  Fiffer:
    '{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.2,"duration":20,"particles":[{"x":536,"y":472.7,"mass":1},{"x":484,"y":656,"mass":4},{"x":504,"y":433,"mass":10},{"x":644,"y":661,"mass":1},{"x":653,"y":451,"mass":10},{"x":749,"y":428,"mass":1},{"x":749,"y":483,"mass":500},{"x":566,"y":505,"mass":1}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2},{"p1":7,"p2":6},{"p1":6,"p2":4},{"p1":4,"p2":5}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":1}},{"p":3,"normal":{"x":0,"y":1},"oneway":true},{"p":7,"normal":{"x":0.7,"y":1}},{"p":7,"normal":{"x":0,"y":1}},{"p":5,"normal":{"x":0,"y":1}},{"p":5,"normal":{"x":0.7,"y":1}}]}}',
  "Floating Arm King Arthur":
    '{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.2,"duration":40,"particles":[{"x":536,"y":472.7,"mass":1},{"x":527,"y":610,"mass":4},{"x":534,"y":418,"mass":10},{"x":698,"y":608,"mass":1},{"x":560,"y":331,"mass":200}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":1,"p2":3},{"p1":2,"p2":4},{"p1":1,"p2":2}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":2,"normal":{"x":-0.5,"y":0},"oneway":true},{"p":1,"normal":{"x":0.7,"y":0},"oneway":true},{"p":3,"normal":{"x":0,"y":1},"oneway":true}]}}',
  "Launch Ness Monster":
    '{"projectile":3,"mainaxle":2,"armtip":1,"axleheight":8,"timestep":0.3,"duration":80,"particles":[{"x":600.7,"y":746.2,"mass":10},{"x":559.1,"y":774.0,"mass":4},{"x":660.2,"y":530.0,"mass":100},{"x":703.9,"y":796.7,"mass":1},{"x":810,"y":530,"mass":10},{"x":552,"y":500,"mass":10},{"x":458,"y":666,"mass":10},{"x":886.1,"y":662.4,"mass":10}],"constraints":{"rod":[{"p1":2,"p2":1},{"p1":3,"p2":1},{"p1":6,"p2":5},{"p1":5,"p2":2},{"p1":4,"p2":2},{"p1":4,"p2":7},{"p1":5,"p2":4}],"slider":[{"p":0,"normal":{"x":1,"y":2.1}},{"p":0,"normal":{"x":-0.6,"y":1.6}},{"p":3,"normal":{"x":0,"y":1},"oneway":true},{"p":6,"normal":{"x":0.6,"y":1}},{"p":6,"normal":{"x":0,"y":1}},{"p":7,"normal":{"x":1,"y":1}},{"p":7,"normal":{"x":0,"y":1}}],"colinear":[{"reference":1,"slider":0,"base":2}]}}',
  "Pulley Sling":
    '{"projectile":3,"mainaxle":0,"armtip":1,"axleheight":8,"timestep":0.2,"duration":35,"particles":[{"x":546.3,"y":584.3,"mass":1},{"x":285.6,"y":791.6,"mass":4},{"x":560.6,"y":481.2,"mass":10},{"x":1000.9,"y":742.8,"mass":1},{"x":645.5,"y":541.0,"mass":500},{"x":72.7,"y":730.2,"mass":1}],"constraints":{"rod":[{"p1":0,"p2":1},{"p1":0,"p2":2},{"p1":2,"p2":4},{"p1":1,"p2":2},{"p1":0,"p2":4,"oneway":true}],"slider":[{"p":0,"normal":{"x":0,"y":1}},{"p":0,"normal":{"x":0.6,"y":1}},{"p":3,"normal":{"x":0,"y":1},"oneway":true},{"p":5,"normal":{"x":1,"y":1}},{"p":5,"normal":{"x":0,"y":1}}],"colinear":[],"rope":[{"p1":5,"pulleys":[{"idx":1,"wrapping":"both"}],"p3":3}]}}',
};
let optimizing_range = false;
async function optimize_range() {
  if (optimizing_range) {
    optimizing_range = false;
    document.getElementById("optimize").innerText = "Optimize";
    return;
  }
  document.getElementById("optimize").innerText = "Stop";
  optimizing_range = true;
  //wait();
  var opt_timeout = 500;
  var timer = opt_timeout;
  var step = 40;
  var oldrange = +document.getElementById("range").innerText;
  while (optimizing_range) {
    iterations += 1;
    var oldDesign = JSON.stringify(window.data);
    for (var p of window.data.particles) {
      if (Math.random() > 0.5) {
        if (p.x % 100 != 0) {
          p.x = p.x + step * (0.5 - Math.random());
        }
        if (p.y % 100 != 0) {
          p.y = p.y + step * (0.5 - Math.random());
        } else {
          if (p.mass % 1 != 0) {
            p.mass = Math.abs(p.mass + 0.001 * step * (0.5 - Math.random()));
          }
        }
      }
    }
    //for (var p of window.data.constraints.slider) {
    //  if (Math.random() > 0.5) {
    //    p.normal.x = p.normal.x + (step / 80) * (0.5 - Math.random());
    //    p.normal.y = p.normal.y + (step / 80) * (0.5 - Math.random());
    //  }
    //}
    var [_, range, _, _oad] = simulate_and_range();

    if (timer % 20 == 0) {
      await wait();
    }
    var newRange = range;
    if (!(newRange > oldrange)) {
      window.data = JSON.parse(oldDesign);
      timer -= 1;
      if (timer == 0) {
        timer = opt_timeout;
        step *= 0.6;
      }
    } else {
      timer = opt_timeout;
      oldrange = range;
      drawMechanism();
    }
  }
  drawMechanism();
}
let optimizing = false;
async function optimize() {
  if (optimizing) {
    optimizing = false;
    document.getElementById("gentlify").innerText = "Gentlify";
    return;
  }
  document.getElementById("gentlify").innerText = "Stop";
  optimizing = true;
  //wait();
  var opt_timeout = 500;
  var timer = opt_timeout;
  var step = 40;
  var oldrange = +document.getElementById("range").innerText;
  var oldload = +document.getElementById("peakLoad").innerText;
  while (optimizing) {
    iterations += 1;
    var oldDesign = JSON.stringify(window.data);
    for (var p of window.data.particles) {
      if (Math.random() > 0.5) {
        if (p.x % 100 != 0) {
          p.x = p.x + step * (0.5 - Math.random());
        }
        if (p.y % 100 != 0) {
          p.y = p.y + step * (0.5 - Math.random());
        } else {
          p.mass = Math.abs(p.mass + 0.001 * step * (0.5 - Math.random()));
        }
      }
    }
    //for (var p of window.data.constraints.slider) {
    //  if (Math.random() > 0.5) {
    //    p.normal.x = p.normal.x + (step / 80) * (0.5 - Math.random());
    //    p.normal.y = p.normal.y + (step / 80) * (0.5 - Math.random());
    //  }
    //}
    var [_, range, _, load] = simulate_and_range();

    if (timer % 20 == 0) {
      await wait();
    }
    var newLoad = load;
    console.log(newLoad, load, range, oldrange);
    if (!(newLoad < oldload) || range < oldrange) {
      window.data = JSON.parse(oldDesign);
      timer -= 1;
      if (timer == 0) {
        timer = opt_timeout;
        step *= 0.6;
      }
    } else {
      timer = opt_timeout;
      oldload = load;
      drawMechanism();
    }
  }
  drawMechanism();
}
function save() {
  const blob = new Blob([JSON.stringify(window.data)], {
    type: "application/json",
  });

  // Ask the user for a filename
  const filename = prompt(
    "Enter a filename for your window.data:",
    "window.data.json",
  );
  if (!filename) {
    alert("Save cancelled.");
    return; // Exit if no filename is provided
  }

  const href = URL.createObjectURL(blob);

  // Create a link and trigger the download
  const link = document.createElement("a");
  link.href = href;
  link.download = filename; // Use the user-provided filename
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}
function load() {
  const input = document.createElement("input");
  input.type = "file";
  input.onchange = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      try {
        window.data = JSON.parse(readerEvent.target.result);
        fill_empty_constraints(window.data);
        updateUI();
      } catch (error) {
        alert("Error parsing JSON!");
      }
    };

    reader.readAsText(file);
  };
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}
window.doAnimate = doAnimate;
window.terminate = terminate;
window.drawMechanism = drawMechanism;
window.createParticle = createParticle;
window.updateParticle = updateParticle;
window.deleteParticle = deleteParticle;
window.createConstraint = createConstraint;
window.updateConstraint = updateConstraint;
window.deleteConstraint = deleteConstraint;
window.resizeCanvas = resizeCanvas;
window.updateUI = updateUI;
window.loadPreset = loadPreset;
window.createParticleControlBox = createParticleControlBox;
window.constraintExists = constraintExists;
window.createConstraintControlBox = createConstraintControlBox;
window.getParticleAtPosition = getParticleAtPosition;
window.saveMechanism = saveMechanism;
window.loadMechanism = loadMechanism;
window.optimize = optimize;
window.optimize_range = optimize_range;
window.save = save;
window.load = load;
window.updatePulley = updatePulley;
window.updatePulleyDirection = updatePulleyDirection;
window.addPulley = addPulley;
window.removePulley = removePulley;
window.waitForAnimationFrame = waitForAnimationFrame;
