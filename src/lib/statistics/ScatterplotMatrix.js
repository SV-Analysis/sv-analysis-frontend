/**
 * Created by Qiaomu on 11/6/2017.
 */
import * as d3 from 'd3'
let ScatterPlotMatrix = function(el, margin){

};
ScatterPlotMatrix.prototype.setConfig = function(el, features, config){
  this.el = el;
  let _this = this;
  this.features = features;
  this.config = config;
  let matrixSize = this.config.margin['size'] ;
  let contaienrOffsetX = this.config.margin['offsetX'];
  let singleRegionSize = matrixSize / this.features.length;
  this.singleRegionSize = singleRegionSize;
  // let regionMargin = 2;
  this.regionMargin = 3;
  this.colorScale = config.colorScale;
  let regionArray = [];
  let index = 0;
  for(var i = 0; i < features.length; i++) {
    for (var j = i; j < features.length; j++) {
      regionArray[index] = {x: j, y: i};
      index++;
    }
  }
  // Each single rect
  this.regionContainer = el.append('g').attr('class', 'region_container').attr('transform', 'translate(' + contaienrOffsetX + ',' + '0)');
  this.regions = this.regionContainer.selectAll('.rect-region')
    .data(regionArray)
    .enter()
    .append('g').attr('class', 'rect-region')
    .attr('transform', function(d, i){
      return 'translate(' +  ((d['x'] ) * singleRegionSize ) +
        ',' + (d['y'] * singleRegionSize) + ')'
    });


  // Init the regions
  this.regions.each(function(attr) {
    let pointContainer = d3.select(this);
    if (attr['x'] == attr['y']) {
      let str = features[attr['x']];

      if(str == 'green') str = 'greenery';
      if(str == 'car') str = 'vehicle';
      str = str.charAt(0).toUpperCase() + str.slice(1);
      pointContainer.append('text')
        .attr('x', 5)
        .attr('y', singleRegionSize / 2 + 5)
        .text(str);
      return
    }
    pointContainer.append('rect')
      .attr('x', _this.regionMargin)
      .attr('y', _this.regionMargin)
      .attr('width', singleRegionSize - _this.regionMargin * 2)
      .attr('height', singleRegionSize - _this.regionMargin * 2)
      .attr('fill', 'none')
      .attr('stroke', function(d){
        return '#777';
      })
      .attr('stroke-width', 0.3)
      .attr('stoke-opacity', 0.3)
      .append('title')
      .text(d=>d['x'] + ',' + d['y']);
  });
};
ScatterPlotMatrix.prototype.init = function(){

};

ScatterPlotMatrix.prototype.getColor = function(id){
  return this.colorScale != undefined? this.colorScale[id]: "red";
};

