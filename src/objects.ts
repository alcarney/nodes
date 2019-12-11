import { svgns } from "./constants";

export class Grid {

  start: number
  stop: number
  numSquares: number

  elements: SVGElement[]

  constructor(scale: number, num: number) {

    this.start = -(scale / 2)
    this.stop = scale / 2

    this.numSquares = num
    this.elements = []
    this.constructGrid()
  }

  constructGrid() {
    this.elements = []
    const spacing = (this.stop - this.start) / this.numSquares

    for (let n = 0; n <= this.numSquares; n++) {
      const p = (this.start + (n * spacing)).toString()
      const startVal = this.start.toString()
      const stopVal = this.stop.toString()

      const col = document.createElementNS(svgns, "line")
      col.setAttribute("x1", p)
      col.setAttribute("x2", p)
      col.setAttribute("y1", startVal)
      col.setAttribute("y2", stopVal)

      const row = document.createElementNS(svgns, "line")
      row.setAttribute("x1", startVal)
      row.setAttribute("x2", stopVal)
      row.setAttribute("y1", p)
      row.setAttribute("y2", p)

      this.elements.push(col)
      this.elements.push(row)
    }
  }
}

export class EditorNode {

  elements: SVGElement[]

  constructor() {
    this.elements = []

    const rect = document.createElementNS(svgns, 'rect')
    rect.setAttribute("width", "20")
    rect.setAttribute("height", "20")
    rect.setAttribute("rx", "1")

    this.elements.push(rect)
  }
}