'use strict';
/*
*  Copyright (C) 1998-2023 by Northwoods Software Corporation. All Rights Reserved.
*/

// This file holds the definitions of several useful figures with rounded corners but straight sides:
// "RoundedTopRectangle", "RoundedBottomRectangle", "RoundedLeftRectangle", "RoundedRightRectangle",
// "CapsuleH", and "CapsuleV".
// The basic "RoundedRectangle" (corners on all four sides) is built into the GoJS library --
// you can see its definition in Figures.js.
// Two of these are demonstrated at ../samples/twoHalves.html and ../samples/roundedGroups.html.

go.Shape.defineFigureGenerator("RoundedTopRectangle", function (shape, w, h) {
  // this figure takes one parameter, the size of the corner
  var p1 = 5;  // default corner size
  if (shape !== null) {
    var param1 = shape.parameter1;
    if (!isNaN(param1) && param1 >= 0) p1 = param1;  // can't be negative or NaN
  }
  p1 = Math.min(p1, w/3);  // limit by width & height
  p1 = Math.min(p1, h);
  var geo = new go.Geometry();
  // a single figure consisting of straight lines and quarter-circle arcs
  geo.add(new go.PathFigure(0, p1)
    .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, p1, p1, p1, p1))
    .add(new go.PathSegment(go.PathSegment.Line, w - p1, 0))
    .add(new go.PathSegment(go.PathSegment.Arc, 270, 90, w - p1, p1, p1, p1))
    .add(new go.PathSegment(go.PathSegment.Line, w, h))
    .add(new go.PathSegment(go.PathSegment.Line, 0, h).close()));
  // don't intersect with two top corners when used in an "Auto" Panel
  geo.spot1 = new go.Spot(0, 0, 0.3 * p1, 0.3 * p1);
  geo.spot2 = new go.Spot(1, 1, -0.3 * p1, 0);
  return geo;
});

go.Shape.defineFigureGenerator("RoundedBottomRectangle", function (shape, w, h) {
  // this figure takes one parameter, the size of the corner
  var p1 = 5;  // default corner size
  if (shape !== null) {
    var param1 = shape.parameter1;
    if (!isNaN(param1) && param1 >= 0) p1 = param1;  // can't be negative or NaN
  }
  p1 = Math.min(p1, w/3);  // limit by width & height
  p1 = Math.min(p1, h);
  var geo = new go.Geometry();
  // a single figure consisting of straight lines and quarter-circle arcs
  geo.add(new go.PathFigure(0, 0)
    .add(new go.PathSegment(go.PathSegment.Line, w, 0))
    .add(new go.PathSegment(go.PathSegment.Line, w, h - p1))
    .add(new go.PathSegment(go.PathSegment.Arc, 0, 90, w - p1, h - p1, p1, p1))
    .add(new go.PathSegment(go.PathSegment.Line, p1, h))
    .add(new go.PathSegment(go.PathSegment.Arc, 90, 90, p1, h - p1, p1, p1).close()));
  // don't intersect with two bottom corners when used in an "Auto" Panel
  geo.spot1 = new go.Spot(0, 0, 0.3 * p1, 0);
  geo.spot2 = new go.Spot(1, 1, -0.3 * p1, -0.3 * p1);
  return geo;
});

go.Shape.defineFigureGenerator("RoundedLeftRectangle", function (shape, w, h) {
  // this figure takes one parameter, the size of the corner
  var p1 = 5;  // default corner size
  if (shape !== null) {
    var param1 = shape.parameter1;
    if (!isNaN(param1) && param1 >= 0) p1 = param1;  // can't be negative or NaN
  }
  p1 = Math.min(p1, w);  // limit by width & height
  p1 = Math.min(p1, h/3);
  var geo = new go.Geometry();
  // a single figure consisting of straight lines and quarter-circle arcs
  geo.add(new go.PathFigure(w, 0)
    .add(new go.PathSegment(go.PathSegment.Line, w, h))
    .add(new go.PathSegment(go.PathSegment.Line, p1, h))
    .add(new go.PathSegment(go.PathSegment.Arc, 90, 90, p1, h - p1, p1, p1))
    .add(new go.PathSegment(go.PathSegment.Line, 0, p1))
    .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, p1, p1, p1, p1).close()));
  // don't intersect with two top corners when used in an "Auto" Panel
  geo.spot1 = new go.Spot(0, 0, 0.3 * p1, 0.3 * p1);
  geo.spot2 = new go.Spot(1, 1, -0.3 * p1, 0);
  return geo;
});

