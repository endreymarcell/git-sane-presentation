import { RoughCanvas } from "roughjs/bin/canvas";
import { Options } from "roughjs/bin/core";
import { Point } from "roughjs/bin/geometry";

let index = 0;

let context: CanvasRenderingContext2D;
let roughCanvas: RoughCanvas;
let seed: number;

const ww = 1000;
const hh = 700;
const unit = 70;
const small = unit / 4;

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

function fontSize(size: number) {
  context.font = `${size}px Virgil`;
}

function line(fromX: number, fromY: number, toX: number, toY: number) {
  roughCanvas.line(fromX, fromY, toX, toY, { seed, roughness: 2 });
}

function rectangle(
  x: number,
  y: number,
  width: number,
  height: number,
  options: Partial<Options> = {}
) {
  roughCanvas.rectangle(x, y, width, height, {
    ...options,
    seed,
    roughness: 2,
  });
}

function square(
  x: number,
  y: number,
  size: number,
  options: Partial<Options> = {}
) {
  rectangle(x - size / 2, y - size / 2, size, size, options);
}

function ellipse(
  x: number,
  y: number,
  width: number,
  height: number,
  options: Partial<Options> = {}
) {
  roughCanvas.ellipse(x, y, width, height, {
    ...options,
    seed,
    roughness: 1,
  });
}

function circle(
  x: number,
  y: number,
  diameter: number,
  options: Partial<Options> = {}
) {
  ellipse(x, y, diameter, diameter, options);
}

function triangle(
  x: number,
  y: number,
  width: number,
  height: number,
  options: Partial<Options> = {}
) {
  roughCanvas.polygon(
    [
      [x - width / 2, y + height / 2],
      [x, y - height / 2],
      [x + width / 2, y + height / 2],
    ],
    { ...options, seed, roughness: 1 }
  );
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
/*
function curve(
  points: Array<[number, number]>,
  options: Partial<Options> = {}
) {
  roughCanvas.curve(points, { ...options, seed, roughness: 2, bowing: 5 });
}*/

function arrow(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  bowing: number,
  options: Partial<Options> = {}
) {
  const startPoint: Point = [fromX, fromY];
  const endPoint: Point = [toX, toY];
  const startMiddlePoint: Point = [
    fromX + (toX - fromX) / 5,
    fromY + (toY - fromY) / 5,
  ];
  const middlePoint: Point = [
    fromX + (toX - fromX) / 2,
    fromY + (toY - fromY) / 2,
  ];
  const endMiddlePoint: Point = [
    fromX + ((toX - fromX) / 5) * 4,
    fromY + ((toY - fromY) / 5) * 4,
  ];

  const vector = [toX - fromX, toY - fromY];
  const [dx, dy] = vector;
  const rotated = [-dy, dx];
  const shrunk = rotated.map((d) => d / 10);
  const adjusted = shrunk.map((d) => d * bowing);
  const [adx, ady] = adjusted;

  const someMagicNumber = 2 / 3;

  const extraStartMiddlePoint: Point = [
    startMiddlePoint[0] + adx * someMagicNumber,
    startMiddlePoint[1] + ady * someMagicNumber,
  ];
  const extraMiddlePoint: Point = [middlePoint[0] + adx, middlePoint[1] + ady];
  const extraEndMiddlePoint: Point = [
    endMiddlePoint[0] + adx * someMagicNumber,
    endMiddlePoint[1] + ady * someMagicNumber,
  ];

  const points: Array<Point> = [
    startPoint,
    extraStartMiddlePoint,
    extraMiddlePoint,
    extraEndMiddlePoint,
    endPoint,
  ];
  roughCanvas.curve(points, { ...options, seed });

  const extraEndMiddlePointToEndVector: Point = [
    endPoint[0] - extraEndMiddlePoint[0],
    endPoint[1] - extraEndMiddlePoint[1],
  ];
  const [edx, edy] = extraEndMiddlePointToEndVector;
  const auxNormalVector = [-edy, edx].map((d) => d / 2.5);
  const auxPoint: Point = [
    extraEndMiddlePoint[0] + edx / 10,
    extraEndMiddlePoint[1] + edy / 10,
  ];
  const headPoint1: Point = [
    auxPoint[0] + auxNormalVector[0],
    auxPoint[1] + auxNormalVector[1],
  ];
  const headPoint2: Point = [
    auxPoint[0] - auxNormalVector[0],
    auxPoint[1] - auxNormalVector[1],
  ];
  line(...endPoint, ...headPoint1);
  line(...endPoint, ...headPoint2);
}

const steps = [
  () => line(ww / 3, 20, ww / 3, hh - 20),
  () => line((ww / 3) * 2, 20, (ww / 3) * 2, hh - 20),
  () => text("workdir", ww / 6, 30, 2),
  () => text("staging area", ww / 2, 30, -1),
  () => text("committed", (ww * 5) / 6, 30, 3),
  () => circle(ww / 8, hh / 2, unit),
  () => circle(ww / 4, hh / 2, unit, { fill: "orange" }),
  () => triangle(ww / 2, hh / 2, unit, unit, { fill: "red" }),
  () => square((ww * 5) / 6, hh / 2, unit, { fill: "blue" }),
  () =>
    curve([
      [ww / 8, hh / 2 - unit],
      [(ww / 16) * 3, hh / 2 - 1.5 * unit],
      [ww / 4, hh / 2 - unit],
    ]),
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
