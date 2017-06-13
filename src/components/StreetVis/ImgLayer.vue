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
    props:['selectItems', 'street'],
    data () {
      return {
        title: 'ImageLayer',
        id: null,
        svFeatures2Color: Config.svFeatures2Color
      }
    },
    mounted(){
      let _this = this;
      this.id = this.street.id;
      this.svgImgLayer = new SvgImgLayer(this.$el, this.svFeatures2Color);
      this.container = this.svgImgLayer.getCotnainer();
      pipeService.onUpdateImagesFromImgMap2ImgLayer(function(updateImagesObj){
        let id = updateImagesObj['id'];
        if(id == _this.id){
          let images = updateImagesObj['images'];
          _this.updateImages(images);
        }
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
