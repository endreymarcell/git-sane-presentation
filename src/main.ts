import rough from "roughjs";
import { stepForward, stepBack, setStuff } from "./steps";

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
context.font = "30px Virgil";
context.textAlign = "center";
context.textBaseline = "middle";

const roughCanvas = rough.canvas(canvas);

export const seed = Math.floor(Math.random() * Math.pow(2, 31));

setStuff({ context, roughCanvas, seed });

document.addEventListener("keydown", (event) => {
  if (event.key === " " || event.key === "ArrowRight") {
    event.preventDefault();
    stepForward();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    stepBack();
  }
});

const params = new URLSearchParams(window.location.search);
if (params.get("step")) {
  const startIndex = parseInt(params.get("step"));
  for (let i = 0; i < startIndex; i++) {
    stepForward();
  }
}
