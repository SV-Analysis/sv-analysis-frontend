/**
 * Created by yiding on 2017/1/10.
 */

import Vue from 'vue'
import VueResource from 'vue-resource'
Vue.use(VueResource)

const dataServerUrl = "http://127.0.0.1:5000";

const $http = Vue.http
var data = 'dds';
function getTestData (callback) {

  const url = `${dataServerUrl}/test`
  $http.get(url).then(response => {
    callback(response)
  }, errResponse => {
    console.log(errResponse)
  })
}

export default{
  getTestData,
  data
}
