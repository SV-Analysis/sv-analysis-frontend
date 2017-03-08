<template>
  <div class="street-view">
    <SparkPCP v-bind:svFeatures2Color='svFeatures2Color' class="spark-pcp">spark-pcp</SparkPCP>
    <div class="img-map-container">
      <ImgLayer v-bind:svFeatures2Color='svFeatures2Color' class="img-svg"></ImgLayer>
      <ImgMap v-bind:svFeatures2Color='svFeatures2Color' class="img-map">img-map</ImgMap>
    </div>
    <TrendView v-bind:svFeatures2Color='svFeatures2Color' class="trend-view">trend-view</TrendView>
  </div>
</template>

<script>
  import * as d3 from 'd3'
  import SparkPCP from './SparkPCP.vue'
  import ImgLayer from './ImgLayer.vue'
  import ImgMap from './ImgMap.vue'
  import TrendView from './TrendView.vue'

  export default {
    name: 'StreetView',
    props:['svFeatures2Color', 'selectItems'],
    data () {
      return {
        title: 'Street View',
      }
    },
    mounted(){

      let _this = this;
//      pipeService.onConfirmSelection(function(items){
//        matrixBarHandler.draw(items[0], items[1], _this.svFeatures2Color['allFeatures']);
//
//      })
    },
    beforeDestroy(){

    },
    computed:{

    },
    methods:{
    },
    components:{
      SparkPCP,
      TrendView,
      ImgMap,
      ImgLayer
    }

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .street-view{
    margin-top: 0px;
    width: 100%;
    height: 100%;

  }
  .spark-pcp{
    height: 25%;
    /*background-color: #5bc0de;*/
    border-width: 1px;
    border-style: solid;
    border-color: #ff899c;
  }
  .img-map-container{
    position: relative;
    height: 50%;
    border-width: 1px;
    border-style: solid;
    border-color: #9ea0ff;
  }
  .img-map{
    position: absolute;
    height: 100%;
    top: 0px;
    left: 0px;
  }
  .img-svg{
    position: absolute;
    height: 100%;
    top: 0px;
    left: 0px;
    pointer-events: none;
    z-index: 1000;
  }
  .trend-view{
    height: 30%;
    border-width: 1px;
    border-style: solid;
    border-color: #baff92;
  }
</style>
