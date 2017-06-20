/**
 * Created by qshen on 16/6/2017.
 */
import {Unit} from "../../../src/lib/MultiExploration/BasicElements.js";
import * as d3 from "d3";

let nameMap = {
  'london': 'LON',
  'singapore': 'SIN',
  'nyc': 'NYC',
  'hk': 'HK'
};
let featureMap = {
  'green': 'greenery',
  'car': 'vehicle'
};

let durationTime = 500;
let MultiExploration = function(el, colorMap){
  this.selected = {
    'idMap': {},
    'number': 0,
    'xIndex2Color':{},
    'maxSelectd': 2,
    'extendYIndex': null
  };
  this.selectedColor = [{'color': '#df65b0',  'used': false}, {'color': '#2b8cbe', 'used': false}];
  this.styleConfig = {
    clickHighlightOpacity: 0.3,
    clickNormalOpacity: 0.2,
  };
  this.el = el;
  this.columNumber = 18;
  this.colorMap = colorMap;
  this.width = el.clientWidth;
  this.height = 400;
  this.svg = d3.select(this.el).append('svg').attr('width', this.width);
  this.svg.style('border-width', '1px').style('border-style','solid').style('border-color','#dfe6ec').style('border-radius', '3px');
  this.clipContainer = this.svg.append('g');
  this.tableMargin = {'top':5,'left':5,'right':5,'bottom':5};
  this.containerWidth = this.width - this.tableMargin.left - this.tableMargin.right;
  this.containerHeight = this.height - this.tableMargin.top - this.tableMargin.bottom;
  this.container = this.svg.append('g').attr('transform', 'translate(' + this.tableMargin.left + ',' + this.tableMargin.top + ')');
  this.unitConfig = {
    left: 2,
    right: 2,
    top: 2,
    bottom: 2,
    headHeight: 30,
    height: 25,

    widths: [],
    lefts: [],
    widthScale: [],
    domains: [],
    signBoxWidth: 6,
    boxplotWidthScale: []
  };
  // Generate render attributes
  this.unitConfig.renderTop = this.unitConfig.top + 3;
  this.unitConfig.renderRight = this.unitConfig.right + 10;
  this.unitConfig.renderLeft = this.unitConfig.left;
  this.unitConfig.renderBottom = this.unitConfig.bottom + 3;
  this.unitConfig.renderHeight = this.unitConfig.height - this.unitConfig.renderTop - this.unitConfig.renderBottom;
  this.attrUnits = [];
  this.handleFucs = {};
};

