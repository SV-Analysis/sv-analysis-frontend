/**
 * Created by qshen on 2/21/2017.
 */
import * as d3 from 'd3'

let MatrixBarV2 = function(el,svFeatures2Color){
  this.$el = el;
  this.width = this.$el.clientWidth;
  this.height = this.$el.clientHeight;
  this.svFeatures2Color = svFeatures2Color;
  this.features = this.svFeatures2Color['allFeatures'];

  this.colorScale = {
    'hk': '#b2df8a',
    'singapore': '#fb9a99',
    'london': '#1f78b4',
    'nyc': '#ff7f00'
  };
  this.init();
  this.initMatrix();
  this.initCollection();
};
MatrixBarV2.prototype.init = function(){
  this.svgContainer = d3.select(this.$el);
  // Init the configuration of matrix and collection
  this.matrixContainer = this.svgContainer.append('g');
  this.matrixMargin = {left: 10, right: 10, top:20, bottom: 5, width: this.width / 2, height: this.height};
  this.matrixMargin['regionWidth'] = this.matrixMargin['width'] - this.matrixMargin['left'] - this.matrixMargin['right'];
  this.matrixMargin['regionHeight'] = this.matrixMargin['height'] - this.matrixMargin['top'] - this.matrixMargin['bottom'];

  let matrixSize = this.matrixMargin['regionWidth'] > this.matrixMargin['regionHeight']? this.matrixMargin['regionHeight']: this.matrixMargin['regionWidth'];
  this.matrixSize = matrixSize;

  this.collectionContainer = this.svgContainer.append('g').attr('transform', 'translate(' + this.width / 2 + ',0)')
  this.collectionMargin =  {left: 10, right: 10, top:5, bottom: 5, width: this.width / 2, height: this.height};
  this.collectionMargin['regionWidth'] = this.collectionMargin['width'] - this.collectionMargin['left'] - this.collectionMargin['right'];
  this.collectionMargin['regionHeight'] = this.collectionMargin['height'] - this.collectionMargin['top'] - this.collectionMargin['bottom'];
};
MatrixBarV2.prototype.initMatrix = function(){
  let _this = this;
  let featureArray = this.features;
  let matrixSize = this.matrixSize;

  let singleRegionSize = matrixSize /featureArray.length;
  let barOffset = singleRegionSize + 10;
  let barContainerLength = this.matrixMargin['width'] - matrixSize;
  this.singleRegionSize = singleRegionSize;
  let gap = 20;
  this.barContainerMargin = {left: 10, right: 10, top: 20, bottom: 5, width: barContainerLength, height: this.height, offsetX: this.matrixSize + 40};
  let _width = this.barContainerMargin['width'] - this.barContainerMargin['left'] - this.barContainerMargin['right'] - gap;
  this.barContainerMargin['regionWidth'] = _width;
  //
  // this.matrixContainer.append('rect')
  //   .attr('x', this.matrixMargin['left'])
  //   .attr('y', this.matrixMargin['top'])
  //   .attr('width', this.matrixMargin['regionWidth'])
  //   .attr('height', this.matrixMargin['regionHeight'])
  //   .attr('fill', 'red')
  //   .attr('opacity', '0.1');

  let regionArray = [];
  let index = 0;
  for(var i = 0; i < featureArray.length; i++) {
    for (var j = i; j < featureArray.length; j++) {
      regionArray[index] = {x: j, y: i}
      index++;
    }
  }
  let regionContainer = this.matrixContainer.append('g')
    .attr('transform', 'translate(0, ' + this.matrixMargin['top'] + ')');


  this.regions = regionContainer.selectAll('.rect-region')
    .data(regionArray)
    .enter()
    .append('g').attr('class', 'rect-region')
    .attr('transform', function(d, i){
      return 'translate(' +  ((d['x'] ) * singleRegionSize ) +
        ',' + (d['y'] * singleRegionSize) + ')'
    });

  this.regions.each(function(attr) {
    let pointContainer = d3.select(this);
    if (attr['x'] == attr['y']) {
      let str = featureArray[attr['x']].charAt(0).toUpperCase() + featureArray[attr['x']].slice(1);
      pointContainer.append('text')
        .attr('x', 5)
        .attr('y', singleRegionSize / 2 + 5)
        .text(str);
      return
    }
    pointContainer.append('rect')
      .attr('x', 3)
      .attr('y', 3)
      .attr('width', singleRegionSize - 6)
      .attr('height', singleRegionSize - 6)
      .attr('fill', 'none')
      .attr('stroke', function(d){
        return '#777';
      })
      .attr('stroke-width', 0.3)
      .attr('stoke-opacity', 0.3)
      .append('title')
      .text(d=>d['x'] + ',' + d['y']);

  });

  this.barContainer = this.matrixContainer.append('g')
    .attr('transform', 'translate( ' + this.barContainerMargin['offsetX'] +',' + this.barContainerMargin['top']+')');

  this.barChartsPair = this.barContainer.selectAll('.barContainers')
    .data(featureArray)
    .enter()
    .append('g')
    .attr('class', 'barContainers')
    .attr('transform', function(d, i){
      return 'translate( 0' +',' +(i * singleRegionSize) +')'
    });


  this.barChartsPair.append('rect').attr('width', this.barContainerMargin['regionWidth'])
    .attr('x',3)
    .attr('y', 3)
    .attr('height', singleRegionSize - 6)
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', 0.3)
    .attr('stoke-opacity', 0.3)
};

