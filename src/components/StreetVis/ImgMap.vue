<template>
  <div v-bind:class="{ active: notShow }" class="img-map">

  </div>
</template>

<script>
  import DetailMap from '../../lib/DetailMap'
  import pipeService from '../../service/pipeService'


  export default {
    name: 'ImageMap',
    props:['svFeatures2Color', 'selectItems', 'data', 'picked'],
    data () {
      return {
        title: 'ImageMap',
        id: 'none',
        notShow: false
      }
    },
    mounted(){
      console.log('data',this.data);
      this.createMap(this.data['cityObj'], this.data['record']['aggregatedImages']);
      this.id = this.data['id']
    },
    computed:{

    },
    watch:{
      picked(value){
        console.log('value', value);
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
        if(this.$el.clientWidth < 10) return
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
<style >
  .img-map{
    margin-top: 0px;
    width: 100%;
    height: 100%
  }

  .active{
    display: none
    /*z-index: 10000*/
  }
</style>
