<template>
  <div class="img-map">

  </div>
</template>

<script>
  import DetailMap from '../../lib/DetailMap'
  import pipeService from '../../service/pipeService'


  export default {
    name: 'ImageMap',
    props:['svFeatures2Color', 'selectItems'],
    data () {
      return {
        title: 'ImageMap',
      }
    },
    mounted(){
      let _this = this;
      pipeService.onConfirmSelection(function(items){
        _this.createMap(items[0]['cityObj'], items[0]['record']['aggregatedImages'])
      })
    },
    computed:{

    },
    methods:{
      createMap(cityObj, imgList){
        let _this = this;
        if(this.$el.clientWidth < 10) return
        this.mapObj = new DetailMap(this.$el, cityObj);
        this.mapObj.init();
        this.mapObj.setColorStyle(this.svFeatures2Color);
        this.mapObj.addMapScale();
        this.mapObj.calculateImgLocations(imgList);
        this.mapObj.fitBoundByImgList(imgList);
        this.mapObj.onEvent('zoomend', function(event){
          _this.sendSelectImages();
        });
        this.mapObj.onEvent('dragend', function(event){
          setTimeout(function(){
            _this.sendSelectImages();
          }, 200);

        });
        this.sendSelectImages()
      },
      sendSelectImages(){
        let _this = this;
        if(!this.mapObj) return;
        let images = this.mapObj.sampleImagesInTheBound();
        pipeService.emitUpdateImagesFromImgMap2ImgLayer(images);

      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .img-map{
    margin-top: 0px;
    width: 100%;
  }
</style>
