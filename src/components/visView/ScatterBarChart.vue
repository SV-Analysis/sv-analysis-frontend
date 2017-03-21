<template>
  <svg class="scatter-bar-chart">

  </svg>
</template>

<script>
  import * as d3 from 'd3'
  import pipeService from '../../service/pipeService'
  import MatrixBar from '../../lib/MatrixBarV2'
  import * as Config from '../../Config'
  export default {
    name: 'scatterBarChart',
    props:['selectItems'],
    data () {
      return {
        title: 'BarChart',
        svFeatures2Color: Config.svFeatures2Color
      }
    },
//    mounted(){
//      console.log('matrix bar chart');
//      let _this = this;
//      let matrixBarHandler = new MatrixBar(this.$el);
//      pipeService.onConfirmSelection(function(items){
//        console.log('itmes', items);
//        matrixBarHandler.draw(items[0], items[1], _this.svFeatures2Color['allFeatures']);
//      })
//    },
    mounted(){

      let _this = this;
      this.matrixBarHandler = new MatrixBar(this.$el, this.svFeatures2Color);
//      matrixBarHandler.draw();
      pipeService.onCitySelected(function(data){
        _this.matrixBarHandler.drawMatrix(data);
        _this.matrixBarHandler.drawdsbBarchart(data);
      });
    },
    computed:{

    },
    methods:{

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .scatter-bar-chart{
    margin-top: 10px;
    width: 100%;

  }
</style>
