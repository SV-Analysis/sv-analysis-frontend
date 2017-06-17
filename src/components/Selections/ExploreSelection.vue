<template>
  <div class="exploreSelection">
  </div>
</template>
<script>
  import pipeService from '../../service/pipeService'
  import * as Config from '../../Config'
  import dataService from '../../service/dataService'
  import MulitExploration from '../../lib/MultiExploration/MulitExploration.js'
  import * as d3 from 'd3'
  export default {
    props: [''],
    components:{

    },
    data() {
      return {
        streets: [],
        streetMap:{},
        regions: [],
        region:{},
        selected: [],
        isInitRender: false,
        attrs: []
      };
    },
    methods: {
      mouseOver:function(){

      },
      initRender: function(){
        if(this.isInitRender) return;
        this.isInitRender = true;
        this.multiExploration = new MulitExploration(this.$el, Config.svFeatures2Color);
        this.multiExploration.on('rowClick', function(row, sign){
          let record = row.raw;
          record.mSign = sign;
          record.mColor = row.mColor;
          pipeService.emitMESelected(record);
        });
        this.multiExploration.setAttrs(this.attrs);
        this.multiExploration.update(this.streets);
        console.log('streets', this.streets);
      },
      updateRegionOrStreet(record){
        let id = record['id'];
        let streets = [];
        let isExist = false;
        for(var i = 0, ilen = this.streets.length; i < ilen; i++){
          let _s = this.streets[i];
          if(_s.id != id){
            streets.push(_s);
          }else{
            isExist = true;
          }
        }
        if(isExist == false){
          streets.push(record)
        }
        return streets
      }
    },
    watch:{

    },
    computed:{

    },
    mounted(){

      let features = Config.svFeatures2Color.allFeatures.slice();
      let attrs = ['id', 'city'].concat(features);
      this.attrs = attrs;
      pipeService.onSelectRegion((record)=>{
        record.id = record['rid'];
        record.record = {
          statistics: record.statistics,
          id: record.rid
        };

        let streets = this.updateRegionOrStreet(record);
        this.streets = streets;
      });
      pipeService.onUpdateSelectItems((record)=>{
        let streets = this.updateRegionOrStreet(record);
        this.streets = streets;
        if(this.multiExploration)
          this.multiExploration.update(this.streets);
      });
      pipeService.onTabClicked((msg)=>{
        if(msg == 'explore'){
          setTimeout(()=>{
            this.initRender();
          }, 1);
        }
      });
      pipeService.onAllCityStatistics((allStatistics)=>{
        allStatistics.forEach((record)=>{
          record.id = record.city;
          let streets = this.updateRegionOrStreet(record);
          this.streets = streets;
          if(this.multiExploration)
            this.multiExploration.update(this.streets);
        });

      });
    }
  };
</script>
<style scope>
  .exploreSelection{

    width: 100%;
    height: 100%;
  }

</style>
