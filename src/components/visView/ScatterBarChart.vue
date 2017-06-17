<template>
  <div style="position:relative">
    <svg class="scatter-bar-chart" id="scatter-bar-chart">

    </svg>
    <el-popover
      ref="popcontrol"
      width="400"
      height="500"
      placement="left-end"  v-model="visible">
      <el-radio size="large" class="radio" v-model="radio" label="region">Region</el-radio>
      <el-radio size="small" class="radio" v-model="radio" label="street">Street</el-radio>

      <div style="width: 80%">
        <div v-for="attrConf in controlConf">
          <span style="float: left; text-align: left; width: 20%">{{attrConf.id}}</span>
          <el-slider v-model="attrConf['valueRange']" style="width: 70%; float: left"
                     range
                     :max=100>
          </el-slider>
        </div>
      </div>

      <div style="position: absolute;  bottom: 10px; right: 20px">
        <el-button type="primary" size="mini" @click="visible = false">confirm</el-button>
      </div>
    </el-popover>
    <el-button size='small' class="botton-class" v-popover:popcontrol>config</el-button>
  </div>
</template>

<script>
  import * as d3 from 'd3'
  import pipeService from '../../service/pipeService'
  import MatrixBar from '../../lib/MatrixBarV3'
  import * as Config from '../../Config'
  export default {
    name: 'scatterBarChart',
    props:['selectItems'],
    data () {
      return {
        title: 'BarChart',
        radio:'region',
        visible: false,
        svFeatures2Color: Config.svFeatures2Color,
        controlConf:[],
        Config: Config,
        features: Config.svFeatures2Color.allFeatures,
        selectedRegions: [],
        currentComparisonType: null,
        records:[]
      }
    },

    mounted(){
      let _this = this;
      this.initControlConfig();
      let _el = document.getElementById('scatter-bar-chart');
      this.matrixBarHandler = new MatrixBar(_el, this.svFeatures2Color, Config);

      pipeService.onMESelected((record)=>{
        this.updateRecords(record);

        _this.selectedCollectionUpdated(_this.selectedRegions)
      });


      pipeService.onCitySelected(function(data){
        _this.currentComparisonType = "city";
        _this.matrixBarHandler.drawMatrix(data);
        _this.matrixBarHandler.drawdsbBarchart(data);
        let list = [];
        data.forEach(function(d){
          let tempList = [];
          d['imgList'].forEach(function(img){
            let standard = img['record']['standard'];
            if (_this.checkStatistics(standard)){
              tempList.push(img);
            }
          });
          list = list.concat(tempList)
        });
        _this.matrixBarHandler.drawDiversity(list);
      });

      pipeService.onSelectRegion(function(d){
//        console.log('selected' , d);
//        _this.currentComparisonType = "region";
//
//        let imgList =  _this.parseRecords(d['streets'], d['name']);
//        let record = {'imgList': imgList, 'name':d['name']}
//        if(_this.selectedRegions.length == 2){
//          _this.selectedRegions = []
//        }
//        _this.selectedRegions.push(record);
//        _this.selectedCollectionUpdated(_this.selectedRegions)

      });

      pipeService.onSelectedRegionByClick(function(region){
        _this.matrixBarHandler.highlightSelection(region)
      });

    },
    computed:{

    },
    methods:{
      updateRecords(d){
        // To decide to remove a old element or add a new element
        let _this = this;
        console.log('udpate');
        let newRecords = [];
        let imgList =  _this.parseRecords(d['streets'], d['name']);
        imgList.forEach(function(item){
            if(item.record.record!= undefined){
              item.record.statistics = item.record.record.statistics;
              item.record.dv = item.record.record.dv;
              item.record.standard = item.record.record.standard;
              item.record.sv = item.record.record.sv;
            }
        })
        let record = {'imgList': imgList, 'name':d.name, id: d.id, 'color': d.mColor};
        let existed = false;
        this.selectedRegions.forEach((region)=>{
          if(region.id != record.id){
              newRecords.push(region)
          }else{
              existed = true;
          }
        });

        if(newRecords.length < 2 && existed == false){
          newRecords.push(record);
        }
        _this.selectedRegions = newRecords;
      },
      selectedCollectionUpdated(newData){
        let _this = this;
        let names = [];
        newData.forEach(function(d){
          names.push(d['name'])
        });
        // Change color
        _this.matrixBarHandler.setColorStyle(names);
//                Demo
        console.log('draw', newData);
        _this.matrixBarHandler.drawMatrix(newData);
        _this.matrixBarHandler.drawdsbBarchart(newData);

        _this.matrixBarHandler.drawDiversity(newData);

      },
      parseRecords(list, cityId){
        let output = [];
        list.forEach(function(d){
          output.push({
            'record': d,
            'cityObj':{'id': cityId}
          })
        });
        return output
      },
      checkStatistics(standard){
        let sum = 0;
        this.features.forEach(function(attr){
          sum += standard[attr];
        });
        return sum == 0? false: true;
      },
      initControlConfig(){
        let _this = this;
        let controlConf = this.controlConf
        this.svFeatures2Color.allFeatures.forEach(function(attr){
          controlConf.push({
            'id': attr,
            'valueRange': [0,100],
          })
        })
      },
    },
    watch:{
      controlConf:{
        handler: function(newData){
          let _this = this;
          //Hack 不忍直视
          d3.select(this.$el).selectAll('.el-slider__bar').each(function(d, i){
            let e = newData[i];
            if(e != undefined){
              d3.select(this).style('background-color', _this.svFeatures2Color[e['id']]);
            }

          });
          d3.select(this.$el).selectAll('.el-slider__button').each(function(d, i){
            let index = parseInt(i / 2)
            let e = newData[index];
            if(e != undefined){
              d3.select(this).style('background-color', _this.svFeatures2Color[e['id']]);
            }
          });
        },
        deep: true
      },
      selectItems(newData){
//        this.currentComparisonType = "street";
//        this.matrixBarHandler.drawDiversity(newData);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .scatter-bar-chart{
    width: 100%;
    height: 100%
  }
  .botton-class{
    position: absolute;
    left: 10px;
    bottom: 10px;
  }
</style>
