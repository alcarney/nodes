import { Canvas } from "./canvas";
import { EditorNode, Grid } from "./objects";

const main = document.getElementById("canvas")

if (main === null) {
  throw new Error("Could not find canvas element")
}

const canvas = new Canvas(main, 100)

const grid = new Grid(canvas.viewBox.height, 25)
canvas.setBackground(grid)

const node = new EditorNode()
canvas.addItem(node)