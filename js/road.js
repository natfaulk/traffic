const Settings = require('./settings')

module.exports = class Road {
  constructor(_start, _finish) {
    this.start = _start
    this.finish = _finish
  }

  draw(_d) {
    _d.stroke('black')
    _d.strokeWeight(Settings.ROAD_WIDTH)
    _d.line(this.start.x, this.start.y, this.finish.x, this.finish.y)
    _d.strokeWeight(2)
    _d.stroke('white')
    _d.line(this.start.x, this.start.y, this.finish.x, this.finish.y)
  }
}