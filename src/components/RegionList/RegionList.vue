<template>
  <div class="region-list">
    <div class="table-pagination-container">
      <div> {{title}}</div>

      <select v-model="selected" class="dropbtn">
        <option v-for="option in cityOptions" v-bind:value="option.id">
          {{ option.name }}
        </option>
      </select>

      <div class="table-container">
        <table class="street-table">
          <!--<col width="16.67%">-->
          <!--<col width="16.67%">-->
          <!--<col width="16.67%">-->
          <!--<col width="16.67%">-->
          <!--<col width="16.67%">-->
          <!--<col width="16.67%">-->
          <thead >
          <tr>
            <th v-for="attr in attrs" class="head-style">{{attr}}</th>
          </tr>
          </thead>
          <tbody>
          <!--Street Record-->
          <tr v-for="record in data" v-if="record['dataType']=='street'">
            <td oncontextmenu="return false;" v-bind:class="record['attr']['SL'] ? 'selectRow' : 'notSelectRow'" v-on:click='rowClick(record)' v-on:contextmenu="rightClick(record)" v-for="attr_name in attrs">{{record.attr[attr_name]}}</td>
          </tr>

          <tr class="extand_map" v-else-if="record['dataType']=='map'"><td colspan="6">
            <RegionMap v-bind:cityInfo="currentCity" v-bind:streetData="record['context']" v-bind:svFeatures2Color="svFeatures2Color"></RegionMap>
          </td></tr>
          </tbody>
        </table>
      </div>

      <div class="pagination_container">
        <div class = "pagination_button_container">
          <ul class="pagination">
            <button v-on:click="previousCollection">«</button>
            <input class="nav-btn-group" v-model="startIndex" placeholder="Start" >
            ~
            <input class="nav-btn-group" v-model="endIndex" placeholder="End" >
            <button v-on:click="confirmNum()">Confirm</button>
            <button v-on:click="nextCollection">»</button>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import dataService from "../../service/dataService"
  import RegionMap from "../MapViews/RegionMap.vue"
  import pipeService from "../../service/pipeService"

  export default {
    name: 'streetlist',
    props: ['svFeatures2Color', 'selectIdMap'],
    components:{
      RegionMap
    },
    data () {
      return {
        title: 'Street List',
        selected:'',
        data:[],
        nav_button:[1,2,3,'...',5],
        attrs:['SL','id','tag','len', 'streetType','img_len'],
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
          },
        ],
        startIndex: 'Start',
        endIndex: 'End',
        currentLen: 30,
        currentCity: null
      }
    },
    mounted(){

    },
    computed:{
      listNumber: function(){
        if(isNaN(this.endIndex) || isNaN(this.startIndex))
          return 0;
        else{
          return parseInt(this.endIndex) - parseInt(this.startIndex) + 1;
        }
      }
    },
    watch:{
      selected: function(newdata, olddata){
        let _this = this;
        this.cityOptions.forEach(function(city){
          if(city['id'] == _this.selected){
            _this.currentCity = city;
          }
        });
        this.initPaginationInput();
        this._queryStreet();
      },
      listNumber: function(newData, oldData){
        if(newData > 50){
          this.endIndex = parseInt(this.startIndex) + 51;
        }
      }
    },
    methods:{
      initPaginationInput(){
        this.startIndex = 0;
        this.endIndex = this.startIndex + this.currentLen - 1;
      },
      updatePaginationInput(start, end, number){

      },
      _queryStreet(){
        let _this = this;
        dataService.queryStreetCollections(this.selected, this.startIndex, this.currentLen, function(records){
          _this._parseRecords(records, _this.selected)
        })
      },
      _parseRecords(records, city){
        let _this = this;
        let udpateData = [];
        records.forEach(function(record){
//        City is somehow hack
          record['dataType'] = 'street';
          record['clicked'] = false;
          record['attr']['id'] = record['id'];
          record['attr']['tag'] = record['tag'];

          record['city'] = city;
          let record_id = record['city'] + '_' + record['dataType'] + '_' + record['id'];
          if(_this.selectIdMap[record_id]){
            record['attr']['SL'] = true;
          }
          else{
            record['attr']['SL'] = false;
          }
          udpateData.push(record);
        });
        _this.data = udpateData;
      },
      rowClick(record){
        let index = -1;
        for(var i = 0; i < this.data.length; i++){
          if(record == this.data[i]){
            index = i;
            break;
          }
        }
        if(index != -1 && this.data[index]['clicked'] == false){
          // Insert a new element at index
          this.data.splice(index + 1, 0, {
            dataType: 'map',
            context: this.data[index]
          });

          this.data[index]['clicked'] = true;
        }else if(index != -1 && this.data[index]['clicked'] == true){
          this.data[index]['clicked'] = false;
          this.data.splice(index + 1, 1);

        }
      },
      rightClick(record){
        record['attr']['SL'] = !record['attr']['SL'];
        let item = {
          id: record['city'] + '_' + record['dataType'] + '_' + record['id'],
          city: record['city'],
          type: record['dataType'],
          record: record,
          updateSign: record['attr']['SL']
        };
        pipeService.emitUpdateSelectItems(item);
      },
      confirmNum(){
        if(isNaN(this.endIndex)||isNaN(this.startIndex)||isNaN(this.listNumber)){
          console.log('Incorrect input');
        }
        if(this.listNumber>0){
          this.currentLen = parseInt(this.listNumber);
          this._queryStreet();
        }
      },
      previousCollection(){
        if(isNaN(this.startIndex) || isNaN(this.endIndex)) return
        this.startIndex = parseInt(this.startIndex);
        this.endIndex = parseInt(this.endIndex);
        this.startIndex = (this.startIndex - this.currentLen) < 0? 0 :(this.startIndex - this.currentLen);
        this.endIndex = this.startIndex + this.currentLen - 1;
        this.confirmNum();
      },
      nextCollection(){
        if(isNaN(this.startIndex) || isNaN(this.endIndex)) return
        this.startIndex = parseInt(this.startIndex);
        this.endIndex = parseInt(this.endIndex);
        this.startIndex += this.currentLen;
        this.endIndex += this.currentLen;
        this.confirmNum();
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .region-list{
    height:100%;
  }
  .table-pagination-container{
    margin: auto;
    width: 90%;
    height: 100%;
  }
  .table-container{
    width:100%;
    /*height:100%;*/
    max-height: 80%;
    overflow-y: auto;
  }
  .street-table{
    /*margin-top:10px;*/
    padding: auto;
    width: 100%;
    border: 1px solid #ddd;
    max-height: 90%;
    overflow-y: auto;
  }
  .head-style{
    text-align: center;
    background-color: #F9FAFB;
    font-weight: bold;
    /*color: #fff;*/
  }
  .extand_map{

    height: 200px
  }
  .pagination_container{
    background-color: #5bc0de;
  }
  .pagination_button_container{
    /*width: 100%;*/
    float: right;
  }

  /* css for the table*/
  ul.pagination {
    /*display: inline-block;*/
    padding:0;
    margin:0px;
    margin-top:3px;
  }

  ul.pagination li {display: inline-block;}

  ul.pagination li a {
    color: black;
    float: left;
    padding: 8px 16px;
    text-decoration: none;
    transition: background-color .3s;
    border: 1px solid #ddd;
  }

  ul.pagination li a.active {
    background-color: #4CAF50;
    color: white;
    border: 1px solid #4CAF50;
  }

  ul.pagination li a:hover:not(.active) {background-color: #ddd;}

  /*Drop down box*/
  .dropbtn {
    /*background-color: #ddd;*/
    color: black;
    padding: 4px;
    font-size: 12px;
    border: none;
    cursor: pointer;
    float: left;
    margin-bottom: 5px;
    border: 1px solid #ddd;
  }

  .dropdown {
    position: relative;
    display: inline-block;
    float: left;
    margin-bottom: 10px;

  }

  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  }

  .dropdown-content a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }

  .dropdown-content a:hover {background-color: #f1f1f1}

  .dropdown:hover .dropdown-content {
    display: block;
  }

  .dropdown:hover .dropbtn {
    background-color: rgba(203, 240, 251, 0.97);
  }

  /*nav buttons*/
  input.nav-btn-group{
    width: 60px
  }

  /**/
  .selectRow{
    background-color: #d6e9c6;
  }
  .notSelectRow{
    background-color: white;
  }
</style>
