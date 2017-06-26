<template>
  <transition name="modal">
    <div class="modal-mask" >
      <div class="modal-wrapper">
        <div class="modal-container">
          <!--<div class="">-->
            <!--<button class="modal-default-button" @click="$emit('close')">-->
            <!--X-->
            <!--</button>-->
          <!--</div>-->
          <div class="modal-body-top">
            <div class="ui-row modal-body">
              <div class="col-sm-10 col-md-10 col-lg-10 vis-container" >
                <StreetVis
                  v-bind:selectItems="selectItems"
                ></StreetVis>
              </div>


              <div class="col-sm-2 col-md-2 col-lg-2 " >
                <StreetList v-bind:selectItems="selectItems">
                  <el-button @click="$emit('close')">
                    Close
                  </el-button>
                </StreetList>
              </div>

            </div>
          </div>
          <!--<div class="modal-footer">-->
          <!--</div>-->
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  //  import ScatterBarChart from './visView/ScatterBarChart.vue'
  import Multiselect from 'vue-multiselect'
  import pipeService from '../service/pipeService'
  import StreetVis from './StreetVis/StreetVis.vue'
  import * as Config from '../Config'
  import StreetList from './StreetVis/StreetList.vue'

  export default {
    name: 'modalview',
    props:[ 'selectItems'],
    data () {
      return {
        SelectLabel:'',
        title: 'ModalView',
        options: [],
        selection: [],
        svFeatures2Color: Config.svFeatures2Color
      }
    },
    mounted(){
      let _this = this;
      this.selectItems.forEach(function(d){
        _this.options.push(d)
      });
    },
    computed:{

    },
    methods:{
      confirm: function(){
        this.selection[0]['show'] = true;
        this.selection[1]['show'] = false;
        pipeService.emitConfirmSelection([this.selection[0], this.selection[1]]);
      }
    },

    components:{
//      ScatterBarChart,
      Multiselect,
      StreetVis,
      StreetList
    }
  }
</script>

<style >

  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: table;
    transition: opacity .3s ease;
  }

  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
    position: relative;
  }

  .modal-container {
    width: 80%;
    height: 95%;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
    font-family: Helvetica, Arial, sans-serif;
    position: relative;
    /*background: rgba(255, 255, 255, 0.0);*/
    background: rgba(211,211,211, 1);
  }

  .def-modal-header{
    color: #42b983;

  }
  .modal-body-top{
    height: 115%;
    width: 100%
  }
  .modal-body {
    /*margin: 20px 0;*/
    height: 90%;
    /*background-color: #5bc0de;*/
    background: rgba(211,211,211, 0.0);
  }

  .modal-default-button {
    /*float: right;*/
  }

  /*
   * The following styles are auto-applied to elements with
   * transition="modal" when their visibility is toggled
   * by Vue.js.
   *
   * You can easily play with the modal transition by editing
   * these styles.
   */

  .modal-enter {
    opacity: 0;
  }

  .modal-leave-active {
    opacity: 0;
  }

  .modal-enter .modal-container,
  .modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
  .modal-footer{
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .vis-container{
    height: 100%;
    /*background-color: rgba(170, 229, 231, 0.84);*/
  }

</style>
