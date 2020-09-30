import { weightedVoronoi as d3WeightedVoronoi } from 'd3-weighted-voronoi';
import { voronoiMap as d3VoronoiMap } from 'd3-voronoi-map';

export function voronoiMapTween() {
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
  var weightedVoronoi = d3WeightedVoronoi(),
    shouldInitialize = true; // should initialize due to changes via APIs

  //end: internals

  //begin: utils

  //end: utils

  function _voronoiMapTween(startingVoronoiMap, endingVoronoiMap, key) {}

  return _voronoiMapTween;
}
