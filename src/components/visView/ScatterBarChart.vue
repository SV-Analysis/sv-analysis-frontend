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
  import MatrixBar from '../../lib/MatrixBarV2'
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
        Config: Config
      }
    },
//    mounted(){
//      console.log('matrix bar chart');
//      let _this = this;
//      let matrixBarHandler = new MatrixBar(this.$el);
//      pipeService.onConfirmSelection(function(items){
//        console.log('itmes', items);
//        matrixBarHandler.draw(items[0], items[1], _this.svFeatures2Color['allFeatures']);
//      })
//    },
    mounted(){

      let _this = this;
      this.initControlConfig();
      let _el = document.getElementById('scatter-bar-chart');
      this.matrixBarHandler = new MatrixBar(_el, this.svFeatures2Color, Config);
//      matrixBarHandler.draw();
      pipeService.onCitySelected(function(data){

        _this.matrixBarHandler.drawMatrix(data);
        _this.matrixBarHandler.drawdsbBarchart(data);

      });

    },
    computed:{

    },
    methods:{
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

          // Alternative methods to detect continues actions.
//          if (this.x) clearTimeout(this.x);
//          this.x = setTimeout(function(){ _this.selectionChanged() }, 800);
        },
        deep: true
      },
      selectItems(newData){
        this.matrixBarHandler.drawDiversity(newData);
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
