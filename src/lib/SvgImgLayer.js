/**
 * Created by yiding on 2017/1/12.
 */
import * as d3 from "d3";

let SvgImgLayer = function(el, svFeatures2Color){
  this.$el = el;
  this.width = this.$el.clientWidth;
  this.height = this.$el.clientHeight;
  this.disablePoint = false;
  this.svFeatures2Color = svFeatures2Color;
  this.container = d3.select(this.$el).append('g').attr('class', 'imagecontainer');
  this.id2Data = {};
  this.features = svFeatures2Color['allFeatures'];
  this.imgWidth = 84;
  this.imgHeight = 64;
};

SvgImgLayer.prototype.setColorStyle = function(colorStyle){
  this.colorStyle = colorStyle;
};

SvgImgLayer.prototype.getCotnainer = function(){
  return this.container;
};

SvgImgLayer.prototype.generateColorStyles = function(){
  let _this = this;
  let colors = [];
  let features = this.svFeatures2Color['allFeatures'];
  features.forEach(function(attr){
    colors.push(_this.svFeatures2Color[attr])
  });

  var colorScales = d3.scaleOrdinal()
    .range(colors);
  this.colorScales = colorScales;

  return colorScales;
};

SvgImgLayer.prototype.setImgList = function(imgList, str){
  this.imgList = imgList;
  if(str != undefined){
    this.imgList.sort(function(a, b){
      return parseInt(a[str]) - parseInt(b[str]);
    });
  }
};


SvgImgLayer.prototype.getImgPerDis = function(imgList){
  imgList = imgList == undefined? this.imgList: imgList;
  let allDis = this.sampleImage(imgList, function(d){
    return d.screenLocation;
  });
  let imgAvgDis = allDis / imgList.length;
  return {
    avg: imgAvgDis,
    dis: allDis,
    bestNumber: allDis / 60
  };
};

function distance(p1, p2){
  let dx = p1.x == undefined? (p1[0] - p2[0]): (p1.x - p2.x);
  let dy = p1.y == undefined? (p1[1] - p2[1]): (p1.y - p2.y);
  return Math.sqrt(dx * dx + dy * dy)
};

SvgImgLayer.prototype.sampleImage = function(imgList, func){
  let allDis = 0;
  let prePoint = null;
  imgList.forEach((d, i)=>{
    if(i == 0) prePoint = func(d);
    allDis += distance(prePoint, func(d));
    prePoint = func(d);
  });
  return allDis;
};

SvgImgLayer.prototype.reInit = function(){
  this.generateColorStyles();
  this.generateOffset();
  // this.generateAssistanceGraphics();
};

SvgImgLayer.prototype.getImgList = function(){
  return this.imgList;
};

SvgImgLayer.prototype.generateOffset = function(){

  if(!this.imgList) return;

  this.fx = 0, this.fy = 0, this.lx = 0, this.ly = 0;
  let imgList = this.imgList;

  if(imgList.length != 0){
    this.fx = imgList[0]['screenLocation'].x;
    this.fy = imgList[0]['screenLocation'].y;
    this.lx = imgList[imgList.length - 1]['screenLocation'].x;
    this.ly = imgList[imgList.length - 1]['screenLocation'].y;
    let streetVectorY = this.ly - this.fy;
    let streetVectorX = this.lx - this.fx;
    let renderRatio = streetVectorX == 0? 0 : - streetVectorY / streetVectorX;
    let distance = this.$el.clientHeight / 15;
    this.dy = Math.sqrt(distance * distance / (1 + renderRatio * renderRatio));
    this.dx = this.dy * renderRatio;
  }
  else{
    this.dx = 0;
    this.dy = 0;
  }
  return [this.dx, this.dy, this.fx, this.fy, this.lx, this.ly]
};

SvgImgLayer.prototype.generateAssistanceGraphics = function(){

  // Assistance
  let tempX = this.$el.clientWidth / 2;
  let tempY = this.$el.clientHeight / 2;

  this.container.select('#assistance').remove();
  this.container.append("line")          // attach a line
    .attr('id', 'assistance')
    .style("stroke", "white")  // colour the line
    .attr("x1", tempX)     // x position of the first end of the line
    .attr("y1", tempY)      // y position of the first end of the line
    .attr("x2", tempX + this.dx  )     // x position of the second end of the line
    .attr("y2", tempY+ this.dy );    // y position of the second end of the line


  this.container.select('#assistance2').remove();
  this.container.append("line")          // attach a line
    .attr('id', 'assistance2')
    .style("stroke", "red")  // colour the line
    .attr("x1", this.fx)     // x position of the first end of the line
    .attr("y1", this.fy)      // y position of the first end of the line
    .attr("x2", this.lx)     // x position of the second end of the line
    .attr("y2", this.ly);    // y position of the second end of the line

};

