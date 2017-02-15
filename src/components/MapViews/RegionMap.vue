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
  import ParallelCoordinate from '../../lib/ParallelCoordinate'


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
//      this.drawBarChart()
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
    components:{

    },
    methods:{
      vbuttonClick(){
        if (event) event.stopPropagation()
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
          this.parallelHanlder.updateDisplay(true)
          this.isChartDisplayed = false;
          return
        }else if(this.isRendered == true && this.isChartDisplayed == false){
          this.parallelHanlder.updateDisplay(false)
          this.isChartDisplayed = true;
          return
        }else if(this.isRendered == false){

        }
        this.isRendered = true;
        this.isChartDisplayed = true;
        let parallelHandler = new ParallelCoordinate(this.$el, this.attrs, this.streetData['image_list'], this.svFeatures2Color);
        this.parallelHanlder = parallelHandler;
        parallelHandler.init();
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

  .parallel-path {
    fill: none;
    stroke: #273fdd;
    stroke-width:1px;
    shape-rendering: crispEdges;
    opacity: 0.2
  }

  /*.foreground path {*/
  /*fill: none;*/
  /*stroke: steelblue;*/
  /*}*/

  /*.brush .extent {*/
  /*fill-opacity: .3;*/
  /*stroke: #fff;*/
  /*shape-rendering: crispEdges;*/
  /*}*/

  /*.axis line,*/
  /*.axis path {*/
  /*fill: none;*/
  /*stroke: #000;*/
  /*shape-rendering: crispEdges;*/
  /*}*/

  /*.axis text {*/
  /*text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff;*/
  /*cursor: move;*/
  /*}*/
</style>
