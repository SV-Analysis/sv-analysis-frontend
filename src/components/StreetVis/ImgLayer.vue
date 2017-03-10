<template>
  <svg class="img-layer">

  </svg>
</template>

<script>
  import pipeService from '../../service/pipeService'
  import * as d3 from 'd3'
  import SvgImgLayer from '../../lib/SvgImgLayer'
  import * as Config from '../../Config'


  export default {
    name: 'Image_layer',
    props:['selectItems'],
    data () {
      return {
        title: 'ImageLayer',
        svFeatures2Color: Config.svFeatures2Color
      }
    },
    mounted(){
      let _this = this;
      this.svgImgLayer = new SvgImgLayer(this.$el, this.svFeatures2Color);
      this.container = this.svgImgLayer.getCotnainer();
      pipeService.onUpdateImagesFromImgMap2ImgLayer(function(images){
        _this.updateImages(images);
      });
      pipeService.onImageGroupSelected(function(selectedImgs){
        _this.svgImgLayer.onSelectedImages(selectedImgs);
      })
    },
    computed:{
    },
    methods:{
      updateImages(originImgList){
        this.svgImgLayer.setImgList(originImgList, 'aggregateIndex');
        this.svgImgLayer.updateImages();
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
  .img-layer{
    width: 100%;
  }
  circle{
    pointer-events: none;
  }
  image{
    pointer-events: auto;
  }
  path{
    pointer-events: auto;
  }
</style>
