/**
 * Created by yiding on 2017/1/10.
 */

import Vue from 'vue'
import VueResource from 'vue-resource'
Vue.use(VueResource)

const dataServerUrl = "http://127.0.0.1:5000";

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
