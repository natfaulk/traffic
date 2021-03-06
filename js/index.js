const Mindrawing = require('mindrawingjs')
const Road = require('./road')
const Point = require('./point')
const Settings = require('./settings')
const Routing = require('./routing')
const Savefiles = require('./savefiles')
const Utils = require('./utils')

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

  $s.settings = {
    showGrid: false,
    gridSnap: true,
    numLanes: 1,
    showRouting: true,
    showWaypoints: false,
    vehTime: Settings.DEFAULT_VEHICLE_INTERVAL,
    intRad: 1.5,
    intSpac: 1,
    intIsTrafficLight: true
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
  let intersections = []
  
  $s.d = new Mindrawing()
  $s.d.setup('display')
  let rect = $s.d.c.parentNode.getBoundingClientRect()
  $s.d.setCanvasSize(rect.width, rect.height)
  $s.d.background('black')

  $s.d.c.addEventListener('mouseup', (e) => {
    let e2
    if ($s.settings.gridSnap) e2 = Utils.snapToGrid(e, Settings.GRID_SIZE)
    else e2 = e
    if ($s.tool.type == 'road') {
      if (Routing.getAll().length >= 2) {
        let closest = Routing.getClosest(new Point(lastMouse.x, lastMouse.y))
        if (!$s.tool.begin) $s.tool.pos1 = closest
        else {
          $s.tool.pos2 = closest
          $s.roads.push(new Road($s.tool.pos1.pos, $s.tool.pos2.pos, $s.settings.numLanes))

          let type1 = $s.tool.pos1.__proto__.constructor.name
          let type2 = $s.tool.pos2.__proto__.constructor.name
          if ((type1 == 'VehicleSource' || type1 == 'IntersectionNode') && (type2 == 'VehicleSink' || type2 == 'IntersectionNode')) $s.tool.pos1.children.push($s.tool.pos2.uid)
        }
        $s.tool.begin = !$s.tool.begin
      } else console.log('Not enough routing objs')
    } else if ($s.tool.type == 'vehicleSource') {
      new Routing.VehicleSource(e2.x, e2.y, {interval: $s.settings.vehTime, vehicles: $s.cars})
    } else if ($s.tool.type == 'vehicleSink') {
      new Routing.VehicleSink(e2.x, e2.y)
    } else if ($s.tool.type == 'intersection') {
      new Routing.IntersectionNode(e2.x, e2.y, {trafficLight: $s.settings.intIsTrafficLight})
    } else if ($s.tool.type == 'intersection4_1') {
      intersections.push(new Routing.Intersection4_1(e2.x, e2.y, $s.settings.intRad, $s.settings.intSpac))
    } else if ($s.tool.type == 'inspect') {
      console.log(Routing.getClosest(new Point(lastMouse.x, lastMouse.y)))
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
        $s.d.line(0, i, $s.d.width, i)
      }
    }
    
    $s.roads.forEach(road => {
      road.draw($s.d, $s.settings.showRouting)
    })
    intersections.forEach(i => {
      i.draw($s.d)
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
      car.draw($s.d, $s.settings.showWaypoints)
    })

    if ($s.tool.begin) $s.d.line($s.tool.pos1.x, $s.tool.pos1.y, lastMouse.x, lastMouse.y)
  }, 1/ 30)

  $s.save = () => {
    Savefiles.save('test.json', $s.roads, Routing.getAll(), intersections)
  }

  $s.load = () => {
    // delete all routing objs else vehicle sources still generate
    Routing.getAll().forEach(robj => robj.delete())
    // vehicles is returned because a new vehicles object is passed into the loaded vehicle sources
    // this then needs to be linked back to $s.cars
    Savefiles.load('test.json', (_roads, _robjs, _ints, _vehicles) => {
      $s.cars = _vehicles
      console.log('Loaded')
      $s.roads = _roads
      intersections = _ints
      Routing.setAll(_robjs)
    })
  }
}])