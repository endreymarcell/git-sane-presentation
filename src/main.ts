import rough from "roughjs";
import { stepForward, stepBack, setStuff } from "./steps";

const canvas = document.querySelector("canvas")!;
const context = canvas.getContext("2d")!;
context.font = "40px Virgil";
context.textAlign = "center";
context.textBaseline = "middle";

const roughCanvas = rough.canvas(canvas);

export const seed = Math.floor(Math.random() * Math.pow(2, 31));

setStuff({ context, roughCanvas, seed });

const forwardKeys = [" ", "ArrowRight", "Enter"];
const backKeys = ["ArrowLeft", "Backspace"];

document.addEventListener("keydown", (event) => {
  if (forwardKeys.includes(event.key)) {
    event.preventDefault();
    stepForward();
  } else if (backKeys.includes(event.key)) {
    event.preventDefault();
    stepBack();
  }
});

const params = new URLSearchParams(window.location.search);
if (params.get("step")) {
  const startIndex = parseInt(params.get("step") ?? "0");
  for (let i = 0; i < startIndex; i++) {
    stepForward();
  }
}
