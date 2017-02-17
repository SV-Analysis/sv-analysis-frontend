<template>
  <svg class="scatter-bar-chart">

  </svg>
</template>

<script>
  import * as d3 from 'd3'
  export default {
    name: 'scatterBarChart',
    props:['regionQueryData', 'svFeatures2Color', 'selectItems'],
    data () {
      return {
        title: 'BarChart',
      }
    },
    mounted(){
      this.drawBarChart(this.selectItems[0], this.selectItems[1]);
    },
    computed:{

    },
    methods:{
      drawBarChart(sourceItem, targetItem){

        let featureArray = this.svFeatures2Color['allFeatures'];
        console.log('Current', featureArray);
        if(sourceItem != undefined && targetItem != undefined){
          console.log('Undefined item')
          return
        }
        let width = this.$el.clientWidth;
        let height = this.$el.clientHeight;
        d3.select(this.$el).append('rect')
          .attr('width', width)
          .attr('height', height)
          .attr('fill', '#e5f5f9');

        console.log('s t', sourceItem['record']['image_list'], targetItem['record']['image_list'])
      }
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
