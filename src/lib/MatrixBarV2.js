/**
 * Created by qshen on 2/21/2017.
 */
import * as d3 from 'd3'
// import * as d3contour from 'd3-contour'
import * as d3contour from '../../src/lib/d3-contour'

let MatrixBarV2 = function(el,svFeatures2Color, Config){
  this.$el = el;
  this.width = this.$el.clientWidth;
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

  this.init();
  this.initMatrix();
  this.initDiversity();
};
MatrixBarV2.prototype.init = function(){
  this.svgContainer = d3.select(this.$el);
  // Init the configuration of matrix and collection
  this.matrixContainer = this.svgContainer.append('g');
  this.matrixMargin = {left: 10, right: 10, top:10, bottom: 5, width: this.width * 3/ 5, height: this.height};
  this.matrixMargin['regionWidth'] = this.matrixMargin['width'] - this.matrixMargin['left'] - this.matrixMargin['right'];
  this.matrixMargin['regionHeight'] = this.matrixMargin['height'] - this.matrixMargin['top'] - this.matrixMargin['bottom'];

  let matrixSize = this.matrixMargin['regionWidth'] > this.matrixMargin['regionHeight']? this.matrixMargin['regionHeight']: this.matrixMargin['regionWidth'];
  this.matrixSize = matrixSize;

  this.collectionContainer = this.svgContainer.append('g').attr('transform', 'translate(' + this.width * 3/ 5 + ',0)')
  this.collectionMargin =  {left: 0, right: 10, top:10, bottom: 5, width: this.width *3 / 5, height: this.height, gap:5};
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
  this.gap = 20;
  this.barContainerMargin = {left: 10, right: 10, top: 10, bottom: 5, width: barContainerLength, height: this.height, offsetX: this.matrixSize + this.gap / 2};
  let _width = this.barContainerMargin['width'] - this.barContainerMargin['left'] - this.barContainerMargin['right'] - this.gap;
  this.barContainerMargin['regionWidth'] = _width;

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
  this.regionContainer = regionContainer;

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
      let str = featureArray[attr['x']];

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

      let _id = d['id'] != undefined? d['id']: d['record']['statistics']['id']
      let id = cityId + '_' + type + '_' + _id;
      d['point_id'] = id;
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
      return 'translate(' + 22 +',' + (y + _this.matrixMargin.height - bottom_y)+ ')';
    });
  legends.append('text')
    .attr('x', 10)
    .attr('y', 5)
    .text(function(d, i){
      if(d['cityId']!= undefined)
        return _this.Config.cityId2Name[d['cityId']];
      else
        return d['name']
    });

  legends.append('circle').attr('r', 6 )
    .attr('stroke', function(d, i){

      if(d['cityId']!= undefined)
        return _this.colorScale[d['cityId']]
      else
        return _this.colorScale[d['name']]

    })
    .attr('stroke-width', function(d, i){
      return 2;
    })
    .attr('fill', function(d, i){
      if(d['cityId']!= undefined)
        return _this.colorScale[d['cityId']]
      else
        return _this.colorScale[d['name']]
    })
    .attr('fill-opacity', 0.5)

  legendsContainer.append('text')
    .text(function(){
      if(dataList[0]['type'] == 'region') return 'Type: Administrative region';
      else return 'Type: Street'
    })
    .attr('x', 22).attr('y', _this.matrixMargin.height - 80);

  this.regions.each(function(attr, i){
    if(attr['x'] == attr['y']) return;

    let pointsContainer = d3.select(this).append('g').attr('class', 'pointsContainer');
    let firstAttr = featureArray[attr['x']];
    let secondAttr = featureArray[attr['y']];
    let largest_x = Math.max.apply(Math,dataArray.map(function(e){return e['record']['statistics'][firstAttr];}));
    let largest_y = Math.max.apply(Math,dataArray.map(function(e){return e['record']['statistics'][secondAttr];}));
    largest_x = largest_x < 50 ? 50 : largest_x;
    largest_y = largest_y < 50 ? 50 : largest_y;
    let xscale = d3.scaleLinear().range([3,_this.singleRegionSize - 3])
      .domain([0 , largest_x / 100]);
    let yscale = d3.scaleLinear().range([_this.singleRegionSize - 3 ,3])
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
        return _this.colorScale[d['cityObj']['id']]})
      .attr('fill-opacity', 0.2)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3)
      .attr('stroke', function(d){return _this.colorScale[d['cityId']]});

    circles.each(function(d){
      if(d['render'] == undefined){
        d['render'] = []
      }
      d['render'].push(this)
    })
    let axisContainer = null;
    if(attr['y'] == attr['x'] - 1) {
      let regionXAxis = d3.axisBottom()
        .ticks(1)
        .tickSize(1)

      axisContainer = pointsContainer.append('g').attr('class', 'xdimension')
        .attr("transform", function (d) {
          return "translate(" + 0 + ',' + (_this.singleRegionSize -3) + ")";
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

    if(attr['y'] == attr['x'] - 1) {
      let regionYAxis = d3.axisLeft()
        .ticks(1)
        .tickSize(1)

      axisContainer = pointsContainer.append('g').attr('class', 'ydimension')
        .attr("transform", function (d) {
          return "translate(" + ( + 3)  + ',' + (0) + ")";
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
  this.numberOfScale = numberOfScale;
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
    attr2RatioArray[i]['name'] = d['name']
    attr2RatioArray[i].len = images.length;
    images.forEach(function(img){
      features.forEach(function(attr){
        let value = parseInt(img['record']['statistics'][attr] / (100 / numberOfScale));
        attr2RatioArray[i][attr][value] += 1;
        if(largestIndex < value){
          largestIndex = value;
        }
      })
    })
  });

  attr2RatioArray.forEach(function(singleArr){
    features.forEach(function(attr){
      for(var i = 0, ilen = singleArr[attr].length; i < ilen; i++){
        singleArr[attr][i] /= singleArr.len;
        if(largestValue < singleArr[attr][i]){
          largestValue = singleArr[attr][i];
        }
      }
    })
  })

  let barWidth = this.barContainerMargin.regionWidth / largestIndex * 3 / 4;
  this.barChartsPair.each(function(attr){
    let x_scale = d3.scaleLinear().domain([0, largestIndex + 1]).range([3, _this.barContainerMargin.regionWidth]);
    _this.x_scale = x_scale;
    let y_scale = d3.scaleLinear().domain([0, largestValue+ 0.1]).range([3, _this.singleRegionSize / 2 - 6]);
    let barPairContainer = d3.select(this).append('g').attr('class', 'barContainer');
    let cityId = attr2RatioArray[0]['cityId'];
    let name = attr2RatioArray[0]['name'];
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
      .attr('fill', function(d){
        if(cityId!= undefined)
          return _this.colorScale[cityId]
        else
          return _this.colorScale[name]
      })
      .attr('opacity', 0.7);

    let axis = d3.axisBottom()
      .ticks(5)
      .tickFormat(function(ds){
        return ds / numberOfScale;
      });

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

    ;

    if(attr2RatioArray.length > 1){
      let cityId = attr2RatioArray[1]['cityId'];
      let name = attr2RatioArray[1]['name'];
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
          if(cityId!= undefined)
            return _this.colorScale[cityId]
          else
            return _this.colorScale[name]
        })
        .attr('opacity', 0.7);
    }

  });
};

MatrixBarV2.prototype.initDiversity = function(){
  let _this = this;
  let r = (this.collectionMargin.height - this.collectionMargin['top'] - this.collectionMargin['bottom'])/ 2;
  this.diversityContainer = this.collectionContainer.append('g')
    .attr('transform','translate(' + this.collectionMargin['left'] * 2+ ',' + this.collectionMargin['top'] +')');

  let features = this.features;

  this.collectionMargin['diversityRegionHeight'] = (this.collectionMargin['height'] - this.collectionMargin['top'] - this.collectionMargin['bottom'])/ 3;
  this.collectionMargin['diversityRegionWidth'] =
    (this.collectionMargin['width'] - this.collectionMargin['left'] - this.collectionMargin['right']) / 3;
  //this.collectionMargin['diversityRegionHeight'] * 5 / 3;
  this.collectionMargin['diversityRegionMargin'] = 10;


  let diversityRegionWidth = this.collectionMargin['diversityRegionWidth'];
  let diversityRegionHeight = this.collectionMargin['diversityRegionHeight'];
  let margin = this.collectionMargin['diversityRegionMargin'];

  this.diversityContainers = this.diversityContainer.selectAll('.diversityContainers')
    .data(features)
    .enter()
    .append('g')
    .attr('class', 'diversityContainers')
    .attr('transform', function(d, i){
      let _x = i % 2 * diversityRegionWidth;
      let _y = (parseInt(i / 2) * diversityRegionHeight);

      return 'translate('+ _x +',' + _y +')'
    });

  this.diversityContainers.append('rect').attr('width', diversityRegionWidth - margin * 2)
    .attr('x',3)
    .attr('y', 3)
    .attr('height', diversityRegionHeight - margin * 2)
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', 0.3)
    .attr('stoke-opacity', 0.3);

  let texts = this.diversityContainers.append('text')
    .attr('font-size', 35)
    .text(function(d){

      if(d == 'green') d = 'Greenery'
      if(d == 'car') d = 'vehicle'
      return d.charAt(0).toUpperCase() + d.slice(1);
    });
  texts.attr('x', function(){
    let _width = d3.select(this).node().getBBox().width;
    return diversityRegionWidth / 2 - _width / 2 - margin;
  })
    .attr('y', function(){
      let _height = d3.select(this).node().getBBox().height;
      return diversityRegionHeight / 2 - _height / 2 + margin + 10;
    })
    .attr('opacity', 0.2)

};

MatrixBarV2.prototype.drawDiversity = function(dataList){
  let _this = this;
  let features = this.features;

  let largestFV = 0;
  let largestDis = 0;
  dataList.forEach(function(item){
    if(item.type == 'adregion'){
      item['dv'] = {};
      item['dv']['standard'] = item['record']['standard'];
      item['dv']['statistics'] = item['record']['statistics'];
      item['dv']['sv'] = item['record']['sv'];
      item['dv']['lv'] = item['record']['lv'];
    }else{
      item['dv'] = {};
      item['dv']['standard'] = item['record']['standard'];
      item['dv']['statistics'] = item['record']['statistics'];
      item['dv']['sv'] = item['record']['sv'];
      item['dv']['lv'] = item['record']['lv'];

    }
    features.forEach(function(attr){
      largestFV = largestFV < item['dv']['statistics'][attr]? item['dv']['statistics'][attr]: largestFV;
      largestDis = largestDis < item['dv']['standard'][attr]? item['dv']['standard'][attr]: largestDis;
    })
  });

  this.diversityContainers.each(function(d){
    d3.select(this).selectAll('.diversityPointContainer').remove();
  });


  let diversityRegionWidth = this.collectionMargin['diversityRegionWidth'];
  let diversityRegionHeight = this.collectionMargin['diversityRegionHeight'];
  let margin = this.collectionMargin['diversityRegionMargin'];


  let xScale = d3.scaleLinear()
    .domain([0, largestFV / 100]).range([3, diversityRegionWidth - this.gap]);

  let yScale = d3.scaleLinear().range([diversityRegionHeight - 2 * margin + 3, 3])
    .domain([0 , largestDis]);

  let offScale = d3.scaleLinear().range([0, 15]).domain([0, 0.2])

  let idMap = null;
  this.diversityContainers.each(function(attr, i){
    let diversityPointContainer = d3.select(this).append('g').attr('class','diversityPointContainer');

    let __nodes1 = [];
    let __nodes2 = [];

    dataList.forEach(function(data){

      let dataid = data['cityObj']['id'];
      if(idMap == null){
        idMap = dataid;
      }

      let nodes = data['cityObj']['id'] == idMap ? __nodes1: __nodes2


      nodes.push({
        x: xScale(data['dv']['statistics'][attr] / 100),
        y: yScale(data['dv']['standard'][attr])
      })
    });

    console.log('nodes', __nodes1, __nodes2)
    // 'hk': '#2b8cbe',
    // 'singapore': '#df65b0',
    let bandwidth = 10;
    let c1 = d3contour.contourDensity()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .size([diversityRegionWidth , diversityRegionHeight])
      .bandwidth(bandwidth)
      (__nodes1);

    let c2 = d3contour.contourDensity()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .size([diversityRegionWidth , diversityRegionHeight])
        .bandwidth(bandwidth)
        (__nodes2);

    console.log('c1', c1);
    diversityPointContainer.append('g')
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5)
      .attr("stroke-linejoin", "round")
      .selectAll("path")
      .data(c1)
      .enter().append("path")
      .attr("fill", '#2b8cbe')
      .attr("d", d3.geoPath())
      .attr('opacity', 0.3);


    diversityPointContainer.append('g')
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5)
      .attr("stroke-linejoin", "round")
      .selectAll("path")
      .data(c2)
      .enter().append("path")
      .attr("fill", '#df65b0')
      .attr("d", d3.geoPath())
      .attr('opacity', 0.3)

    let pointsContainers = diversityPointContainer.selectAll('.diversityCombination')
      .data(dataList)
      .enter()
      .append('g').attr('class', 'diversityCombination')
      .attr('transform', function(data, i){
        let _x = xScale(data['dv']['statistics'][attr] / 100);
        let _y = yScale(data['dv']['standard'][attr]);
        // let _x = __nodes[i]['x'];
        // let _y = __nodes[i]['y'];
        return 'translate('+ _x +','+ _y +')';
      });

    // let lines = pointsContainers.append('line')
    //   .attr('x1', function(data){
    //     let gapValue = offScale((data['dv']['statistics'][attr] - data['dv']['sv'][attr]) / 100);
    //     return -gapValue;
    //   })
    //   .attr('x2', function(data){
    //     let gapValue = offScale((data['dv']['lv'][attr] - data['dv']['statistics'][attr]) / 100);
    //     return gapValue;
    //   }).attr('class', d=> d['point_id'])
    //
    //   .attr('stroke', function(d){ return _this.colorScale[d['cityObj']['id']]}).attr('stroke-width', 1)
    //   .on('click', function(d){
    //     let renders = d['render'];
    //     renders.forEach(function(e){
    //       d3.select(e).attr('stroke', 'red').attr('stroke-width', 2)
    //         .attr('fill', 'red').attr('fill-opacity', 0.5)
    //         .attr('r',4)
    //
    //       e.parentNode.appendChild(e);
    //       e.parentNode.parentNode.appendChild(e.parentNode);
    //
    //     });
    //   });
    //
    // lines.each(function(d){
    //   if(d['render'] == undefined){
    //     d['render'] = []
    //   }
    //   d['render'].push(this)
    // })
    //
    // let circles = pointsContainers.append('circle')
    //   .attr('stroke-width', 1)
    //   .on('click', function(d){
    //     let renders = d['render'];
    //     renders.forEach(function(e){
    //       d3.select(e).attr('stroke', 'red').attr('stroke-width', 2)
    //         .attr('fill', 'red').attr('fill-opacity', 0.9)
    //         .attr('r',4);
    //       e.parentNode.appendChild(e);
    //       e.parentNode.parentNode.appendChild(e.parentNode);
    //
    //     });
    //     console.log('d', d);
    //   })
    //   .attr('class', d => d['point_id'])
    //   .attr('r',2)
    //   .attr('fill',function(d){
    //     return "red";
    //     return _this.colorScale[d['cityObj']['id']]
    //   })
    //   .attr('fill-opacity', '0.5')
    //   .attr('stroke', function(d){
    //     return _this.colorScale[d['cityObj']['id']]
    //   });
    //
    // circles.each(function(d){
    //   if(d['render'] == undefined){
    //     d['render'] = []
    //   }
    //   d['render'].push(this)
    // });


    if(i >= 4){
      let regionXAxis = d3.axisBottom()
        .ticks(5);

      let axisContainer = diversityPointContainer.append('g').attr('class', 'xdimension')
        .attr("transform", function (d) {
          return "translate(" + 0 + ',' + (diversityRegionHeight - margin* 2 + 3) + ")"
        });

      axisContainer.append("g")
        .attr("class", "diversity-axis")
        .each(function (d) {
          let ct = d3.select(this)
            .call(regionXAxis.scale(xScale));
          ct.selectAll('path').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('line').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('text').attr('fill', '#777')
        });
    }


    if(i % 2 == 0){
      let regionYAxis = d3.axisLeft()
        .ticks(3)
        .tickSize(2);

      let axisContainer = diversityPointContainer.append('g').attr('class', 'ydimension')
        .attr("transform", function (d) {
          return "translate(" + 3 + ',' + (0) + ")";
        });

      axisContainer.append("g")
        .attr("class", "axis")
        .each(function (d) {
          let ct = d3.select(this).call(regionYAxis.scale(yScale));
          ct.selectAll('line').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('path').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('text').attr('fill', '#777')
        });
    }
  });

  this.diversityContainer.each(function(attr, i){
    console.log('attr', attr, i);
  });

};

function drawDiversityAxis(i, diversityPointContainer){

}
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