SvgImgLayer.prototype.updateImages = function(allNumber){
  let _this = this;
  let features = this.features;
  this.reInit();
  let feature2Color = this.svFeatures2Color;
  let disObj = this.getImgPerDis();
  let displayNumber = disObj.bestNumber / this.imgList.length * allNumber;
  let maxScale = Math.floor(Math.log2(displayNumber * 2) - 1) ;
  //Init scales
  let t = d3.transition(500)
  let imgList = [];
  this.imgList.forEach(d=>{
    if(d.scaleLevel <= maxScale){
      imgList.push(d);
    }
  });

  let line = d3.line().x(function(d){return d.x;}).y(function(d){return d.y;}).curve(d3.curveLinear);

  let images = this.container.selectAll('.imageRect')
    .data(imgList, function(d){return d['id'];});

  //Not exited in the new data

  let deletedImages = images.exit().remove();

  // Old data
  images.transition(t).attr('transform', function(d, i){
    let loc = d['screenLocation'];
    return 'translate(' + loc['x'] + ','+ loc['y'] + ')';
  })

    .each(function(d, i){
      let imgContainer = d3.select(this);
      let index = d.aggregateIndex;
      let _dx = index % 2 == 0?_this.dx:  -1 * _this.dx;
      let _dy = index % 2 == 0?_this.dy:  -1 * _this.dy;

      imgContainer.selectAll('.image_pointer_link')
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", _dx)
        .attr("y2", _dy)
        .attr('stroke-width', 2);
    });


  // Hack
  let strokeColor = '#aaa';
  let new_images = images.enter()
    .append('g')
    .attr('class', 'imageRect')
    .attr('transform', function(d, i){
      let loc = d['screenLocation'];
      return 'translate(' + loc['x'] + ','+ loc['y'] + ')';
    });


  new_images.each(function(d, i){
    let imgContainer = d3.select(this);
    let index = d.aggregateIndex;
    let _dx = index % 2 == 0?_this.dx:  -1 * _this.dx;
    let _dy = index % 2 == 0?_this.dy:  -1 * _this.dy;
    let sideX = _dx > 0 ? _dx * 0.9: _dx * 0.9 - _this.imgWidth ;
    let sideY = _dy > 0 ? _dy * 0.9: _dy * 0.9 - _this.imgHeight ;
    let attrObj = d.attrObj;
    let largestValue = -1;
    let primaryFeature = null;
    features.forEach(attr=>{
      largestValue = largestValue < attrObj[attr]? attrObj[attr]: largestValue;
      primaryFeature = largestValue == attrObj[attr]? attr: primaryFeature;
    });

    imgContainer.append('circle').attr('r', 5)
      .attr('fill', feature2Color[primaryFeature]).attr('opacity', 0.6);
    imgContainer.append('line').attr('class', 'image_pointer_link')
      .attr("x2", _dx).attr("y2", _dy)
      .attr('stroke', strokeColor).attr('stroke-width', 2)
      .attr('stroke-opacity', 0.5);

    let rectImage = imgContainer.append('g').attr('class', 'imgRectContaienr')
      .attr('transform', 'translate('+ sideX + ',' + sideY+ ')');
    rectImage.append('rect').attr('class','background')
      .attr('rx', 5).attr('ry', 5)
      .transition(t)
      .attr('width', _this.imgWidth).attr('height', _this.imgHeight)
      .attr('fill', 'white').attr('opacity', 0.5)

    rectImage.append('image')
      .attr('xlink:href', d['formatImgPath'])
      .attr('x',2).attr('y', 2)
      .attr('stroke', 'white').attr('width', 0).attr('height', 0)
      .transition(t)
      .attr('width', _this.imgWidth - 4).attr('height', _this.imgHeight - 4);


    imgContainer.on('mouseover', function(d, i){
      let _container = d3.select(this);
      _container.select('#featureIcon').remove();
      _container.selectAll('.background').attr('fill', 'orange');

      let treemapConatiner = _container.select('.imgRectContaienr').append('g').attr('id','featureIcon')
        .attr('transform','translate(' + ( 1.5 ) + ',' + ( 1.5)+ ')');
      let attrObj = d['attrObj'];
      let childrenArray = [];
      features.forEach(function(attr){
        childrenArray.push({
          'name': attr,
          'value': attrObj[attr]
        })
      });
      let _data = {'name': 'root','children': childrenArray};
      _this.drawTreemap(treemapConatiner, _data, _this.imgWidth - 4, _this.imgHeight - 4);
      this.parentNode.parentNode.appendChild(this.parentNode)
      this.parentNode.appendChild(this);
      _this.hightLightHover(d, this);
      if(_this.mouseover)
        _this.mouseover(d);

    }).on('mouseout', function(){
      d3.select(this).selectAll('.background').attr('fill', 'white')
      d3.select(this).select('#featureIcon').remove();
      _this.rmHightLightHover(d, this);
      if(_this.mouseout){
        _this.mouseout(d);
      }

    })
  });


  //
  // new_images.each(function(d){
  //     // let aid = d['id']
  //     // if(_this.id2Data[aid] == undefined){
  //     //     _this.id2Data[aid] = {}
  //     // }
  //     // _this.id2Data[aid]['data'] = d;
  //     // _this.id2Data[aid]['el'] = this
  // }).on('mousemove', function(d, i){
  //
  //
  // }).on('mouseout', function(d){
  //
  // })

};

