<!--这个component没写好，应该再分成一些子模块-->
<template>
  <div class="region-list">
    <el-tabs v-model="activeName" @tab-click="tabClicked">
      <el-tab-pane label="City" name="city">
        <CitySelection ></CitySelection>
      </el-tab-pane>
      <el-tab-pane label="Region" name="region" >
        <RegionSelection :selectIdMap="selectIdMap"> </RegionSelection>
      </el-tab-pane>
      <el-tab-pane label="Street" name="street">
        <StreetSelection :selectIdMap="selectIdMap"> </StreetSelection>
      </el-tab-pane>
      <el-tab-pane label="Exploration" name="explore">
        <ExploreSelection> </ExploreSelection>
      </el-tab-pane>
    </el-tabs>

  </div>
  </div>
</template>

<script>

  import dataService from "../../service/dataService"
  import RegionMap from "../MapViews/RegionMap.vue"
  import pipeService from "../../service/pipeService"

  import StreetSelection from "../Selections/StreetSelection.vue"
  import RegionSelection from "../Selections/RegionSelection.vue"
  import CitySelection from "../Selections/CitySelection.vue"
  import ExploreSelection from "../Selections/ExploreSelection.vue"
  import  * as Config from "../../Config"



  export default {
    name: 'streetlist',
    props: ['selectIdMap'],
    components:{
      RegionMap,
      StreetSelection,
      RegionSelection,
      CitySelection,
      ExploreSelection
    },
    data () {
      return {
        title: 'Street List',
        svFeatures2Color: Config.svFeatures2Color,
        serverLink: Config.serverLink,
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
        queryCondition:[

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
        currentCity: null,
        activeName: 'city'
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
      tabClicked(tab, event){
//          console.log('tab', tab.label, event);
          pipeService.emitTabClicked(tab.name);

      },
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
        pipeService.emitStreetsSelected(_this.data)

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

        if(record['aggregatedImages'] == undefined) {
          let agImgList = this._createAggregatedImglist(record['image_list']);
          record['aggregatedImages'] = agImgList;
        }
        pipeService.emitUpdateSelectItems(item);
      },
      _createAggregatedImglist(imgList){
        let _this = this;

        let features = this.svFeatures2Color['allFeatures'];
        let locationMap = {};
        let aggregateImgList = [];
        for(let i = 0, ilen = imgList.length; i < ilen; i++){
          let imgObj = imgList[i];
          let [x, y] = imgObj['location'];

          if(locationMap[x] == undefined){
            locationMap[x] = {};
          }
          if(locationMap[x][y] == undefined){
            locationMap[x][y] = {
              imgList:[],
              location: [x,y],
              attrObj:{}
            };
            aggregateImgList.push(locationMap[x][y])
          }
          locationMap[x][y]['imgList'].push(imgObj);
        }
        aggregateImgList.forEach(function(agImg, i){
          // Init attrs in the AggregateImgOb
          features.forEach(function(attr){
            agImg['attrObj'][attr] = 0;
          });
          //  Calculate Attr
          agImg['imgList'].forEach(function(imgObj){
            features.forEach(function(attr){
              agImg['attrObj'][attr] += (imgObj[attr] / agImg['imgList'].length);
            })
          });
          let largestValue = 0;
          let largestAttr = null;
          features.forEach(function(attr){
            if(largestValue < agImg['attrObj'][attr]){
              largestValue = agImg['attrObj'][attr]
              largestAttr = attr;
            }
          });
          agImg['max_attr'] = {
            attr: largestAttr,
            value: largestValue
          }
          agImg['img_path'] = agImg['imgList'][0]['img_path'];
          agImg['id'] = 'aggregate_' + agImg['imgList'][0]['index'];


          let imgPath = agImg['img_path']
          let imgitems = imgPath.split('/');
          let cityname = imgitems[0];
          let cid = imgitems[2];
          let iid = imgitems[3];

          let imgLink = _this.serverLink  + 'getImage?city=' + cityname +'&cid='+cid +'&iid=' + iid;
          agImg['formatImgPath'] = imgLink;
          agImg['aggregateIndex'] = i;
        });

        return aggregateImgList;

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
    width: 98%;
    padding-right: 20px;
    overflow-y: auto;
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