MultiExploration.prototype.updateBackground = function(){
  this.backgroundContainer = this.bodyContainer.append('g').attr('class', 'backgroundContainer')
  let unitConfig = this.unitConfig;
  let backRows = [];
  let backUnits = [];
  for(var i = 0, ilen = this.columNumber; i < ilen; i++){
    let _row = [];
    this.attrs.forEach(function(attr, j){
      _row.push(new Unit(i + '_' + j + '_' + attr, attr, attr, i, j, 'background'));
    });
    backRows.push(_row);
    backUnits = backUnits.concat(_row)
  };


  let unitContainers = this.bodyContainer.selectAll('.backgroundUnit')
    .data(backUnits, function(d){
      return d.id
    });
  let t = d3.transition()
    .duration(durationTime);
  // UPDATE old elements present in new data.e
  unitContainers.each(function(d){
    let yIndex = d['yIndex'];
    let xIndex = d['xIndex'];
    let left = unitConfig.lefts[yIndex];
    let _width = unitConfig.widths[yIndex] - unitConfig.left - unitConfig.right;
    let _height = unitConfig.height ;
    let value = d['value'];

    let unitContainer = d3.select(this);
    unitContainer
      // .transition(t)
      .attr('transform', 'translate('+ left + ',' + (xIndex * unitConfig.height)+ ')');

    unitContainer.selectAll('.unitBackground')
      // .transition(t)
      .attr('width', _width).attr('height', _height)
      .attr('fill', function(){
        return xIndex % 2 != 0? '#eee': '#fff';
      })
      .attr('opacity', 0.8)
      .attr('x', unitConfig.left)
      .attr('y', 0);

  });

  // ENTER new elements present in new data.
  let newUnitContainers = unitContainers.enter().append('g').attr('class', 'backgroundUnit')
  // .attr('clip-path', d=>{
  //   let clip_id = 'clips_'+ d.attr;
  //   return 'url(#' + clip_id + ')'
  // });

  newUnitContainers.each(function(d){
    let yIndex = d['yIndex'];
    let xIndex = d['xIndex'];
    let left = unitConfig.lefts[yIndex];
    let _width = unitConfig.widths[yIndex] - unitConfig.left - unitConfig.right;
    // let _height = unitConfig.height - unitConfig.top - unitConfig.bottom;
    let _height = unitConfig.height;

    let value = d['value'];
    let unitContainer = d3.select(this);
    unitContainer.attr('transform', 'translate('+ left + ',' + (xIndex * unitConfig.height)+ ')');
    unitContainer.append('rect').attr('class','unitBackground')
      .attr('width', _width).attr('height', _height)
      .attr('fill', function(){
        return xIndex % 2 != 0? '#eee': '#fff';
      })
      .attr('opacity', 0.8)
      .attr('x', unitConfig.left);
    // .attr('y', unitConfig.top);
  });

  // Remove old elements as needed.
  let exitUnitContainers = unitContainers.exit();
  exitUnitContainers.remove();


};

MultiExploration.prototype.initBodyRender = function(){
  this.container.selectAll('.bodyContainer').remove();
  this.bodyContainer = this.container.append('g').attr('class', 'bodyContainer')
    .attr('transform','translate(0,' + (this.unitConfig.headHeight) + ')');


  let clips = this.clipContainer.selectAll('clipPath')
    .data(this.attrs, attr=>{
      return attr;
    });

  let clips_rects = clips.enter()
    .append('clipPath')
    .attr('id', function(d){
      return 'clips_'+ d;
    })
    .append('rect')
    .attr('width',(d, i)=>{
      return this.unitConfig.widths[i] - this.unitConfig.left;
    })
    .attr('height', this.unitConfig['height']);
  this.clips_rects = clips_rects;
  this.updateBackground();
};


MultiExploration.prototype.setAttrs = function(attrs){
  this.attrs = attrs;
  this.unitConfig.attr2Index = {};
  this.attrUnits = [];
  for(let i = 0, ilen = this.attrs.length; i < ilen; i++){
    this.attrUnits.push(new Unit(this.attrs[i], this.attrs[i], this.attrs[i],0, i));
    this.unitConfig.attr2Index[this.attrs[i]] = i;
  }
  if(this.widthRatios == undefined || this.widthRatios.length == 0){
    this.widthRatios = [];
    for(let i = 0, ilen = this.attrs.length; i < ilen; i++){
      let attr = this.attrs[i];
      if(attr == 'id' || attr == 'city'){
        this.widthRatios.push(0.5 / (ilen - 1));
      }else{
        this.widthRatios.push(1 / (ilen - 1));
      }

    }
  }
  this.updateRenderHead();
  this.initBodyRender();
};

