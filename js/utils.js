const Point = require('./point')

module.exports = {
  randomColour: () => {
    let r = Math.floor(Math.random() * 256)
    let g = Math.floor(Math.random() * 256)
    let b = Math.floor(Math.random() * 256)
    return [r,g,b]
  },
  snapToGrid: (_point, _spacing) => {
    return new Point(
      Math.round(_point.x / _spacing) * _spacing,
      Math.round(_point.y / _spacing) * _spacing
    )
  }
}