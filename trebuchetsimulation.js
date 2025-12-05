/**
 * Shared trebuchet simulation utilities
 */

const ctypes = ["rod", "pin", "slider", "colinear", "f2k", "rope"];

/**
 * Fill in missing constraint types and handle pin constraints from sliders
 * @param {Object} data - The trebuchet data object
 */
export function fillEmptyConstraints(data) {
  for (const ctype of ctypes) {
    if (data.constraints[ctype] === undefined) {
      data.constraints[ctype] = [];
    }
  }

  // Handle pin constraints from sliders
  const sliderCounts = data.particles.map(() => 0);
  data.constraints.slider.forEach((x) => {
    if (!x.oneway) {
      sliderCounts[x.p] += 1;
    }
  });
  data.constraints.slider = data.constraints.slider.filter(
    (x) => sliderCounts[x.p] < 2
  );
  data.constraints.pin = data.constraints.pin.concat(
    sliderCounts
      .flatMap((x, i) => [{ count: x, p: i }])
      .filter((x) => x.count > 1)
  );
}

/**
 * Calculate the peak load from force log
 * @param {Array} forceLog - The force log from simulation
 * @returns {number} The peak load
 */
export function calculatePeakLoad(forceLog) {
  return Math.max(
    ...forceLog.slice(1).map((x) => Math.max(...x.map((y) => Math.abs(y))))
  );
}

/**
 * Calculate the range from trajectories
 * @param {Array} trajectories - The trajectories from simulation
 * @param {Object} data - The trebuchet data object containing particles and configuration
 * @returns {number} The calculated range
 */
export function calculateRange(trajectories, data) {
  let axlecoord = -data.particles[data.mainaxle].y;
  let mincoord = -data.particles[data.mainaxle].y;
  let range = 0;

  for (const trajectory of trajectories) {
    for (let partIndex = 0; partIndex < data.particles.length; partIndex++) {
      if (trajectory[2 * partIndex] < 2000) {
        mincoord = Math.min(mincoord, -trajectory[2 * partIndex + 1]);
      }
      axlecoord = Math.max(axlecoord, -trajectory[2 * data.mainaxle + 1]);
    }

    range = Math.max(
      range,
      2 *
        Math.max(
          0,
          -trajectory[2 * data.particles.length + 2 * data.projectile + 1]
        ) *
        trajectory[2 * data.particles.length + 2 * data.projectile]
    );
  }

  const height1 = axlecoord - mincoord;
  const height2 = Math.sqrt(
    Math.pow(
      data.particles[data.armtip].x - data.particles[data.mainaxle].x,
      2
    ) +
      Math.pow(
        data.particles[data.armtip].y - data.particles[data.projectile].y,
        2
      )
  );
  var height3;
  if (data.particles.length > 4 ){
  height3 = Math.sqrt(
    Math.pow(
      data.particles[2].x -
        data.particles[data.mainaxle].x,
      2,
    ) +
      Math.pow(
        data.particles[2].y -
          data.particles[data.mainaxle].y,
        2,
      ),
  ) + Math.sqrt(
    Math.pow(
      data.particles[2].x -
        data.particles[4].x,
      2,
    ) +
      Math.pow(
        data.particles[2].y -
          data.particles[4].y,
        2,
      ),
  );
  } else {
    height3 = 0
   }
  range = (range / Math.max(Math.max(height1, 0.75 * height2), height3)) * data.axleheight;

  return range;
}

/**
 * Preset trebuchet configurations
 */
export const presets = {
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
  MURLIN:
    '{"projectile":8,"mainaxle":0,"armtip":1,"axleheight":8,"timestep":0.1,"duration":40,"particles":[{"x":510.98330181224014,"y":585.0346326615387,"mass":1,"hovered":false},{"x":610.8818474508025,"y":509.1784380643879,"mass":1,"hovered":false},{"x":530.7749198606792,"y":582.2639014087384,"mass":1,"hovered":false},{"x":508.2352941176471,"y":627.2941140567556,"mass":1,"hovered":false},{"x":437.64705882352945,"y":593.176466997932,"mass":1,"hovered":false},{"x":477.64705882352945,"y":495.5294081744026,"mass":1,"hovered":false},{"x":648.2352941176471,"y":446.1176434685202,"mass":1,"hovered":false},{"x":648.2352941176471,"y":464.94117288028497,"mass":200,"hovered":false},{"x":462.2625079139531,"y":570.2700562274708,"mass":1,"hovered":false}],"constraints":{"rod":[{"p1":2,"p2":1,"hovered":false},{"p1":2,"p2":0,"hovered":false},{"p1":1,"p2":0,"hovered":false},{"p1":3,"p2":2,"hovered":false},{"p1":3,"p2":0,"hovered":false},{"p1":4,"p2":3,"hovered":false},{"p1":4,"p2":0,"hovered":false},{"p1":5,"p2":4,"hovered":false},{"p1":5,"p2":0,"hovered":false},{"p1":8,"p2":1,"hovered":false},{"p1":8,"p2":0,"hovered":false,"oneway":true}],"slider":[],"colinear":[],"f2k":[],"rope":[{"p1":7,"pulleys":[{"idx":6,"wrapping":"ccw"},{"idx":5,"wrapping":"ccw"},{"idx":4,"wrapping":"ccw"},{"idx":3,"wrapping":"ccw"}],"p3":2,"hovered":false}],"pin":[{"count":2,"p":0},{"count":2,"p":6}]}}',
};
