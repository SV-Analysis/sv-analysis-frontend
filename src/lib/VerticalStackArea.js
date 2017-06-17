/**
 * Created by qshen on 15/6/2017.
 */
import * as d3 from "d3"

let VerticalAreaChart = function(el, data,width, height, colorMap){
  this.el = el;
  this.data = data;
  this.container = d3.select(el).append('g').attr('class', 'container')
  this.width = width;
  this.height = height;
  this.colorMap = colorMap;
  this.initScale();
  this.renderAreaChart();
};

VerticalAreaChart.prototype.initScale = function(){
  let minValue = d3.min(this.data, function(layer) {
    return d3.min(layer, function(d) {
      return d.range[0];
    });
  });
  let maxValue = d3.max(this.data, function(layer) {
    return d3.max(layer, function(d){
      return d.range[1]
    })
  });

  let xScale = d3.scaleLinear()
    .domain([minValue, maxValue])
    .range([0, this.width]);
  let yScale = d3.scaleLinear()
    .domain([0, this.data[0].length])
    .range([0, this.height]);

  this.area = d3.area()
    .y(function(d,i) {
      return yScale(d['index'] == undefined? i: d['index']);
    })
    .x0(function(d) { return xScale(d.range[0]); })
    .x1(function(d) { return xScale(d.range[1]); });
};

VerticalAreaChart.prototype.renderAreaChart = function(){
  let _this = this;
  this.areaContainer = this.container.append('g').attr('class', 'areaContainer')
  this.areaContainer.selectAll("path")
    .data(this.data)
    .enter().append("path")
    .attr("d", this.area)
    .style("fill", function(d, i) {
      return _this.colorMap[d[0].attr];
    })
    .attr('opacity', 0.6)
};

export default VerticalAreaChart
