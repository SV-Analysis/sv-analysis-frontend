<template>
  <svg class="scatter-bar-chart">

  </svg>
</template>

<script>
  import * as d3 from 'd3'
  import pipeService from '../../service/pipeService'
  import MatrixBar from '../../lib/matrixBars'

  export default {
    name: 'scatterBarChart',
    props:['svFeatures2Color', 'selectItems'],
    data () {
      return {
        title: 'BarChart',
      }
    },
    mounted(){
      console.log('matrix bar chart');
      let _this = this;
      let matrixBarHandler = new MatrixBar(this.$el);
      pipeService.onConfirmSelection(function(items){
        matrixBarHandler.draw(items[0], items[1], _this.svFeatures2Color['allFeatures']);

      })
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
    margin-top: 0px;
    width: 100%;
    height: 100%
  }
</style>
