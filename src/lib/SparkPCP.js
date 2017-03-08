/**
 * Created by qshen on 3/3/2017.
 */

import * as d3 from 'd3'

let SparkPCP = function(el, attrs, data, featureColor ){
  this.$el = el;
  d3.select(this.$el).selectAll('g').remove();
  this.attrs = attrs;
  this.data = data; // Image list
  this.svFeatures2Color = featureColor;
  this.isRendered = false;
  this.isChartDisplayed = false;
  this.pcpColor = ['#fdae61', '#66c2a5']

};

SparkPCP.prototype.initRender = function(){
  let _this = this;
  this.width = this.$el.clientWidth;
  this.height = this.$el.clientHeight;
  this.margin = {top: 40, right: this.width / 5, bottom: 40, left: this.width / 5};

  this.x = d3.scalePoint().range([0, this.width - this.margin.right - this.margin.left]);
  this.x.domain(this.attrs);

  this.y = {};
  console.log('ratio', _this.largestRatio);
  this.attrs.forEach(function(attr){
    _this.y[attr] = d3.scaleLinear().domain([0, _this.largestRatio]).range([_this.height - _this.margin.bottom,  _this.margin.top]);
  });
  this.svgContainer = d3.select(this.$el);
  this.pcpContainer = this.svgContainer
    .append("g")
    .attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

  this.dimensionContainer = this.pcpContainer.selectAll(".dimension")
    .data(this.attrs)
    .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", function(d) {
      return "translate(" + _this.x(d) + ")";
    });
};

SparkPCP.prototype.initData = function(){
  this.data.forEach(function(d, i){
    d.forEach(function(e, j){
      e['group'] = i;
    })
  });
  this.imageList = this.data[0].concat(this.data[1]);
  // ratio bar data
  let ratioBarData = {};
  for(var i = 0, ilen = this.attrs.length; i < ilen; i++){
    ratioBarData[this.attrs[i]] = [];
    for(var j = 0; j < 20; j++){
      ratioBarData[this.attrs[i]][j] = 0
    }
  }
  let largestIndex = 0;
  for(var i = 0, ilen = this.imageList.length; i < ilen; i++){
    let imageObj = this.imageList[i];
    this.attrs.forEach(function(attr){
      let value = parseInt(parseInt(imageObj[attr]) / 5);
      if(largestIndex < value){
        largestIndex = value;
      }
      ratioBarData[attr][value] += 1;
    })
  }
  let imageNumber = this.imageList.length;
  let largestRatio = -1;
  largestIndex = 20;
  this.attrs.forEach(function(attr){

    for(var i = 0, ilen = ratioBarData[attr].length; i < ilen; i++){
      let ratio = ratioBarData[attr][i] / imageNumber;
      ratioBarData[attr][i] = ratio;
      largestRatio = largestRatio < ratio? ratio: largestRatio;
    }
  });

  this.ratioBarData = ratioBarData;
  this.largestRatio = largestRatio;
  this.largestIndex = largestIndex;

  let areaData = [];
  for(var i = 0, ilen = this.data.length; i < ilen; i++){
    let areaObj = {};
    let imgList = this.data[i];
    let largestValue = -1;
    this.attrs.forEach(function(attr){
      areaObj[attr] = [];
      imgList.forEach(function(img){
        areaObj[attr].push(img[attr])
        largestValue = largestValue < img[attr]? img[attr]: largestValue;
      })
      areaObj[attr]['largest'] = largestValue;
    });
    areaData.push(areaObj)
  }
  this.areaData = areaData;
};

SparkPCP.prototype.drawAxis = function(){
  let _this = this;
  let axis = d3.axisLeft();
  axis.ticks(2);

  this.dimensionContainer.append("g")
    .attr("class", "axis")
    .each(function(d) { d3.select(this).call(axis.scale(_this.y[d])); })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
};

