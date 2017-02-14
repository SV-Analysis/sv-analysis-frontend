<template>

  <div class="region-mapview">
    <div class="regionmap-control">
      <button v-on:click="vbuttonClick()" id="display-points" type="button" class="btn btn-default btn-xs self-button" aria-label="Left Align">
        <span class="glyphicon " aria-hidden="true">V</span>
      </button>
    </div>
    <svg class="regionmap-svg"></svg>
  </div>
</template>

<script>
  import pipeService from '../../service/pipeService'
  import DetailMap from '../../lib/DetailMap'
  import * as d3 from 'd3'

  export default {
    name: 'mapview',
    props: ['cityInfo', 'streetData', 'svFeatures2Color'],
    data () {
      return {
        title: 'mapview',
        attrs:['green', 'sky', 'road','building', 'car', 'others'],
        isRendered:false,
        isChartDisplayed: false
      }
    },
    mounted(){
      this.createMap();
      this.drawBarChart()

    },
    destroyed(){
      let _this = this;
      pipeService.emitDestroyPolyLine({
        'cityId': _this.cityInfo['id'],
        'streetInfo': _this.streetData
      })
    },
    beforeDestroyed(){

    },
    computed:{
    },
    methods:{
      vbuttonClick(){
        this.drawBarChart();
      },
      createMap(){
        let _this = this;
        this.mapObj = new DetailMap(this.$el, this.cityInfo);
        this.mapObj.init();
        this.mapObj.setColorStyle(this.svFeatures2Color)
        this.mapObj.enableControlLayer();
        this.mapObj.drawPolygon(this.streetData);
        this.mapObj.drawPointsToMap(this.streetData);

        this.mapObj.fitBoundByStreet(this.streetData);
        pipeService.emitPolyLine({
          'cityId': _this.cityInfo['id'],
          'streetInfo': _this.streetData
        });
      },
      drawBarChart(){
        if(this.isRendered == true && this.isChartDisplayed== true){
          this.svgContainer.attr('opacity', 0);
          this.isChartDisplayed = false;
          return
        }else if(this.isRendered == true && this.isChartDisplayed == false){
          this.svgContainer.attr('opacity', 1);
          this.isChartDisplayed = true;
          return
        }else if(this.isRendered == false){

        }
        this.isRendered = true;
        this.isChartDisplayed = true;
        let _this = this;

        let ratioBarData  = {};
        let bar_marginLeft = 100;
        let imageList = this.streetData['image_list'];
        for(var i = 0, ilen = this.attrs.length; i < ilen; i++){
          ratioBarData[this.attrs[i]] = [];
          for(var j = 0; j < 20; j++){
            ratioBarData[this.attrs[i]][j] = 0
          }
        }
        let largestIndex = 0;
        for(var i = 0, ilen = imageList.length; i < ilen; i++){
          let imageObj = imageList[i];
          this.attrs.forEach(function(attr){
            let value = parseInt(parseInt(imageObj[attr]) / 5);
            if(largestIndex < value){
              largestIndex = value;
            }
            ratioBarData[attr][value] += 1;
          })
        }
        let imageNumber = imageList.length;
        let largestRatio = -1;
        this.attrs.forEach(function(attr){
          for(var i = 0; i < imageNumber; i++){
            let ratio = ratioBarData[attr][i] / imageNumber;
            ratioBarData[attr][i] = ratio;
            largestRatio = largestRatio < ratio? ratio: largestRatio;
          }
        });

        let width = this.$el.clientWidth;
        let height = this.$el.clientHeight;
        let eachHeight = this.$el.clientHeight / this.attrs.length;
        let featureArr = this.svFeatures2Color['allFeatures'];
        let barNum = featureArr.length;
        let featureTextLength = 60;
        let svgContainer = d3.select(this.$el).select('svg');
        this.svgContainer = svgContainer;
        svgContainer.append('rect').attr('width', width).attr('height', height).attr('fill', 'white')
          .attr('opacity', 0.9)
        let feature_Obj = 0;
        let chartContainer = svgContainer.append('g').selectAll('.attrs').data(this.attrs)
          .enter()
          .append('g')
          .attr('class', 'attrs')
          .attr('transform', function(d, i){
            return 'translate(0,' + i * eachHeight + ')';
          })

        let perHeight = height / 6;
        let realIndex = largestIndex;
        realIndex = 20;
        let perWidth = (width - bar_marginLeft) * 0.9 / realIndex;
        chartContainer.each(function(attr){
          let data = ratioBarData[attr].slice(0, realIndex);
          d3.select(this).selectAll('attr_bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'attr_bar')

            .attr('x', (d,i) => bar_marginLeft + i * perWidth)
            .attr('y', (d,i) => perHeight - (perHeight * d / largestRatio * 0.9))
            .attr('fill', _this.svFeatures2Color[attr])
            .attr('width', perWidth)
            .attr('height', (d,i) => perHeight * d / largestRatio * 0.9)
            .attr('stroke', 'white')
            .attr('opacity', 0.7)

        })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .region-mapview{
    text-align: center;
    margin: auto;
    margin-bottom: 10px;
    width: 95%;
    background: rgba(13,13,13,0.1);
    height: 200px
  }

  .regionmap-control{
    left: 5px;
    top: 5px;
    position: absolute;
    z-index:10001;
  }
  .regionmap-svg{
    position: absolute;
    width: 100%;
    height: 200px;
    top: 0px;
    left:0px;
    z-index: 1002;
  }
</style>
