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
