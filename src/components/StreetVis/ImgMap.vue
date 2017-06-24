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
      generateScales(elementNumber, scaleNumber){
        scaleNumber = scaleNumber == undefined? 100: scaleNumber;
        let ids = [0, Math.floor((elementNumber - 1) / 2)];
        let newIds = [ids];

        for(let i = 0; i< scaleNumber; i++){
          let oldIds = newIds[i];
          let _newIds = [];
          for(let j = 0, jlen = oldIds.length; j< jlen; j++){
            _newIds.push(oldIds[j]);
            if(j < oldIds.length - 1){
              let startId = oldIds[j];
              let endId = oldIds[j+1];
              let midId = Math.floor((startId + endId) / 2);
              if(midId != startId && midId != endId){
                _newIds.push(Math.floor(midId));
              }
            }
          }
          if(_newIds.length <= oldIds.length){
            break
          }
          newIds.push(_newIds);
        }
        let formatIds = [];
        newIds.forEach(function(ids){
          let arr = [];
          ids.forEach(function(id){
            arr.push(id*2)
            if(id * 2 + 1< elementNumber) arr.push(id*2+1);
          })
          if(arr.length != 0) formatIds.push(arr)
        });
        return formatIds
      },
      addScaleToImgAgg(imgList){
        let scaleArr = this.generateScales(imgList.length);
        console.log('scale', scaleArr)
        scaleArr.forEach((ids, level)=>{
          ids.forEach(index=>{
            imgList[index].scaleLevel = imgList[index].scaleLevel == undefined? level: imgList[index].scaleLevel;
          })
        });
      },
      createMap(cityObj, imgList){
        this.addScaleToImgAgg(imgList);
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
        let allNumber  = this.mapObj.getImageNumber();
        pipeService.emitUpdateImagesFromImgMap2ImgLayer({
          images: images,
          id: _this.id,
          allNumber: allNumber
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
