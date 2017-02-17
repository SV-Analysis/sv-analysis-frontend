<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            Analysis
          </div>

          <div class="modal-body-top">
            <div class="ui-row modal-body">

              <div class="col-sm-2 col-md-2 col-lg-2 " >
                a
              </div>

              <div class="col-sm-8 col-md-8 col-lg-8 vis-container" >
                <ScatterBarChart v-bind:svFeatures2Color='svFeatures2Color' v-bind:selectItems="selectItems">

                </ScatterBarChart>
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

  export default {
    name: 'modalview',
    props:['svFeatures2Color', 'selectItems'],
    data () {
      return {
        title: 'ModalView',
        showModal: true
      }
    },
    mounted(){
      console.log('mount', this.selectItems);
    },
    computed:{

    },
    methods:{

    },
    components:{
        ScatterBarChart
    }
  }
</script>

<style scoped>

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

  .modal-header{

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

</style>
