const svgns = "http://www.w3.org/2000/svg"

interface CanvasItem {
  elements: SVGElement[]
}

class Grid {

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

class EditorNode {

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

class Point {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  minus(other: Point): Point {
    return new Point(this.x - other.x, this.y - other.y)
  }
}

class Canvas {

  offset: Point

  clickOffset: Point
  clickPosition: Point

  scale: number

  width: number
  height: number

  canvas: SVGElement
  background?: SVGElement

  constructor(root: HTMLElement, scale: number) {
    this.canvas = document.createElementNS(svgns, "svg")

    this.offset = new Point(0, 0)
    this.clickPosition = new Point(0, 0)
    this.clickOffset = new Point(0, 0)

    this.width = 1
    this.height = 1
    this.scale = scale

    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
    this.canvas.addEventListener('resize', this.onResize.bind(this))
    this.canvas.addEventListener('wheel', this.onScroll.bind(this))

    root.appendChild(this.canvas)
    this.calcViewBox()
  }

  calcViewBox() {
    const bbox = this.canvas.getBoundingClientRect()
    const aspectRatio = bbox.width / bbox.height

    this.height = this.scale
    this.width = aspectRatio * this.height

    const xMin = this.offset.x - (this.width / 2)
    const yMin = this.offset.y - (this.height / 2)

    const viewBoxStr = `${xMin} ${yMin} ${this.width} ${this.height}`
    this.canvas.setAttribute("viewBox", viewBoxStr)
  }

  getMousePosition(event: MouseEvent): Point {
    const bbox = this.canvas.getBoundingClientRect()
    const x = (event.clientX - bbox.left) / bbox.width
    const y = (event.clientY - bbox.top) / bbox.height

    return new Point(x, y)
  }

  onMouseUp(event: MouseEvent) {
    console.debug("[canvas]: mouseup")

  }

  onMouseDown(event: MouseEvent) {
    this.clickOffset = new Point(this.offset.x, this.offset.y)
    this.clickPosition = this.getMousePosition(event)

    console.debug("[canvas]: click", this.clickPosition)
  }

  onMouseMove(event: MouseEvent) {
    if (event.buttons !== 1) {
      return
    }

    const mousePos = this.getMousePosition(event)
    const delta = mousePos.minus(this.clickPosition)

    const x = this.clickOffset.x - (delta.x * this.width)
    const y = this.clickOffset.y - (delta.y * this.height)

    this.offset = new Point(x, y)
    this.calcViewBox()

    console.debug("[canvas]: mousemove", delta)
  }

  onResize() {
    console.debug("[canvas]: resize")
    this.calcViewBox()
  }

  onScroll(event: WheelEvent) {
    this.scale = this.scale + (event.deltaY * this.scale * 0.02)
    this.calcViewBox()

    console.debug("[canvas]: scroll", this.scale)
  }

  setBackground(item: CanvasItem) {
    const g = document.createElementNS(svgns, 'g')

    for (let e in item.elements) {
      g.appendChild(item.elements[e])
    }

    this.background = g
    this.canvas.appendChild(g)
  }

  addItem(item: CanvasItem) {
    const g = document.createElementNS(svgns, 'g')

    for (let e in item.elements) {
      g.appendChild(item.elements[e])
    }

    this.canvas.appendChild(g)
  }
}