MultiExploration.prototype.update = function(dataList){

// Hack
  let vectors = processStreets(dataList, this.attrs);
  this.bodyData = vectors;
  let largestValue = -1;
  let largestMax = -1
  this.attrs.forEach((attr, i)=>{
    let extent = d3.extent(vectors, function(d){
      return d.data[i].value;
    });

    let maxExtent = d3.extent(vectors, function(d){
      return d.data[i].plot['max'];
    });

    if(attr != 'id' && attr != 'city'){
      largestValue = largestValue < extent[1]? extent[1]: largestValue;
      largestMax = largestMax < maxExtent[1]? maxExtent[1] : largestMax;
    }

    this.unitConfig.domains[i] = extent;

  });


  this.attrs.forEach((attr, i)=>{
    let index = this.unitConfig.attr2Index[attr];
    if(attr == 'id') {
      this.unitConfig.widthScale[i] = null;
      this.unitConfig.boxplotWidthScale[i] = null;
    }
    else if(attr == 'city') {
      this.unitConfig.widthScale[i] = null;
      this.unitConfig.boxplotWidthScale[i] = null;
    }
    else{
      let xscale = d3.scaleLinear().range([0, this.unitConfig.widths[index] - this.unitConfig.renderRight])
        .domain([0 , largestValue]);
      this.unitConfig.widthScale[i] = xscale;
      let plotScale = d3.scaleLinear().range([0, this.unitConfig.widths[index] - this.unitConfig.renderRight]).domain([0 , largestMax+5]);
      this.unitConfig.boxplotWidthScale[i] = plotScale;
    }
  });

  let _height = this.columNumber * this.unitConfig.height + this.unitConfig.headHeight + this.tableMargin.top + this.tableMargin.bottom;
  this.updateRenderBody();
  this.svg.attr('height', _height);
};

MultiExploration.prototype.updateRenderBody = function(){

  let _this = this;
  let unitConfig = this.unitConfig;

  let units = [];
  let t = d3.transition()
    .duration(durationTime);

  this.clips_rects.transition(t).attr('width',(d, i)=>{
    return this.unitConfig.widths[i] - this.unitConfig.left;
  });

  this.bodyData.forEach(function(row){
    units = units.concat(row.data);
  });
  let unitContainers = this.bodyContainer.selectAll('.bodyUnit')
    .data(units, function(d){
      return d.id
    });


  // UPDATE old elements present in new data.
  unitContainers.each(function(d){
    let yIndex = d['yIndex'];
    let xIndex = d['xIndex'];


    let unitContainer = d3.select(this);
    unitContainer
      .transition(t)
      .attr('transform', 'translate('+ unitConfig.lefts[yIndex] + ',' + (xIndex * unitConfig.height)+ ')');

    _this.updateClickBackground(unitContainer, d);
    if(d.attr == 'id' || d.attr == 'city') {
      // id inforamtion
    }else{
      if(_this.selected.extendYIndex == yIndex){
        d.currStyle = 'box';
        _this.updateBoxPlot(unitContainer, d);
      }else{

        if(d.currStyle == 'box'){
          d.currStyle = 'bar';
          _this.renderBar(unitContainer, d);
        }else{
          d.currStyle = 'bar';
          _this.updateBar(unitContainer, d);
        }
      }
    }
  });

  // ENTER new elements present in new data.
  let newUnitContainers = unitContainers.enter().append('g').attr('class', 'bodyUnit')
    .attr('clip-path', d=>{
      let clip_id = 'clips_'+ d.attr;
      return 'url(#' + clip_id + ')';
    });

  newUnitContainers.each(function(d){
    let yIndex = d['yIndex'];
    let xIndex = d['xIndex'];
    let value = d['value'];

    let unitContainer = d3.select(this);
    unitContainer.attr('transform', 'translate('+ unitConfig.lefts[yIndex] + ',' + (xIndex * unitConfig.height)+ ')');
    // Add select background rect

    _this.renderClickBackground(unitContainer, d);
    if(d.attr == 'id' ) {
      _this.renderKeyLabel(unitContainer, d)
    }else if(d.attr == 'city'){
      _this.renderLabel(unitContainer, d);
    }
    else{
      d.currStyle = 'bar';
      _this.renderBar(unitContainer, d);
    }
  });

  newUnitContainers.on('click', (d)=>{
    _this.clickOnBodyUnit(d);
  }).on('mouseover',(d)=>{
    this.hoverHighlightRow(d.xIndex);
  }).on('mouseout', (d)=>{
    this.removeHoverHighlightRow(d.xIndex);
  }).append('title').text(function(d){
    return d.raw.name;
  })


  // Remove old elements as needed.
  let exitUnitContainers = unitContainers.exit();
  exitUnitContainers.remove();

};

