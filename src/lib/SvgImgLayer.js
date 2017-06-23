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
    bestNumber: allDis / 80
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
  this.generateAssistanceGraphics();
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
    let distance = this.$el.clientHeight / 5;
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

SvgImgLayer.prototype.updateImages = function(){
  let _this = this;
  let features = this.features;
  this.reInit();
  let colorScales = this.colorScales;
  let disObj = this.getImgPerDis();
  let disPerImg = disObj.avg;
  let bestNumber = disObj.bestNumber;
  let _gap = Math.floor(this.imgList.length / bestNumber);

  let images = this.container.selectAll('.imageRect')
    .data(this.imgList, function(d){
      return d['id'];
    });

  //Not exited in the new data

  let ids = [];
  this.imgList.forEach(function(img){
    ids.push(img.id);
  });
  console.log('list', ids);
  images.exit()
    .transition(1000)
    .attr('opacity', 0)
    .remove();

  _gap = _gap / 5;
  console.log('gap', _gap)
  // Old data
  images.transition().attr('transform', function(d, i){
    let loc = d['screenLocation'];
    return 'translate(' + loc['x'] + ','+ loc['y'] + ')';
  })
    .duration(500);

  images.each(function(d, i){
    //
    // if(i % _gap != 0){
    //   return
    // }
    let imgContainer = d3.select(this);

    imgContainer.selectAll('line')
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d)=>{
        return i % 2 == 0?_this.dx:  -1 * _this.dx;
      } )
      .attr("y2",(d)=>{
        return i % 2 == 0?_this.dy:  -1 * _this.dy;
      } )
      .attr('stroke', 'green')
      .attr('stroke-width', 1);
  });

  let new_images = images.enter()
    .append('g')
    .attr('class', 'imageRect');

  new_images.attr('transform', function(d, i){
    let loc = d['screenLocation'];
    return 'translate(' + loc['x'] + ','+ loc['y'] + ')';
  });

  new_images.append('circle')
    .attr('r', 0)
    .attr('stroke', 'red')
    .attr('fill', 'red')
    .attr('opacity', 1)
    .transition()
    .attr('r', function(d, i){
      if(i == 0|| i == _this.imgList.length - 1){
        return 2;
      }else{
        return 0;
      }
    })
    .duration(500);
  let dx = this.dx;
  let dy = this.dy;

  let line = d3.line()
    .x(function(d){
      return d.x;
    })
    .y(function(d){
      return d.y;
    })
    .curve(d3.curveLinear)
  // Hack
  let sampleIndex = 4;
  let offsetx = 100;
  let offsety = 0;
  let sides1X = -dx - 2 - offsetx + 50;
  let sides1Y = -dy - 2 - offsety;
  let sides2X = dx - 50;
  let sides2Y = dy - 50;
  new_images.each(function(d, i){
    // if(i % _gap != 0){
    //   return
    // }
    let imgContainer = d3.select(this);

    imgContainer.append('line')
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d)=>{
        return i % 2 == 0?_this.dx:  -1 * _this.dx;
      } )
      .attr("y2",(d)=>{
        return i % 2 == 0?_this.dy:  -1 * _this.dy;
      } )
      .attr('stroke', 'red')
      .attr('stroke-width', 1);
  });

  // new_images.each(function(d, i){
  //     if(i % sampleIndex== 0){
  //         let points = [{x: 0, y: 0}, {x: (-dx - 2 - offsetx + 60), y: (-dy - 2 - offsety + 60)}];
  //         d3.select(this).append('g').datum(points).append('path').attr('class','image_pointer_link')
  //             .attr('d', line)
  //             .attr('stroke',strokeColor)
  //             .attr('stroke-width', 3)
  //
  //
  //         d3.select(this).append('rect')
  //             .attr('class','background')
  //             .attr('x', sides1X)
  //             .attr('y', sides1Y)
  //             .attr('rx', 5)
  //             .attr('ry', 5)
  //             .attr('width', 0)
  //             .attr('height', 0)
  //             .attr('fill', 'white')
  //             .transition()
  //             .attr('width', 84)
  //             .attr('height', 64)
  //             .duration(500);
  //
  //         d3.select(this).append('image')
  //             .attr('xlink:href', function(d){
  //                 return d['formatImgPath']
  //             })
  //             .attr('x',sides1X + 2)
  //             .attr('y', sides1Y + 2)
  //             .attr('width', 0)
  //             .attr('height', 0)
  //             .attr('stroke', 'white')
  //             .transition()
  //             .attr('width', 80)
  //             .attr('height', 60)
  //             .duration(500);
  //
  //     }else if(i % (sampleIndex / 2) == 0){
  //
  //         let points = [{x: 0, y: 0}, {x: sides2X + 80, y: sides2Y}];
  //
  //         d3.select(this).append('g').datum(points).append('path').attr('class','image_pointer_link')
  //             .attr('d', line)
  //             .attr('stroke',strokeColor)
  //             .attr('stroke-width', 3)
  //
  //
  //
  //         d3.select(this).append('rect')
  //             .attr('class','background')
  //             .attr('x',sides2X)
  //             .attr('y', sides2Y)
  //             .attr('rx', 5)
  //             .attr('ry', 5)
  //             .attr('width', 0)
  //             .attr('height', 0)
  //             .attr('fill', 'white')
  //             .transition()
  //             .attr('width', 84)
  //             .attr('height', 64)
  //             .duration(500);
  //
  //         d3.select(this).append('image')
  //             .attr('xlink:href', function(d){
  //                 return d['formatImgPath']
  //             })
  //             .attr('x', sides2X + 2)
  //             .attr('y', sides2Y + 2)
  //             .attr('width', 0)
  //             .attr('height', 0)
  //             .attr('stroke', 'white')
  //             .transition()
  //             .attr('width', 80)
  //             .attr('height', 60)
  //             .duration(500);
  //
  //         let features = _this.svFeatures2Color['allFeatures'];
  //         let data = [];
  //         features.forEach(function(attr){
  //             data.push(d['attrObj'][attr])
  //         });
  //
  //         function drawVoilin(e, img, width, height, featureColor){
  //         }
  //
  //
  //         d3.select(this).append('title').text(function(d, i){
  //             return d['aggregateIndex'];
  //         });
  //
  //         d3.select(this).selectAll('circle').attr('fill', function(d){
  //             return _this.svFeatures2Color[d['max_attr']['attr']]
  //         })
  //
  //     }else{
  //         d3.select(this).selectAll('circle').attr('fill', function(d){
  //             return _this.svFeatures2Color[d['max_attr']['attr']]
  //         })
  //     }
  // });
  //
  //
  // new_images.each(function(d){
  //     let aid = d['id']
  //     if(_this.id2Data[aid] == undefined){
  //         _this.id2Data[aid] = {}
  //     }
  //     _this.id2Data[aid]['data'] = d;
  //     _this.id2Data[aid]['el'] = this
  // })
  //
  // new_images.on('mousemove', function(d, i){
  //     d3.select(this).select('#featureIcon').remove();
  //     d3.select(this).selectAll('.background').attr('fill', 'orange')
  //     let mousex = d3.mouse(this)[0];
  //     let mousey = d3.mouse(this)[1];
  //     if(i % sampleIndex == 0){
  //         mousex = sides1X;
  //         mousey = sides1Y;
  //     }else{
  //         mousex = sides2X;
  //         mousey = sides2Y;
  //     }
  //     let treemapConatiner = d3.select(this).append('g').attr('id','featureIcon')
  //
  //         .attr('transform','translate(' + (mousex + 1.5 ) + ',' + (mousey + 1.5)+ ')')
  //     let attrObj = d['attrObj'];
  //     let childrenArray = [];
  //     features.forEach(function(attr){
  //         childrenArray.push({
  //             'name': attr,
  //             'value': attrObj[attr]
  //         })
  //     });
  //     let _data = {'name': 'root','children': childrenArray};
  //
  //     _this.drawTreemap(treemapConatiner, _data, 80, 60);
  //     // treemapConatiner.append('circle').attr('r', 50).attr('fill','orange').attr('fill-opacity', 0.8);
  //     this.parentNode.parentNode.appendChild(this.parentNode)
  //     this.parentNode.appendChild(this);
  // }).on('mouseout', function(d){
  //     d3.select(this).selectAll('.background').attr('fill', 'white')
  //     d3.select(this).select('#featureIcon').remove();
  // })

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
