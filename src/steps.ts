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

function line(fromX: number, fromY: number, toX: number, toY: number) {
  roughCanvas.line(fromX, fromY, toX, toY, { seed, roughness: 5 });
}

function text(
  textToDraw: string,
  x: number,
  y: number,
  rotationDegree: number = 0
) {
  context.translate(x, y);
  context.rotate((rotationDegree / 180) * Math.PI);
  context.fillText(textToDraw, 0, 0);
  context.resetTransform();
}

const steps = [
  () => line(ww / 3, 20, ww / 3, hh - 20),
  () => line((ww / 3) * 2, 20, (ww / 3) * 2, hh - 20),
  () => text("workdir", ww / 6, 30, 2),
  () => text("staging area", ww / 2, 30, -1),
  () => text("committed", (ww * 5) / 6, 30, 3),
];

function getStep() {
  return steps[index++];
}

function setStepInUrl() {
  const url = `${window.location.protocol}//${window.location.host}?step=${index}`;
  window.history.replaceState(null, "", url);
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