MultiExploration.prototype.on = function(eventName, func){
//  register event functions
  this.handleFucs[eventName] = func;
};

MultiExploration.prototype.hoverHighlightRow = function(xIndex){
  let _this = this;
  let t = d3.transition()
    .duration(300);
  this.bodyContainer.selectAll('.backgroundUnit').each(function(d){
    if(d.xIndex == xIndex){
      d3.select(this).selectAll('rect').transition(t).attr('fill', '#ccc')
    }
  })
};

MultiExploration.prototype.removeHoverHighlightRow = function(xIndex){
  let _this = this;
  let t = d3.transition()
    .duration(300);

  this.bodyContainer.selectAll('.backgroundUnit').each(function(d){
    if(d.xIndex == xIndex){
      d3.select(this).selectAll('rect').transition(t).attr('fill', function(){
        return xIndex % 2 != 0? '#eee': '#fff';
      });
    }
  })
};

MultiExploration.prototype.clickHighlightRow = function(xIndex){
  let _this = this;
  let color = this.findUnusedColor();
  if(!color) return;
  this.selected.xIndex2Color[xIndex] = color;
  ////////////////////////////////////////////////////
  let t = d3.transition()
    .duration(durationTime);

  this.bodyContainer.selectAll('.bodyUnit').each(function(d){
    if(d.xIndex == xIndex ){
      if(d.attr == 'id'){
        d3.select(this).selectAll('.signbox').transition(t).attr('fill', color).attr('fill-opacity', 0.8);
      }
      d3.select(this).selectAll('.clickBackground').transition(t).attr('fill', color).attr('opacity', _this.styleConfig.clickHighlightOpacity);
    }
  });

  return color;
};

MultiExploration.prototype.removeClickHighlightRow = function(xIndex){
  let _this = this;
  let color = this.selected.xIndex2Color[xIndex];
  this.releaseColor(color);
  let t = d3.transition()
    .duration(durationTime);

  this.bodyContainer.selectAll('.bodyUnit').each(function(d){
    if(d.xIndex == xIndex ){
      if(d.attr == 'id'){
        d3.select(this).selectAll('.signbox').transition(t).attr('fill-opacity', 0);
      }
      d3.select(this).selectAll('.clickBackground').transition(t).attr('fill', color).attr('opacity', 0);
    }
  });
};

MultiExploration.prototype.findUnusedColor = function(){
  for(let i = 0, ilen = this.selectedColor.length; i < ilen; i++){
    let colorObj = this.selectedColor[i];
    if(colorObj.used == false){
      colorObj.used = true;
      return colorObj.color
    }
  }
  return null;
};

MultiExploration.prototype.releaseColor = function(color){
  this.selectedColor.forEach((d)=>{
    if(d.color == color){
      d.used = false;
    }
  });
};

MultiExploration.prototype.updateRenderHead = function(){

  // neet set attrs
  let unitConfig = this.unitConfig;
  let _this = this;
  this.unitConfig.widths = [];
  let left = 0;
  this.widthRatios.forEach((d, i)=>{
    let _width = d * this.containerWidth;
    this.unitConfig.widths[i] = _width;
    this.unitConfig.lefts[i] = left;
    left +=_width;
  });


  this.container.selectAll('.rowContainer').remove();
  this.attrsRowContainer = this.container.append('g').attr('class', 'rowContainer');
  this.attrContainers = this.attrsRowContainer.selectAll('.attrContainer')
    .data(this.attrUnits)
    .enter()
    .append('g')
    .attr('class', 'attrContainer');

  this.attrContainers.each(function(d){
    let yIndex = d['yIndex'];
    let left = unitConfig.lefts[yIndex];
    let _width = unitConfig.widths[yIndex] - unitConfig.left - unitConfig.right;
    let _height = unitConfig.headHeight - unitConfig.top - unitConfig.bottom;
    let unitContainer = d3.select(this);
    unitContainer.attr('transform', 'translate('+ left + ',0)');
    unitContainer.append('rect')
      .attr('width', _width).attr('height', _height)
      .attr('fill', '#eee').attr('opacity', 0.8)
      .attr('x', unitConfig.left)
      .attr('y', unitConfig.top)
      .on('click', function(){
        _this.clickOnAttr(d.value)
      });
    unitContainer.append('text')
      .style('font-weight', 'bold')
      .style('font-family', "'PT Sans',Tahoma")
      .text(function(d){
        let value = featureMap[d.value] == undefined? d.value: featureMap[d.value];
        return value.charAt(0).toUpperCase() + value.slice(1);
      }).attr('y', 18).attr('x', unitConfig.left + 1)
  });
};

