/**
 * Created by qshen on 3/3/2017.
 */

import * as d3 from 'd3'

let SparkPCP = function(el, attrs, data, featureColor ){

  this.$el = el;
  d3.select(this.$el).selectAll('g').remove();
  this.attrs = attrs;
  this.data = [data[0]['record']['aggregatedImages'],data[1]['record']['aggregatedImages']]; // Image list
  this.svFeatures2Color = featureColor;
  this.isRendered = false;
  this.isChartDisplayed = false;
  this.pcpColor = ['#fdae61', '#66c2a5'];
  this.pcpBarColor = ['#f46d43', '#a6d96a']
  this.id2Data = {};
};

SparkPCP.prototype.initRender = function(){
  let _this = this;
  this.width = this.$el.clientWidth;
  this.height = this.$el.clientHeight;
  this.margin = {top: 40, right: 100, bottom: 40, left: 40};

  this.pcpRegion = {
    top: this.margin.top,
    left: this.margin.left,
    areaHeight: 40,
    pcpWidth: (this.width - this.margin.right - this.margin.left) ,
    pcpHeight: this.height - this.margin.bottom - this.margin.top,
    overallHeight: this.height,
    overallWidth: this.width,
  };
  let axisData = ['region'].concat(this.attrs);

  this.x = this.generateOverallXScaleRegionLeft([0, this.pcpRegion.pcpWidth], axisData, function(){
    return 0;
  });

  this.y = {};
  axisData.forEach(function(attr){
    _this.y[attr] = d3.scaleLinear().domain([0, _this.largestRatio]).range([_this.height - _this.margin.bottom,  _this.margin.top]);
  });

  this.svgContainer = d3.select(this.$el);

  this.pcpContainer = this.svgContainer
    .append("g")
    .attr("transform", "translate(" + this.pcpRegion.left + "," + 0 + ")");
  // this.pcpContainer.append('rect')
  //   .attr('y', this.margin.top)
  //   .attr('width', this.pcpRegion.pcpWidth)
  //   .attr('height', this.pcpRegion.pcpHeight)
  //   .attr('stroke', 'blue')
  //   .attr('fill', 'none')
  //   .attr('fill-opacity', 0.1)


  this.dimensionContainer = this.pcpContainer.selectAll(".dimension")
    .data(axisData)
    .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", function(d) {

      return "translate(" + _this.x(d) + ")";
    });
};

SparkPCP.prototype.initData = function(){
  // Important, will be used latter
  this.largestRatio = 0;
  this.ratioBarData = [];
  this.largestBarRatio = [];
  this.areaData = [];
  // Config
  let _this = this;
  let dataPair = this.data;
  let numOfScale = 100;

  dataPair.forEach(function(data, i){
    data.forEach(function(aggImg, j){
      _this.attrs.forEach(function(attr){
        if(_this.largestRatio < aggImg['attrObj'][attr] / 100){
          _this.largestRatio = aggImg['attrObj'][attr] / 100;
        }
      })
    })
  });


  dataPair.forEach(function(data, i){
    let tempRatioData = {};
    tempRatioData.len = data.length;
    data.forEach(function(aggImg, j){
      _this.attrs.forEach(function(attr){
        // Init
        if(tempRatioData[attr] == undefined){
          tempRatioData[attr] = [];
          for(var _i = 0; _i < numOfScale; _i++){
            tempRatioData[attr][_i] = 0;
          }
        }
        let _index = parseInt(aggImg['attrObj'][attr] / (100 / numOfScale));
        tempRatioData[attr][_index] += 1;
      })
    });
    _this.attrs.forEach(function(attr){
      for(var j = 0, jlen = tempRatioData[attr].length; j < jlen; j++){
        tempRatioData[attr][j] /= tempRatioData.len;
        _this.largestBarRatio = _this.largestBarRatio < tempRatioData[attr][j] ? tempRatioData[attr][j]: _this.largestBarRatio;
      }
    });

    _this.ratioBarData.push(tempRatioData)
  });

  let areaData = [];

  dataPair.forEach(function(d){
    let areaObj = {};
    let imgList = d;
    let largestValue = -1;
    _this.attrs.forEach(function(attr){
      areaObj[attr] = [];
      let _tempData = 0;
      let _num = 0
      let gap = Math.floor(imgList.length / 10);
      imgList.forEach(function(img, i){
        _tempData += img['attrObj'][attr];
        _num += 1;
        if((i % gap == 0 || i == imgList.length - 1)&& (i != 0)){

          areaObj[attr].push(_tempData / _num);
          _tempData = 0;
          _num = 0;
        }

        // areaObj[attr].push(img[attr]);
        largestValue = largestValue < img[attr] ? img[attr] : largestValue;
      });
      areaObj[attr]['largest'] = largestValue;
    });
    areaData.push(areaObj)
  });
  this.areaData = areaData;
};