MatrixBarV2.prototype.initCollection = function(){
  this.collectionContainer.append('rect')
    .attr('x', this.collectionMargin['left'])
    .attr('y', this.collectionMargin['top'])
    .attr('width', this.collectionMargin['regionWidth'])
    .attr('height', this.collectionMargin['regionHeight'])
    .attr('fill', 'blue')
    .attr('opacity', '0.1');
};

MatrixBarV2.prototype.clearRegions = function(){
  this.regions.each(function(d){
    d3.select(this).selectAll('.pointsContainer').remove();

  });
  this.barChartsPair.each(function(d){
    d3.select(this).selectAll('.barContainer').remove();
  })
};


MatrixBarV2.prototype.mergeData = function(data){


};

MatrixBarV2.prototype.drawMatrix = function(dataList){
  let _this = this;
  this.clearRegions();
  let featureArray = this.features;
  // Build a scale function for every region

  let dataArray = [];

  dataList.forEach(function(data){
    let cityId = data['cityId'];
    let type = data['type'];
    data['imgList'].forEach(function(d){
      let id = cityId + '_' + type + '_' + d['id'];
      d['point_id'] = id;
      dataArray.push(d);
    });
  });

  this.regions.each(function(attr, i){
    if(attr['x'] == attr['y']) return;

    let pointsContainer = d3.select(this).append('g').attr('class', 'pointsContainer');
    let firstAttr = featureArray[attr['x']];
    let secondAttr = featureArray[attr['y']];
    let largest_x = Math.max.apply(Math,dataArray.map(function(e){return e[firstAttr];}));
    let largest_y = Math.max.apply(Math,dataArray.map(function(e){return e[secondAttr];}));

    let xscale = d3.scaleLinear().range([3,_this.singleRegionSize - 3])
      .domain([0 , largest_x / 100]);
    let yscale = d3.scaleLinear().range([3, _this.singleRegionSize - 3])
      .domain([0 , largest_y / 100]);

    pointsContainer.append('g').selectAll('.scatter-point-x')
      .data(dataArray)
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
      .attr('r', 2)
      .attr('fill', function(d){return _this.colorScale[d['cityId']]})
      .attr('fill-opacity', 0.2)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3)
      .attr('stroke', function(d){return _this.colorScale[d['cityId']]});

    let axisContainer = null;
    if(attr['y'] == 0) {
      let regionXAxis = d3.axisTop()
        .ticks(1);

      axisContainer = pointsContainer.append('g').attr('class', 'xdimension')
        .attr("transform", function (d) {
          return "translate(" + 0 + ',' + (0) + ")";
        });

      axisContainer.append("g")
        .attr("class", "axis")
        .each(function (d) {
          let ct = d3.select(this)
            .call(regionXAxis.scale(xscale));
          ct.selectAll('path').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('line').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('text').attr('fill', '#777')
        })
    }

    if( attr['x'] == 5) {
      let regionYAxis = d3.axisRight()
        .ticks(2)
        .tickSize(2)

      axisContainer = pointsContainer.append('g').attr('class', 'ydimension')
        .attr("transform", function (d) {
          return "translate(" + _this.singleRegionSize + ',' + (0) + ")";
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
};

MatrixBarV2.prototype.drawdsbBarchart = function(dataList){
  let _this = this;
  let features = this.features;

  let numberOfScale = 20;
  // Init the data
  let attr2RatioArray = [];
  for(let i = 0, ilen = dataList.length; i <ilen; i++){
    let data = dataList[i];
    let _cityObj = {'cityId': data['cityId']};
    features.forEach(function(attr){
      _cityObj[attr] = [];
      for(let j = 0, jlen = numberOfScale; j < jlen; j++ ){
        _cityObj[attr][j] = 0;
      }
    });
    attr2RatioArray.push(_cityObj);
  }

  let largestIndex = 0;
  let largestValue = 0;

  dataList.forEach(function(d, i){
    if(d['cityId'] != attr2RatioArray[i]['cityId']) return;
    let images = d['imgList'];
    images.forEach(function(img){
      features.forEach(function(attr){
        let value = parseInt(img[attr] / (100 / numberOfScale));
        attr2RatioArray[i][attr][value] += 1;
        if(largestValue < attr2RatioArray[i][attr][value]){
          largestValue = attr2RatioArray[i][attr][value];
        }

        if(largestIndex < value){
          largestIndex = value;
        }
      })
    })
  });

  console.log('largestIndex', attr2RatioArray);

  let barWidth = this.barContainerMargin.regionWidth / largestIndex * 3 / 4;
  this.barChartsPair.each(function(attr){
    let x_scale = d3.scaleLinear().domain([0, largestIndex + 1]).range([3, _this.barContainerMargin.regionWidth]);
    let y_scale = d3.scaleLinear().domain([0, largestValue + 0.1]).range([3, _this.singleRegionSize / 2 - 6]);
    let barPairContainer = d3.select(this).append('g').attr('class', 'barContainer');
    let cityId = attr2RatioArray[0]['cityId'];
    barPairContainer.append('g').selectAll('.bar').data(attr2RatioArray[0][attr].slice(0, largestIndex + 1))
      .enter()
      .append('rect').attr('class','bar')
      .attr('x', function(d, i){
        return x_scale(i);
      })
      .attr('y', function(d, i){
        return _this.singleRegionSize / 2 - y_scale(d);

      })
      .attr('width', barWidth)
      .attr('height', function(d){
        return y_scale(d);
      })
      .attr('fill', function(){
        return _this.colorScale[cityId]
      })
      .attr('opacity', 0.7);

    let axis = d3.axisBottom()
      .ticks(3);

    let axisContainer = barPairContainer.append('g').attr('class', '.dimension')
      .attr("transform", function(d) {
        return "translate(" + 0 + ',' + (_this.singleRegionSize  / 2) + ")";
      });

    axisContainer.append("g")
      .attr("class", "axis")
      .each(function(d) {
        d3.select(this)
          .call(axis.scale(x_scale))
          .attr('stroke-dasharray', '2,2');
      })
      .append("text")
      .style("text-anchor", "middle")
      .text(function(d) {
        return d;
      })
    ;

    if(attr2RatioArray.length > 1){
      let cityId = attr2RatioArray[1]['cityId'];
      barPairContainer.append('g').selectAll('.bar').data(attr2RatioArray[1][attr].slice(0, largestIndex + 1))
        .enter()
        .append('rect').attr('class','bar')
        .attr('x', function(d, i){
          return x_scale(i);
        })
        .attr('y', function(d, i){
          return _this.singleRegionSize / 2;
        })
        .attr('width', barWidth)
        .attr('height', function(d){
          return y_scale(d);
        })
        .attr('fill', function(){
          return _this.colorScale[cityId];
        })
        .attr('opacity', 0.7);
    }



  });
};
export default MatrixBarV2
