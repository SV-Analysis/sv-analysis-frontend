<template>
  <div class="exploreSelection">
    <div class='exploreContainer'style="width: 100%; height: 100%"></div>

    <div>
      <el-collapse size="small"  v-model="activeNames" class="multi-query" >
        <el-collapse-item title="Control" name="1" style="text-align:center">
          <div class="title" style="margin-top: 10px"><span>Filter</span></div>
          <div v-for="attrConf in controlConf">
            <span style="float: left; text-align: left; width: 20%">{{attrConf.id}}</span>
            <el-slider v-model="attrConf['valueRange']" style="width: 70%; float: left"
                       range
                       :max=100>
            </el-slider>
          </div>
          <div style="height: 20px"></div>
        </el-collapse-item>
      </el-collapse>
    </div>

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
        svFeatures2Color: Config.svFeatures2Color,
        attrs: [],
        activeNames: ['1'],
        controlConf:[]
      };
    },
    methods: {
      initFilter: function(){
        let newData = this.controlConf;
        let _this = this;
        //Hack 不忍直视
        d3.select(this.$el).selectAll('.el-slider__bar').each(function(d, i){
          let e = newData[i];
          if(e != undefined){
            d3.select(this).style('background-color', _this.svFeatures2Color[e['id']]);
          }
        });
        d3.select(this.$el).selectAll('.el-slider__button').each(function(d, i){
          let index = parseInt(i / 2);
          let e = newData[index];
          if(e != undefined){
            d3.select(this).style('background-color', _this.svFeatures2Color[e['id']]);
          }
        });
      },

      initRender: function(){
        if(this.isInitRender) return;
        this.isInitRender = true;
        let container = d3.select(this.$el).select('.exploreContainer').nodes()[0];
        console.log('container', container);

        this.multiExploration = new MulitExploration(container, Config.svFeatures2Color);
        this.multiExploration.on('rowClick', function(row, sign){
          let record = row.raw;
          record.mSign = sign;
          record.mColor = row.mColor;
          pipeService.emitMESelected(record);
        });
        this.multiExploration.setAttrs(this.attrs);
        this.multiExploration.update(this.streets);


        this.initFilter();
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
      let attrs = ['id'].concat(features);
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
//      pipeService.onAllCityStatistics((allStatistics)=>{
//        allStatistics.forEach((record)=>{
//          record.id = record.city;
//          let streets = this.updateRegionOrStreet(record);
//          this.streets = streets;
//          if(this.multiExploration)
//            this.multiExploration.update(this.streets);
//        });
//
//      });


      let controlConf = this.controlConf
      this.svFeatures2Color.allFeatures.forEach(function(attr){
        controlConf.push({
          'id': attr,
          'valueRange': [0,100],
        })
      })
    }
  };
</script>
<style >
  .exploreSelection{

    width: 100%;
    height: 100%;
  }

</style>
