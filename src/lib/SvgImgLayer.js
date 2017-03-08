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
  this.id2Data = {}
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
SvgImgLayer.prototype.reInit = function(){
  this.generateColorStyles();
  this.generateOffset();
  this.generateAssistanceGraphics();
}

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
  this.reInit();
  let colorScales = this.colorScales;
  let images = this.container.selectAll('.imageRect')
    .data(this.imgList, function(d){
      return d['id'];
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
    .attr('opacity', 0.2)
    .transition()
    .attr('r', 5)
    .duration(500);

  images.transition().attr('transform', function(d, i){
    let loc = d['screenLocation'];
    return 'translate(' + loc['x'] + ','+ loc['y'] + ')';
  })
    .duration(500);
//        images.merge(new_images);

  var arc = d3.arc()
    .outerRadius(30 - 10)
    .innerRadius(5)
    .padAngle(0.03)
    .cornerRadius(2)

  var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d; });

  let dx = this.dx;
  let dy = this.dy;

  new_images.each(function(d, i){
    if(i % 4 == 0){
      d3.select(this).append('rect')
        .attr('x', dx - 27)
        .attr('y', dy - 27)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', 0)
        .attr('height', 0)
        .attr('fill', 'white')
        .transition()
        .attr('width', 84)
        .attr('height', 64)
        .duration(500);

      d3.select(this).append('image')
        .attr('xlink:href', function(d){
          return d['formatImgPath']
        })
        .attr('x', dx - 25)
        .attr('y', dy - 25)
        .attr('width', 0)
        .attr('height', 0)
        .attr('stroke', 'white')
        .transition()
        .attr('width', 80)
        .attr('height', 60)
        .duration(500);

      let features = _this.svFeatures2Color['allFeatures'];
      let data = [];
      features.forEach(function(attr){
        data.push(d['attrObj'][attr])
      });


      var g = d3.select(this).selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("transform", "translate(" + (-dx) + "," + (-dy) + ")")
        .attr("class", "arc");

      let path = g.append("path")

        .style("fill", function(d) {
          return colorScales(d.data); })
        .style('opacity', 0.8)

        .attr("d", arc)

      path.transition()
        .duration(1000)
        .attrTween('d', function(d) {
          var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
          return function(t) {
            return arc(interpolate(t));
          };
        });

      d3.select(this).append('title').text(function(d, i){
        return d['aggregateIndex'];
      });

      d3.select(this).selectAll('circle').attr('fill', 'green').attr('stroke','green')

    }else{
      d3.select(this).selectAll('circle').attr('fill', 'red').attr('stroke','red')
    }
  });


  new_images.each(function(d){
    let aid = d['id']
    if(_this.id2Data[aid] == undefined){
      _this.id2Data[aid] = {}
    }
    _this.id2Data[aid]['data'] = d;
    _this.id2Data[aid]['el'] = this
  })
  images.exit()
    .transition(1000)
    .attr('opacity', 0)
    .remove();

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
    d3.select(_this.id2Data[aid]['el']).selectAll('circle').attr('stroke-width', 1).attr('fill-opacity', '0.2')
  }

};
export default SvgImgLayer
