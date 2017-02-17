/**
 * Created by qshen on 2/14/2017.
 */
import * as d3 from 'd3'

let ParallelCoordinate = function(el, attrs, data, featureColor){
  this.$el = el;
  this.attrs = attrs;
  this.data = data; // Image list
  this.svFeatures2Color = featureColor;
  this.isRendered = false;
  this.isChartDisplayed = false;
};

ParallelCoordinate.prototype.init = function(){
  let _this = this;
  this.isRendered = false;
  this.isChartDisplayed = true;
  let ratioBarData  = {};
  let imageList = this.data;
  for(var i = 0, ilen = this.attrs.length; i < ilen; i++){
    ratioBarData[this.attrs[i]] = [];
    for(var j = 0; j < 20; j++){
      ratioBarData[this.attrs[i]][j] = 0
    }
  }
  let largestIndex = 0;
  for(var i = 0, ilen = imageList.length; i < ilen; i++){
    let imageObj = imageList[i];
    this.attrs.forEach(function(attr){
      let value = parseInt(parseInt(imageObj[attr]) / 5);
      if(largestIndex < value){
        largestIndex = value;
      }
      ratioBarData[attr][value] += 1;
    })
  }
  let imageNumber = imageList.length;
  let largestRatio = -1;
  largestIndex = 20;
  this.attrs.forEach(function(attr){

    for(var i = 0, ilen = ratioBarData[attr].length; i < ilen; i++){
      let ratio = ratioBarData[attr][i] / imageNumber;
      ratioBarData[attr][i] = ratio;
      largestRatio = largestRatio < ratio? ratio: largestRatio;
    }
  });

  let width = this.$el.clientWidth;
  let height = this.$el.clientHeight;

  let svgContainer = d3.select(this.$el).select('svg');
  this.svgContainer = svgContainer;
  svgContainer.append('rect')
    .attr('width', width).attr('height', height).attr('fill', 'white').attr('opacity', 0.9)
  var x = d3.scalePoint().range([60, width - 30]),
    y = {},
    dragging = {};

  var line = d3.line(),
    axis = d3.axisLeft(),
    background;
  var margin = {top: 0, right: 0, bottom: 0, left: 0};
  var svg = svgContainer
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  this.attrs.forEach(function(attr){
    y[attr] = d3.scaleLinear().domain([0, 1]).range([height - 40, 20]);
  });

  x.domain(this.attrs);
  var axisContainer = svg.selectAll(".dimension")
    .data(this.attrs)
    .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", function(d) {
      return "translate(" + x(d) + ")";
    })
  axisContainer.append("g")
    .attr("class", "axis")
    .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function(d) { return d; });
  let barHeight = (height - 60) / 20;
  axisContainer.each(function(d){
    let barContainers = d3.select(this).append('g');
    let dataArr = ratioBarData[d];

    barContainers.selectAll('.rationbar')
      .data(dataArr)
      .enter()
      .append('rect').attr('class', 'rationbar')
      .attr('x', (d, i) => - d * 50 / 2)
      .attr('y', (r, i)=> {
        return y[d](i / largestIndex) - barHeight})
      .attr('fill', 'steelblue')
      .attr('opacity', 0.9)
      .attr('height',barHeight - 1)
      // .attr('stroke', 'white')
      .attr('width', (d, i) => d * 50)
      .on('mouseover', function(ss){
        d3.select(this).attr('opacity', 1)
      })
      .on('mouseout', function(){
        d3.select(this).attr('opacity', 0.9)
      })
  });
  axisContainer.append('text')
    .text(function(d) {return d})
    .attr('y', height - 20)
    .attr('x', -20)


  var foreground = svg.append("g")
    .attr("class", "background")
    .selectAll("path")
    .data(imageList)
    .enter().append("path")
    .attr("d", path)
    .attr('class', 'parallel-path')
    .attr('stroke', '#6b6ecf')
    .attr('fill', 'none')
    .attr('opacity', '0.05')


  function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
  }
  function path(d) {
    var _arrs = _this.attrs.map(function(p){
      return [position(p), y[p](d[p] / 100)];
    })
    return line(_arrs);
  }
};
ParallelCoordinate.prototype.updateDisplay = function(sign){
  if(sign == true){
    this.svgContainer.attr('opacity', 0);
    this.isChartDisplayed = false;
    return
  }else if(sign == false){
    this.svgContainer.attr('opacity', 1);
    return
  }else if(this.isRendered == false){

  }
};

export default ParallelCoordinate
