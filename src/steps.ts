import { RoughCanvas } from "roughjs/bin/canvas";

let index = 0;

let context: CanvasRenderingContext2D;
let roughCanvas: RoughCanvas;
let seed: number;

const ww = 1000;
const hh = 700;

type Stuff = {
  context: CanvasRenderingContext2D;
  roughCanvas: RoughCanvas;
  seed: number;
};

export function setStuff(stuff: Stuff) {
  context = stuff.context;
  roughCanvas = stuff.roughCanvas;
  seed = stuff.seed;
}

const steps = [
  () => roughCanvas.line(ww / 3, 20, ww / 3, hh - 20, { seed, roughness: 5 }),
  () =>
    roughCanvas.line((ww / 3) * 2, 20, (ww / 3) * 2, hh - 20, {
      seed,
      roughness: 5,
    }),
  () => {
    context.rotate(0.02);
    context.fillText("workdir", ww / 6, 30);
    context.resetTransform();
  },
  () => {
    context.rotate(-0.01);
    context.fillText("staging area", ww / 2, 30);
    context.resetTransform();
  },
  () => {
    context.rotate(0.01);
    context.fillText("committed", (ww * 5) / 6, 20);
    context.resetTransform();
  },
];

function getStep() {
  return steps[index++];
}

function setStepInUrl() {
  window.history.replaceState(
    null,
    null,
    `${window.location.protocol}//${window.location.host}?step=${index}`
  );
}

export function stepForward() {
  if (index < steps.length) {
    getStep()();
    seed++;
    setStepInUrl();
  }
}

export function stepBack() {
  if (index > 0) {
    context.clearRect(0, 0, 3000, 3000);
    seed -= index;
    index--;
    for (let i = 0; i < index; i++) {
      steps[i]();
      seed++;
    }
    setStepInUrl();
  }
}
