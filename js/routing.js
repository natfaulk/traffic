const Vehicle = require('./vehicle')
const Point = require('./point')
const Settings = require('./settings')

let uid = 0
let routableObjs = []

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
      _d.ellipse(this.pos.x, this.pos.y, 20)
      _d.fill('red')
      _d.rect(this.pos.x - 5, this.pos.y - 5, 10, 10)
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
      _d.ellipse(this.pos.x, this.pos.y, 20)
    }
  },

  Intersection: class extends Routable {
    constructor(_x = 0, _y = 0) {
      super(_x, _y)
    }

    draw(_d) {
      _d.fill('red')
      _d.ellipse(this.pos.x, this.pos.y, 20)
    }
  }
}