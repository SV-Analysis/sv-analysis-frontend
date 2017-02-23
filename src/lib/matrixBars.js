/**
 * Created by qshen on 2/21/2017.
 */
import * as d3 from 'd3'

let MatrixBar = function(el,source,target){
  this.$el = el;
  this.width = this.$el.clientWidth;
  this.height = this.$el.clientHeight;

};

MatrixBar.prototype.draw = function(sourceItem, targetItem, featureArray){

  if(this.$el.clientWidth == 0) return


  let _this = this;
  // let featureArray = this.svFeatures2Color['allFeatures'];

  if(sourceItem == undefined || targetItem == undefined){
    console.log('Undefined item',sourceItem, targetItem);
    return
  }
  let barColors = ['#fc4e2a', '#74c476'];
  let width = this.$el.clientWidth;
  let height = this.$el.clientHeight;
  if(this.svg) {
    d3.selectAll('.pannel').remove();
  }


  let svg = d3.select(this.$el).append('g').attr('class','pannel');
  this.svg = svg;

  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('stroke', '#7084f9')
    .attr('stroke-width', 3)

  let margin_x = 80;
  let margin_y = 50;//height * 1 / 10;
  let matrixSize = width / 2 - margin_x ;// - margin_y * 2;

  let firstArray = sourceItem['record']['image_list'];
  let secondArray = targetItem['record']['image_list'];
  let matrixRegion = svg.append('g').attr('transform', function(d, i){
    return 'translate(' +  (margin_x ) +
      ',' + (margin_y) + ')'
  });

  matrixRegion.append('rect')
    .attr('width', matrixSize)
    .attr('height', matrixSize)
    .attr('fill', 'none')
    .attr('opacity', 0.2)


  let regionMargin = 2;
  let regionWidthWithMargin = matrixSize / (featureArray.length);
  let regionWidth = regionWidthWithMargin - regionMargin * 2;
  let regionArray = [];
  let index = 0;
  let maxRatio = 0;
  for(var i = 0; i < featureArray.length; i++){
    for(var j = i ; j < featureArray.length; j++){
      regionArray[index] ={x: j,y :i}
      index ++;
    }
    firstArray.forEach(function(d){
      if(maxRatio < d[featureArray[i]]){
        maxRatio = d[featureArray[i]];
      }
    })
  }
  maxRatio = maxRatio / 100;
  let regions = matrixRegion.selectAll('.rect-region')
    .data(regionArray)
    .enter()
    .append('g').attr('class', 'rect-region')
    .attr('transform', function(d, i){
      return 'translate(' +  ((d['x'] ) * regionWidthWithMargin ) +
        ',' + (d['y'] * regionWidthWithMargin) + ')'
    });

  // Draw scatter plot matrix
  regions.each(function(attr){
    let pointContainer = d3.select(this);
    if(attr['x'] == attr['y']) {
      let str = featureArray[attr['x']].charAt(0).toUpperCase() + featureArray[attr['x']].slice(1);
      pointContainer.append('text')
        .attr('x', 5)
        .attr('y', regionWidth / 2 + 5)
        .text(str);
      return
    }

    pointContainer.append('rect')
      .attr('x', regionMargin)
      .attr('y', regionMargin)
      .attr('width', regionWidth)
      .attr('height', regionWidth)
      .attr('fill', 'none')
      .attr('stroke', '#5499f9')
      .attr('stroke-width', 1)
      .append('title')
      .text(d=>d['x'] + ',' + d['y']);

    let xscale = d3.scaleLinear().range([regionMargin, regionWidth - regionMargin])
      .domain([0 , maxRatio + 0.1]);
    let yscale = d3.scaleLinear().range([regionMargin, regionWidth - regionMargin])
      .domain([0 , maxRatio + 0.1]);

    let firstAttr = featureArray[attr['x']];
    let secondAttr = featureArray[attr['y']];

    pointContainer.append('g').selectAll('.scatter-point-x')
      .data(firstArray)
      .enter()
      .append('circle')
      .attr('class', 'scatter-point-x')
      .attr('cx', function(d){
        let ratio = d[firstAttr];
        let xvalue = xscale(ratio / 100)
        return xvalue
      })
      .attr('cy', function(d){
        let ratio = d[secondAttr];
        let yvalue = yscale(ratio/ 100)
        return yvalue
      })
      .attr('r', 1)
      .attr('fill', barColors[0])
      .attr('opacity', 0.5)

    pointContainer.append('g').selectAll('.scatter-point-y')
      .data(secondArray)
      .enter()
      .append('circle')
      .attr('class', 'scatter-point-y')
      .attr('cx', function(d){
        let ratio = d[firstAttr];
        let xvalue = xscale(ratio / 100)
        return xvalue
      })
      .attr('cy', function(d){
        let ratio = d[secondAttr];
        let yvalue = yscale(ratio/ 100)
        return yvalue
      })
      .attr('r', 1)
      .attr('fill',barColors[1])
      .attr('opacity', 0.3)

    if(attr['y'] == 0){
      let regionXAxis = d3.axisTop()
        .ticks(2);

      let axisContainer = pointContainer.append('g').attr('class', '.xdimension')
        .attr("transform", function(d) {
          return "translate(" + regionMargin + ',' + (regionMargin) + ")";
        });

      axisContainer.append("g")
        .attr("class", "axis")
        .each(function(d) {
          let ct = d3.select(this)
            .call(regionXAxis.scale(xscale));
          ct.selectAll('path').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('line').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('text').attr('fill', '#777')
        })

    }
    if(attr['x'] == attr['y'] + 1) {
      let regionYAxis = d3.axisLeft()
        .ticks(2);

      axisContainer = pointContainer.append('g').attr('class', '.ydimension')
        .attr("transform", function (d) {
          return "translate(" + regionMargin + ',' + (regionMargin) + ")";
        });

      axisContainer.append("g")
        .attr("class", "axis")
        .each(function (d) {
          let ct = d3.select(this).call(regionYAxis.scale(yscale));
          ct.selectAll('line').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('path').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('text').attr('fill', '#777')
        })

    }
  });

  // Draw barchart
  let numberOfScale = 100;
  // BarCollection after matrix
  let attr2RatioArray = [{},{}];
  // BarChart after BarCollection
  let barGroup = {};

  let largestIndex = 0;
  let largestValue = 0;
  let dsbChartWidth = matrixSize * 0.6;
  let cmpChartWidth = matrixSize * 0.3;
  let textWidth = 55;

  let largestGroupBarValue = 0;

  featureArray.forEach(function(attr){
    barGroup[attr] = [0, 0];
    attr2RatioArray[0][attr] = [];
    attr2RatioArray[1][attr] = [];
    for(let i = 0; i < numberOfScale; i++){
      attr2RatioArray[0][attr][i] = 0;
      attr2RatioArray[1][attr][i] = 0;
    }
    firstArray.forEach(function(item){
      let attrValue = item[attr];
      barGroup[attr][0] += attrValue;
      let value = parseInt(parseInt(attrValue) / (100 / numberOfScale));
      attr2RatioArray[0][attr][value] += 1;
      if(largestIndex < value) largestIndex = value;
      if(largestValue < attr2RatioArray[0][attr][value]) largestValue = attr2RatioArray[0][attr][value];

    });
    secondArray.forEach(function(item){
      let attrValue = item[attr];
      barGroup[attr][1] += attrValue;
      let value = parseInt(parseInt(item[attr]) / (100 / numberOfScale));
      attr2RatioArray[1][attr][value] += 1;
      if(largestIndex < value) largestIndex = value;
      if(largestValue < attr2RatioArray[1][attr][value]) largestValue = attr2RatioArray[1][attr][value];
    })
  });

  for(var attr in barGroup){
    barGroup[attr][0] = barGroup[attr][0] / firstArray.length;
    barGroup[attr][1] = barGroup[attr][1] / secondArray.length;
    if(largestGroupBarValue < barGroup[attr][0]) largestGroupBarValue = barGroup[attr][0];
    if(largestGroupBarValue < barGroup[attr][1]) largestGroupBarValue = barGroup[attr][1];
  }

  let perwidth = dsbChartWidth / largestIndex * 0.5;

  let x_scale = d3.scaleLinear().domain([0, largestIndex / numberOfScale]).range([0, dsbChartWidth]);

  let barChartContainer = svg.append('g').attr('class','regionssss');

  let dsbBarCollections = barChartContainer.selectAll('.barcharts')
    .data(featureArray)
    .enter()
    .append('g')
    .attr('class', 'barcharts')
    .attr('transform', function(d, i){
      return 'translate(' + (margin_x + 5+ matrixSize) + ',' + (margin_y + i * regionWidthWithMargin + regionMargin) + ')';
    });

  dsbBarCollections.append('rect')
    .attr('width', dsbChartWidth)
    .attr('height', regionWidth)
    .attr('fill', 'none')
    .attr('stroke-width', 1)
    .attr('stroke', '#5499f9')
    .attr('opacity', 1);

  let axis = d3.axisBottom()
    .ticks(3);

  let axisContainer = dsbBarCollections.append('g').attr('class', '.dimension')
    .attr("transform", function(d) {
      return "translate(" + 0 + ',' + (regionWidth / 2) + ")";
    });

  axisContainer.append("g")
    .attr("class", "axis")
    .each(function(d) { d3.select(this).call(axis.scale(x_scale)); })
    .append("text")
    .style("text-anchor", "middle")
    .text(function(d) {
      return d;
    });


  dsbBarCollections.each(function(attr){
    let currentArray = attr2RatioArray[0][attr];

    let y_scale = d3.scaleLinear().domain([0, largestValue]).range([0, regionWidth / 2]);

    let firstBars = d3.select(this).append('g').selectAll('.bar')
      .data(attr2RatioArray[0][attr].slice(0, largestIndex + 1))
      .enter()
      .append('rect').attr('class', 'bar')
      .attr('x', function(d, i){
        let x_pos = x_scale(i / numberOfScale);
        return x_pos;
      })
      .attr('y', function(d,i){
        return regionWidth / 2 - y_scale(d)
      })
      .attr('width', perwidth)
      .attr('height', function(d){
        return y_scale(d);
      })
      .attr('fill', '#fc4e2a')
      .attr('opacity', 0.7)

    let secondBars = d3.select(this).append('g').selectAll('.bar')
      .data(attr2RatioArray[1][attr].slice(0, largestIndex + 1))
      .enter()
      .append('rect').attr('class', 'bar')
      .attr('x', function(d, i){
        let x_pos = x_scale(i / numberOfScale);
        return x_pos;
      })
      .attr('y', function(d, i){
        return regionWidth / 2
      })
      .attr('width', perwidth)
      .attr('height', function(d){
        return y_scale(d);
      })
      .attr('fill', '#74c476')
      .attr('opacity', 0.7)
  });

  //Draw bar group
  let barGroupContainer = svg.append('g').attr('class','barGroup');
  let groupbarHeight = regionWidth / 5;
  let x_groupbar_scale = d3.scaleLinear().domain([0, largestGroupBarValue]).range([0, cmpChartWidth]);
  let cmpBarCollections = barGroupContainer.selectAll('.barcharts')
    .data(featureArray)
    .enter()
    .append('g')
    .attr('class', 'barcharts')
    .attr('transform', function(d, i){
      return 'translate(' + (margin_x + 10 + matrixSize + dsbChartWidth) + ',' + (margin_y + i * regionWidthWithMargin + regionMargin) + ')';
    });

  cmpBarCollections.append('rect')
    .attr('width', cmpChartWidth + textWidth)
    .attr('height', regionWidth)
    .attr('fill', 'none')
    .attr('stroke-width', 1)
    .attr('stroke', '#5499f9')
    .attr('opacity', 1);

  cmpBarCollections.each(function(attr){
    d3.select(this).selectAll('.groupBar')
      .data(barGroup[attr])
      .enter()
      .append('rect')
      .attr('class', 'groupBar')

      .attr('height', groupbarHeight)
      .attr('fill', function(d, i){
        return barColors[i]
      })
      .attr('y', function(d, i){
        return regionWidth / 2 - (groupbarHeight) + i *　groupbarHeight;
      })
      .attr('width', d => x_groupbar_scale(d))
      .attr('opacity', 0.5);

    let texts = d3.select(this).selectAll('.ratio')
      .data(barGroup[attr])
      .enter()
      .append('text')
      .attr('class', 'ratio')
      .text(function(d){
        return parseInt(d) / 100;
      });
    texts.attr('y', function(d, i){
      let texts = d3.select(this);
      return regionWidth / 2 + i * texts.node().getBoundingClientRect().height - 2;
    })
      .attr('x', d => x_groupbar_scale(d) + 5)
  });

};

export default MatrixBar