SparkPCP.prototype.drawAxis = function(){
  let _this = this;
  let axis = d3.axisLeft();
  axis.ticks(6);

  let leftAxisContainer = this.dimensionContainer.append("g")
    .attr("class", "axis");
  let imagePointsContainerLeft = null;
  leftAxisContainer.each(function(d){
    let _container = d3.select(this);
    if(d == 'region'){
      imagePointsContainerLeft = _container;
      _container.attr('transform', 'translate(0,' + _this.pcpRegion.top + ')')
      _container.append("text")
        .style("text-anchor", "middle")
        .attr("y",20)
        .text(function(d){return d})
        .style('fill', 'black')
    }else{
      _container.call(axis.scale(_this.y[d]));
      _container.append("text")
        .style("text-anchor", "middle")
        .attr("y",20)
        .text(function(d){return d})
        .style('fill', 'black')
    }
  });

  let imagePointsContainerRight = this.pcpContainer.append('g')
    .attr('transform', 'translate('+ (_this.pcpRegion.pcpWidth * 9/ 10) + ',' +  _this.pcpRegion.top+ ')')


  this.drawImagePoints(imagePointsContainerLeft, _this.pcpRegion.pcpWidth / 5, _this.pcpRegion.pcpHeight, this.data[0]);
  this.drawPCPLinesLeft(this.data[0]);
  this.drawImagePoints(imagePointsContainerRight, _this.pcpRegion.pcpWidth / 5, _this.pcpRegion.pcpHeight, this.data[1]);
  this.drawPCPLinesRight(this.data[1]);


  let barContainer = this.pcpContainer.selectAll(".bars")
    .data(['region'].concat(this.attrs))
    .enter().append("g")
    .attr("class", "bars")
    .attr("transform", function(d) {

      return "translate(" + _this.x(d) + ")";
    });
  let areaContainer = this.pcpContainer.selectAll(".areas")
    .data(['region'].concat(this.attrs))
    .enter().append("g")
    .attr("class", "areas")
    .attr("transform", function(d) {
      return "translate(" + _this.x(d) + ")";
    });

  this.drawPCPBars(this.ratioBarData, barContainer);
  this.drawPCPArea(areaContainer);
};

SparkPCP.prototype.drawPCPBars = function(data, container){
  let _this = this;
  container.each(function(attr){
    if(attr == 'region') return


    let tempYScale = _this.y[attr]
    let tempXScale = d3.scaleLinear().range([0, _this.pcpRegion.pcpWidth / 20]).domain([0, _this.largestBarRatio])
    let _barDataLeft = data[0][attr];
    let _barDataRight = data[1][attr];
    let _barHeight = _this.pcpRegion.pcpHeight / (_barDataLeft.length * _this.largestRatio );
    d3.select(this).append('g').attr('class','leftContainer').selectAll('.bars')
      .data(_barDataLeft)
      .enter()
      .append('rect').attr('class','bars')
      .attr('width', function(d){
        return tempXScale(d)
      })
      .attr('x', function(d){
        return  -tempXScale(d)
      })
      .attr('height',_barHeight)
      .attr('y', function(d,i){
        return tempYScale(i / _barDataLeft.length) -_barHeight;
      })
      .attr('fill', _this.pcpBarColor[0])//.attr('opacity', 0.5)
    // .attr('stroke','white');

    d3.select(this).append('g').attr('class','rightContainer').selectAll('.bars')
      .data(_barDataRight)
      .enter()
      .append('rect').attr('class','bars')
      .attr('width', function(d){
        return tempXScale(d)
      })

      .attr('height',_barHeight)
      .attr('y', function(d,i){
        return tempYScale(i / _barDataRight.length) -_barHeight;
      })
      .attr('fill', _this.pcpBarColor[1])//.attr('opacity', 0.5)
    // .attr('stroke','white')
  })
};

