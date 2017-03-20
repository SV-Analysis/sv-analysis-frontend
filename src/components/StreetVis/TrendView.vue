<template>
  <svg class="trend-view">

  </svg>
</template>

<script>
  import pipeService from '../../service/pipeService'
  import * as d3 from 'd3'
  import * as Config from '../../Config'

  export default {
    name: 'TrendView',
    props:['selectItems'],
    data () {
      return {
        title: 'TrendView',
        serverLink: Config.serverLink,
        id2Data:{},
        svFeatures2Color: Config.svFeatures2Color
      }
    },

    mounted(){
      let _this = this;
      this.features = this.svFeatures2Color['allFeatures'];
      this.imgHeight = this.$el.clientHeight / 6 - 10;

      this.colors = [];
      this.features.forEach(function(attr){
        _this.colors.push(_this.svFeatures2Color[attr])
      });

      pipeService.onConfirmSelection(function(items){
        _this.createTrend(items);
      });
      pipeService.onImageGroupSelected(function(selectedImgs){
        if(selectedImgs['sign'] == true){
          _this.highlightImg(selectedImgs);
        }else if(selectedImgs['sign'] == false){
          _this.removeHighlightImg(selectedImgs);
        }
      })
    },
    computed:{

    },
    methods:{
      initContainer(){

      },
      createTrend(items){
        this.id2Data = {};
        let firstSet = items[0];
        let secondSet = items[1];
        let overAllHeight = this.$el.clientHeight;
        let overAllWidth = this.$el.clientWidth;
        this.imageHeight = overAllHeight / 3 - 10;
        this.imageHeightExtend = overAllHeight / 3;
        if(overAllHeight < 10) return;

        let firstContainer = d3.select(this.$el).append('g');
        let secondContainer = d3.select(this.$el).append('g')
          .attr('transform','translate(0,' + overAllHeight / 2 + ')');

        this.renderTrend(firstContainer, firstSet);
        this.renderTrend(secondContainer,secondSet);
      },
      highlightImg(selectedImages){
        let _this = this;
        let aid = selectedImages['aid'];
        if (this.id2Data[aid] == undefined) return
        let imgContainer = this.id2Data[aid]['imgContainer'];
        let idArr = this.id2Data[aid]['iid'];
        let maxIndex = Math.max.apply(null, idArr);
        let minIndex = Math.min.apply(null, idArr);
        let imgWidth = this.imageHeight * 4 / 3;
        let imgWidthExtend = this.imageHeightExtend * 4 / 3;
        let gap = (this.$el.clientWidth - (idArr.length * imgWidthExtend)) / imgContainer.size();

        imgContainer.transition().attr('transform', function(d, i){
          let _offsetX = null;

          if(i <= minIndex){
            _offsetX = i * gap;
          }else if(i<= (maxIndex + 1) && i> minIndex){
            _offsetX = (i - minIndex) * imgWidthExtend + minIndex * gap
          }else if(i > maxIndex)
            _offsetX = ((maxIndex - minIndex) + 1) * imgWidthExtend + (minIndex + i - maxIndex - 1) * gap;
          return 'translate(' + _offsetX + ', 0)';
        }).duration(500)

        //Why opacity doesn't work?
        d3.select(this.id2Data[aid]['ael']).selectAll('.bar').attr('stroke-width', 1)
        this.id2Data[aid]['iel'].forEach(function(img){
          d3.select(img).transition().attr('height', _this.imageHeightExtend).duration(500)
        })

      },
      removeHighlightImg(selectedImages){
        let _this = this;
        let aid = selectedImages['aid'];
        if(this.id2Data[aid] == undefined) return
        let imgContainer = this.id2Data[aid]['imgContainer'];
        let gap = (this.$el.clientWidth -  this.imageHeight) / imgContainer.size();
//        d3.select(this.id2Data[aid]['ael']).selectAll('.bar').attr('stroke-width', 0);

        this.id2Data[aid]['iel'].forEach(function(img){
          d3.select(img).transition().attr('height',  _this.imageHeight).transition()
        });

        imgContainer.transition()
          .attr('transform', function(d, i){
            let _offsetX = i * gap;
            return 'translate(' + _offsetX + ', 0)';
          }).duration(500);

      },
      generateMessage(d, sign){
        let aid = d['id']
        let iids = []
        d['imgList'].forEach(function(img){
          iids.push(img['index'])
        });
        let imgsMessage = {
          'sign': sign,
          'aid': aid,
          'iids': iids
        };
        return imgsMessage;
      },
      renderTrend(el, trendData){
        let _this = this;
        let overAllHeight = this.$el.clientHeight;
        let overAllWidth = this.$el.clientWidth;
        if(overAllHeight == 0){
          console.log('is 0');
        }
        let trendContainer = el;
        let margin = {left: 10, right: 10, top: 10, bottom: 10};
        let tagHeight = overAllHeight / 6;
        let imageData = trendData['record']['aggregatedImages'];
        let imgNumber = imageData.length;
        let avgWidth = overAllWidth / imgNumber;
        let tagContainer = trendContainer.append('g').selectAll('.tagContainer')
          .data(imageData)
          .enter()
          .append('g')
          .attr('class', 'tagContainer')
          .attr('transform',function(d, i){
            return 'translate(' + (i * avgWidth) + ',0)';
          });
        let setColor = ['red', 'blue', 'green' ,'yellow','purple'];
        tagContainer.each(function(d){
          let barContainer = d3.select(this).append('g').attr('class', 'barContainer')

          let barData = [];
          _this.features.forEach(function(attr){
            barData.push(d['attrObj'][attr])
          });
          let offsetY = 0;
          barContainer.selectAll('.bar')
            .data(_this.features)
            .enter()
            .append('rect').attr('class','bar')
            .attr('height', function(feature, i){
              return d['attrObj'][feature] / 100 * tagHeight;
            })
            .attr('y', function(feature, i) {
              let tempY = offsetY;
              offsetY += (d['attrObj'][feature] / 100 * tagHeight);
              return tempY;
            })
            .attr('width', avgWidth)
            .attr('stroke', function(){
                return setColor[d['cluster_label']]
            })
            .attr('stroke-width', function(d){
                return 2
            })
            .attr('fill', function(feature, i) {return _this.svFeatures2Color[feature]})

          barContainer.attr('stroke', 'white')
            .attr('stroke-width', 0.1)
            .attr('opacity', 0.5)
            .on('mouseover', function(d){
              let imgsMessage = _this.generateMessage(d, true);
              pipeService.emitImageGroupSelected(imgsMessage);
            })
            .on('mouseout', function(d){
              let imgsMessage = _this.generateMessage(d, false)
              pipeService.emitImageGroupSelected(imgsMessage, false);
            })
            .on('click', function(d){
              console.log('ddd', d);
            })
        })

        tagContainer.each(function(d){
          let aid = d['id'];
          if(_this.id2Data[aid] == undefined){
            _this.id2Data[aid] = {}
          }
          if(_this.id2Data[aid]['ael'] == undefined){
            _this.id2Data[aid]['ael'] = this;
            _this.id2Data[aid]['data'] = d;
          }
        });

        let images = [];

        imageData.forEach(function(aggImgObj){
          let _imgs = aggImgObj['imgList'];
          _imgs.forEach(function(imgObj){
            imgObj['aggregateObj'] = aggImgObj;
            images.push(imgObj);
          })
        });

        let imgWidth = 100, height = imgWidth / 4 * 3;
        let gap = (overAllWidth - imgWidth) / (images.length - 1);
        let offsetX = 0;
//        Calculate positions:

        let imgContainer = trendContainer.append('g')
          .attr('transform','translate(0,' + overAllHeight / 6  + ')')
          .selectAll('.imgContainer')
          .data(images)
          .enter()
          .append('g')
          .attr('class', 'imgContainer')
          .attr('transform', function(d, i){
            let _offsetX = i * gap;
            return 'translate(' + _offsetX + ', 0)';
          })


        let svgImages = imgContainer.append('image')
          .attr('xlink:href', function(d){
            return generateImageLink(d, _this.serverLink)
          })
          .attr('height', overAllHeight / 3 - 10)
          .on('mouseover', function(d){

            let imgsMessage = _this.generateMessage(d['aggregateObj'], true);
            pipeService.emitImageGroupSelected(imgsMessage);
          })
          .on('mouseout', function(d){
            let imgsMessage = _this.generateMessage(d['aggregateObj'], false)
            pipeService.emitImageGroupSelected(imgsMessage, false);
          });

        svgImages.each(function(d, index){
          let aid = d['aggregateObj']['id'];
          if(_this.id2Data[aid] == undefined){
            _this.id2Data[aid] = {}
          }
          if(_this.id2Data[aid]['iel'] == undefined){
            _this.id2Data[aid]['iel'] = [];
            _this.id2Data[aid]['iid'] = [];
            _this.id2Data[aid]['imgContainer'] = imgContainer
          }
          _this.id2Data[aid]['iel'].push(this);
          _this.id2Data[aid]['iid'].push(index)

        });

        function generateImageLink(imgObj, serverLink){
          let imgPath = imgObj['img_path']
          let imgitems = imgPath.split('/');
          let cityname = imgitems[0];
          let cid = imgitems[2];
          let iid = imgitems[3];

          let imgLink = serverLink  + 'getImage?city=' + cityname +'&cid='+cid +'&iid=' + iid;
          return imgLink
        }
      }

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .trend-view{
    margin-top: 0px;
    width: 100%;

  }
</style>
