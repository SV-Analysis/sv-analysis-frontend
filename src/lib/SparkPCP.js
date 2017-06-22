/**
 * Created by Qiaomu on 13/6/2017.
 */

import * as d3 from 'd3'
import VerticalStackArea from '../../src/lib/VerticalStackArea'
import VerticalPolyline from '../../src/lib/VerticalPolyline'

let SparkPCP = function(el, attrs, data, featureColor){

  d3.select(this.$el).selectAll('g').remove();

  this.width = el.clientWidth;
  this.height = el.clientHeight;
  this.$el = el;

  this.attrs = attrs;
  this.data = [data[0]['record']['aggregatedImages'],data[1]['record']['aggregatedImages']]; // Image list
  this.svFeatures2Color = featureColor;
  this.isRendered = false;
  this.isChartDisplayed = false;
  this.pcpColor = ['#fdae61', '#66c2a5'];
  this.pcpBarColor = ['#f46d43', '#a6d96a']
  this.id2Data = {};
  this.regionConfig = {'left': 0.2,'middle': 0.6, 'right': 0.2,'middleMargin': 0.1};
  this.margin = {};
  for(let attr in this.regionConfig){
    this.margin[attr] = this.regionConfig[attr] * this.width;
  }
  this.margin['top'] = 10;
  this.margin['bottom'] = 10;
  this.margin['rightLeft'] = this.margin['left'] + this.margin['middle'];
};
SparkPCP.prototype.initData = function(attrs){
  this.leftData = [];
  this.rightData = [];
  this.largestRatio = -1;
  this.data.forEach((data, i)=>{
    let arr = i==0? this.leftData: this.rightData;
    let label = i==0? 'left': 'right';
    let _attrs = i==0? ['left'].concat(this.attrs.slice()): this.attrs.slice().concat(['right'])
    data.forEach((d, j)=>{
      let obj = Object.assign({}, d);
      obj['attrObj'][label] = j / data.length * 100;
      obj['attrArr'] = [];
      arr.push(obj);
      _attrs.forEach((attr, i)=>{

        let currentRatio = obj['attrObj'][attr];
        if(attr != 'left' && attr != 'right'){
          this.largestRatio = this.largestRatio < currentRatio? currentRatio: this.largestRatio;
        }
        obj['attrArr'].push({
          attr: attr,
          value: currentRatio,
          raw: obj
        })
      })
    });
  });

};
SparkPCP.prototype.initRender = function(){
  this.container = d3.select(this.$el).append('g').attr('class', 'container');
  this.leftAreaContainer = this.container.append('g');
  this.rightAreaContainer = this.container.append('g').attr('transform','translate('+ (this.margin.left + this.margin.middle) + ',0)')
  this.areaWidth = this.margin.left;
  this.initXScale();
};

SparkPCP.prototype.initXScale = function(){
  let middleLeft = this.margin.left;
  let middleRight = this.margin.left + this.margin.middle;
  let middleMargin =this.margin.middleMargin;
  let middleXScale = d3.scalePoint().range([middleLeft + middleMargin, middleRight - middleMargin]).domain(this.attrs);

  this.middleXScale = middleXScale;
  this.middleYScale = d3.scaleLinear().domain([0, this.largestRatio]).range([this.height - this.margin.bottom, this.margin.top]);
  this.leftXScale = function(attr, d){
    return d == undefined? middleLeft: d.raw.scalePoint.x;
  };
  this.rightXScale = function(attr, d){

    return d == undefined? middleRight: d.raw.scalePoint.x + this.margin['rightLeft']

  };
  this.xScale = function(attr, d){
    if(attr == 'left' && d == undefined){
      console.log('attr', d);
    }
    return attr == 'left' ? this.leftXScale(attr, d):
      attr == 'right'? this.rightXScale(attr, d): this.middleXScale(attr);
  };
  this.leftYScale = function(value, d){
    return d == undefined? 100: d.raw.scalePoint.y;

  };
  this.rightYScale = function(value, attr, d){
    if(d == undefined){
      console.log('ddd', d)
    }
    return d == undefined? 100: d.raw.scalePoint.y;
  };
  this.yScale = function(value, attr, d){
    return attr == 'left'? this.leftYScale(value, d):
      attr =='right'? this.rightYScale(value, attr, d): this.middleYScale(value);
  }
};

