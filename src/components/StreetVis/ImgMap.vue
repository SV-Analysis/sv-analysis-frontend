<template>
  <!--<div v-bind:class="{ active: notShow }" class="img-map">-->
  <!--{{id}}-->
  <!--</div>-->
  <div class="img-map">

  </div>
</template>

<script>
  import DetailMap from '../../lib/DetailMap'
  import pipeService from '../../service/pipeService'
  import * as Config from '../../Config'

  export default {
    name: 'ImageMap',
    props:['street', 'picked'],
    data () {
      return {
        title: 'ImageMap',
        id: 'none',
        notShow: false,
        svFeatures2Color: Config.svFeatures2Color
      }
    },
    mounted(){
      console.log('sss', this.street, this.picked);
      this.createMap(this.street['cityObj'], this.street['record']['aggregatedImages']);
      this.id = this.street['id'];
    },
    computed:{

    },
    watch:{
      picked(value){

        if(value == this.id){
          this.notShow = false;
          this.sendSelectImages();
        }else{
          this.notShow = true;
        }
      }
    },
    methods:{
      createMap(cityObj, imgList){
        let _this = this;
        if(this.$el.clientWidth < 10) return;
        let el =  document.createElement("div");
        el.style.width='100%';
        el.style.height='100%';
        this.$el.appendChild(el);
        this.mapObj = new DetailMap(el, cityObj);
        this.mapObj.init();
        this.mapObj.setColorStyle(this.svFeatures2Color);
        this.mapObj.addMapScale();
        this.mapObj.calculateImgLocations(imgList);
        this.mapObj.fitBoundByImgList(imgList);
        let imageList = this.mapObj.generateImgObjWithScreenPosition();


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
        pipeService.emitUpdateImagesFromImgMap2ImgLayer({
            images: images,
            id: _this.id
        });
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
  .img-map{
    margin-top: 0px;
    background-color: #1b6d85;
  }
  .active{
    display: none
    /*z-index: 10000*/
  }
</style>
