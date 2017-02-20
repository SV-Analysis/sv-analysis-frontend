<template>
  <div id="app">
    <Navbar><button @click="showModal = true" slot="header" style="margin-top: 10px">Compare</button></Navbar>
    <div class="ui-row">
      <!--<div class="col-sm-3 col-md-3 col-lg-3 root-container" ><ControlPanel class="bstyle"></ControlPanel></div>-->
      <div class="col-sm-9 col-md-9 col-lg-9 root-container " >
        <Navigation class="y-style-top"></Navigation>
        <CompContainer v-bind:svFeatures2Color="svFeatures2Color" class="y-style-middle"></CompContainer>
        <Analysis v-bind:svFeatures2Color="svFeatures2Color" class="y-style-botton"></Analysis>
      </div>
      <div class="col-sm-4 col-md-3 col-lg-3 root-container bstyle" ><RegionList v-bind:svFeatures2Color="svFeatures2Color" v-bind:selectIdMap="selectIdMap"></RegionList></div>
    </div>
    <ModalView v-if="showModal" @close="showModal = false" v-bind:svFeatures2Color="svFeatures2Color" v-bind:selectItems="selectItems">

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

    },
    data () {
      return {
        svFeatures2Color: {
          'green': '#2ca02c',
          'sky': '#17becf',
          'road': '#8c564b',
          'building' : '#ff7f0e',
          'car': '#ff9896',
          'others': '#c7c7c7',
          'allFeatures': ['green', 'sky', 'road', 'building', 'car', 'others']
        },
        showModal: false,
        selectItems:[],
        selectIdMap:{},
        value: null,
        options: ['list', 'of', 'options']
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
    width: 100%
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
  .root-container{
    height: 100%;
    padding-right: 5px;
    padding-left: 5px
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
    margin-top: 10px;
    height:54%;
  }
  .y-style-botton{
    border-radius: 5px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;
    margin-top: 10px;
    height:19%;
  }
  .bstyle {
    border-radius: 5px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;
    margin-left: 0px;
    height:100%;
  }


</style>
