<template>
  <div id="app">
    <Navbar></Navbar>
    <div class="ui-row">
      <!--<div class="col-sm-3 col-md-3 col-lg-3 root-container" ><ControlPanel class="bstyle"></ControlPanel></div>-->
      <div class="col-sm-9 col-md-9 col-lg-9 root-container " >
        <Navigation class="y-style-30"></Navigation>
        <CompContainer class="y-style-70"></CompContainer>
      </div>
      <div class="col-sm-4 col-md-3 col-lg-3 root-container" ><Analysis class="bstyle"></Analysis></div>
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
    height:90vh;
    min-height:90vh;
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
  .y-style-30{
    border-radius: 5px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;
    height:30%;
  }
  .y-style-70{
    border-radius: 5px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;
    margin-top: 10px;
    height:69%;
  }

</style>
