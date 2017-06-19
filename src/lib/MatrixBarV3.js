/**
 * Created by qshen on 2/21/2017.
 */
import * as d3 from 'd3'
// import * as d3contour from 'd3-contour'
import ScatterPlotMatrix from '../../src/lib/statistics/ScatterplotMatrix'
import CompBarCharts from '../../src/lib/statistics/CompBarCharts'
import DiversityChart from '../../src/lib/statistics/DiversityChart'

let MatrixBarV2 = function(el,svFeatures2Color, Config){
  this.$el = el;
  this.width = this.$el.clientWidth - 30;
  this.height = this.$el.clientHeight;
  this.svFeatures2Color = svFeatures2Color;
  this.features = this.svFeatures2Color['allFeatures'];
  this.Config = Config;

  this.colorScale = {
    'hk': '#2b8cbe',
    'singapore': '#df65b0',
    'london': '#2b8cbe',
    'nyc': '#df65b0'
  };
  this.colorScaleArray = ['#df65b0', '#2b8cbe'];
  this.scatterPlotMatrix = new ScatterPlotMatrix();
  this.compBarCharts = new CompBarCharts();
  this.diversityChart = new DiversityChart();
  this.init();
  this.initMatrix();
  this.initCompBars();
  this.initDiversity();
};
MatrixBarV2.prototype.init = function(){
  function generate_config(_margin, conf){
    let margin = Object.assign({},_margin, conf);
    margin['regionWidth'] = margin['width'] - margin['left'] - margin['right'];
    margin['regionHeight'] = margin['height'] - margin['top'] - margin['bottom'];
    if(margin['offsetX'] == undefined)
      margin['offsetX'] = margin['regionWidth'] -  margin['size']> 0 ? margin['regionWidth'] - margin['size']:0;
    return margin
  }

  // Init the configuration of matrix and collection
  let _margin = {left: 10, right: 10, top:10, bottom: 15};
  let matrixWidth = this.width * 2/ 5;
  let matrixHeight = this.height;

  this.matrixSize = matrixWidth > matrixHeight? matrixHeight: matrixWidth;
  let contaienrOffsetX = matrixWidth > matrixHeight? (matrixWidth - matrixHeight): 0;


  this.matrixMargin = generate_config(_margin, {width: matrixWidth, height: matrixHeight, offsetX: contaienrOffsetX});
  this.matrixSize = this.matrixMargin['regionWidth'] > this.matrixMargin['regionHeight']? this.matrixMargin['regionHeight']: this.matrixMargin['regionWidth'];
  this.matrixMargin['size'] = this.matrixSize;
  this.compBarMargin = generate_config(_margin, {offsetX: this.matrixSize + 10, width:this.width * 1 / 5, height: this.height});

  this.diversityMargin = generate_config(_margin,{width: this.width * 2 / 5, height: this.height, offsetX: this.matrixSize + this.compBarMargin['width'] + 25})


  this.svgContainer = d3.select(this.$el);

};


MatrixBarV2.prototype.initMatrix = function(){
  let _this = this;
  this.matrixContainer = this.svgContainer.append('g').attr('class','matrixContainer')
    .attr('transform', 'translate('+ this.matrixMargin['left'] + ',' + this.matrixMargin['top'] + ')')

  this.scatterPlotMatrix.setConfig(this.matrixContainer, this.features, {
    'margin': {width: this.matrixMargin['regionWidth'], height: this.matrixMargin['regionHeight'], offsetX: this.matrixMargin['offsetX'],size: this.matrixMargin['size']},
    'cityId2Name': _this.Config.cityId2Name,
    'colorScale': _this.colorScale
  });
};

