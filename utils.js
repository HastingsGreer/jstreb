export async function wait() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1); // waits for 10 milliseconds
  });
}
export async function waitForAnimationFrame() {
  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}
export const canvas = document.getElementById("mechanism");
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
