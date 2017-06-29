<template>
  <div id="navigation" class="navigation">

    <div style="height: 100%" class="map-list-container">
      <div class='navmap-container' v-for="cityInfo in cityInfos">
        <div>
          <input style='float:left; margin-left: 20px'
                 v-bind:value='cityInfo.id' type="radio"
                 v-model="checked" :disabled="cityInfo.notDisabled == 1? false: true">
          <div style='float:left; margin-left: 20px' for="checkbox">{{ cityInfo.config.name }}</div>
        </div>
        <NavMapView v-bind:cityInfo="cityInfo.config"></NavMapView>
      </div>
      <el-button @click="selectAllCities" size="small" style="left:10px;  margin-top: 5px; margin-bottom: 5px" >Select All</el-button>
    </div>
  </div>
</template>

<script>
  import NavMapView from '../MapViews/NavMapView.vue'
  import pipeService from '../../service/pipeService'
  import dataService from '../../service/dataService'

  import * as Config from '../../Config'
  export default {
    name: 'citySelection',
    watch:{
      checked(newValue, oldValue){
        pipeService.emitUpdateSelectedMapView([]);
        setTimeout(function(){
          pipeService.emitUpdateSelectedMapView([newValue]);
        }, 200)


      },
      checkedItem: {
        deep: 'true',
        handler(newValue, oldValue){
          if(newValue.length == 2){
            for(var i = 0, ilen = this.cityInfos.length; i < ilen; i++){
              this.cityInfos[i].notDisabled = 0;
              for(var j = 0, jlen = newValue.length; j < jlen; j++){
                if(newValue[j] == this.cityInfos[i].id) this.cityInfos[i].notDisabled = 1;
              }
            }
          }else{
            for(var i = 0, ilen = this.cityInfos.length; i < ilen; i++){
              this.cityInfos[i].notDisabled = 1;
            }
          }
          let _this = this;

          newValue.forEach(function(cityId){
            if(_this.statistic[cityId] == undefined){
              dataService.queryStatistics(cityId, 'region', function(data){
                _this.statistic[cityId] = data;
                _this.generateAndSendSelectedData();
              })
            }else{
              _this.generateAndSendSelectedData()
            }
          });
          pipeService.emitUpdateSelectedMapView(newValue);
        }
      }
    },
    data () {
      return {
        title: 'Navigation View',
        // City configuration should be loaded from the backend configuration files
        checkedItem: [],
        statistic:{

        },
        checked: null,
        cityInfos:[]
        //cities: Config.cityOptions
      }
    },
    mounted(){

      // Copy city information from config files

      dataService.queryAllCityStatics(['hk', 'singapore', 'london', 'nyc'], function(d){
        pipeService.emitAllCityStatistics(d);
      });
      Config.cityOptions.forEach((d)=>{
        this.cityInfos.push({
          'id': d['id'],
          'config':d,
          'selected': false,
          'notDisabled': 1
        });
      });
    },
    methods:{
      selectAllCities(){
        pipeService.emitAllCitiesSelected();
      },
      generateAndSendSelectedData(){
        let _this = this;
        let sendData = [];

        this.checkedItem.forEach(function(cityId){
          if(_this.statistic[cityId]!= undefined){
            sendData.push({
              'cityId': cityId,
              'imgList': _this.statistic[cityId],
              'type': 'region'
            });
          }else{
            console.log('Error in selected cities');
          }
        });
        pipeService.emitCitySelected(sendData);
      }
    },
    computed:{
      newMessage: function(){
        return this.title;
      },
      new_style: function(){
        if(this.$el){
          let width = this.$el.clientWidth * this.cityInfos.length + 'px';
          let height = (this.$el.clientWidth * 3  / 4) * this.cityInfos.length + 'px';
          return {width: width, height: height }
        }
      }
    },
    components:{
      NavMapView
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #navigation{
    max-width: 100%;
    min-width: 100%;
    height: 1140px;
    max-height: 100%
  }
  .map-list-container{
    overflow-y: auto;
    max-width: 100%;
    max-height: 80%;
    height: 80%;
    width: 100%
  }
  .navmap-container{
    margin-left: 20px;
    background: rgba(13,13,13,0.1);
    height: 260px;
  }
</style>