go.Shape.defineFigureGenerator("RoundedRightRectangle", function (shape, w, h) {
  // this figure takes one parameter, the size of the corner
  var p1 = 5;  // default corner size
  if (shape !== null) {
    var param1 = shape.parameter1;
    if (!isNaN(param1) && param1 >= 0) p1 = param1;  // can't be negative or NaN
  }
  p1 = Math.min(p1, w);  // limit by width & height
  p1 = Math.min(p1, h/3);
  var geo = new go.Geometry();
  // a single figure consisting of straight lines and quarter-circle arcs
  geo.add(new go.PathFigure(0, 0)
    .add(new go.PathSegment(go.PathSegment.Line, w - p1, 0))
    .add(new go.PathSegment(go.PathSegment.Arc, 270, 90, w - p1, p1, p1, p1))
    .add(new go.PathSegment(go.PathSegment.Line, w, h - p1))
    .add(new go.PathSegment(go.PathSegment.Arc, 0, 90, w - p1, h - p1, p1, p1))
    .add(new go.PathSegment(go.PathSegment.Line, 0, h).close()));
  // don't intersect with two bottom corners when used in an "Auto" Panel
  geo.spot1 = new go.Spot(0, 0, 0.3 * p1, 0);
  geo.spot2 = new go.Spot(1, 1, -0.3 * p1, -0.3 * p1);
  return geo;
});

// these two figures have rounded ends
go.Shape.defineFigureGenerator("Capsule", function(shape, w, h) {
  var geo = new go.Geometry();
  if (w < h) {
    var fig = new go.PathFigure(w/2, 0, true);
    fig.add(new go.PathSegment(go.PathSegment.Bezier, w/2, h, w, 0, w, h));
    fig.add(new go.PathSegment(go.PathSegment.Bezier, w/2, 0, 0, h, 0, 0));
    geo.add(fig);
    return geo;
  } else {
    var fig = new go.PathFigure(h/2, 0, true);
    geo.add(fig);
    // Outline
    fig.add(new go.PathSegment(go.PathSegment.Line, w-h/2, 0));
    fig.add(new go.PathSegment(go.PathSegment.Arc, 270, 180, w-h/2, h/2, h/2, h/2));
    fig.add(new go.PathSegment(go.PathSegment.Line, w-h/2, h));
    fig.add(new go.PathSegment(go.PathSegment.Arc, 90, 180, h/2, h/2, h/2, h/2));
    return geo;
  }
});
go.Shape.defineFigureGenerator("CapsuleH", "Capsule");  // synonym

go.Shape.defineFigureGenerator("CapsuleV", function(shape, w, h) {
  var geo = new go.Geometry();
  if (h < w) {
    var fig = new go.PathFigure(0, h/2, true);
    fig.add(new go.PathSegment(go.PathSegment.Bezier, w, h/2, 0, h, w, h));
    fig.add(new go.PathSegment(go.PathSegment.Bezier, 0, h/2, w, 0, 0, 0));
    geo.add(fig);
    return geo;
  } else {
    var fig = new go.PathFigure(0, w/2, true);
    geo.add(fig);
    // Outline
    fig.add(new go.PathSegment(go.PathSegment.Arc, 180, 180, w/2, w/2, w/2, w/2));
    fig.add(new go.PathSegment(go.PathSegment.Line, w, h-w/2));
    fig.add(new go.PathSegment(go.PathSegment.Arc, 0, 180, w/2, h-w/2, w/2, w/2));
    fig.add(new go.PathSegment(go.PathSegment.Line, 0, w/2));
    return geo;
  }
});
