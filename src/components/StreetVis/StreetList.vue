<template>
  <div class="street-list-container">
    <div class="street-list">
      <div v-for="street,i in selectItems" >
        <div style="text-align: left">
          <input type="checkbox"
                 v-bind:value='street'
                 v-model="checked"
                 :disabled="street.selectDisable == true? true: false"
          >
          <label>{{street.id}}</label>
        </div>
        <el-carousel :autoplay='false' type="card" height="120px" >
          <el-carousel-item v-for="seg in street.record.segments">
            <img v-bind:src="seg['summary_img'][0]['formatImgPath']" height="120px" >
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
    <el-button  v-on:click="confirm()">
      Confirm
    </el-button>
  </div>
</template>

<script>
  import * as d3 from 'd3'
  import * as Config from '../../Config'
  import pipeService from '../../service/pipeService'
  export default {
    name: 'streetList',
    props:['selectItems'],
    data () {
      return {
        title: 'streetList',
        svFeatures2Color: Config.svFeatures2Color,
        activeSelections: [],
        checked: [],
        streetList: []
      }
    },
    mounted(){

      let _this = this;
      this.selectItems.forEach(function(d){
        d['selectDisable'] = false;
      });
    },
    computed:{

    },
    methods:{
      confirm(){
        this.checked[0]['show'] = true;
        this.checked[1]['show'] = false;
        pipeService.emitConfirmSelection(this.checked);
      }
    },
    watch:{
      checked(newData){
        console.log('new', newData);
        let _this = this;
        if(newData.length < 2){
          this.selectItems.forEach(function(d){
            d['selectDisable'] = false
          })
        }else{
          let temp_map = {};
          _this.checked.forEach(function(d){
            temp_map[d.id] = true;
          });

          this.selectItems.forEach(function(d, i){
            if(temp_map[d['id']] == undefined){
              d['selectDisable'] = true;
            }else{
              d['selectDisable'] = false;
            }
          })

        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >

  .street-list-container{
    margin-top: 0px;
    width: 100%;
    height: 90%;
    max-height: 820px;

  }
  .street-list{
    margin-top: 0px;
    width: 100%;
    height: 90%;
    max-height: 800px;
    overflow-y: auto;
    margin-bottom: 10px;
  }


  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
  }

  .el-carousel__item:nth-child(2n) {
    /*background-color: #99a9bf;*/
  }

  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
</style>
