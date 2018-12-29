const Vehicle = require('./vehicle')
const Point = require('./point')
const Settings = require('./settings')
const Utils = require('./utils')

let uid = 0
let routableObjs = []

const DRAW_SIZE = Settings.GRID_SIZE - 4

class Routable{
  constructor(_x, _y) {
    this.pos = new Point(_x, _y)
    this.children = []
    this.uid = uid++
    routableObjs.push(this)
  }

  delete() {}

  drawHighlight(_d) {
    _d.stroke('red')
    _d.fill('rgba(0,0,0,0)')
    _d.ellipse(this.pos.x, this.pos.y, 50)
  }
}

let getByUid = _uid => {
  let out = undefined
  routableObjs.forEach(obj => {
    if (obj.uid == _uid) out = obj
  })
  if (out == undefined) console.log('passed invalid uid')
  return out
}

let IntersectionNode = class extends Routable {
  constructor(_x = 0, _y = 0) {
    super(_x, _y)
  }

  draw(_d) {
    _d.fill('red')
    _d.ellipse(this.pos.x, this.pos.y, DRAW_SIZE)
  }
}

module.exports = {
  setAll: (_all) => {
    routableObjs = _all
  },
  getAll: () => {return routableObjs},
  getByUid: getByUid,
  getClosest: (_obj) => {
    let min = undefined
    let minDist = undefined
    routableObjs.forEach(ro => {
      let dist = Point.distance(ro.pos, _obj)
      if (min) {
        if (dist < minDist) {
          min = ro
          minDist = dist
        }
      } else {
        min = ro
        minDist = dist
      }
    })
    return min
  },
  setUID: (_uid) => {
    uid = _uid
  },
  VehicleSource: class extends Routable {
    constructor(_x = 0, _y = 0, _interval = 0, _vehicles = []) {
      super(_x, _y)
      this.intervalTime = _interval
      if (_interval > 0) this.interval = setInterval(() => {
        if (this.children.length > 0) {
          let tempVeh = new Vehicle(this.pos.x, this.pos.y)
          let currentNode = this
          let timeout = 0
          while (timeout < Settings.MAX_WAYPOINTS) {
            let index = Math.floor(Math.random() * currentNode.children.length)
            let childNode = getByUid(currentNode.children[index])
            tempVeh.addWaypoint(childNode.pos)
            currentNode = childNode
            timeout++
            if (currentNode.children.length <= 0) break
            // console.log(currentNode)
          }
          _vehicles.push(tempVeh)
        }
      }, _interval)
    }

    draw(_d) {
      _d.fill('blue')
      _d.rect(this.pos.x - DRAW_SIZE / 2, this.pos.y - DRAW_SIZE / 2, DRAW_SIZE, DRAW_SIZE)
    }

    delete() {
      clearInterval(this.interval)
    }
  },

  VehicleSink: class extends Routable {
    constructor(_x = 0, _y = 0) {
      super(_x, _y)
    }

    draw(_d) {
      _d.fill('blue')
      _d.ellipse(this.pos.x, this.pos.y, DRAW_SIZE)
    }
  },

  IntersectionNode: IntersectionNode,

  Intersection4_1: class {
    constructor(_x = 0, _y = 0, _spacing = 2, _nodes = []) {
      this.pos = Utils.snapToGrid(new Point(_x, _y), Settings.GRID_SIZE)
      
      if (_nodes.length == 0) {
        let u = Settings.GRID_SIZE
        let oset = _spacing
        let tl = new IntersectionNode(this.pos.x - u, this.pos.y - oset * u)
        let tr = new IntersectionNode(this.pos.x + u, this.pos.y - oset * u)
        let rt = new IntersectionNode(this.pos.x + oset * u, this.pos.y - u)
        let rb = new IntersectionNode(this.pos.x + oset * u, this.pos.y + u)
        let br = new IntersectionNode(this.pos.x + u, this.pos.y + oset * u)
        let bl = new IntersectionNode(this.pos.x - u, this.pos.y + oset * u)
        let lb = new IntersectionNode(this.pos.x - oset * u, this.pos.y + u)
        let lt = new IntersectionNode(this.pos.x - oset * u, this.pos.y - u)
        this.nodes = [tl.uid, tr.uid, rt.uid, rb.uid, br.uid, bl.uid, lb.uid, lt.uid]
        this.spacing = oset

        tr.children = [rt.uid, br.uid, lb.uid]
        bl.children = [rt.uid, tl.uid, lb.uid]
        lt.children = [rt.uid, br.uid, tl.uid]
        rb.children = [lb.uid, tl.uid, br.uid]
      } else {
        this.nodes = _nodes
        this.spacing = _spacing
      }
    }

    draw(_d) {
      _d.fill('black')
      _d.stroke('black')
      let t = this.spacing * Settings.GRID_SIZE
      _d.rect(this.pos.x - t, this.pos.y - t, t * 2, t * 2)
    }
  }
}