MultiExploration.prototype.clickOnAttr = function(attr){
  this.sortByAttr(attr);
  this.updateRenderBody();
};

MultiExploration.prototype.sortByAttr = function(attr){
  let index = this.unitConfig.attr2Index[attr];
  let arr = [];
  this.bodyData.sort(function(row1, row2){
    let value2 = row2.data[index].value;
    let value1 = row1.data[index].value;
    return value2  - value1 ;
  });

  this.freshIndex();
};

MultiExploration.prototype.freshIndex = function(){
  this.bodyData.forEach(function(row, x){
    row.data.forEach(function(unit, y){
      unit.updateIndex(x, y);
    })
  })
};

MultiExploration.prototype.renderBar = function(el, d){
  let unitConfig = this.unitConfig;
  let yIndex = d['yIndex'];
  let xIndex = d['xIndex'];
  let value = d['value'];
  let _this = this;
  el.selectAll('.plot').remove();
  el.append('rect').attr('class', 'value')
    .attr('width', d=>{
      let _w = unitConfig.widthScale[yIndex](value);
      return _w;
    })
    .attr('height', unitConfig.renderHeight)
    .attr('fill', ()=>{
      // '#5FB2E8'
      return _this.colorMap[d.attr]
    })
    .attr('opacity', 0.8)
    .attr('x', unitConfig.renderLeft)
    .attr('y', unitConfig.renderTop)
};

MultiExploration.prototype.renderLabel = function(el, d){
  let unitConfig = this.unitConfig;
  let yIndex = d['yIndex'];
  let xIndex = d['xIndex'];
  let value = d['value'];
  let label = nameMap[value] == undefined? value : nameMap[value];
  let text = el.append('text').text(label);
  let conf = text.node().getBBox();
  text.attr('x', unitConfig.renderLeft)
    .attr('y', (conf.height + unitConfig.height) / 2 - 1 );

};

MultiExploration.prototype.renderKeyLabel = function(el, d){
  let unitConfig = this.unitConfig;
  let yIndex = d['yIndex'];
  let xIndex = d['xIndex'];
  let value = d['value'];
  let label = nameMap[value] == undefined? value : nameMap[value];
  label = "HK "+label;
  let text = el.append('text').text(label);
  let conf = text.node().getBBox();
  text.attr('x', unitConfig.renderLeft + unitConfig.signBoxWidth + 2)
    .attr('y', (conf.height + unitConfig.height) / 2 - 1 );
  if(d.attr == 'id'){
    let signY = (unitConfig.height - unitConfig.signBoxWidth) / 2;
    let signX = unitConfig.left;
    let signBoxBoundary = el.append('rect').attr('class', 'singBoxBoundary')
      .attr('width', unitConfig.signBoxWidth).attr('height', unitConfig.signBoxWidth)
      .attr('x', signX).attr('y', signY)
      .attr('fill-opacity', 0)
      .attr('stroke-width', 1).attr('stroke-opacity', 0.5)
      .attr('stroke', "#212121")

    let signBox = el.append('rect').attr('class','signbox')
      .attr('width', unitConfig.signBoxWidth - 2)
      .attr('height', unitConfig.signBoxWidth - 2)
      .attr('x', signX + 1)
      .attr('y', signY + 1)
      .attr('fill', 'none');
  }
};

