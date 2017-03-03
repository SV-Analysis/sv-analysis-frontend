<!--这个component没写好，应该再分成一些子模块-->
<template>
  <div class="region-list">
    <div class="table-pagination-container">
      <div> {{title}}</div>

      <select v-model="selectedCity" class="dropbtn">
        <option v-for="option in cityOptions" v-bind:value="option.id">
          {{ option.name }}
        </option>
      </select>

      <select v-model="selectedType" class="dropbtn">
        <option v-for="option in typeOption" v-bind:value="option.id">
          {{ option.name }}
        </option>
      </select>

      <div class="table-container">
        <table class="street-table">
          <!--<col width="16.67%">-->
          <thead >
          <tr>
            <th v-for="attr in attrObj[selectedType]" class="head-style">{{attr}}</th>
          </tr>
          </thead>
          <tbody>
          <!--Street Record-->
          <tr v-for="record in data" v-if="record['dataType']=='street'">
            <td oncontextmenu="return false;"
                v-bind:class="record['attr']['SL'] ? 'selectRow' : 'notSelectRow'"
                v-on:click='rowClick(record)'
                v-on:contextmenu="rightClick(record)"
                v-for="attr_name in attrObj[selectedType]">
              {{record.attr[attr_name]}}
            </td>
          </tr>
          <tr v-else-if="record['dataType']=='adregion'">
            <td oncontextmenu="return false;"
                v-bind:class="record['attr']['SL'] ? 'selectRow' : 'notSelectRow'"
                v-on:click='rowClick(record)'
                v-on:contextmenu="rightClick(record)"
                v-for="attr_name in attrObj[selectedType]">
              {{record.attr[attr_name]}}
            </td>
          </tr>
          <tr class="extand_map" v-else-if="record['dataType']=='street_map'"><td colspan="6">
            <RegionMap v-bind:cityInfo="currentCity" v-bind:streetData="record['context']" v-bind:svFeatures2Color="svFeatures2Color"></RegionMap></td>
          </tr>
          <tr class="extand_map" v-else-if="record['dataType']=='adregion_map'"><td colspan="6">
            <RegionMap v-bind:cityInfo="currentCity" v-bind:adRegionData="record['context']" v-bind:svFeatures2Color="svFeatures2Color"></RegionMap></td>
          </tr>
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
        selectedCity:'',
        selectedType:'st',
        data:[],
        nav_button:[1,2,3,'...',5],
        attrs:['SL','id','tag', 'streetType','img_len'],
        attrObj:{
          'st': ['SL','id','tag', 'streetType','img_len'],
          'ar': ['SL', 'id', 'area', 'img_len']
        },
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
        typeOption:[
          {
            'id': 'st',
            'name':'street'
          },{
            'id': 'ar',
            'name':'region'
          }
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
      selectedCity: function(newdata, olddata){
        this.selectedChanged();

      },
      selectedType: function(newdata, olddata){
        this.selectedChanged();
      },
      listNumber: function(newData, oldData){
        if(newData > 50){
          this.endIndex = parseInt(this.startIndex) + 51;
        }
      }
    },
    methods:{
      selectedChanged(){
        let _this = this;
        let selectedCity = this.selectedCity;
        let selectedType = this.selectedType;
        if(selectedCity == '' || selectedType == '') return;
        this.cityOptions.forEach(function(city){
          if(city['id'] == _this.selectedCity){
            _this.currentCity = city;
          }
        });

        this.initPaginationInput();
        if(this.selectedType == 'st'){
          this._queryStreet();
        }else if(this.selectedType == 'ar'){
          this._queryRegionSimp();
        }

      },
      initPaginationInput(){
        this.startIndex = 0;
        this.endIndex = this.startIndex + this.currentLen - 1;
      },
      _queryStreet(){
        let _this = this;
        dataService.queryStreetCollections(this.selectedCity, this.startIndex, this.currentLen, function(records){
          _this._parseStreetRecords(records, _this.selectedCity)
        })
      },
      _queryRegionSimp(){
        let _this = this;
        let startTime = new Date();
        dataService.queryRegionCollections(this.selectedCity, this.startIndex, this.currentLen, function(records){
          let endTime = new Date();
          console.log('Time1 ', endTime - startTime);
          _this._parseRegionRecords(records, _this.selectedCity);
          console.log('Time2 ', new Date() - endTime);
        })
      },
      _parseStreetRecords(records, city){
        let _this = this;
        let udpateData = [];
        let number  = 0;
        records.forEach(function(record){
//        City is somehow hack
          number++;
          record['dataType'] = 'street';
          record['clicked'] = false;
          record['attr']['id'] = record['id'];
          record['attr']['tag'] = record['tag'];
          record['attr']['img_len'] = record['image_list'].length;
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
        console.log(number, 'street', this.data)
      },
      _parseRegionRecords(records, city){
        let _this = this;
        let udpateData = [];
        records.forEach(function(record){
//        City is somehow hack
          record['attr'] = record['attr'] == undefined ? {}: record['attr'];
          record['attr']['id'] = record['rid'];
          record['attr']['area'] = 21;
          record['attr']['img_len'] = record['img_len'];

          record['dataType'] = 'adregion';
          record['clicked'] = false;
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
        console.log('_this/data', this.data);
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
          let mapDataType = null;
          if(record['dataType'] == 'street'){
            mapDataType = 'street_map'
          }else if(record['dataType'] == 'adregion'){
            mapDataType = 'adregion_map'
          }

          this.data.splice(index + 1, 0, {
            dataType: mapDataType,
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

    width: 100px;

    color: black;
    padding: 4px;
    font-size: 12px;
    border: none;
    cursor: pointer;
    float: left;
    margin-bottom: 5px;
    border: 1px solid #ddd;
  }
  .dropbtn:nth-child(odd){

    margin-left: 10px;
    margin-right: 10px;
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
