import { svgns } from "./constants";

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

class ViewBox {
  xMin: number
  yMin: number
  width: number
  height: number

  constructor(xMin: number, yMin: number, width: number, height: number) {
    this.xMin = xMin
    this.yMin = yMin
    this.width = width
    this.height = height
  }

  toString(): string {
    return `${this.xMin} ${this.yMin} ${this.width} ${this.height}`
  }
}


export interface CanvasItem {
  elements: SVGElement[]
}

function makeTouchGuide(touch: Touch): SVGElement {
  const guide = document.createElementNS(svgns, 'circle');
  guide.setAttribute("class", "debug")
  guide.setAttribute("id", "touch-" + touch.identifier)
  guide.setAttribute("r", "10")

  return guide;
}

export class Canvas {

  offset: Point
  scale: number
  viewBox: ViewBox

  clickOffset: Point
  clickPosition: Point
  currentTouches: Touch[]

  canvas: SVGElement
  background?: SVGElement

  constructor(root: HTMLElement, scale: number) {
    this.canvas = document.createElementNS(svgns, "svg")

    this.offset = new Point(0, 0)
    this.clickPosition = new Point(0, 0)
    this.clickOffset = new Point(0, 0)
    this.currentTouches = [];

    this.scale = scale
    this.viewBox = new ViewBox(0, 0, scale, scale)

    // Mouse support
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false)
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false)
    this.canvas.addEventListener('wheel', this.onScroll.bind(this), false)

    // Touchscreen support
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), false)
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), false)
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this), false)

    // Other events
    this.canvas.addEventListener('resize', this.onResize.bind(this), false)

    root.appendChild(this.canvas)
    this.calcViewBox()
  }

  calcViewBox() {
    const bbox = this.canvas.getBoundingClientRect()
    const aspectRatio = bbox.width / bbox.height

    const height = this.scale
    const width = aspectRatio * height

    const xMin = this.offset.x - (width / 2)
    const yMin = this.offset.y - (height / 2)

    this.viewBox = new ViewBox(xMin, yMin, width, height)
    this.canvas.setAttribute("viewBox", this.viewBox.toString())
  }

  getMousePosition(event: MouseEvent | Touch): Point {
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

    console.debug("[canvas]: mousedown", this.clickPosition)
  }

  onMouseMove(event: MouseEvent) {
    if (event.buttons !== 1) {
      return
    }

    const mousePos = this.getMousePosition(event)
    const delta = mousePos.minus(this.clickPosition)

    const x = this.clickOffset.x - (delta.x * this.viewBox.width)
    const y = this.clickOffset.y - (delta.y * this.viewBox.height)

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

  onTouchStart(event: TouchEvent) {
    event.preventDefault()

    // Assume a single touch for now
    const touch = event.changedTouches[0]
    this.clickOffset = new Point(this.offset.x, this.offset.y)
    this.clickPosition = this.getMousePosition(touch)

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const pos = this.getMousePosition(touch)

      const x = this.viewBox.xMin + (pos.x * this.viewBox.width)
      const y = this.viewBox.yMin + (pos.y * this.viewBox.height)

      const guide = makeTouchGuide(touch)
      guide.setAttribute("cx", x.toString())
      guide.setAttribute("cy", y.toString())

      this.canvas.appendChild(guide)
    }

    console.debug("[canvas]: touchstart", this.clickPosition)
  }

  onTouchMove(event: TouchEvent) {
    event.preventDefault()

    // Assume a single touch for now
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      const pos = this.getMousePosition(touch)

      const x = this.viewBox.xMin + (pos.x * this.viewBox.width)
      const y = this.viewBox.yMin + (pos.y * this.viewBox.height)

      const guide = document.getElementById("touch-" + touch.identifier)

      if (guide !== null) {
        guide.setAttribute("cx", x.toString())
        guide.setAttribute("cy", y.toString())
      }
    }

    /*
    const touchPos = this.getMousePosition(touch)
    const delta = touchPos.minus(this.clickPosition)

    const x = this.clickOffset.x - (delta.x * this.viewBox.width)
    const y = this.clickOffset.y - (delta.y * this.viewBox.height)

    this.offset = new Point(x, y)
    this.calcViewBox()

    */

    console.debug("[canvas]: touchmove")
  }

  onTouchEnd(event: TouchEvent) {
    event.preventDefault()
    console.debug("[canvas]: touchend")

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const guide = document.getElementById("touch-" + touch.identifier)

      if (guide !== null) {
        this.canvas.removeChild(guide)
      }
    }
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