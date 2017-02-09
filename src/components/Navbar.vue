<template>
  <ul class="navbar-container">
    <li class="navbar-button"><a class="active" href="#home">Street View Analysis</a></li>

    <div class="dropdown">
      <!--<a href="#" class="dropbtn">drop down</a>-->
      <div class="dropdown-content">
        <a href="#">链接 1</a>
        <a href="#">链接 2</a>
        <a href="#">链接 3</a>
      </div>
    </div>
  </ul>
</template>


<script>
  import dataService from '../service/dataService.js'

  export default {
    name: 'navbar',
    data(){
      return {
        title: 'Street View Analysis',
        buttons: [
          {'name': 'Start', 'link': "http://www.huamin.org/"},

        ],
        data: null
      }
    },
    methods:{
      clcTest(){
        let _this = this;
        dataService.getTestData(function(promise){
          console.log('promise', promise);
          _this.data = promise.data;
        })
      },
      testGetAllCity(){
        dataService.getAllRecordsForOneCity('hk', function(data){
          console.log('promise', data);
        })
      }
    }
  }
</script>

<style scoped>
  ul.navbar-container {
    list-style-type: none;
    margin-bottom: 15px;

    overflow: hidden;
    background-color: #333;
  }

  li.navbar-button {
    float: left;
  }

  li.navbar-button a, .dropbtn {
    display: inline-block;
    color: white;
    text-align: center;
    padding: 14px 16px;
    text-decoration: none;
  }

  li.navbar-button a:hover, .dropdown:hover .dropbtn {
    background-color: #111;
  }

  .dropdown {
    display: inline-block;
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
</style>