SparkPCP.prototype.drawPCPArea = function(container){
  let _this = this;
  let areaChartWidth = (this.pcpRegion.pcpWidth) / 10;
  let areaChartHeight = this.margin.top * 2 / 3;

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
  container.each(function(attr){
    if(attr == 'region'){
      return
    }

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
  })


};

SparkPCP.prototype.drawLineArea = function(){
  let _this = this;
  let areaChartWidth = (this.pcpRegion.pcpWidth) / 6;
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
    if(attr == 'region'){
      return
    }
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

    areaPairContainers.append("path")
      .attr("class", "areachart")
      .attr("d", function(d, i){
        return areaRenders[i][attr](d[attr])
      })
      .attr('fill',function(){
        return _this.svFeatures2Color[attr];
      })
      .attr('fill-opacity', 0.6);

  })
};
SparkPCP.prototype.generateOverallXScaleRegionLeft = function(range, domain, specialXScale){
  let specialAttr = null;
  let remainArr = [];
  for(var i = 0,ilen = domain.length; i < ilen; i++){
    if(i == 0){
      specialAttr = domain[i];
    }else{
      remainArr.push(domain[i]);
    }
  }

  let tempScale = function(d, location){

    let attrX = d3.scalePoint()
      .range([range[0]+ (range[1] - range[0]) / 5, range[1] * 4 / 5])
      .domain(domain);
    if(d == specialAttr){
      return specialXScale(location)
    }else{
      return attrX(d);
    }
  }
  return tempScale;
};

SparkPCP.prototype.generateOverallXScaleRegionRight = function(range, domain, specialXScale){
  let specialAttr = null;
  let remainArr = [];
  for(var i = 0,ilen = domain.length; i < ilen; i++){
    if(i == domain.length - 1){
      specialAttr = domain[i];
    }else{
      remainArr.push(domain[i]);
    }
  }
  let _this = this;
  let tempScale = function(d, location){

    let attrX = d3.scalePoint()
      .range([range[0]+ (range[1] - range[0]) * 1 / 5 , range[1] * 4 / 5])
      .domain(domain);
    if(d == specialAttr){
      return specialXScale(location)
    }else{
      return attrX(d) + range[1] / 10;
    }
  }
  return tempScale
};

SparkPCP.prototype.drawImagePoints = function(container, width, height, streetData){

  let _this = this;
  // container.append('rect')
  //   .attr('width',width)
  //   .attr('height', height)
  //   .attr('stroke', 'red')
  //   .attr('fill', 'none')
  this.xRange = d3.extent(streetData, function(d){
    return d['location'][0]
  });
  this.yRange = d3.extent(streetData, function(d){
    return d['location'][1]
  });

  let tempXScale = d3.scaleLinear().range([0, width]).domain(this.xRange);
  let tempYScale = d3.scaleLinear().range([height, height / 2]).domain(this.yRange);
  this.regionXScale = tempXScale;
  this.regionYScale = tempYScale;
  let sigContainers = container.selectAll('.imagePointContainer')
    .data(streetData)
    .enter()
    .append('g')
    .attr('class', 'imagePointContainer')
    .attr('transform', function(d){
      let x = tempXScale(d['location'][0]);
      let y = tempYScale(d['location'][1]);

      return 'translate(' + x + ',' + y + ')';
    });

  sigContainers.append('circle')
    .attr('r', 5)
    .attr('fill-opacity', 0.8)
    .attr('fill', function(d){
      let attr = d['max_attr']['attr']
      return _this.svFeatures2Color[attr];
    })
    .attr('stroke', 'white')
};


