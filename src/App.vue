<template>
  <div id="app">
    <Navbar></Navbar>
    <div class="ui-row">
      <!--<div class="col-sm-3 col-md-3 col-lg-3 root-container" ><ControlPanel class="bstyle"></ControlPanel></div>-->
      <div class="col-sm-9 col-md-9 col-lg-9 root-container " >
        <Navigation class="y-style-top"></Navigation>
        <CompContainer v-bind:svFeatures2Color="svFeatures2Color" class="y-style-middle"></CompContainer>
      </div>
      <div class="col-sm-4 col-md-3 col-lg-3 root-container" ><Analysis v-bind:svFeatures2Color="svFeatures2Color" class="bstyle"></Analysis></div>
    </div>
  </div>
</template>

<script>
  import Navbar from './components/Navbar.vue'
  import ControlPanel from './components/ControlPanel.vue'
  import Navigation from './components/Navigation.vue'
  import CompContainer from './components/ComparisionContainer.vue'
  import Analysis from './components/Analysis.vue'
  import 'bootstrap/dist/css/bootstrap.css'

  export default {
    name: 'app',
    components: {
      Navbar,
      ControlPanel,
      Navigation,
      CompContainer,
      Analysis
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
        }
      }
    },
    mounted(){

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

  .bstyle {
    border-radius: 5px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;
    margin-left: 0px;
    height:100%;
  }
  .y-style-top{
    border-radius: 5px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;
    height:30%;
  }
  .y-style-middle{
    border-radius: 5px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;
    margin-top: 10px;
    height:69%;
  }
  .y-style-botton{
    border-radius: 5px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;
    margin-top: 10px;
    height:18%;
  }

</style>
