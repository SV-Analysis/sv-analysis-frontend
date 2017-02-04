/**
 * Created by yiding on 2017/1/10.
 */

import Vue from 'vue'
import VueResource from 'vue-resource'
Vue.use(VueResource)

const dataServerUrl = "http://127.0.0.1:9930";
// const dataServerUrl = "/sv-analysis";
// const dataServerUrl = ""
const $http = Vue.http

function getTestData (callback) {

  const url = `${dataServerUrl}/test`
  $http.get(url).then(response => {
    callback(JSON.parse(response.data))
  }, errResponse => {
    console.log(errResponse)
  })
}

function getAllRecordsForOneCity(cityId, callback) {

  const url = `${dataServerUrl}/getallrecords`
  console.log('get all data', url);
  $http.post(url, {'cityId': cityId}).then(response => {
    callback(JSON.parse(response.data))
  }, errResponse => {
    console.log(errResponse)
  })
}

function queryRegionFromBackground(cityId, positions, callback) {
  const url = `${dataServerUrl}/regionquery`
  console.log('post')
  $http.post(url, {'cityId': cityId, 'positions': positions}).then(response => {
    callback(JSON.parse(response.data))
  }, errResponse => {
    console.log(errResponse)
  })
}

export default{
  getTestData,
  getAllRecordsForOneCity,
  queryRegionFromBackground
}