SvgImgLayer.prototype.hightLightHover = function(d, el){
  let _container = d3.select(el);
  _container.selectAll('.image_pointer_link').attr('stroke-opacity', 1);
  _container.selectAll('circle').attr('opacity', 1);
};

SvgImgLayer.prototype.rmHightLightHover = function(d, el){
  let _container = d3.select(el);
  _container.selectAll('.image_pointer_link').attr('stroke-opacity', 0.5);
  _container.selectAll('circle').attr('opacity', 0.6);
};

SvgImgLayer.prototype.onEvent = function(msg, func){
  if(msg == 'mouseover'){
    this.mouseover = func
  }else if(msg == 'mouseout'){
    this.mouseout = func
  };
};



SvgImgLayer.prototype.drawTreemap = function(e, data, width, height){
  let _this = this;
  var treemap = d3.treemap()

    .size([width, height])
    .round(true)
    .paddingInner(1);
  var root = d3.hierarchy(data)
    .eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
    .sum(function(d){return d.value})
    .sort(function(a, b) { return b.height - a.height || b.value - a.value; });
  treemap(root);
  e.append('rect').attr('class', 'background').attr('stroke', 'orange').attr('stroke-width', '3').attr('fill', 'black')
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('width',width + 4)
    .attr('height',height + 4)
    .attr('x', -2)
    .attr('y', -2)
  var cell = e.selectAll("g")
    .data(root.leaves())
    .enter().append("g")
    .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

  cell.append("rect")
    .attr("id", function(d) { return d.data.id; })
    .attr("width", function(d) { return d.x1 - d.x0; })
    .attr("height", function(d) { return d.y1 - d.y0; })
    .attr("fill", function(d) {
      return  _this.svFeatures2Color[d['data']['name']];
    });

  cell.append("clipPath")
    .attr("id", function(d) { return "clip-" + d.data.id; })
    .append("use")
    .attr("xlink:href", function(d) { return "#" + d.data.id; });

  // cell.append("text")
  //     .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
  //     .selectAll("tspan")
  //     .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
  //     .enter().append("tspan")
  //     .attr("x", 4)
  //     .attr("y", function(d, i) { return 13 + i * 10; })
  //     .text(function(d) { return d; });

  // cell.append("title")
  //     .text(function(d) { return d.data.id + "\n" + format(d.value); });

};
SvgImgLayer.prototype.init = function(){


};

SvgImgLayer.prototype.onSelectedImages = function(selectedImages){
  if(selectedImages['sign'] == true){
    this.highlightSelected(selectedImages);
  }else if(selectedImages['sign'] == false){
    this.removeHighlightSelected(selectedImages);
  }
};

SvgImgLayer.prototype.highlightSelected = function(selectedImages){
  let _this = this;
  let aid = selectedImages['aid'];

  if(_this.id2Data[aid]!= undefined){

    d3.select(_this.id2Data[aid]['el']).selectAll('circle').attr('stroke-width', 2).attr('opacity', '1')
  }

};
SvgImgLayer.prototype.removeHighlightSelected = function(selectedImages){
  let _this = this;
  let aid = selectedImages['aid'];

  if(_this.id2Data[aid]!= undefined){
    d3.select(_this.id2Data[aid]['el']).selectAll('circle').attr('stroke-width', 1).attr('opacity', '0.8')
  }

};
export default SvgImgLayer
