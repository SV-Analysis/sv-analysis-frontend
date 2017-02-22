<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header ui-row">

          </div>

          <div class="modal-body-top">
            <div class="ui-row modal-body">

              <div class="col-sm-2 col-md-2 col-lg-2 " >
                <multiselect v-model="selection"
                             :options="options"
                             :multiple="true"
                             placeholder="Type to search"
                             track-by="id"
                             label="id"
                             :max="2"
                >
                  <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>
                </multiselect>
                <!--<multiselect style="padding-bottom: 10px"-->
                <!--v-model="selection" :options="options"-->
                <!--:multiple="true"-->
                <!--placeholder="Select"-->
                <!--label="id" :max="2" :max-height="150" :option-height="5"-->
                <!--select-label="">-->
                <!--</multiselect>-->
                <button v-on:click="confirm()">Confirm</button>
              </div>

              <div class="col-sm-8 col-md-8 col-lg-8 vis-container" >
                <ScatterBarChart v-bind:svFeatures2Color='svFeatures2Color' v-bind:selectItems="selectItems"></ScatterBarChart>
              </div>
              <div class="col-sm-2 col-md-2 col-lg-2 " >
                c
              </div>

            </div>
          </div>

          <div class="modal-footer">
            <button class="modal-default-button" @click="$emit('close')">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import ScatterBarChart from './visView/ScatterBarChart.vue'
  import Multiselect from 'vue-multiselect'
  import pipeService from '../service/pipeService'

  export default {
    name: 'modalview',
    props:['svFeatures2Color', 'selectItems'],
    data () {
      return {
        SelectLabel:'',
        title: 'ModalView',
        options: [],
        selection: []
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
        pipeService.emitConfirmSelection([this.selection[0], this.selection[1]]);
      }
    },

    components:{
      ScatterBarChart,
      Multiselect
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
    width: 90%;
    height: 95%;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
    font-family: Helvetica, Arial, sans-serif;
    position: relative;
  }

  ..def-modal-header{
    color: #42b983;

  }
  .modal-body-top{
    height: 100%;
  }
  .modal-body {
    /*margin: 20px 0;*/
    height: 90%;
    /*background-color: #5bc0de;*/
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
  /*.multiselect__tag {*/
  /*background-color: #dddaff;;*/
  /*color: black;*/

  /*}*/
  /*.multiselect__option--highlight:after {*/
  /*content: attr(data-select);*/
  /*background: #aae5e7;*/
  /*color: #fff;*/
  /*}*/

</style>
