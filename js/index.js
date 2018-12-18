const Mindrawing = require('mindrawingjs')
const Vehicle = require('./vehicle')
let myApp = angular.module('myApp', [])

let lastMouse = {
  x: -1,
  y: -1
}

myApp.controller('display', ['$scope', '$interval', function($s, $interval) {
  document.onmousemove = (event) => {
    lastMouse.x = event.pageX
    lastMouse.y = event.pageY
  }
  
  $s.d = new Mindrawing()
  $s.d.setup('display')
  let rect = $s.d.c.parentNode.getBoundingClientRect()
  $s.d.setCanvasSize(rect.width, rect.height)
  $s.d.background('black')

  $s.car = new Vehicle($s.d.width / 2, $s.d.height / 2)

  // $s.d.fill('red')
  // $s.d.rect(0, $s.d.height - 10, $s.d.width, 10)

  $interval(() => {
    $s.car.tick()
    $s.car.setDest(lastMouse.x, lastMouse.y)

    $s.d.background('black')
    // $s.car.pos.x++
    // if ($s.car.pos.x >= $s.d.width - $s.car.size.x) $s.car.pos.x = 0

    // $s.d.fill('red')
    $s.car.draw($s.d)
    // $s.d.ellipse(lastMouse.x, lastMouse.y, 5)

  }, 1/ 30)
}])