ScatterPlotMatrix.prototype.draw = function(dataList){
  console.log('In Datalist', dataList)
  let _this = this;
  this.clearRegions();
  if(dataList.length == 0){
    return;
  }
  let featureArray = this.features;
  // Build a scale function for every region

  let dataArray = [];

  dataList.forEach(function(data){
    let cityId = data['cityId'];
    let type = data['type'];
    data['imgList'].forEach(function(d){
      let _id = d['id'] != undefined? d['id']: d['cityObj']['id'];
      let id = cityId + '_' + type + '_' + _id;
      d['point_id'] = id;
      d.color = data.color;
      dataArray.push(d);
    });
  });
  this.regionContainer.selectAll('.legendContainer').remove();

  let legendsContainer = this.regionContainer.append('g').attr('class', 'legendContainer');
  let legends = legendsContainer
    .selectAll('.legends')
    .data(dataList)
    .enter()
    .append('g')
    .attr('class', 'legends')
    .attr('transform', function(d, i){
      let y = i * 25;
      let bottom_y = 150;
      return 'translate(' + 22 +',' + (y + _this.config.margin.height - bottom_y)+ ')';
    });
  legends.append('text')
    .attr('x', 10)
    .attr('y', 5)
    .text(function(d, i){
      if(d['cityId']!= undefined)
        return _this.config.cityId2Name[d['cityId']];
      else if(_this.config.cityId2Name[d.id]!= undefined){
        return _this.config.cityId2Name[d.id];
      }else
        return d['name']
    });

  legends.append('circle').attr('r', 6 )
    .attr('stroke', function(d, i){
      return d.color;
    })
    .attr('stroke-width', function(d, i){
      return 2;
    })
    .attr('fill', function(d, i){
      return d.color
    })
    .attr('fill-opacity', 0.5);
  if(dataList.length > 0){
    legendsContainer.append('text')
      .text(function(){
        if(dataList[0]['type'] == 'region') return 'Type: Administrative region';
        else return 'Type: Street'
      })
      .attr('x', 22).attr('y', _this.config.margin.height - 80);
  }

  this.regions.each(function(attr, i){
    if(attr['x'] == attr['y']) return;
    let pointsContainer = d3.select(this).append('g').attr('class', 'pointsContainer');
    let firstAttr = featureArray[attr['x']];
    let secondAttr = featureArray[attr['y']];
    let largest_x = Math.max.apply(Math,dataArray.map(function(e){return e['record']['statistics'][firstAttr];}));
    let largest_y = Math.max.apply(Math,dataArray.map(function(e){return e['record']['statistics'][secondAttr];}));
    largest_x = largest_x < 50 ? 50 : largest_x;
    largest_y = largest_y < 50 ? 50 : largest_y;
    let xscale = d3.scaleLinear().range([_this.regionMargin,_this.singleRegionSize - _this.regionMargin])
      .domain([0 , largest_x / 100]);
    let yscale = d3.scaleLinear().range([_this.singleRegionSize - _this.regionMargin ,_this.regionMargin])
      .domain([0 , largest_y / 100]);

    let circles = pointsContainer.append('g').selectAll('.scatter-point-x')
      .data(dataArray)
      .enter()
      .append('circle')

      .attr('class', d=> 'scatter-point-x '+ d['point_id'])
      .attr('cx', function(d){
        let ratio = d['record']['statistics'][firstAttr];
        let xvalue = xscale(ratio / 100)
        return xvalue
      })
      .attr('cy', function(d){
        let ratio = d['record']['statistics'][secondAttr];
        let yvalue = yscale(ratio/ 100)
        return yvalue
      })
      .attr('r', function(d){

        return 2

      })
      .attr('fill', function(d){
        // return _this.getColor(d['cityObj']['id']);
        return d.color
      })
      .attr('fill-opacity', 0.2)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3)
      .attr('stroke', function(d){
        return d.color
        // return _this.getColor(d['cityId'])
      });

    circles.each(function(d){
      if(d['render'] == undefined){
        d['render'] = []
      }
      d['render'].push(this)
    });
    let axisContainer = null;
    if(attr['y'] == attr['x'] - 1) {
      let regionXAxis = d3.axisBottom()
        .ticks(1)
        .tickSize(1)

      axisContainer = pointsContainer.append('g').attr('class', 'xdimension')
        .attr("transform", function (d) {
          return "translate(" + 0 + ',' + (_this.singleRegionSize - _this.regionMargin) + ")";
        });

      axisContainer.append("g")
        .attr("class", "axis")
        .each(function (d) {
          let ct = d3.select(this)
            .call(regionXAxis.scale(xscale));
          ct.selectAll('path').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('line').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('text').attr('fill', '#777')
        });
    }

    if(attr['y'] == attr['x'] - 1) {
      let regionYAxis = d3.axisLeft()
        .ticks(1)
        .tickSize(1)

      axisContainer = pointsContainer.append('g').attr('class', 'ydimension')
        .attr("transform", function (d) {
          return "translate(" + ( + _this.regionMargin)  + ',' + (0) + ")";
        });

      axisContainer.append("g")
        .attr("class", "axis")
        .each(function (d) {
          let ct = d3.select(this).call(regionYAxis.scale(yscale));
          ct.selectAll('line').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('path').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('text').attr('fill', '#777')
        });
    }
  });
};

ScatterPlotMatrix.prototype.clearRegions = function(){
  this.regions.each(function(d){
    d3.select(this).selectAll('.pointsContainer').remove();
  });
  this.regionContainer.selectAll('.legendContainer').remove();
};
export default ScatterPlotMatrix
