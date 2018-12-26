const Mindrawing = require('mindrawingjs')
const Vehicle = require('./vehicle')
const Road = require('./road')
const Point = require('./point')
let myApp = angular.module('myApp', [])
const Settings = require('./settings')
const Routing = require('./routing')
const Savefiles = require('./savefiles')

let lastMouse = {
  x: -1,
  y: -1
}

myApp.controller('display', ['$scope', '$interval', function($s, $interval) {
  document.onmousemove = (event) => {
    lastMouse.x = event.pageX
    lastMouse.y = event.pageY
  }

  $s.settings = {
    showGrid: false,
    numLanes: 2,
    showRouting: true,
    vehTime: 50
  }

  $s.tool = {
    type: 'road',
    begin: false,
    pos1: new Point(),
    pos2: new Point()
  }

  Savefiles.init()

  $s.cars = []
  $s.roads = []
  
  $s.d = new Mindrawing()
  $s.d.setup('display')
  let rect = $s.d.c.parentNode.getBoundingClientRect()
  $s.d.setCanvasSize(rect.width, rect.height)
  $s.d.background('black')

  $s.d.c.addEventListener('mouseup', (e) => {
    if ($s.tool.type == 'road') {
      if (Routing.getAll().length >= 2) {
        let closest = Routing.getClosest(new Point(lastMouse.x, lastMouse.y))
        if (!$s.tool.begin) $s.tool.pos1 = closest
        else {
          $s.tool.pos2 = closest
          $s.roads.push(new Road($s.tool.pos1.pos, $s.tool.pos2.pos, $s.settings.numLanes))

          let type1 = $s.tool.pos1.__proto__.constructor.name
          let type2 = $s.tool.pos2.__proto__.constructor.name
          if ((type1 == 'VehicleSource' || type1 == 'Intersection') && (type2 == 'VehicleSink' || type2 == 'Intersection')) $s.tool.pos1.children.push($s.tool.pos2.uid)
          if ((type2 == 'VehicleSource' || type2 == 'Intersection') && (type1 == 'VehicleSink' || type1 == 'Intersection')) $s.tool.pos2.children.push($s.tool.pos1.uid)
        }
        $s.tool.begin = !$s.tool.begin
      } else console.log('Not enough routing objs')
    } else if ($s.tool.type == 'vehicleSource') {
      new Routing.VehicleSource(e.x, e.y, $s.settings.vehTime, $s.cars)
    } else if ($s.tool.type == 'vehicleSink') {
      new Routing.VehicleSink(e.x, e.y)
    } else if ($s.tool.type == 'intersection') {
      new Routing.Intersection(e.x, e.y)
    }
  })
  
  $interval(() => {
    $s.cars.forEach(car => {
      car.tick()
    })
    for (let i = 0; i < $s.cars.length; i++) {
      if ($s.cars[i].finished()) $s.cars.splice(i, 1)
    }
    
    $s.d.background('green')

    if ($s.settings.showGrid) {
      $s.d.stroke('white')
      $s.d.strokeWeight(1)      
      for (let i = 0; i < $s.d.width; i += Settings.GRID_SIZE) {
        $s.d.line(i, 0, i, $s.d.height)
      }
      for (let i = 0; i < $s.d.height; i += Settings.GRID_SIZE) {
        $s.d.line(0, i, $s.d.height, i)
      }
    }
    
    $s.roads.forEach(road => {
      road.draw($s.d)
    })
    if ($s.settings.showRouting) {
      Routing.getAll().forEach(ro => {
        // draw each ro
        ro.draw($s.d)
      })

      let closest = Routing.getClosest(new Point(lastMouse.x, lastMouse.y))
      if (closest) closest.drawHighlight($s.d)
    }
    $s.cars.forEach(car => {
      car.draw($s.d)
    })

    if ($s.tool.begin) $s.d.line($s.tool.pos1.x, $s.tool.pos1.y, lastMouse.x, lastMouse.y)
  }, 1/ 30)

  $s.save = () => {
    Savefiles.save('test.json', $s.roads, Routing.getAll())
  }

  $s.load = () => {
    // delete all routing objs else vehicle sources still generate
    Routing.getAll().forEach(robj => robj.delete())
    Savefiles.load('test.json', (_roads, _robjs, _vehicles) => {
      $s.cars = _vehicles
      console.log('Loaded')
      $s.roads = _roads
      Routing.setAll(_robjs)
    })
  }
}])