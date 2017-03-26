<template>
  <svg class="spark-pcp">

  </svg>
</template>

<script>
  import SparkPCP from '../../lib/SparkPCP'
  import pipeService from '../../service/pipeService'
  import * as Config from '../../Config'


  export default {
    name: 'sparkPCP',
    props:[ 'selectItems'],
    data () {
      return {
        title: 'SparkPCP',
        attrs:['green', 'sky', 'road','building', 'car', 'others'],
        imageList: [],
        svFeatures2Color: Config.svFeatures2Color
      }
    },
    mounted(){
      let _this = this;
      pipeService.onConfirmSelection(function(items){
        console.log('items', items);
        _this.drawSpartPCP(items);
      });
      pipeService.onImageGroupSelected(function(selectedImgs){

        _this.handler.onSelectedImages(selectedImgs);
      });

    },
    computed:{},
    methods:{
      drawSpartPCP(items){
        let images = items[0]['record']['image_list'];
        this.imageList = images;
        if(this.$el.clientWidth < 10) return;
        let handler = new SparkPCP(this.$el, this.attrs, items, this.svFeatures2Color);
        handler.init();
        this.handler = handler;
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
