/**
 * Created by qshen on 3/8/2017.
 */

export const serverLink = 'http://127.0.0.1:9930/';
// export const serverLink = '/sv-analysis/'
export const svFeatures2Color = {
  'green': '#2ca02c',
  'sky': '#17becf',
  'road': '#8c564b',
  'building' : '#ff7f0e',
  'car': '#ff9896',
  'others': '#c7c7c7',
  'allFeatures': ['green', 'sky', 'road', 'building', 'car', 'others']
};

export const cityOptions = [
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
];

// v-bind:svFeatures2Color="svFeatures2Color"
