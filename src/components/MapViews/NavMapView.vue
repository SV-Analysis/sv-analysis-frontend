<template>

  <div class="nav-mapview">
  </div>
</template>

<script>
  import pipeService from '../../service/pipeService'
  import dataService from '../../service/dataService'
  import DetailMap from '../../lib/DetailMap'
  import * as Config from '../../Config'
  export default {
    name: 'mapview',
    props: ['cityInfo'],
    data () {
      return {
        title: 'mapview',
        polyLinePoints: [],
        features: Config.svFeatures2Color.allFeatures,
        svFeatures2Color: Config.svFeatures2Color
      }
    },
    mounted(){
      this.createMap();
      this.sendMapRegion();
      pipeService.onAllCityStatistics(msg=>{
        console.log('region', msg);
        msg.forEach(cityInfo=>{
          if(cityInfo.id == this.cityInfo.id)
            cityInfo.streets.forEach((region)=>{
              let statistics = region.record.statistics;

              let _list = [];
              this.features.forEach(attr=>{
                _list.push([attr, statistics[attr]]);
              });
              _list.sort(function(a, b){
                return b[1] - a[1];
              });
              let largestAttr = null;
              if(_list[0][0] == 'road') {
                if(_list[0][1] >= 33){
                  largestAttr = 'road'
                }else{
                    largestAttr = _list[1][0];
                }
              }else{
                  largestAttr=  _list[0][0]
              }

              let polyLines = [];
              region.subRegion.forEach(d=>{
                let boundaryNodes = d['boundary'];
                polyLines.push(boundaryNodes);
              });
              this.mapObj.drawMultiplePolylines(polyLines, this.cityInfo.id, true, this.svFeatures2Color[largestAttr]);
            });
        });

      })

    },
    computed:{
    },
    methods:{
      sendMapRegion(){
        let _this = this;
        if(!this.mapObj) return;
        let region = this.mapObj.getBounds();
        pipeService.emitUpdateMapBound({
          'region': region,
          'id': _this.cityInfo['id']
        })
      },
      createMap(){
        let _this = this;

        this.mapObj = new DetailMap(this.$el, this.cityInfo);
        this.mapObj.init();
        this.mapObj.enableControlLayer();
        this.mapObj.onEvent('zoomend', function(event){
          _this.sendMapRegion();
        });
        this.mapObj.onEvent('dragend', function(event){
          _this.sendMapRegion();
        });
        this.mapObj.onEvent('zoomstart', function(event){
          pipeService.emitCompMapZoomStart({'cityId': _this.cityInfo['id']});
        });
        this.mapObj.onEvent('movestart', function(event){
          pipeService.emitCompMapDragStart({'cityId': _this.cityInfo['id']});
        });

        this.mapObj.onBaseLayerChange(function(event){
          pipeService.emitUpdateMapLayer({
            'cityId': _this.cityInfo['id'],
            'layerName': event.name
          });
        });

      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .nav-mapview{
    float: left;
    width: 100%;
    background: rgba(13,13,13,0.1);
    height: 90%
  }
</style>
