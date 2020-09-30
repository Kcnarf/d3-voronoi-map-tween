(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-weighted-voronoi'), require('d3-voronoi-map')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-weighted-voronoi', 'd3-voronoi-map'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3,global.d3));
}(this, function (exports,d3WeightedVoronoi,d3VoronoiMap) { 'use strict';

  function voronoiMapTween() {
    //begin: constants
    var DEFAULT_KEY = function (d) {
      return d.id;
    }; // default identifier accessor
    //end: constants

    //begin: imputs
    var key = DEFAULT_KEY; // accessor to the idenitifier of each datum
    var startingVoronoiMap, endingVoronoiMap;
    //end: imputs

    //begin: internals
    var weightedVoronoi = d3WeightedVoronoi.weightedVoronoi(),
      shouldInitialize = true; // should initialize due to changes via APIs

    //end: internals

    //begin: utils

    //end: utils

    function _voronoiMapTween(startingVoronoiMap, endingVoronoiMap, key) {}

    return _voronoiMapTween;
  }

  exports.voronoiMapTween = voronoiMapTween;

  Object.defineProperty(exports, '__esModule', { value: true });

}));