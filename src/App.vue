<template>
  <div id="app">
    <Navbar><button @click="showModal = true" slot="header" style="margin-top: 10px">Compare</button></Navbar>
    <el-row :gutter="20" class="whole-row">
      <el-col :span="5" class="root-container bstyle">
        <RegionList v-bind:selectIdMap="selectIdMap"></RegionList>
      </el-col>
      <el-col :span="19" class="root-container">
        <!--<Navigation class="y-style-top"></Navigation>-->
        <CompContainer  class="y-style-middle"></CompContainer>
        <!--<ScatterBarChart class="y-style-bottom"></ScatterBarChart>-->

        <!--<Analysis class="y-style-bottom"></Analysis>-->
        <!--<ImproveLineChart class="y-style-bottom"> </ImproveLineChart>-->
      </el-col>

    </el-row>

    <!--<div class="ui-row">-->
    <!--&lt;!&ndash;<div class="col-sm-3 col-md-3 col-lg-3 root-container" ><ControlPanel class="bstyle"></ControlPanel></div>&ndash;&gt;-->
    <!--<div class="col-sm-3 col-md-3 col-lg-3 root-container bstyle" >-->
    <!--<RegionList v-bind:selectIdMap="selectIdMap"></RegionList>-->
    <!--</div>-->
    <!--<div class="col-sm-9 col-md-9 col-lg-9 root-container " >-->
    <!--<Navigation class="y-style-top"></Navigation>-->
    <!--<CompContainer  class="y-style-middle"></CompContainer>-->
    <!--<Analysis class="y-style-botton"></Analysis>-->
    <!--</div>-->

    <!--</div>-->
    <ModalView
      v-if="showModal"
      @close="showModal = false"
      v-bind:selectItems="selectItems"
      v-bind:cityOptions="cityOptions"
    >
    </ModalView>

  </div>

</template>

<script>
  import Navbar from './components/Navbar.vue'
  import ControlPanel from './components/ControlPanel.vue'
  import Navigation from './components/Navigation.vue'
  import CompContainer from './components/ComparisionContainer.vue'
  import Analysis from './components/Analysis/Analysis.vue'
  import RegionList from './components/RegionList/RegionList.vue'
  import ModalView from './components/AnalysisView.vue'
  import pipeService from './service/pipeService'
  import 'bootstrap/dist/css/bootstrap.css'
  import ScatterBarChart from './components/visView/ScatterBarChart.vue'
  import ImproveLineChart from './components/visView/ImproveLineChart.vue'

  export default {
    name: 'app',
    components: {
      Navbar,
      ControlPanel,
      Navigation,
      CompContainer,
      Analysis,
      RegionList,
      ModalView,
      ScatterBarChart,
      ImproveLineChart
    },
    data () {
      return {
        serverLink: '',
        showModal: false,
        selectItems:[],
        selectIdMap:{},
        value: null,
        options: ['list', 'of', 'options'],
        cityOptions:[
          {
            'name': 'New York',
            'gps':[40.7058253, -74.1180861],
            'id': 'nyc',
            'bound': null
          },{
            'name': 'Singapore',
            'gps':[1.3149014, 103.7769792],
            'id': 'singapore',
            'bound': null
          },{
            'name': 'Hong Kong',
            'gps':[22.365354, 114.105228],
            'id':'hk',
            'bound': null
          },{
            'name': 'London',
            'gps':[51.528308,-0.3817765],
            'id': 'london',
            'bound': null
          }
        ],
      };

    },
    mounted(){
      let _this = this;
      pipeService.onUpdateSelectItems(function(data){
        let updateSign = data['updateSign'];
        if(updateSign == true) {
          _this.addItem(data)
        }
        else{
          _this.removeItem(data)
        }
      })
    },
    methods:{
      addItem(data){
        if(!this.selectIdMap[data['id']]){
          this.selectIdMap[data['id']] = data;
          for(let i = 0, ilen = this.cityOptions.length; i < ilen; i++){
            if(this.cityOptions[i]['id'] == data['city']){
              data['cityObj'] = this.cityOptions[i];
              break;
            }
          }
          this.selectItems.push(data);
        }else{
          console.log('item', data['id'], 'has been existed');
        }
      },
      removeItem(data){
        if(this.selectIdMap[data['id']]){
          let index = -1;
          for(var i = 0, ilen = this.selectItems.length; i < ilen; i++){
            if(data['id'] == this.selectItems[i]['id']){
              index = i;
              break
            }
          }
          if(index != -1){
            this.selectItems.splice(index, 1);
            delete this.selectIdMap[data['id']];
          }
        }else{
          console.log('item', data['id'], 'is not existed');
        }
      }
    }
  }
</script>

<style scoped>
  html{
    background: rgba(211,211,211, 0.3);
    height: 100%;
    width: 100%;
    overflow-y: hidden;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    text-align: center;
    background: #ddd;
    height: 100vh
  }
  .ui-row{
    margin-top: -10px;
    height:93vh;
    min-height:93vh;

  }
  .whole-row{
    margin-top: -10px;
    height: 90%;
    min-height:90%;
    overflow-y: hidden;
    /*height:92vh;*/
    /*min-height:92vh;*/

  }
  .root-container{
    height: 98%;
    padding-right: 5px;
    padding-left: 5px
  }
  .bstyle {
    border-radius: 5px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;
    padding-left: 10px;
    height: 99%;
  }


  .y-style-top{
    border-radius: 5px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;
    height:25%;
  }
  .y-style-middle{
    border-radius: 5px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;
    height:60%;
  }
  .y-style-bottom{
    border-radius: 5px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;
    margin-top: 10px;
    height:40%;
  }


</style>