SparkPCP.prototype.drawPCPLinesRight = function(imgList){
  let _this = this;
  let allAttrs = this.attrs.concat(['region']);
  let xScale = this.generateOverallXScaleRegionRight([0, this.pcpRegion.pcpWidth], allAttrs, function(d){
    return _this.regionXScale(d[0]) + _this.pcpRegion.pcpWidth / 10 * 9;
  })
  let yScale = function(attr, d){
    if(attr == 'region'){

      let yValue = d['location'][1];
      let _y = _this.regionYScale(yValue) + _this.pcpRegion['top']

      return _y;
    }else{
      let yValue = d['attrObj'][attr];
      let _y = _this.y[attr](yValue / 100);

      return _y;
    }
  }



  var  lineContainers = this.pcpContainer.append('g').attr("class", "background")

    .selectAll('.lineContainer')
    .data(imgList)
    .enter()
    .append('g').attr('class', 'lineContainer')

  lineContainers.each(function(aggImg){
    let _container = d3.select(this);
    let line = d3.line()
      .x(function(attr){
        let _x = xScale(attr, aggImg['location'])
        return _x;
      })
      .y(function(attr){
        let _y =  yScale(attr, aggImg)
        return _y ;
      })
      .curve(d3.curveLinear)

    _container.datum(allAttrs).append('path').attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', _this.pcpColor[1])
      .attr('opacity', 0.3)
  })

};


SparkPCP.prototype.drawPCPLinesLeft = function(imgList){
  let _this = this;
  let allAttrs = ['region'].concat(this.attrs);

  // Draw
  let xScale = this.generateOverallXScaleRegionLeft([0, this.pcpRegion.pcpWidth], allAttrs, function(d){
    return _this.regionXScale(d[0]);

  });
  let yScale = function(attr, d){
    if(attr == 'region'){

      let yValue = d['location'][1];
      let _y = _this.regionYScale(yValue) + _this.pcpRegion['top']

      return _y;
    }else{
      let yValue = d['attrObj'][attr];
      let _y = _this.y[attr](yValue / 100);

      return _y;
    }
  }


  var  lineContainers = this.pcpContainer.append('g').attr("class", "background")

    .selectAll('.lineContainer')
    .data(imgList)
    .enter()
    .append('g').attr('class', 'lineContainer')

  lineContainers.each(function(aggImg){
    let _container = d3.select(this);
    let line = d3.line()
      .x(function(attr){
        let _x = xScale(attr, aggImg['location'])
        return _x;
      })
      .y(function(attr){
        let _y =  yScale(attr, aggImg)
        return _y ;
      })
      .curve(d3.curveLinear)
    _container.datum(allAttrs).append('path').attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', _this.pcpColor[0])
      .attr('opacity', 0.3)
  })

};

SparkPCP.prototype.onSelectedImages = function(selectedImages){
  if(selectedImages['sign'] == true){
    this.highlightSelected(selectedImages);
  }else if(selectedImages['sign'] == false){
    this.removeHighlightSelected(selectedImages);
  }
};

SparkPCP.prototype.highlightSelected = function(selectedImages){
  let _this = this;
  let iids = selectedImages['iids'];
  iids.forEach(function(iid){
    if(_this.id2Data[iid]!= undefined){
      d3.select(_this.id2Data[iid]['iel']).attr('stroke-width', 2).attr('opacity', '1')
    }
  })
};
SparkPCP.prototype.removeHighlightSelected = function(selectedImages){
  let _this = this;
  let iids = selectedImages['iids'];
  iids.forEach(function(iid){
    if(_this.id2Data[iid]!= undefined){
      d3.select(_this.id2Data[iid]['iel']).attr('stroke-width', 1).attr('opacity', '0.05')
    }
  })
};


SparkPCP.prototype.init = function(){

  this.initData();
  this.initRender();
  this.drawAxis();
  //
  // this.drawPCPLines();
  // this.drawLineArea();
  // this.drawPCPBars();
  // this.drawRemarkIcon();
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

SparkPCP.prototype.drawRemarkIcon = function(){
  let _this = this;

  let remarkPanel = d3.select(this.$el).append('g').attr('class', 'remarkIconContainer')
    .attr('transform', 'translate(' + (this.pcpRegion.pcpWidth  * 7 / 6 + this.margin.left) + ',' + this.margin.top + ')')
  let remarkContainers = remarkPanel.selectAll('.remarkIcon')
    .data(this.attrs)
    .enter()
    .append('g')
    .attr('class', 'remarkIcon')

  remarkContainers.append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', function(attr){
      return _this.svFeatures2Color[attr];

    })
    .attr('x', 0)
    .attr('y', function(d, i){return i * 15})
    .attr('opacity', 0.8)

  remarkContainers.append('text')
    .text(function(attr) {return attr})
    .attr('x', 20)
    .attr('y' ,function(d, i){
      return i * 15 + 10;
    })

};

export default SparkPCP
