<template>
  <svg class="spark-pcp">

  </svg>
</template>

<script>
  import SparkPCP from '../../lib/SparkPCP'
  import pipeService from '../../service/pipeService'
  export default {
    name: 'sparkPCP',
    props:['svFeatures2Color', 'selectItems'],
    data () {
      return {
        title: 'SparkPCP',
        attrs:['green', 'sky', 'road','building', 'car', 'others'],
        imageList: []
      }
    },
    mounted(){
      let _this = this;
      pipeService.onConfirmSelection(function(items){
        _this.drawSpartPCP(items);
      })
    },
    computed:{

    },
    methods:{
      drawSpartPCP(items){
        let images = items[0]['record']['image_list'];
        this.imageList = images;
        if(this.$el.clientWidth < 10) return
        let handler = new SparkPCP(this.$el, this.attrs, [items[0]['record']['image_list'], items[1]['record']['image_list']], this.svFeatures2Color);
        handler.init();
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .spark-pcp{
    margin-top: 0px;
    width: 100%;

  }
</style>