MultiExploration.prototype.renderClickBackground = function(el, d){
  let unitConfig = this.unitConfig;
  let yIndex = d['yIndex'];
  let xIndex = d['xIndex'];
  let value = d['value'];

  let _width = unitConfig.widths[yIndex] - unitConfig.left - unitConfig.right;
  let _height = unitConfig.height;

  el.append('rect').attr('class', 'clickBackground')
    .attr('width', _width)
    .attr('height', _height)
    .attr('opacity', function(d){
      return 0
    })
    .attr('x', unitConfig.renderLeft)
    .attr('y', 0);
};

MultiExploration.prototype.updateClickBackground = function(el, d){
  let unitConfig = this.unitConfig;
  let yIndex = d['yIndex'];
  let xIndex = d['xIndex'];
  let value = d['value'];

  let _width = unitConfig.widths[yIndex] - unitConfig.left - unitConfig.right;
  let _height = unitConfig.height;

  el.select('.clickBackground')
    .attr('width', _width)
    .attr('height', _height)
    .attr('opacity', function(){
      if(d.raw.clicked == true){
        return 0.4;
      }else{
        return 0;
      }
    })
    .attr('x', unitConfig.renderLeft)
    .attr('y', 0);
};

MultiExploration.prototype.updateBar = function(el, d){
  let unitConfig = this.unitConfig;
  let yIndex = d['yIndex'];
  let xIndex = d['xIndex'];
  let value = d['value'];
  let t = d3.transition()
    .duration(durationTime);

  el.select('.value')
    .transition(t)
    .attr('width', unitConfig.widthScale[yIndex](value))
    .attr('height', unitConfig.renderHeight)
    .attr('x', unitConfig.renderLeft)
    .attr('y', unitConfig.renderTop)
};

MultiExploration.prototype.updateBoxPlot = function(el, d){
  let unitConfig = this.unitConfig;
  let yIndex = d['yIndex'];
  let xIndex = d['xIndex'];
  let value = d['value'];

  let t = d3.transition()
    .duration(durationTime);

  let plotData = d.plot;

  let boxX = this.unitConfig.boxplotWidthScale[yIndex](plotData.ofv);
  let boxW = this.unitConfig.boxplotWidthScale[yIndex](plotData.tfv) - boxX;


  let minX = this.unitConfig.boxplotWidthScale[yIndex](plotData.min);
  let maxX = this.unitConfig.boxplotWidthScale[yIndex](plotData.max);
  let meanX = this.unitConfig.boxplotWidthScale[yIndex](plotData.mean)

  let strokeWidth = 1.5;

  let minY = this.unitConfig.top + 3;
  let maxY = this.unitConfig.height - this.unitConfig.bottom - 3;

  let boxH = maxY - minY;

  el.selectAll('.value').remove();

  let boxContainer = el.append('g').attr('class', 'plot');
  let connectLine = boxContainer.append('line')
    .attr('x1', minX).attr('x2', maxX)
    .attr('y1', this.unitConfig.height / 2).attr('y2', this.unitConfig.height / 2)
    .attr('stroke', '#888').attr('stroke-width', strokeWidth);
  let minLine = boxContainer.append('line')
    .attr('x1', minX).attr('x2', minX)
    .attr('y1', minY).attr('y2', maxY)
    .attr('stroke', '#888').attr('stroke-width', strokeWidth);

  let maxLine = boxContainer.append('line')
    .attr('x1', maxX).attr('x2', maxX)
    .attr('y1', minY).attr('y2', maxY)
    .attr('stroke', '#888').attr('stroke-width', strokeWidth);

  let box = boxContainer.append('rect').attr('x', boxX)
    .attr('y', minY)
    .attr('width', boxW)
    .attr('height', boxH)
    .attr('stroke-width', strokeWidth)
    .attr('stroke', '#888')
    .attr('fill','#bbb');

  let neanLine = boxContainer.append('line')
    .attr('x1', meanX).attr('x2', meanX)
    .attr('y1', minY).attr('y2', maxY)
    .attr('stroke', '#888').attr('stroke-width', strokeWidth);

};

