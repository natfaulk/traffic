const Point = require('./point')
const Settings = require('./settings')
const Utils = require('./utils')

let allVehicles = []

module.exports = class Vehicle {
  constructor(_x = 0, _y = 0) {
    this.pos = new Point(_x, _y)
    this.angle = 0
    this.size = new Point(Settings.CAR_LENGTH, Settings.CAR_WIDTH)
    this.waypoints = []
    this.color = Utils.randomColour()
    allVehicles.push(this)
  }

  draw(_d, _routing = false) {
    _d.strokeWeight(1)
    _d.stroke('black')
    _d.fill(`rgb(${this.color[0]},${this.color[1]},${this.color[2]})`)
    _d.rotatedRect(this.pos.x, this.pos.y, this.size.x, this.size.y, this.angle, this.size.x, this.size.y / 2)
    if (_routing && this.waypoints.length > 0) {
      _d.fill('green')
      _d.ellipse(this.waypoints[0].pos.x, this.waypoints[0].pos.y, 5)
    }
  }

  addWaypoint(_p) {
    this.waypoints.push(_p)
  }

  tick() {
    if (this.waypoints.length > 0) {
      let dest = this.waypoints[0].pos
      let d = Point.distance(this.pos, dest)
      if (d > Settings.DEST_THRESHOLD) {
        let a = Point.angle(dest, this.pos)
        if (d > Settings.MAX_SPEED) d = Settings.MAX_SPEED
        let t = new Point()
        t.setFromPolar(a, d)

        let savePos = this.pos.copy()
        let saveAng = this.angle
        this.pos.add(t)
        this.angle = a

        allVehicles.forEach(_veh => {
          if (_veh != this && this.checkCollision(_veh)) {
            this.pos = savePos
            this.angle = saveAng
          }
        })

      } else {
        let tempTL = this.waypoints[0].trafficLight
        if (tempTL === undefined || (tempTL !== undefined && tempTL == 'g')) {
          this.waypoints.shift()
          this.tick()
        } 
        // else {
        //   while (this.waypoints.length > 0) this.waypoints.shift()
        // }
      }
    }
  }

  finished() {
    return this.waypoints.length == 0
  }

  // returns coordinates of the corners
  getCorners() {
    let out = []
    // top right
    let t = new Point()
    t.setFromPolar(this.angle - Math.PI / 2, this.size.y / 2)
    t.add(this.pos)
    out.push(t)
    
    // bottom right
    t = new Point()
    t.setFromPolar(this.angle + Math.PI / 2, this.size.y / 2)
    t.add(this.pos)
    out.push(t)

    let t2 = new Point()
    t2.setFromPolar(this.angle, -this.size.x)

    // top left
    t = new Point()
    t.setFromPolar(this.angle - Math.PI / 2, this.size.y / 2)    
    t.add(this.pos)
    t.add(t2)
    out.push(t)

    // bottom left
    t = new Point()
    t.setFromPolar(this.angle + Math.PI / 2, this.size.y / 2)    
    t.add(this.pos)
    t.add(t2)
    out.push(t)

    return out
  }

  checkCollision(_car) {
    return Point.distance(this.pos, _car.pos) < 1.5 * Settings.CAR_LENGTH
  }

  static getAll() {
    return allVehicles
  }

  static clearAll() {
    allVehicles = []
  }

  // remove all vehicles with no waypoints left
  static removeDead() {
    for (let i = 0; i < allVehicles.length; i++) {
      if (allVehicles[i].finished()) allVehicles.splice(i, 1)
    }
  }
}