SparkPCP.prototype.drawAxis = function(){
  let _this = this;

  // this.container.append('g').selectAll('circle').data(['left','right']).enter()
  //   .append('circle')
  //   .attr('cx', d => {
  //     return this.xScale(d);
  //   })
  //   .attr('cy', 100)
  //   .attr('r', 10)
  //   .attr('fill', 'blue');

  this.dimensionContainer = this.container.append('g').attr('class', 'dimensionContainer').selectAll('.dimension')
    .data(this.attrs)
    .enter().append('g').attr('class', 'dimension')
    .attr('transform', (d)=>{
      return 'translate('+this.xScale(d) + ',0)';
    });

  this.dimensionContainer.append('circle')
    .attr('r', 10)
    .attr('stroke', 'red')
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  let axis = d3.axisLeft();
  axis.ticks(6);

  let axisContainer = this.dimensionContainer.append("g")
    .attr("class", "axis");

  axisContainer.each(function(d){
    let _container = d3.select(this);
    _container.call(axis.scale(_this.middleYScale));
    _container.append("text")
      .style("text-anchor", "middle")
      .attr("y",20)
      .text(function(d){return d})
      .style('fill', 'black');
  });

};

SparkPCP.prototype.drawPCPLines = function(){
  let _this = this;

  this.leftData;
  this.lineContainers = this.container.append('g').attr('class', 'background')
    .selectAll('.lineContainer')
    .data(this.leftData.concat(this.rightData))
    .enter()
    .append('g').attr('class', 'lineContainer')

  let line = d3.line()
    .x((d, i)=>{
      let _x = this.xScale(d.attr, d)
      return _x;
    })
    .y((d)=>{
      let _y =  this.yScale(d.value, d.attr, d)
      return _y ;
    })
    .curve(d3.curveLinear);

  this.lineContainers.each(function(aggImg){
    let lc = d3.select(this);
    lc.datum(aggImg['attrArr']).append('path').attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 1)
      .attr('opacity', 0.3)
      .attr('stroke', d=>{
        return aggImg['attrObj']['left'] != undefined? 'red':'green'
      })
  });
};
SparkPCP.prototype.drawPCPBars = function(data, container){

};

SparkPCP.prototype.drawPCPAreas = function(){
  this.leftAreaContainer.append('rect').attr('x', 0).attr('y', 0).attr('width', this.margin['left']).attr('height',this.height)
    .attr('stroke', 'red')
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  this.rightAreaContainer.append('rect').attr('x', 0).attr('y', 0).attr('height', this.height).attr('width', this.margin['right'])
    .attr('stroke', 'red')
    .attr('stroke-width', 2)
    .attr('fill', 'none');
  let leftAreaData = this.createAreaData(this.leftData);
  let rightAreaData = this.createAreaData(this.rightData);

  let leftArea = new VerticalStackArea(this.leftAreaContainer.nodes()[0], leftAreaData, this.margin['left'], this.height, this.svFeatures2Color);
  let rightArea = new VerticalStackArea(this.rightAreaContainer.nodes()[0], rightAreaData, this.margin['right'], this.height, this.svFeatures2Color);

  let leftPolyline = new VerticalPolyline(this.leftAreaContainer.nodes()[0], this.leftData, this.margin['left'], this.height, this.svFeatures2Color);
  let rightPolyline = new VerticalPolyline(this.rightAreaContainer.nodes()[0], this.rightData, this.margin['right'], this.height, this.svFeatures2Color)

};
SparkPCP.prototype.createAreaData = function(imgList){

  let featureArrays = [];
  let attrs = this.attrs;
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
SparkPCP.prototype.drawLineArea = function(){

};
SparkPCP.prototype.generateOverallXScaleRegionLeft = function(range, domain, specialXScale){

};

SparkPCP.prototype.generateOverallXScaleRegionRight = function(range, domain, specialXScale){

};

SparkPCP.prototype.drawImagePoints = function(container, width, height, streetData){


};


SparkPCP.prototype.drawPCPLinesRight = function(imgList){

};


SparkPCP.prototype.drawPCPLinesLeft = function(imgList){


};

SparkPCP.prototype.onSelectedImages = function(selectedImages){

};

SparkPCP.prototype.highlightSelected = function(selectedImages){

};
SparkPCP.prototype.removeHighlightSelected = function(selectedImages){

};


SparkPCP.prototype.init = function(){

  this.initData();
  this.initRender();
  this.drawAxis();
  this.drawPCPAreas();
  this.drawPCPLines();
  // this.drawPCPBars();
  // this.drawRemarkIcon();
};

SparkPCP.prototype.updateDisplay = function(sign){

};

SparkPCP.prototype.drawRemarkIcon = function(){


};

export default SparkPCP
