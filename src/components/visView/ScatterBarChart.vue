<template>
  <div style="position:relative">
    <svg class="scatter-bar-chart" id="scatter-bar-chart">

    </svg>
    <el-popover
      ref="popcontrol"
      width="400"
      height="500"
      placement="left-end"  >

      <div class="title"><span>ScatterPlot matrix</span></div>
      <div>
        <span style="margin-top: 10px; float: left; text-align: left; width: 15%">Opacity</span>
        <el-slider v-model="matrixOpacity" style="width: 70%;float:left" :max=100></el-slider>
      </div>



      <div class="title" style="margin-top: 15px"><span>Feature Diversity</span></div>
      <div>
        <div >
          <span style="margin-top: 10px; float: left; text-align: left; width: 15%">Form</span>
          <el-switch style="margin-top: 5px;"
                     width= 90
                     v-model="diversityStyle"
                     on-text="Point"
                     off-text="Contour"
                     on-color="#20a0ff"
                     off-color="#20a0ff">
          </el-switch>
        </div>
        <div style="clear: left">
          <span style="margin-top: 10px; float: left; text-align: left; width: 15%">Opacity</span>
          <el-slider v-model="diversityOpacity" style="width: 70%;float:left" :max=100></el-slider>
        </div>
        <div style="clear: left">
          <span style="margin-top: 10px; float: left; text-align: left; width: 15%">Bandwidth</span>
          <el-slider v-model="diversityBandwidth" style="width: 70%;float:left" :max=50></el-slider>
        </div>
        <div style="clear: left">
          <span style="margin-top: 10px; float: left; text-align: left; width: 15%">Threshold</span>
          <el-slider v-model="diversityThreshold" style="width: 70%;float:left" :max=50></el-slider>
        </div>
      </div>

      <!--<div style="width: 80%">-->
      <!--<div v-for="attrConf in controlConf">-->
      <!--<span style="float: left; text-align: left; width: 20%">{{attrConf.id}}</span>-->
      <!--<el-slider v-model="attrConf['valueRange']" style="width: 70%; float: left"-->
      <!--range-->
      <!--:max=100>-->
      <!--</el-slider>-->
      <!--</div>-->
      <!--</div>-->

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
        records:[],
        matrixOpacity: 0.8,
        diversityStyle: true, // true: point, false: contour
        diversityOpacity: 0.8,
        diversityBandwidth: 4,
        diversityThreshold: 10
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
//        _this.currentComparisonType = "city";
//        _this.matrixBarHandler.drawMatrix(data);
//        _this.matrixBarHandler.drawdsbBarchart(data);
//        let list = [];
//        data.forEach(function(d){
//          let tempList = [];
//          d['imgList'].forEach(function(img){
//            let standard = img['record']['standard'];
//            if (_this.checkStatistics(standard)){
//              tempList.push(img);
//            }
//          });
//          list = list.concat(tempList)
//        });
//        _this.matrixBarHandler.drawDiversity(list);
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

        newData.forEach(function(region){
          names.push(region['name'])
//          imgList could be a list of regions or streets
          let imgList = [];
          region.imgList.forEach(function(img){
            let _statistics = img.record.statistics;
            if(_this.checkStatistics(_statistics)){
              imgList.push(img)
            }
          });
          region.imgList = imgList;
        });
        // Change color
        _this.matrixBarHandler.setColorStyle(names);
//                Demo
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
      selectItems(newData){
//        this.currentComparisonType = "street";
//        this.matrixBarHandler.drawDiversity(newData);
      },
      diversityStyle(newData){
        if(this.matrixBarHandler){
          this.matrixBarHandler.switchDiversityStyle(newData == true? 'point': 'contour')
        }
      },
      diversityBandwidth(newData){
        if (this.timeSign) clearTimeout(this.timeSign);
        this.timeSign = setTimeout(()=>{
          if(this.matrixBarHandler){
            this.matrixBarHandler.updateDiversityBandwidth(this.diversityBandwidth, this.diversityThreshold)
          }
        }, 800);


      },
      diversityThreshold(newData){
        if (this.timeSign) clearTimeout(this.timeSign);
        this.timeSign = setTimeout(()=>{
          if(this.matrixBarHandler){
            this.matrixBarHandler.updateDiversityBandwidth(this.diversityBandwidth, this.diversityThreshold)
          }
        }, 800);

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
  .title{
    clear: left;
    width: 100%;
    height: 13px;
    border-bottom: 1px solid #ccc;
    /*text-align: center;*/
    margin-bottom: 15px;
    text-align:center
  }
</style>