SparkPCP.prototype.drawPCPBars = function(){
  let _this = this;
  let barHeight = (this.height - 60) / 20;
  let largestIndex = this.largestIndex;
  let ratioBarData = this.ratioBarData;

  this.dimensionContainer.each(function(d){
    let barContainers = d3.select(this).append('g');
    let dataArr = ratioBarData[d];

    barContainers.selectAll('.rationbar')
      .data(dataArr)
      .enter()
      .append('rect').attr('class', 'rationbar')
      .attr('x', (d, i) => - d * 50 / 2)
      .attr('y', (r, i)=> {
        return _this.y[d](i / largestIndex) - barHeight})
      .attr('fill', 'steelblue')
      .attr('opacity', 0.9)
      .attr('height',barHeight - 1)
      .attr('width', (d, i) => d * 50)
      .on('mouseover', function(ss){
        d3.select(this).attr('opacity', 1)
      })
      .on('mouseout', function(){
        d3.select(this).attr('opacity', 0.9)
      })
  });
};

SparkPCP.prototype.drawPCPLines = function(){
  let _this = this;
  let line = d3.line();

  var foreground = this.pcpContainer
    .attr("class", "background")
    .selectAll("path")
    .data(this.imageList)
    .enter().append("path")
    .attr("d", path)
    .attr('class', 'parallel-path')
    .attr('stroke', function(d){
      return _this.pcpColor[d['group']]
    })
    .attr('fill', 'none')
    .attr('opacity', '0.05');

  function position(d) {
    return _this.x(d);
  }
  function path(d) {
    var _arrs = _this.attrs.map(function(p){
      return [position(p), _this.y[p](d[p] / 100)];
    })
    return line(_arrs);
  }
};

SparkPCP.prototype.drawLineArea = function(){
  let _this = this;
  let areaChartWidth = (this.width - this.margin.right - this.margin.left) / 6;
  let areaChartHeight = this.margin.top * 2 / 3;

  let lineAreaContainer = this.dimensionContainer.append('g');

  let areax = d3.scaleLinear().range([0, areaChartWidth]);//.domain([0, 600])
  let areay = d3.scaleLinear().range([areaChartHeight, 0]); //domain([0, 100]).

  let areaxs = [];
  let areays = [];
  let areaRenders = [];
  for(var i = 0, ilen = this.areaData.length; i < ilen; i++){
    areaxs[i] = {};
    areays[i] = {};
    areaRenders[i] = {};
    this.attrs.forEach(function(attr){
      let _areax = d3.scaleLinear().range([0, areaChartWidth]).domain([0, _this.areaData[i][attr].length]);
      let _areay = d3.scaleLinear().range([areaChartHeight, 0]).domain([0, _this.areaData[i][attr].largest]);//_this.areaData[i][attr].largest]
      areaRenders[i][attr] = d3.area()
        .x(function(d, j) {
          return _areax(j);
        })
        .y0(areaChartHeight)
        .y1(function(d, j) {
          return _areay(d);
        });

    });
  }


  lineAreaContainer.each(function(attr){
    let areaPairContainers = d3.select(this).selectAll('.areaContainer')
      .data(_this.areaData)
      .enter()
      .append('g')
      .attr('class', 'areaContainer')
      .attr('transform', function(d, i){
        if(i == 0){
          return "translate(" + (-areaChartWidth / 2) + "," + (_this.margin.top * 1 / 3 - 5) + ")"
        }else{
          return "translate(" + (-areaChartWidth / 2) + "," + (_this.height - _this.margin.bottom + _this.margin.top * 1 / 3 - 5) + ")"
        }
      });

    // areaPairContainers
    //   .append('rect').attr('width', areaChartWidth)
    //   .attr('height', areaChartHeight)
    //   .attr('stroke', 'steelblue')
    //   .attr('fill', 'none')

    areaPairContainers.append("path")
      .attr("class", "areachart")
      .attr("d", function(d, i){
        return areaRenders[i][attr](d[attr])
      })
      .attr('fill',function(){
        return _this.svFeatures2Color[attr];
      })
      .attr('fill-opacity', 0.6);


    // areaPairContainers.each(function(d){
    //   d3.select(this).append('path')
    //
    //     .attr("class", "areachart")
    //     .attr("d", area);
    // })
    // areaPairContainers.append('path')
    //   .datum([data])
    //   .attr("class", "area")
    //   .attr("d", area);

  })




};

SparkPCP.prototype.init = function(){

  this.initData();
  this.initRender();
  this.drawAxis();

  this.drawPCPLines();
  this.drawLineArea();
  this.drawPCPBars();
};

SparkPCP.prototype.updateDisplay = function(sign){
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

export default SparkPCP
