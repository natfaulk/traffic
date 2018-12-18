const Point = require('./point')

module.exports = class Vehicle {
  constructor(_x = 0, _y = 0) {
    this.pos = new Point(_x, _y)
    this.size = new Point(10, 5)
    
    this.MAX_SPEED = 1.5
  }

  draw(_d) {
    _d.fill('red')
    _d.rect(this.pos.x + 0.5, this.pos.y + 0.5, this.size.x, this.size.y)
    if (this.dest !== undefined) {
      _d.fill('green')
      _d.ellipse(this.dest.x, this.dest.y, 5)
    }
  }

  setDest(_x, _y) {
    this.dest = {x:_x,y:_y}
  }

  tick() {
    if (this.dest !== undefined) {
      let a = Point.angle(this.dest, this.pos)
      let d = Point.distance(this.pos, this.dest)
      if (d > this.MAX_SPEED) d = this.MAX_SPEED
      let t = new Point()
      t.setFromPolar(a, d)
      this.pos.add(t)
    }
  }
}