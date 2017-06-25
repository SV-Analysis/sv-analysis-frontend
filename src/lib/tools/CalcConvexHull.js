/**
 * Created by qshen on 21/6/2017.
 */
//Need vector
import * as d3 from "d3";
import Vector from "../../../src/lib/tools/Vector";

var ON = 0;
var LEFT = 1;
var RIGHT = 2;
var ALMOST_ZERO = 0;

function GetSideOfLine(lineStart, lineEnd, point) {
  var d = (lineEnd.x-lineStart.x)*(point.y-lineStart.y)-(lineEnd.y-lineStart.y)*(point.x-lineStart.x);
  return (d > ALMOST_ZERO ? LEFT : (d < -ALMOST_ZERO ? RIGHT : ON));
}

// returns convex hull in CW order
// (required by Rotating Calipers implementation)
function CalcConvexHull(points, func)
{
  // bad input?
  func = func == undefined ? function(d){return d}: func;

  if (points.length < 3)
    return points;

  // find first hull point
  var hullPt = func(points[0]);
  var convexHull = [];

  for (var i=1; i<points.length; i++)
  {
    // perform lexicographical compare
    if (func(points[i]).x < hullPt.x)
      hullPt = func(points[i]);
    else if (Math.abs(func(points[i]).x-hullPt.x) < ALMOST_ZERO) // equal
      if (func(points[i]).y < hullPt.y)
        hullPt = func(points[i]);
  }

  // find remaining hull points
  do
  {
    convexHull.unshift(hullPt.clone());
    var endPt = func(points[0]);

    for (var j=1; j<points.length; j++)
    {
      var side = GetSideOfLine(hullPt, endPt, func(points[j]));

      // in case point lies on line take the one further away.
      // this fixes the collinearity problem.
      if (endPt.equals(hullPt) || (side == LEFT || (side == ON && hullPt.distance(func(points[j])) > hullPt.distance(endPt))))
        endPt = func(points[j]);
    }

    hullPt = endPt;
  }
  while (!endPt.equals(convexHull[convexHull.length-1]));

  return convexHull;
}


export default CalcConvexHull
