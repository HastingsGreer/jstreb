const canvas = document.getElementById("mechanism");
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
async function wait() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 10); // waits for 10 milliseconds
  });
}

async function doAnimate() {
  if (window.data.timestep == 0) {
    return;
  }
  var reset = JSON.stringify(window.data);
  var trajectories = simulate(
    data.particles,
    data.constraints,
    data.timestep,
    data.duration,
    terminate,
  );

  data.timestep = 0;
  for (var constraintType of [data.constraints.rod, data.constraints.slider]) {
    var limit = constraintType.length;
    for (var i = 0; i < limit; i++) {
      if (constraintType[i].oneway) {
        constraintType.splice(i, 1);
        i -= 1;
        limit -= 1;
      }
    }
  }

  for (var traj of trajectories) {
    for (var i = 0; i < data.particles.length; i++) {
      data.particles[i].x = traj._data[2 * i];
      data.particles[i].y = traj._data[2 * i + 1];
    }
    drawMechanism();
    await wait();
  }
  window.data = JSON.parse(reset);
  drawMechanism();
}
function terminate(state) {
  state = state._data;
  var slingx = state[2 * data.armtip] - state[2 * data.projectile];
  var slingy = state[2 * data.armtip + 1] - state[2 * data.projectile + 1];

  var norms = Math.sqrt(slingx * slingx + slingy * slingy);

  slingx = slingx / norms;
  slingy = slingy / norms;

  var armx = state[2 * data.armtip] - state[2 * data.mainaxle];
  var army = state[2 * data.armtip + 1] - state[2 * data.mainaxle + 1];
  var norma = Math.sqrt(armx * armx + army * army);

  armx /= norma;
  army /= norma;

  var wedge = armx * slingy - slingx * army;

  return armx * slingy - slingx * army < 0;
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
  if (
    data.particles.length > 1 &&
    data.constraints.rod.length + data.constraints.slider.length > 1 &&
    data.timestep > 0 &&
    typeof data.timestep === "number"
  ) {
        try {

    document.getElementById("range").innerText = "";
    const trajectories = simulate(
      data.particles,
      data.constraints,
      data.timestep,
      data.duration,
      terminate,
    );

    // Draw the trajectories for the rod constraints
    trajectories.forEach((trajectory) => {
      trajectory = trajectory._data;
      for (let i = 0; i < data.constraints.rod.length; i++) {
        if (!(data.constraints.rod[i].oneway == true)) {
          const rod = data.constraints.rod[i];
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
      for (let i = 0; i < data.constraints.rope.length; i++) {
        if (!(data.constraints.rope[i].oneway == true)) {
          const rope = data.constraints.rope[i];
          const p1Index = rope.p1 * 2; // Index in trajectory array for p1.x and p1.y
          const p2Index = rope.p2 * 2; // Index in trajectory array for p2.x and p2.y
          const p3Index = rope.p3 * 2; // Index in trajectory array for p2.x and p2.y

          // Draw the line for the rope's trajectory
          ctx.beginPath();
          ctx.moveTo(trajectory[p1Index], trajectory[p1Index + 1]);
          ctx.lineTo(trajectory[p2Index], trajectory[p2Index + 1]);
          ctx.lineTo(trajectory[p3Index], trajectory[p3Index + 1]);
          ctx.strokeStyle = "rgba(255, 0, 0, 0.2)"; // Light red color
          ctx.stroke();
        }
      }
    });

    ctx.strokeStyle = "black";
    var axlecoord = -data.particles[data.mainaxle].y;
    var mincoord = -data.particles[data.mainaxle].y;
    var range = 0;
    for (var trajectory of trajectories) {
      trajectory = trajectory._data;
      for (
        var part_index = 0;
        part_index < data.particles.length;
        part_index++
      ) {
        if (trajectory[2 * part_index] < 2000) {
          mincoord = Math.min(mincoord, -trajectory[2 * part_index + 1]);
        }
        axlecoord = Math.max(axlecoord, -trajectory[2 * data.mainaxle + 1]);
      }

      range = Math.max(
        range,
        2 *
          Math.max(
            0,
            -trajectory[2 * data.particles.length + 2 * data.projectile + 1],
          ) *
          trajectory[2 * data.particles.length + 2 * data.projectile],
      );
    }
    var height1 = axlecoord - mincoord;
    var height2 = Math.sqrt(
      Math.pow(
        data.particles[data.armtip].x - data.particles[data.mainaxle].x,
        2,
      ) +
        Math.pow(
          data.particles[data.armtip].y - data.particles[data.projectile].y,
          2,
        ),
    );
    document.getElementById("range").innerText =
      (range / Math.max(height1, 0.75 * height2)) * data.axleheight;
    } catch {
      ctx.fillText("Inconsistent Constraints (Duplicate Sliders?)", 300, 100);
    }
  }

  // Draw particles
  data.particles.forEach((p, index) => {
    const radius = Math.cbrt(p.mass) * 4; // Arbitrary scaling factor for visualization
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = p.hovered ? "yellow" : "black"; // Change fill style if hovered
    ctx.strokeStyle = "black";

    ctx.fill();
    ctx.stroke();

    // Draw label
    ctx.font = "18px Arial"; // You can change the size and font if you like
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black"; // Text color
    ctx.fillText(`P${index + 1}`, p.x, p.y - radius - 10); // Adjust label position as needed
  });

  // Set a thicker line width for rods and sliders
  ctx.lineWidth = 3; // Increase the line width as desired

  // Draw rods
  data.constraints.rod.forEach((c) => {
    const p1 = data.particles[c.p1];
    const p2 = data.particles[c.p2];
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = c.hovered ? "blue" : "black"; // Change stroke style if hovered
    ctx.stroke();
  });

  // Draw sliders
  data.constraints.slider.forEach((c) => {
    const p = data.particles[c.p];
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
    ctx.strokeStyle = c.hovered ? "red" : "black"; // Change stroke style if hovered
    ctx.stroke();
  });

  // Reset line width to default if needed elsewhere
  ctx.lineWidth = 1;
  // Simulate the trajectory and get the results
}

function createParticle() {
  const particle = { x: 100, y: 100, mass: 1, hovered: false }; // Default values
  data.particles.push(particle);
  updateUI();
}

function updateParticle(index, property, value) {
  data.particles[index][property] = Number(value);
  drawMechanism();
}

function deleteParticle(index) {
  data.particles.splice(index, 1);
  updateUI();
}
function createConstraint(type) {
  const index = data.constraints[type].length;
  let constraint = {};

  // Depending on the type, create a different constraint
  if (type === "rod") {
    if (data.particles.length < 2) {
      alert("At least two particles are required to create a rod constraint.");
      return;
    }
    var indices = [];
    for (let i = 0; i < data.particles.length; i++) {
      for (let j = 0; j < data.particles.length; j++) {
        if (!constraintExists(i, j)) {
          indices.push([i, j]);
        }
      }
    }
    constraint = { p1: indices[0][0], p2: indices[0][1], hovered: false }; // Default to the first two data.particles
    data.constraints.rod.push(constraint);
  } else if (type === "slider") {
    if (data.particles.length < 1) {
      alert("At least one particle is required to create a slider constraint.");
      return;
    }
    constraint = { p: 0, normal: { x: 0, y: 1 }, hovered: false }; // Default to the first particle and a vertical normal
    data.constraints.slider.push(constraint);
  } else if (type === "colinear") {
    constraint = { reference: 0, slider: 1, base: 2 };
    data.constraints.colinear.push(constraint);
  } else if (type === "f2k") {
    constraint = { reference: 0, slider: 1, base: 2 };
    data.constraints.f2k.push(constraint);
  } else if (type === "rope") {
    constraint = { p1: 0, p2: 1, p2: 3 };
    data.constraints.rope.push(constraint);
  } else {
    console.error("Unknown constraint type:", type);
    return;
  }
  updateUI();
}
function updateConstraint(element, type, index, property) {
  const value = property.includes("normal")
    ? parseFloat(element.value)
    : parseInt(element.value);
  const constraint = data.constraints[type][index];

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
  data.constraints[type].splice(index, 1);
  updateUI();
}

function resizeCanvas() {
  canvas.width = window.innerWidth - 600; // 300px for each control column
  canvas.height = window.innerHeight;
  updateUI();
}

function updateUI() {
  // Clear the canvas and redraw the mechanism
  drawMechanism();
  document.getElementById("timestep").value = data.timestep;
  document.getElementById("duration").value = data.duration;

  // Update Particle Controls UI
  const particlesControl = document.getElementById("particlesControl");
  // Clear current particle controls except the 'Add Particle' button
  while (particlesControl.children.length > 1) {
    particlesControl.removeChild(particlesControl.lastChild);
  }
  // Re-create particle control boxes
  data.particles.forEach((particle, index) => createParticleControlBox(index));

  // Update Constraint Controls UI
  const constraintsControl = document.getElementById("constraintsControl");
  // Clear current constraint controls except the 'Add' buttons
  while (constraintsControl.children.length > 4) {
    constraintsControl.removeChild(constraintsControl.lastChild);
  }
  // Re-create constraint control boxes
  data.constraints.rod.forEach((constraint, index) =>
    createConstraintControlBox("rod", index),
  );
  data.constraints.slider.forEach((constraint, index) =>
    createConstraintControlBox("slider", index),
  );
  data.constraints.colinear.forEach((constraint, index) =>
    createConstraintControlBox("colinear", index),
  );
  data.constraints.f2k.forEach((constraint, index) =>
    createConstraintControlBox("f2k", index),
  );
  data.constraints.rope.forEach((constraint, index) =>
    createConstraintControlBox("rope", index),
  );
  const presetsbox = document.getElementById("presets");
  while (presetsbox.children.length > 0) {
    presetsbox.removeChild(presetsbox.lastChild);
  }
  const title = document.createElement("option");
  title.selected = "true";
  title.innerHTML = "Presets";
  presetsbox.appendChild(title);
  for (key of Object.keys(presets)) {
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
    for (var i = 0; i < data.particles.length; i++) {
      const poption = document.createElement("option");
      poption.selected = data[name] == i;
      poption.innerHTML = `P ${i + 1}`;
      poption.value = i;
      selectbox.appendChild(poption);
    }
  }
  document.getElementById("axleheight").value = data.axleheight;
}
function loadPreset(element) {
  window.data = JSON.parse(window.presets[element.value]);
  if (data.constraints.colinear === undefined) {
    data.constraints.colinear = [];
  }
  if (data.constraints.f2k === undefined) {
    data.constraints.f2k = [];
  }
  if (data.constraints.rope === undefined) {
    data.constraints.rope = [];
  }
  updateUI();
}

function createParticleControlBox(index) {
  const box = document.createElement("div");
  box.className = "control-box";
  box.innerHTML = `
                <label>Mass: <input type="text" min="1" max="500" value="${data.particles[index].mass}" oninput="updateParticle(${index}, 'mass', this.value)"></label>
                <label>X: <input type="text" min="0" max="${canvas.width}" value="${data.particles[index].x}" oninput="updateParticle(${index}, 'x', this.value)"></label>
                <label>Y: <input type="text" min="0" max="${canvas.height}" value="${data.particles[index].y}" oninput="updateParticle(${index}, 'y', this.value)"></label>
                <button onclick="deleteParticle(${index})">X</button>
              `;
  //box.addEventListener("mouseenter", () => {
  //  data.particles[index].hovered = true;
  //  drawMechanism();
  //});
  //box.addEventListener("mouseleave", () => {
  //  data.particles[index].hovered = false;
  //  drawMechanism();
  //});
  document.getElementById("particlesControl").appendChild(box);
}
function constraintExists(p1, p2) {
  if (p1 == p2) {
    return true;
  }
  for (rod of data.constraints.rod) {
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
            	   ${data.particles
                   .map((_, i) => i)
                   .filter(
                     (i) =>
                       !constraintExists(data.constraints.rod[index].p2, i) ||
                       i == data.constraints.rod[index].p1,
                   )
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === data.constraints.rod[index].p1 ? "selected" : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
                    <select name="p2" onchange="updateConstraint(this, 'rod', ${index}, 'p2')">
            	   ${data.particles
                   .map((_, i) => i)
                   .filter(
                     (i) =>
                       !constraintExists(data.constraints.rod[index].p1, i) ||
                       i == data.constraints.rod[index].p2,
                   )
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === data.constraints.rod[index].p2 ? "selected" : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
                  <button onclick="deleteConstraint('rod', ${index})">Delete</button>
            			<input type="checkbox" oninput="data.constraints.rod[${index}].oneway=this.checked;updateUI()" ${
                    data.constraints.rod[index].oneway ? "checked" : ""
                  }></input>
                `;
  } else if (type === "slider") {
    const slider = data.constraints.slider[index];
    box.innerHTML = `
                  <label>
            		Slider
                    <select name="p" onchange="updateConstraint(this, 'slider', ${index}, 'p')">
                      ${data.particles
                        .map(
                          (_, i) =>
                            `<option value="${i}" ${
                              i === slider.p ? "selected" : ""
                            }>P ${i + 1}</option>`,
                        )
                        .join("")}
                    </select>
                  </label>
                  <label>Normal X: <input type="range" name="normalX" min="-1" max="1" step="0.1" value="${
                    slider.normal.x
                  }" oninput="updateConstraint(this, 'slider', ${index}, 'normalX')"></label>
                  <label>Normal Y: <input type="range" name="normalY" min="-1" max="1" step="0.1" value="${
                    slider.normal.y
                  }" oninput="updateConstraint(this, 'slider', ${index}, 'normalY')"></label>
                  <button onclick="deleteConstraint('slider', ${index})">Delete</button>
            			<input type="checkbox" oninput="data.constraints.slider[${index}].oneway=this.checked;updateUI()" ${
                    data.constraints.slider[index].oneway ? "checked" : ""
                  }></input>
                `;
  } else if (type === "colinear") {
    box.innerHTML = `Roller Track1
                    <select name="reference" onchange="updateConstraint(this, 'colinear', ${index}, 'reference')">
            	   ${data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === data.constraints.colinear[index].reference
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
		    Slide
                    <select name="slider" onchange="updateConstraint(this, 'colinear', ${index}, 'slider')">

            	   ${data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === data.constraints.colinear[index].slider
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
		    Track2
                    <select name="base" onchange="updateConstraint(this, 'colinear', ${index}, 'base')">

            	   ${data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === data.constraints.colinear[index].base
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
                  <button onclick="deleteConstraint('colinear', ${index})">Delete</button>
            			<input type="checkbox" oninput="data.constraints.colinear[${index}].oneway=this.checked;updateUI()" ${
                    data.constraints.colinear[index].oneway ? "checked" : ""
                  }></input>
                `;
  } else if (type === "f2k") {
    box.innerHTML = `F2k Arm Tip
                    <select name="reference" onchange="updateConstraint(this, 'f2k', ${index}, 'reference')">
            	   ${data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === data.constraints.f2k[index].reference
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
		    Roller 
                    <select name="slider" onchange="updateConstraint(this, 'f2k', ${index}, 'slider')">

            	   ${data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === data.constraints.f2k[index].slider
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
		    Arm Base
                    <select name="base" onchange="updateConstraint(this, 'f2k', ${index}, 'base')">

            	   ${data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === data.constraints.f2k[index].base
                           ? "selected"
                           : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
                  <button onclick="deleteConstraint('f2k', ${index})">Delete</button>
            			<input type="checkbox" oninput="data.constraints.f2k[${index}].oneway=this.checked;updateUI()" ${
                    data.constraints.f2k[index].oneway ? "checked" : ""
                  }></input>
                `;
  } else if (type === "rope") {
    box.innerHTML = `Rope
                    <select name="p1" onchange="updateConstraint(this, 'rope', ${index}, 'p1')">
            	   ${data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === data.constraints.rope[index].p1 ? "selected" : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
                    <select name="p2" onchange="updateConstraint(this, 'rope', ${index}, 'p2')">

            	   ${data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === data.constraints.rope[index].p2 ? "selected" : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
                    <select name="p3" onchange="updateConstraint(this, 'rope', ${index}, 'p3')">

            	   ${data.particles
                   .map((_, i) => i)
                   .map(
                     (i) =>
                       `<option value="${i}" ${
                         i === data.constraints.rope[index].p3 ? "selected" : ""
                       }>P ${i + 1}</option>`,
                   )
                   .join("")}
                    </select>
                  <button onclick="deleteConstraint('rope', ${index})">Delete</button>
            			<input type="checkbox" oninput="data.constraints.rope[${index}].oneway=this.checked;updateUI()" ${
                    data.constraints.rope[index].oneway ? "checked" : ""
                  }></input>
                `;
  }

  //box.addEventListener("mouseenter", () => {
  //  data.constraints[type][index].hovered = true;
  //  drawMechanism();
  //});
  //box.addEventListener("mouseleave", () => {
  //  data.constraints[type][index].hovered = false;
  //  drawMechanism();
  //});
  document.getElementById("constraintsControl").appendChild(box);
}
// Global variable to track the currently dragged particle, if any
let draggedParticleIndex = null;

// Function to check if a mouse position is over a particle
function getParticleAtPosition(x, y) {
  return data.particles.findIndex((p) => {
    const distance = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
    const radius = Math.cbrt(p.mass) * 10; // Same scaling as used in drawMechanism
    return distance < radius; // The mouse is over the particle if its within its radius
  });
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
let zoomLevel = 1;
const ZOOM_SENSITIVITY = 0.001;

canvas.addEventListener("wheel", function (event) {
  event.preventDefault();
  zoomLevel += event.deltaY * -ZOOM_SENSITIVITY;
  zoomLevel = Math.min(Math.max(0.125, zoomLevel), 4); // Clamp between 0.125x and 4x
  ctx.setTransform(zoomLevel, 0, 0, zoomLevel, 0, 0);
  drawMechanism(); // You will need to redraw the canvas content
});

let isPanning = false;
let startX = 0,
  startY = 0;

canvas.addEventListener("mousemove", function (event) {
  if (isPanning) {
    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;
    const dx = x - startX;
    const dy = y - startY;
    ctx.translate(dx, dy);
    drawMechanism(); // Redraw the canvas content
    startX = x;
    startY = y;
  }
});

canvas.addEventListener("mouseup", function (event) {
  isPanning = false;
});

canvas.addEventListener("mouseleave", function (event) {
  isPanning = false;
});
canvas.addEventListener("mousemove", function (event) {
  if (draggedParticleIndex !== null) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    data.particles[draggedParticleIndex].x = x;
    data.particles[draggedParticleIndex].y = y;
    drawMechanism(); // Redraw the mechanism with updated particle position
  }
});

canvas.addEventListener("mouseup", function (event) {
  if (draggedParticleIndex !== null) {
    updateUI(); // Update the entire UI to reflect the new position of the dragged particle
    draggedParticleIndex = null;
    canvas.style.cursor = "default";
  }
});

canvas.addEventListener("mouseleave", function (event) {
  // If the user drags the mouse outside the canvas, release the dragged particle
  if (draggedParticleIndex !== null) {
    updateUI();
    draggedParticleIndex = null;
    canvas.style.cursor = "default";
  }
});
function saveMechanism() {
  localStorage.setItem("mechanismData", JSON.stringify(data));
}

function loadMechanism() {
  const savedData = localStorage.getItem("mechanismData");
  if (savedData) {
    window.data = JSON.parse(savedData);
    updateUI();
  } else {
    loadPreset({ value: "Hinged Counterweight" });
  }
}

window.addEventListener("resize", resizeCanvas);
window.onload = () => {
  loadMechanism();
  resizeCanvas();
};
presets = {
  "Hinged Counterweight":
    '{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3, "duration":35, "particles":[{"x":536,"y":472.7363315056523,"mass":1,"hovered":false},{"x":346,"y":657.6332053503577,"mass":4,"hovered":false},{"x":588,"y":440.75416954332485,"mass":10,"hovered":false},{"x":668,"y":673.6242863315215,"mass":1,"hovered":false},{"x":586,"y":533.7023277463389,"mass":100,"hovered":false}],"constraints":{"rod":[{"p1":0,"p2":1,"hovered":false},{"p1":0,"p2":2,"hovered":false},{"p1":1,"p2":3,"hovered":false},{"p1":2,"p2":4,"hovered":false},{"p1":1,"p2":2,"hovered":false}],"slider":[{"p":0,"normal":{"x":0,"y":1},"hovered":false},{"p":0,"normal":{"x":0.6,"y":1},"hovered":false},{"p":3,"normal":{"x":0,"y":1},"hovered":false,"oneway":true}]}}',
  "Fixed Counterweight":
    '{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3, "duration":35, "particles":[{"x":536,"y":472.7363315056523,"mass":1,"hovered":false},{"x":346,"y":657.6332053503577,"mass":4,"hovered":false},{"x":589,"y":444.719739113931,"mass":100,"hovered":false},{"x":668,"y":673.6242863315215,"mass":1,"hovered":false}],"constraints":{"rod":[{"p1":0,"p2":1,"hovered":false},{"p1":0,"p2":2,"hovered":false},{"p1":1,"p2":3,"hovered":false},{"p1":1,"p2":2,"hovered":false}],"slider":[{"p":0,"normal":{"x":0,"y":1},"hovered":false},{"p":0,"normal":{"x":0.6,"y":1},"hovered":false},{"p":3,"normal":{"x":0,"y":1},"hovered":false,"oneway":true}]}}',
  "Floating Arm Trebuchet":
    '{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3, "duration":35, "particles":[{"x":487.0140918429353,"y":517.0092960532231,"mass":1,"hovered":false},{"x":346,"y":657.6332053503577,"mass":4,"hovered":false},{"x":589,"y":444.719739113931,"mass":100,"hovered":false},{"x":589,"y":673.6242863315215,"mass":1,"hovered":false}],"constraints":{"rod":[{"p1":0,"p2":1,"hovered":false},{"p1":0,"p2":2,"hovered":false},{"p1":1,"p2":3,"hovered":false},{"p1":1,"p2":2,"hovered":false}],"slider":[{"p":0,"normal":{"x":0,"y":1},"hovered":false},{"p":2,"normal":{"x":0.6,"y":0},"hovered":false},{"p":3,"normal":{"x":0,"y":1},"hovered":false,"oneway":true}]}}',
  F2k: '{"projectile":3,"mainaxle":0,"armtip":1,"axleheight":8,"timestep":0.6,"duration":35,"particles":[{"x":454,"y":516,"mass":1,"hovered":false},{"x":436.68769591122077,"y":513.0518373240019,"mass":4,"hovered":false},{"x":560.3084834808736,"y":211.51753342999993,"mass":100,"hovered":false},{"x":652.9785163122632,"y":621.8910173174999,"mass":1,"hovered":false}],"constraints":{"rod":[{"p1":1,"p2":3,"hovered":false},{"p1":1,"p2":2,"hovered":false}],"slider":[{"p":0,"normal":{"x":1,"y":1},"hovered":false},{"p":2,"normal":{"x":0.6,"y":0},"hovered":false},{"p":3,"normal":{"x":0,"y":1},"hovered":false,"oneway":true},{"p":0,"normal":{"x":0,"y":1},"hovered":false}],"colinear":[],"f2k":[{"reference":1,"slider":0,"base":2,"hovered":false}],"rope":[]}}',
  "Floating Arm Whipper (NASAW)":
    '{"projectile":3,"mainaxle":0,"armtip":1,"axleheight":8,"timestep":0.25,"duration":37,"particles":[{"x":496.3768762864126,"y":477.6488505996885,"mass":1,"hovered":false},{"x":677.5437773419831,"y":471.0994822534413,"mass":4,"hovered":false},{"x":468.04119394558313,"y":453.55516542833107,"mass":10,"hovered":false},{"x":557.0821854673263,"y":431.8078926373332,"mass":1,"hovered":false},{"x":563.0719502933894,"y":340.79567817868605,"mass":200,"hovered":false}],"constraints":{"rod":[{"p1":0,"p2":1,"hovered":false},{"p1":0,"p2":2,"hovered":false},{"p1":1,"p2":3,"hovered":false},{"p1":2,"p2":4,"hovered":false},{"p1":1,"p2":2,"hovered":false},{"p1":0,"p2":3,"hovered":false,"oneway":true},{"p1":0,"p2":4,"hovered":false,"oneway":true}],"slider":[{"p":0,"normal":{"x":0,"y":1},"hovered":false},{"p":4,"normal":{"x":0.6,"y":0},"hovered":false}],"colinear":[]}}',
  Whipper:
    '{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.3,"duration":60,"particles":[{"x":536,"y":472.7363315056523,"mass":1,"hovered":false},{"x":759,"y":451,"mass":4,"hovered":false},{"x":483,"y":498,"mass":10,"hovered":false},{"x":551,"y":434,"mass":1,"hovered":false},{"x":560,"y":368,"mass":200,"hovered":false}],"constraints":{"rod":[{"p1":0,"p2":1,"hovered":false},{"p1":0,"p2":2,"hovered":false},{"p1":1,"p2":3,"hovered":false},{"p1":2,"p2":4,"hovered":false},{"p1":1,"p2":2,"hovered":false},{"p1":0,"p2":3,"hovered":false,"oneway":true},{"p1":0,"p2":4,"hovered":false,"oneway":true}],"slider":[{"p":0,"normal":{"x":0,"y":1},"hovered":false},{"p":0,"normal":{"x":0.6,"y":0},"hovered":false}]}}',
  Fiffer:
    '{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.2,"duration":20,"particles":[{"x":536,"y":472.7363315056523,"mass":1,"hovered":false},{"x":484,"y":656,"mass":4,"hovered":false},{"x":504,"y":433,"mass":10,"hovered":false},{"x":644,"y":661,"mass":1,"hovered":false},{"x":653,"y":451,"mass":10,"hovered":false},{"x":749,"y":428,"mass":1,"hovered":false},{"x":749,"y":483,"mass":500,"hovered":false},{"x":566,"y":505,"mass":1,"hovered":false}],"constraints":{"rod":[{"p1":0,"p2":1,"hovered":false},{"p1":0,"p2":2,"hovered":false},{"p1":1,"p2":3,"hovered":false},{"p1":2,"p2":4,"hovered":false},{"p1":1,"p2":2,"hovered":false},{"p1":7,"p2":6,"hovered":false},{"p1":6,"p2":4,"hovered":false},{"p1":4,"p2":5,"hovered":false}],"slider":[{"p":0,"normal":{"x":0,"y":1},"hovered":false},{"p":0,"normal":{"x":0.6,"y":1},"hovered":false},{"p":3,"normal":{"x":0,"y":1},"hovered":false,"oneway":true},{"p":7,"normal":{"x":0.7,"y":1},"hovered":false},{"p":7,"normal":{"x":0,"y":1},"hovered":false},{"p":5,"normal":{"x":0,"y":1},"hovered":false},{"p":5,"normal":{"x":0.7,"y":1},"hovered":false}]}}',

  "Floating Arm King Arthur":
    '{"projectile":3, "mainaxle":0, "armtip":1, "axleheight":8, "timestep":0.2,"duration":40,"particles":[{"x":536,"y":472.7363315056523,"mass":1,"hovered":false},{"x":527,"y":610,"mass":4,"hovered":false},{"x":534,"y":418,"mass":10,"hovered":false},{"x":698,"y":608,"mass":1,"hovered":false},{"x":560,"y":331,"mass":200,"hovered":false}],"constraints":{"rod":[{"p1":0,"p2":1,"hovered":false},{"p1":0,"p2":2,"hovered":false},{"p1":1,"p2":3,"hovered":false},{"p1":2,"p2":4,"hovered":false},{"p1":1,"p2":2,"hovered":false}],"slider":[{"p":0,"normal":{"x":0,"y":1},"hovered":false},{"p":2,"normal":{"x":-0.5,"y":0},"hovered":false,"oneway":true},{"p":1,"normal":{"x":0.7,"y":0},"hovered":false,"oneway":true},{"p":3,"normal":{"x":0,"y":1},"hovered":false,"oneway":true}]}}',
  "Launch Ness Monster":
    '{"projectile":3,"mainaxle":2,"armtip":1,"axleheight":8,"timestep":0.3,"duration":80,"particles":[{"x":600.7448043997729,"y":746.2817936449396,"mass":10,"hovered":false},{"x":559.1340177888502,"y":774.0891411590661,"mass":4,"hovered":false},{"x":660.283069433465,"y":530.0270235522231,"mass":100,"hovered":false},{"x":703.9480403612703,"y":796.722427569219,"mass":1,"hovered":false},{"x":810,"y":530,"mass":10,"hovered":false},{"x":552,"y":500,"mass":10,"hovered":false},{"x":458,"y":666,"mass":10,"hovered":false},{"x":886.1112117706023,"y":662.4242110057531,"mass":10,"hovered":false}],"constraints":{"rod":[{"p1":2,"p2":1,"hovered":false},{"p1":3,"p2":1,"hovered":true},{"p1":6,"p2":5,"hovered":false},{"p1":5,"p2":2,"hovered":false},{"p1":4,"p2":2,"hovered":false},{"p1":4,"p2":7,"hovered":false},{"p1":5,"p2":4,"hovered":false}],"slider":[{"p":0,"normal":{"x":1,"y":2.1049285379913085},"hovered":false},{"p":0,"normal":{"x":-0.6,"y":1.631436664119544},"hovered":false},{"p":3,"normal":{"x":0,"y":1},"hovered":false,"oneway":true},{"p":6,"normal":{"x":0.6,"y":1},"hovered":false},{"p":6,"normal":{"x":0,"y":1},"hovered":false},{"p":7,"normal":{"x":1,"y":1},"hovered":false},{"p":7,"normal":{"x":0,"y":1},"hovered":false}],"colinear":[{"reference":1,"slider":0,"base":2}]}}',
  "Pulley Sling":
    '{"projectile":3,"mainaxle":0,"armtip":1,"axleheight":8,"timestep":0.2,"duration":35,"particles":[{"x":546.3996560578205,"y":584.3575814068853,"mass":1,"hovered":false},{"x":285.60825276178224,"y":791.6482113107999,"mass":4,"hovered":false},{"x":560.6373890594891,"y":481.2893046533675,"mass":10,"hovered":false},{"x":1000.9376079311984,"y":742.8413334783639,"mass":1,"hovered":false},{"x":645.5115623487806,"y":541.0151278114975,"mass":500,"hovered":false},{"x":72.74744735998127,"y":730.2095434891331,"mass":1,"hovered":false}],"constraints":{"rod":[{"p1":0,"p2":1,"hovered":true},{"p1":0,"p2":2,"hovered":false},{"p1":2,"p2":4,"hovered":false},{"p1":1,"p2":2,"hovered":false},{"p1":0,"p2":4,"hovered":false,"oneway":true}],"slider":[{"p":0,"normal":{"x":0,"y":1},"hovered":false},{"p":0,"normal":{"x":0.6,"y":1},"hovered":false},{"p":3,"normal":{"x":0,"y":1},"hovered":false,"oneway":true},{"p":5,"normal":{"x":1,"y":1},"hovered":false},{"p":5,"normal":{"x":0,"y":1},"hovered":false}],"colinear":[],"rope":[{"p1":5,"p2":1,"hovered":false,"p3":3}]}}',
};
let optimizing = false;
async function optimize() {
  if (optimizing) {
    optimizing = false;
    document.getElementById("optimize").innerText = "Optimize";
    return;
  }
  document.getElementById("optimize").innerText = "Stop";
  optimizing = true;
  wait();
  console.log(document.getElementById("range").innerText);
  var timer = 30;
  var step = 40;
  while (optimizing) {
    var oldrange = +document.getElementById("range").innerText;
    var oldDesign = JSON.stringify(window.data);
    for (var p of data.particles) {
      if (Math.random() > 0.5) {
        p.x = p.x + step * (0.5 - Math.random());
        p.y = p.y + step * (0.5 - Math.random());
      }
    }
    //for (var p of data.constraints.slider) {
    //	if (Math.random() > .5) {
    //	p.normal.x = p.normal.x + step / 80 * (.5 - Math.random());
    //	p.normal.y = p.normal.y + step / 80 * (.5 - Math.random());
    //	}
    //}
    drawMechanism();
    await wait();
    var newRange = +document.getElementById("range").innerText;
    if (newRange < oldrange) {
      window.data = JSON.parse(oldDesign);
      document.getElementById("range").innerText = oldrange;
      timer -= 1;
      if (timer == 0) {
        timer = 30;
        step *= 0.6;
      }
    } else {
      timer = 30;
    }
  }
  drawMechanism();
}
function save() {
  const data = window.data; // Assuming data is a global variable
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });

  // Ask the user for a filename
  const filename = prompt("Enter a filename for your data:", "data.json");
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
    console.log("asf");
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      try {
        window.data = JSON.parse(readerEvent.target.result);
        updateUI();
      } catch (error) {
        alert("Error parsing JSON!");
      }
    };

    reader.readAsText(file);
  };
  document.body.appendChild(input);
  console.log(input);
  input.click();
  document.body.removeChild(input);
}
