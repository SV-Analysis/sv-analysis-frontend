/**
 * Created by qshen on 21/6/2017.
 */
import CalcConvexHull from "../../../src/lib/tools/CalcConvexHull";
import CalcOmbb from "../../../src/lib/tools/CalcOmbb";
import * as d3 from "d3";

function Verticalize(points, func){

  let converx = CalcConvexHull(points, func);

  let ombb = CalcOmbb(converx);

  let result = VerticalProcess(ombb);
  let o = result.o;
  let angle = result.angle;
  let rotatePoints = [];

  points.forEach(function(d){
    rotatePoints.push(func(d).rotate(o, -1 * angle));
  })

  let ombbBoundary = [];
  ombb.forEach(function(d){
    ombbBoundary.push(d.rotate(o ,-1 * angle));
  });

  let minx = d3.min(rotatePoints, function(d){
    return d.x;
  });

  let miny = d3.min(rotatePoints, function(d){
    return d.y;
  });

  rotatePoints.concat(ombbBoundary).forEach(function(point){
    point.x -= minx;
    point.y -= miny;
  })

  return {
    points: rotatePoints,
    ombb: ombbBoundary,
    width: result.width,
    height: result.height
  };
}


function VerticalProcess(data){
  // data must have four elements
  let l1 = data[0].distance(data[1]);
  let l2 = data[1].distance(data[2]);
  let o = null;
  let d = null;
  let width;
  let height;
  if(l1 > l2){
    o = data[1];
    d = data[2];
    width = l2;
    height = l1;
  }else{
    o = data[0];
    d = data[1];
    width = l1;
    height = l2;
  }
  var angleRadians = Math.atan2(d.y - o.y, d.x - o.x);

  return {
    'angle': angleRadians / Math.PI * 180,
    'o': o,
    'd': d,
    'width': width,
    'height': height
  }
}

export {
  Verticalize,
  VerticalProcess
}
