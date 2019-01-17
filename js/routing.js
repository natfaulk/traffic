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
  constructor(_x = 0, _y = 0, _settings = {}) {
    super(_x, _y)
    // (r)ed, (y)ellow or (g)reen
    let tempRand = Math.floor(Math.random() * 3)
    if (_settings.trafficLight === true) {
      if (tempRand < 1) this.trafficLight = 'r'
      else if (tempRand < 2) this.trafficLight = 'y'
      else this.trafficLight = 'g'
    } else if (_settings.trafficLight === false) this.trafficLight = undefined
    else this.trafficLight = _settings.trafficLight
  }

  draw(_d) {
    if (this.trafficLight === undefined) _d.fill('white')
    else if (this.trafficLight == 'r') _d.fill('red')
    else if (this.trafficLight == 'y') _d.fill('yellow')
    else if (this.trafficLight == 'g') _d.fill('green')
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
    constructor(_x = 0, _y = 0, _settings = {}) {
      super(_x, _y)
      this.intervalTime = _settings.interval
      if (_settings.interval > 0) this.interval = setInterval(() => {
        if (this.children.length > 0) {
          let tempVeh = new Vehicle(this.pos.x, this.pos.y)
          let currentNode = this
          let timeout = 0
          while (timeout < Settings.MAX_WAYPOINTS) {
            let index = Math.floor(Math.random() * currentNode.children.length)
            let childNode = getByUid(currentNode.children[index])
            tempVeh.addWaypoint(childNode)
            currentNode = childNode
            timeout++
            if (currentNode.children.length <= 0) break
            // console.log(currentNode)
          }
          Vehicle.getAll().push(tempVeh)
        }
      }, _settings.interval)
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
    // radius is the distance each pair of nodes is from the centre
    // spacing is the distance between the pair of nodes
    constructor(_x = 0, _y = 0, _radius = 2, _spacing = 2, _nodes = []) {
      this.pos = Utils.snapToGrid(new Point(_x, _y), Settings.GRID_SIZE)
      // ensure lines up on grid squares
      // if (_spacing % 2 == 1) {
      //   this.pos.x -= 0.5 * Settings.GRID_SIZE
      //   this.pos.y -= 0.5 * Settings.GRID_SIZE
      // }

      if (_nodes.length == 0) {
        let r = Settings.GRID_SIZE * _radius
        let s = Settings.GRID_SIZE * _spacing

        let tl = new IntersectionNode(this.pos.x + (r - s/2), this.pos.y)
        let tr = new IntersectionNode(this.pos.x + (r + s/2), this.pos.y, {trafficLight: true})
        let rt = new IntersectionNode(this.pos.x + 2 * r, this.pos.y + (r - s/2))
        let rb = new IntersectionNode(this.pos.x + 2 * r, this.pos.y + (r + s/2), {trafficLight: true})
        let br = new IntersectionNode(this.pos.x + (r + s/2), this.pos.y + 2 * r)
        let bl = new IntersectionNode(this.pos.x + (r - s/2), this.pos.y + 2 * r, {trafficLight: true})
        let lb = new IntersectionNode(this.pos.x, this.pos.y + (r + s/2))
        let lt = new IntersectionNode(this.pos.x, this.pos.y + (r - s/2), {trafficLight: true})
        this.nodes = [tl.uid, tr.uid, rt.uid, rb.uid, br.uid, bl.uid, lb.uid, lt.uid]

        tr.children = [rt.uid, br.uid, lb.uid]
        bl.children = [rt.uid, tl.uid, lb.uid]
        lt.children = [rt.uid, br.uid, tl.uid]
        rb.children = [lb.uid, tl.uid, br.uid]
      } else {
        this.nodes = _nodes
      }
      this.spacing = _spacing
      this.radius = _radius
    }

    draw(_d) {
      _d.fill('black')
      _d.stroke('black')
      let t = this.radius * Settings.GRID_SIZE
      _d.rect(this.pos.x, this.pos.y, t * 2, t * 2)
    }
  }
}