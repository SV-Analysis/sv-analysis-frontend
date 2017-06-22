/**
 * Created by qshen on 21/6/2017.
 */
import * as d3 from "d3";
import Vector from "../../src/lib/tools/Vector";
import {Verticalize} from "../../src/lib/tools/Verticalize";

let VerticalPolyline = function(el, data, width, height, colorMap){
  this.el = el;
  this.data = data;
  this.height = height == undefined? el.clientHeight: height;
  this.width = width == undefined? el.clientWidth: width;
  this.container = d3.select(el).append('g').attr('class', 'lineContainer')
  this.processData()
};

VerticalPolyline.prototype.draw = function(){

};

VerticalPolyline.prototype.processData = function(){

  this.data.forEach(d=>{
    d.renderLocation = new Vector(d.location[1], d.location[0]);
  });

  let verticalResult = Verticalize(this.data, function(d){
    return d.renderLocation;
  });

  let resultPoints = verticalResult['points'];
  let boundary = verticalResult['ombb'];
  let whRatio = verticalResult.width / verticalResult.height;

  let scaleWidth = this.height * whRatio;
  let scaleHeight = this.height;

  let xScale = d3.scaleLinear().domain([0, verticalResult.width]).range([(this.width - scaleWidth) / 2, (this.width + scaleWidth) / 2]);
  let yScale = d3.scaleLinear().domain([0, verticalResult.height]).range([0, scaleHeight]);

  let scalePoints = [];

  resultPoints.forEach(function(point){
    let x = xScale(point.x);
    let y = yScale(point.y);
    scalePoints.push(new Vector(x, y));
  });

  this.data.forEach((d, i)=>{
    let p = resultPoints[i];
    let x = xScale(p.x);
    let y = yScale(p.y);
    d.scalePoint = new Vector(x, y);
  });
  this.container.selectAll('.scalePoint')
    .data(this.data).enter().append('circle').attr('class', 'scalePoint')
    .attr('cx', (d)=>{ return d.scalePoint.x;})
    .attr('cy', (d)=>{ return d.scalePoint.y;})
    .attr('r', 1)
    .attr('fill', 'red');

  let line = d3.line()
    .x(function(d) { return d.scalePoint.x; })
    .y(function(d) { return d.scalePoint.y; });

  this.container.append('path').attr('class', 'imageLine')
    .datum(this.data)
    .attr("class", "line")
    .attr("d", line)
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-width', 2)
    .attr('opacity', 0.8)
};
export default VerticalPolyline
