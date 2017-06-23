/**
 * Created by qshen on 15/6/2017.
 */
import * as d3 from "d3";

let VerticalAreaChart = function(el, data, margin, colorMap){
  this.el = el;
  this.colorMap = colorMap;

  this.container = d3.select(el).append('g').attr('class', 'container')
  this.width = margin.width;
  this.height = margin.height;
  this.currentFeatures = this.colorMap.allFeatures;
  this.top = margin.top;
  this.bottom = margin.bottom;
  this.left = margin.left;
  this.right = margin.right;
  this.rawData = data;


  this.renderAreaChart();
};

VerticalAreaChart.prototype.updateScale = function(){
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
    .range([this.left, this.width - this.right]);
  let yScale = d3.scaleLinear()
    .domain([0, this.data[0].length - 1])
    .range([this.top, this.height - this.bottom]);

  this.area = d3.area()
    .y(function(d,i) {
      return yScale(d['index'] == undefined? i: d['index']);
    })
    .x0(function(d) { return xScale(d.range[0]); })
    .x1(function(d) { return xScale(d.range[1]); });
};

VerticalAreaChart.prototype.renderAreaChart = function(){
  let _this = this;
  this.areaContainer = this.container.append('g').attr('class', 'areaContainer');
  this.areaContainer.append('rect')
    .attr('x', this.left)
    .attr('y', this.top)
    .attr('width', this.width - this.left - this.right)
    .attr('height', this.height - this.top - this.bottom)
    .attr('fill','none')
    .attr('stroke', '#777').attr('stroke-width', 1);
  this.updateAreaChart();
};

VerticalAreaChart.prototype.updateAreaChart = function(){

  let _this = this;
  let t = d3.transition()
    .duration(500);

  this.data = this.createAreaData(this.rawData);
  this.updateScale();

  // this.areaContainer.selectAll('path').remove();
  let areas = this.areaContainer.selectAll(".areaPath")
    .data(this.data, function(d, i){
      return i;
    });


  areas
    .transition(t)
    .attr("d", this.area)
    .attr("fill", function(d, i) {
      return _this.colorMap[d[0].attr];
    });



  let newAreas = areas
    .enter().append("path").attr('class', 'areaPath')
    .attr("d", this.area)
    .attr("fill", function(d, i) {
      return _this.colorMap[d[0].attr];
    })
    .attr('opacity', 0.6)
    .on('click', function(d, i){

      _this.resort(i);
      _this.updateAreaChart();
    })
};

VerticalAreaChart.prototype.resort = function(index){
  let newFeatures = [this.currentFeatures[index]];
  this.currentFeatures.forEach((d, i)=>{
    if(i != index){
      newFeatures.push(d);
    }
  });
  this.currentFeatures = newFeatures;
};

VerticalAreaChart.prototype.createAreaData = function(imgList){

  let featureArrays = [];
  let attrs = this.currentFeatures;
  imgList.forEach(function(imgObj, index){
    let leftSum = 0;
    for(var i = 0, ilen = attrs.length;i < ilen; i++){
      if(featureArrays[i] == undefined){
        featureArrays[i] = [];
      }
      let attr = attrs[i];
      let value = imgObj['attrObj'][attr];
      featureArrays[i].push({
        range: [leftSum, leftSum + value],
        attr: attr,
        index: index
      });
      leftSum += value;
    }
  });
  return featureArrays;
};
export default VerticalAreaChart