MultiExploration.prototype.clickOnBodyUnit = function(d){
  let attr = d.attr;
  if(attr == 'id' || attr == 'city'){
    let id = d.raw.id;
    if(this.selected.idMap[id] == undefined){
      if(this.selected.number >= this.selected.maxSelectd ){
        return
      }
      this.selected.idMap[id] = d;
      this.selected.number += 1;
      let color = this.clickHighlightRow(d.xIndex);
      d.raw.clicked = true;
      d.mColor = color;
      this.handleFucs['rowClick'](d, 'add');
    }else{
      delete this.selected.idMap[id];
      this.selected.number -= 1;
      this.handleFucs['rowClick'](d, 'remove');
      delete d.raw.clicked;
      this.removeClickHighlightRow(d.xIndex);
    }
  }else{
    let yIndex = this.unitConfig.attr2Index[attr]

    this.extandColumn(yIndex);
  }
};

MultiExploration.prototype.extandColumn = function(yIndex){

  if(yIndex == this.selected.extendYIndex){
    this.selected.extendYIndex = null;
    this.widthRatios = [];
    for(let i = 0, ilen = this.attrs.length; i < ilen; i++){
      let attr = this.attrs[i];
      if(attr == 'id' || attr == 'city'){
        this.widthRatios.push(0.5 / (ilen - 1));
      }else{
        this.widthRatios.push(1 / (ilen - 1));
      }
    }
  }else{
    this.selected.extendYIndex = yIndex;
    let attr = this.attrs[yIndex];
    if(attr == 'id' || attr == 'city') return
    let newRatios = [];
    for(var i = 0, ilen = this.widthRatios.length; i < ilen; i++){
      let _attr = this.attrs[i];
      if(_attr == 'id' || _attr == 'city'){
        newRatios.push(0.5 / (ilen - 1));
      }else{
        if(i == yIndex){
          newRatios.push((1 - 1 / (ilen - 1)) / 2);
        }else{
          newRatios.push((1 - 1 / (ilen - 1)) / 2 / (ilen - 3))
        }
      }
    }
    this.widthRatios = newRatios;
  }

  this.updateRenderHead(); // unitConfig.width is changed in updated in this function
  this.updateScale();
  this.updateBackground();
  this.updateRenderBody();
};

MultiExploration.prototype.updateScale = function(){
  this.unitConfig.widthScale.forEach((scale, index)=>{
    if(scale){
      scale.range([0, this.unitConfig.widths[index] - this.unitConfig.renderRight]);

    }
  });
  this.unitConfig.boxplotWidthScale.forEach((scale, index)=>{
    if(scale){
      scale.range([3, this.unitConfig.widths[index] - this.unitConfig.renderRight]);
    }
  })

};

function processStreets(streets, attrs){
  let vectors = [];

  streets.forEach((street, rIndex)=>{
    let attr2Value = street.record == undefined ? street.statistics: street.record.statistics;
    let _unit = {};
    let unitArray = [];
    let streetId = null;
    attrs.forEach(function(attr, cIndex){
      let value = attr == 'id'? (street.record.id == undefined? street.id:street.record.id):
        attr == 'city'? street.city: attr2Value[attr];
      if(attr == 'id') streetId = value;
      _unit[attr] = value;
      let id = streetId + '_' + attr;
      let unit = new Unit(id, attr, value, rIndex, cIndex, 'data', street);
      //Hack
      let _plot = street.record.plot == undefined? street.plot: street.record.plot;
      _plot = _plot == undefined? {}: _plot;
      unit.plot = _plot[attr] == undefined? {}: _plot[attr];
      unitArray.push(unit);
    });
    vectors.push({'id': streetId, data: unitArray, raw: street});
  });
  return vectors;
};
export default MultiExploration;
