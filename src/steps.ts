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
  const font = context.font.substring(context.font.indexOf(" "));
  context.font = `${size}px ${font}`;
}

function fontColor(color: string) {
  context.fillStyle = color;
}

function line(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  options: Partial<Options> = {}
) {
  roughCanvas.line(fromX, fromY, toX, toY, { roughness: 2, ...options, seed });
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
  line(...endPoint, ...headPoint1, options);
  line(...endPoint, ...headPoint2, options);
}

const steps = [
  // vertical lines
  () => line(ww / 3, 20, ww / 3, hh - 20),
  () => line((ww / 3) * 2, 20, (ww / 3) * 2, hh - 20),
  () => {
    fontSize(40);
    fontColor("black");
    text("workdir", ww / 6, 30, 2);
  },
  () => {
    fontSize(40);
    text("staging area", ww / 2, 30, -1);
  },
  () => {
    fontSize(40);
    fontColor("black");
    text("committed", (ww * 5) / 6, 30, 3);
  },

  // workdir
  () => circle(ww / 8, hh / 2, unit),
  () => circle(ww / 4, hh / 2, unit, { fill: "orange" }),

  // staging area
  () => triangle(ww / 2, hh / 2, unit, unit, { fill: "red" }),

  // commit
  () => square((ww * 5) / 6, hh / 2, unit, { fill: "blue" }),

  // change file
  () => arrow(ww / 8, hh / 2 - unit, ww / 4 - small, hh / 2 - unit, -3),
  () => {
    fontSize(18);
    fontColor("#555");
    text("<change>", ww / 6 + small / 2, hh / 2 - (unit * 7) / 4);
  },

  // stage change
  () => arrow(ww / 4 + small, hh / 2 - unit, ww / 2 - small, hh / 2 - unit, -2),
  () => {
    fontSize(30);
    text("add", ww / 3 + unit / 2, hh / 2 - unit * 2, 5);
  },

  // commit change
  () => {
    arrow(
      ww / 2 + small,
      hh / 2 - unit,
      (ww / 6) * 5 - small,
      hh / 2 - unit,
      -2
    );
  },
  () => {
    fontSize(30);
    text("commit", ww / 2 + unit + small, hh / 2 - unit * 2, -12);
  },

  // undo change
  () => arrow(ww / 4, hh / 2 + unit, ww / 8, hh / 2 + unit, -2),
  () => {
    fontSize(24);
    text("restore", ww / 6 + small, hh / 2 + unit * 1.8);
  },

  // unstage change
  () => arrow(ww / 2 - small, hh / 2 + unit, ww / 4 + small, hh / 2 + unit, -2),
  () => {
    fontSize(24);
    text("remove", ww / 3 + 3 * small, hh / 2 + unit * 2);
  },
  () =>
    line(
      ww / 3 + small / 2,
      hh / 2 + unit * 2,
      ww / 3 + unit + small * 2,
      hh / 2 + unit * 2
    ),
  () => {
    fontSize(24);
    text("rm", ww / 3 + 3 * small, hh / 2 + unit * 2.3);
  },
  () =>
    line(
      ww / 3 + small * 1.5,
      hh / 2 + unit * 2.3,
      ww / 3 + unit,
      hh / 2 + unit * 2.3
    ),
  () => {
    fontSize(24);
    text("reset", ww / 3 + 3 * small, hh / 2 + unit * 2.6);
  },

  // uncommit
  () =>
    arrow(
      (ww / 6) * 5 - small,
      hh / 2 + unit - small,
      ww / 2 + unit / 2,
      hh / 2 + unit,
      -2
    ),
  () => {
    fontSize(24);
    text("reset", (ww / 3) * 2 + unit, hh / 2 + (unit * 7) / 4, -10);
  },

  // revert
  () => {
    fontSize(24);
    text("or revert (?)", (ww / 3) * 2 + unit + small, hh / 2 + 2.1 * unit, -8);
  },

  // diff
  () => {
    arrow(
      ww / 8 - small,
      hh / 2 - unit * 1.5,
      ww / 4 - small,
      hh / 2 - unit * 1.5,
      -5,
      {
        stroke: "orange",
      }
    );
    arrow(
      ww / 4 - small,
      hh / 2 - unit * 1.5,
      ww / 8 - small,
      hh / 2 - unit * 1.5,
      5,
      {
        stroke: "orange",
      }
    );
  },
  () => {
    fontColor("orange");
    text("diff", ww / 6, hh / 2 - unit * 2.7);
    fontColor("black");
  },

  // diff cached
  () =>
    arrow(ww / 8 - small, hh / 2 - unit * 2.5, ww / 2, hh / 2 - unit * 2, -3, {
      stroke: "red",
    }),
  () => {
    fontColor("red");
    text("diff --staged", ww / 3 - unit - small, hh / 2 - unit * 4, -10);
  },
  () =>
    line(
      ww / 3 - unit * 1.7,
      hh / 2 - unit * 3.9,
      ww / 3 + 5,
      hh / 2 - unit * 4.3,
      {
        stroke: "red",
        roughness: 4,
      }
    ),
  () => {
    fontColor("red");
    text("--cached", ww / 3 - unit, hh / 2 - unit * 4.3, -10);
  },
  () => {
    fontColor("black");
    fontSize(34);
    text("(cache)", ww / 2 + small, unit);
  },
  () => line(ww / 2 - small * 2, unit, ww / 2 + unit, unit, { strokeWidth: 2 }),
  () => {
    fontColor("black");
    fontSize(34);
    text("(index)", ww / 2 + small * 2, unit * 1.5);
  },

  // commit all
  () => {
    arrow(
      ww / 4 + small * 2,
      hh / 2 - small * 2,
      (ww / 6) * 5 - small * 3,
      hh / 2 - small,
      -0.5,
      { stroke: "blue" }
    );
  },
  () => {
    fontColor("blue");
    fontSize(24);
    text("commit --all", ww / 2 - unit - small, hh / 2 - small - 10, -3);
  },
  () => {
    fontSize(20);
    text("(tracked)", ww / 2 - unit - small, hh / 2, -3);
  },

  // branches
  () => line(small + 4, hh - 2 * unit - 6, ww - small - 2, hh - 2 * unit),
  () => line(small - 8, hh - unit, ww - small - 10, hh - unit - 5),
  () => {
    fontColor("darkgreen");
    text("master", unit, hh - 2.5 * unit);
  },
  () => text("feature", unit + 2, hh - 1.5 * unit, 2),
  () => {
    fontColor("black");
    fontSize(80);
    text("}", unit * 2, hh - unit * 1.8, -19);
  },
  () => {
    fontSize(24);
    text("branch --list", unit * 3.4, hh - unit * 2.3, -5);
  },
  () => {
    fontColor("limegreen");
    text("new-branch:", unit - 5, hh - 0.5 * unit, 5);
  },
  () => {
    fontColor("black");
    text("checkout -b", unit * 3, hh - unit / 2);
  },
  () => {
    fontSize(20);
    text("(--branch)", unit * 4.7, hh - unit / 2 - 10, -8);
  },
  () => line(unit * 4, hh - unit / 2 - 5, unit * 5.5, hh - unit / 2 - 20),
  () => text("or switch -c", unit * 3, hh - small),

  () => {
    line(small * 2, hh - unit * 1.8, unit * 1.6, hh - unit * 1.3, {
      stroke: "red",
    });
    line(small * 2, hh - unit * 1.3, unit * 1.6, hh - unit * 1.8, {
      stroke: "red",
    });
  },
  () => {
    fontColor("red");
    text("branch -d", unit * 2.5, hh - unit * 1.3);
  },
  () => {
    fontSize(28);
    text("D", unit * 3.1, hh - unit * 1.3);
  },

  // rebase
  () => {
    fontColor("black");
    text("rebase", ww / 2 - unit * 1.5, hh - unit * 1.5);
  },

  // other re-commands
  () => {
    fontSize(22);
    text("replace", ww / 2 - unit, hh - unit / 2, -20);
  },
  () => text("repack", ww / 2 - 10, hh - unit / 2, -15),
  () => text("reflog", ww / 2 + unit - 20, hh - unit / 2, -28),
  () => text("rev-parse", ww / 2 + unit * 1.8, hh - unit / 2 - 6, -25),

  // rerere
  () => {
    fontSize(32);
    fontColor("purple");
    text("rerere", (ww / 3) * 2 + unit, hh - unit / 2, -9);
  },
  () => text(":)", (ww / 3) * 2 + 2 * unit, hh - unit / 2 - 10, 90),
  // not kidding
  () =>
    line(
      (ww / 3) * 2 + 1.8 * unit,
      hh - unit / 2.5,
      (ww / 3) * 2 + 2.3 * unit,
      hh - unit / 1.2,
      { strokeWidth: 3 }
    ),
  () =>
    line(
      (ww / 3) * 2 + 1.8 * unit,
      hh - unit / 1.2,
      (ww / 3) * 2 + 2.3 * unit,
      hh - unit / 2.5,
      { strokeWidth: 3 }
    ),
  () =>
    line(
      (ww / 3) * 2 + 1.7 * unit,
      hh - unit / 2.6,
      (ww / 3) * 2 + 2.4 * unit,
      hh - unit / 1.25,
      { strokeWidth: 3 }
    ),
  () =>
    line(
      (ww / 3) * 2 + 1.9 * unit,
      hh - unit / 1.14,
      (ww / 3) * 2 + 2.2 * unit,
      hh - unit / 2.5,
      { strokeWidth: 3 }
    ),

  // go bananas
  () => {
    fontSize(25);
    fontColor("black");
    text("--porcelain", ww - unit, 2 * unit);
  },
  () => {
    fontSize(29);
    text("--patience", ww - unit - 10, 3 * unit, 2);
  },
  () => {
    fontSize(22);
    text("--pickaxe-all", ww - unit - small, 4 * unit, -2);
  },
  () => {
    text("--guess --no-progress", ww - unit - 20, 6.3 * unit, -50);
  },
  () => text("--find-copies", (ww * 5) / 6, hh - unit * 1.7),
  () => text("--find-copies-harder", (ww * 5) / 6 + small, hh - unit * 1.3),

  // magic incantation
  () => text("rev-parse", unit / 2 - small, hh / 2 + unit * 1.5, -85),
  () => text("--abbrev-ref", unit / 2, hh / 2 - unit / 2 + 15, -83),
  () => text("--stuck-long", unit / 2 + small, hh / 2 - 2.4 * unit + 5, -85),
  () => {
    context.font = "22px Virgil";
    text("--parseopt", unit / 2 + 2 * small, hh / 2 - 4.2 * unit, -86);
    document.getElementById("canvas-cover")?.classList.remove("visible");
  },

  // BREAK
  () => document.getElementById("canvas-cover")?.classList.add("visible"),
  () => {
    context.clearRect(0, 0, ww, hh);
    document.getElementById("canvas-cover")?.classList.remove("visible");
  },

  // git-sane

  // change and undo
  () => {
    context.font = "28px Fira Code";
    context.textAlign = "right";
    text("<change>", ww / 2 - unit / 2, small);
  },
  () => {
    context.textAlign = "center";
    text("-", ww / 2, small);
  },
  () => {
    context.textAlign = "left";
    text("undo (u)", ww / 2 + unit / 2, small);
  },
  () => text("undo-all (ua)", ww / 2 + unit / 2, unit - 12),

  // staging
  () => {
    context.textAlign = "right";
    text("stage (s)", ww / 2 - unit / 2, hh / 6);
  },
  () => {
    context.textAlign = "center";
    text("-", ww / 2, hh / 6);
  },
  () => {
    context.textAlign = "left";
    text("unstage (us)", ww / 2 + unit / 2, hh / 6);
  },
  () => {
    context.textAlign = "right";
    text("stage-all (sa)", ww / 2 - unit / 2, hh / 6 + unit - 12 - small);
  },
  () => {
    context.textAlign = "left";
    text("unstage-all (usa)", ww / 2 + unit / 2, hh / 6 + unit - small - 12);
  },
  () => {
    context.textAlign = "right";
    text("stage-files (sf)", ww / 2 - unit / 2, hh / 4 + small + 5);
  },
  () => text("stage-lines (sl)", ww / 2 - unit / 2, hh / 3 + 5),
  () => {
    context.textAlign = "left";
    text("diff-staged (ds)", ww / 2 + unit / 2, hh / 3 + 5);
  },

  // commit
  () => {
    context.textAlign = "right";
    text("commit (c)", ww / 2 - unit / 2, hh / 2 - unit + small);
  },
  () => {
    context.textAlign = "center";
    text("-", ww / 2, hh / 2 - unit + small);
  },
  () => {
    context.textAlign = "left";
    text("uncommit (uc)", ww / 2 + unit / 2, hh / 2 - unit + small);
  },
  () => {
    context.textAlign = "left";
    text("drop-commit (dc)", ww / 2 + unit / 2, hh / 2 - 12);
  },
  () => {
    context.textAlign = "left";
    text("invert-commit (ic)", ww / 2 + unit / 2, hh / 2 + 30);
  },

  // branches
  () => {
    context.textAlign = "center";
    text("list-branches (lb)", ww / 5, (hh * 7) / 12);
  },
  () => text("select-branch (sb)", ww / 5, (hh * 2) / 3),
  () => text("create-branch (cb)", ww / 5, (hh * 3) / 4),
  () => text("delete-branch (db)", ww / 5, (hh * 5) / 6),

  // others
  () => text("jump-to (j)", (ww / 3) * 2, (hh / 4) * 3),
  () => text("rewrite-history (rh)", (ww / 3) * 2, (hh / 6) * 5),

  // finally
  () => {
    context.beginPath();
    context.rect(0, hh - unit, ww, unit);
    context.fillStyle = "#2da44e";
    context.fill();
    fontColor("white");
    fontSize(24);
    context.textAlign = "center";
    text("github.com/endreymarcell/git-sane", ww / 2, hh - small * 2 + 4);
  },
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
