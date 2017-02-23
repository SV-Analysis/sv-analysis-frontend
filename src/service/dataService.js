/**
 * Created by yiding on 2017/1/10.
 */

import Vue from 'vue'
import VueResource from 'vue-resource'
Vue.use(VueResource)

const dataServerUrl = "http://127.0.0.1:9930";
// const dataServerUrl = "/sv-analysis";

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
  $http.post(url, {'cityId': cityId, 'positions': positions}).then(response => {
    callback(JSON.parse(response.data))
  }, errResponse => {
    console.log(errResponse)
  })
}

function queryStreetCollections(cityId, startIndex, number, callback){
  const url = `${dataServerUrl}/streetsetquery`
  $http.post(url, {'cityId': cityId, 'startIndex': startIndex, 'number': number}).then(response => {
    callback(JSON.parse(response.data))
  }, errResponse => {
    console.log(errResponse)
  })
}

function queryRegionCollections(cityId, startIndex, number, callback){
  const url = `${dataServerUrl}/adregionsetquery`
  $http.post(url, {'cityId': cityId, 'startIndex': startIndex, 'number': number}).then(response => {
    callback(JSON.parse(response.data))
  }, errResponse => {
    console.log(errResponse)
  })
}

export default{
  getTestData,
  getAllRecordsForOneCity,
  queryRegionFromBackground,
  queryStreetCollections,
  queryRegionCollections
}