MatrixBarV2.prototype.initCompBars = function(){
  let _this = this;
  // this.compBarMargin

  this.compBarContainer = this.svgContainer.append('g').attr('class', 'compBarContaienr')
    .attr('transform','translate(' + (this.compBarMargin['offsetX'] + this.compBarMargin['left']) + ',' + this.compBarMargin['top'] + ')');

  this.compBarCharts.setConfig(this.compBarContainer, this.features, {
    'margin': {width: this.compBarMargin['regionWidth'], height: this.compBarMargin['regionHeight'], size: this.matrixSize},
    'cityId2Name': _this.Config.cityId2Name,
    'colorScale': _this.colorScale
  })
};

MatrixBarV2.prototype.drawMatrix = function(dataList){
  this.scatterPlotMatrix.draw(dataList, this.features);
};

MatrixBarV2.prototype.drawdsbBarchart = function(dataList){
  this.compBarCharts.draw(dataList);

};

MatrixBarV2.prototype.initDiversity = function(){

  let _this = this;
  this.diversityContainer = this.svgContainer.append('g').attr('class', 'diversityBarChart')
    .attr('transform','translate(' + (this.diversityMargin['offsetX'] + this.diversityMargin['left']) + ',' + this.diversityMargin['top'] + ')');

  this.diversityChart.setConfig(this.diversityContainer, this.features, {
    'margin': {width: this.diversityMargin['regionWidth'], height: this.diversityMargin['regionHeight'], size: this.matrixSize},
    'cityId2Name': _this.Config.cityId2Name,
    'colorScale': _this.colorScale
  });

  // this.diversityContainer.append('rect')
  //   .attr('width',  this.diversityMargin.regionWidth)
  //   .attr('height', this.diversityMargin.regionHeight)
  //   .attr('stroke-width', 1)
  //   .attr('stroke', 'red')
  //   .attr('fill', 'red')
  //   .attr('opacity', 0.1);
};

MatrixBarV2.prototype.drawDiversity = function(dataList){
  this.diversityChart.update(dataList);
};

MatrixBarV2.prototype.switchDiversityStyle = function(style){
  this.diversityChart.switchDiversityStyle(style);
};

MatrixBarV2.prototype.updateDiversityBandwidth = function(bandwidth, threshold){
  this.diversityChart.updateDiversityBandwidth(bandwidth, threshold)
};

MatrixBarV2.prototype.setColorStyle = function(names){
  this.colorScaleArray;
  this.colorScale = {};
  let _this = this;
  names.forEach(function(name, i){
    _this.colorScale[name] = _this.colorScaleArray[i];
  })
};

MatrixBarV2.prototype.clearRegions = function(){
  this.regions.each(function(d){
    d3.select(this).selectAll('.pointsContainer').remove();

  });
  this.barChartsPair.each(function(d){
    d3.select(this).selectAll('.barContainer').remove();
  })
};
MatrixBarV2.prototype.highlightSelection = function(record){
  // let point_id = record['cityId'] + '_region_' + record['rid'];
  // console.log('record', record);
  // let _this = this;
  // let selections = d3.selectAll('.' + point_id).attr('fill', 'red').attr('stroke', 'red').attr('fill-opacity', 0.8)
  //   .attr('stroke-width', 2)
  //   .attr('stroke', 'red')
  //   .attr('r', 3.5);
  //
  // // let value = parseInt(img['record']['statistics'][attr] / (100 / numberOfScale));
  // let recordFeatures = record['statistics'];
  // this.barChartsPair.each(function(attr){
  //   let featureValue = recordFeatures[attr] / (100 / _this.numberOfScale)
  //   let x = _this.x_scale(featureValue)
  //   d3.select(this).append('line').attr('x1', x).attr('x2',x).attr('y1', _this.singleRegionSize / 2).attr('y2', _this.singleRegionSize - 10).attr('stroke', 'red').attr('stroke-width', 1.5);
  //   console.log('x', x);
  // })
  // selections.each(function(){
  //   this.parentNode.appendChild(this);
  //   this.parentNode.parentNode.appendChild(this.parentNode);
  // })
};
export default MatrixBarV2
