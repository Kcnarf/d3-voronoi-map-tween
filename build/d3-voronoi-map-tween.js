(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-weighted-voronoi')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-weighted-voronoi'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3));
}(this, function (exports,d3WeightedVoronoi) { 'use strict';

  const ENTER_TWEEN_TYPE = 'enter'; // datum not in starting data, but in ending data; adds a cell to the starting Voronoï tessellation
  const UPDATE_TWEEN_TYPE = 'update'; // datum in starting data and in ending data; the corresponding cell in starting Voronoï tessellation evolves
  const EXIT_TWEEN_TYPE = 'exit'; // datum in starting data, but not in ending data; deletes a cell from the starting Voronoï tessellation

  function voronoiMapTween() {
    //begin: constants
    var DEFAULT_IDENTIFIER_ACCESSOR = function (d) {
      return d.id;
    }; // d identified with its 'id' attribute
    var X_ACCESSOR = function (d) {
      return d.interpolatedX;
    }; // x accessor of interpolated data
    var Y_ACCESSOR = function (d) {
      return d.interpolatedY;
    }; // y accessor of interpolated data
    var WEIGHT_ACCESSOR = function (d) {
      return d.interpolatedWeight;
    }; // weight accessor of interpolated data
    //end: constants

    //begin: imputs
    var startingKey = DEFAULT_IDENTIFIER_ACCESSOR; // used to identify starting data; used when maping starting data and ending data
    var endingKey = DEFAULT_IDENTIFIER_ACCESSOR; // used to identify ending data; used when maping starting data and ending data
    var startingVoronoiMapSimulation, endingVoronoiMapSimulation;
    //end: imputs

    //begin: internals
    var weightedVoronoi = d3WeightedVoronoi.weightedVoronoi().x(X_ACCESSOR).y(Y_ACCESSOR).weight(WEIGHT_ACCESSOR),
      shouldInitialize = true, // should initialize (or not) due to input changes via APIs
      clippingPolygon, // stores the clipping polygon; starting and ending Voronoï maps must use the same clipping polygon; set to the starting clipping polygon
      startingSiteByKey = {}, // map datum's identifier => startingSite (which references starting data, starting site's weight and position)
      endingSiteByKey = {}, // map datum's identifier => endingSite (which references ending data, ending site's weight and position)
      allSiteKeys = new Set(), // all data identifiers from starting data and ending data
      siteTweenData = []; // tween information for each data
    //end: internals

    //begin: utils
    function sqr(d) {
      return Math.pow(d, 2);
    }

    function squaredDistance(s0, s1) {
      return sqr(s1[0] - s0[0]) + sqr(s1[1] - s0[1]);
    }
    //end: utils

    ///////////////////////
    ///////// API /////////
    ///////////////////////
    function _voronoiMapTween(_startingVoronoiMapSimulation, _endingVoronoiMapSimulation) {
      startingVoronoiMapSimulation = _startingVoronoiMapSimulation;
      endingVoronoiMapSimulation = _endingVoronoiMapSimulation;
      shouldInitialize = true;

      // Produces a Voronoï tessellation inbetween a starting tessellation and an ending tessellation.
      // Currently uses a LERP interpollation. Param 'interpolationValue' gives the interpolation amount: 0->starting tessellation, 1->ending tessellation
      return function voronoiTesselationInterpolator(interpolationValue) {
        if (shouldInitialize) {
          initialize();
        }

        // [STEP 1] interpolate each coords and weights
        var interpolatedSites = siteTweenData.map(function (std) {
          return {
            key: std.key,
            startingData: std.startingData,
            endingData: std.endingData,
            interpolatedX: lerp(std.startingX, std.endingX, interpolationValue),
            interpolatedY: lerp(std.startingY, std.endingY, interpolationValue),
            interpolatedWeight: lerp(std.startingWeight, std.endingWeight, interpolationValue),
            interpolatedValue: lerp(std.startingValue, std.endingValue, interpolationValue),
            tweenType: std.tweenType,
          };
        });

        // [STEP 2] use d3-weighted-voronoi to compute the interpolated tessellation
        return weightedVoronoi(interpolatedSites);
      };
    }

    _voronoiMapTween.startingKey = function (_) {
      if (!arguments.length) {
        return startingKey;
      }

      startingKey = _;
      shouldInitialize = true;
      return _voronoiMapTween;
    };

    _voronoiMapTween.endingKey = function (_) {
      if (!arguments.length) {
        return endingKey;
      }

      endingKey = _;
      shouldInitialize = true;
      return _voronoiMapTween;
    };

    ///////////////////////
    /////// Private ///////
    ///////////////////////

    function initialize() {
      clippingPolygon = startingVoronoiMapSimulation.clip();
      weightedVoronoi.clip(clippingPolygon);

      var startingPolygons = startingVoronoiMapSimulation.state().polygons,
        endingPolygons = endingVoronoiMapSimulation.state().polygons,
        startingSites = startingPolygons.map(function (p) {
          return p.site;
        }),
        endingSites = endingPolygons.map(function (p) {
          return p.site;
        });
      var k;

      startingSiteByKey = {};
      startingSites.forEach(function (s) {
        k = key(s.originalObject.data.originalData);
        startingSiteByKey[k] = s;
        allSiteKeys.add(k);
      });
      endingSiteByKey = {};
      endingSites.forEach(function (s) {
        k = key(s.originalObject.data.originalData);
        endingSiteByKey[k] = s;
        allSiteKeys.add(k);
      });

      var startingSite,
        startingData,
        startingX,
        startingY,
        startingWeight,
        startingValue,
        endingSite,
        endingData,
        endingX,
        endingY,
        endingWeight,
        endingValue,
        tweenType;
      //find correspondance between starting and ending cells/sites/data; handle entering and exiting cells
      siteTweenData = [];
      allSiteKeys.forEach(function (k) {
        startingSite = startingSiteByKey[k];
        endingSite = endingSiteByKey[k];
        if (startingSite && endingSite) {
          // a startingSite and an endingSite related to the same datum
          startingData = startingSite.originalObject.data.originalData;
          endingData = endingSite.originalObject.data.originalData;
          startingX = startingSite.x;
          endingX = endingSite.x;
          startingY = startingSite.y;
          endingY = endingSite.y;
          startingWeight = startingSite.weight;
          endingWeight = endingSite.weight;
          startingValue = startingSite.originalObject.data.weight;
          endingValue = endingSite.originalObject.data.weight;
          tweenType = UPDATE_TWEEN_TYPE;
        } else if (endingSite) {
          // no startingSite, i.e. datum not in starting sites
          // no coords interpolation (site fixed to ending position), weight interpolated FROM underweighted weight, and value interpolated FROM 0
          startingData = null;
          endingData = endingSite.originalObject.data.originalData;
          startingX = endingSite.x;
          endingX = endingSite.x;
          startingY = endingSite.y;
          endingY = endingSite.y;
          startingWeight = computeUnderweight(endingSite, startingPolygons);
          endingWeight = endingSite.weight;
          startingValue = 0;
          endingValue = endingData.value;
          tweenType = ENTER_TWEEN_TYPE;
        } else {
          //no endingSite, i.e. datum not in ending sites
          //no coords interpolation (site fixed to starting position), weight interpolated TO underweighted weight, and data interpolated TO 0
          startingData = startingSite.originalObject.data.originalData;
          endingData = null;
          startingX = startingSite.x;
          endingX = startingSite.x;
          startingY = startingSite.y;
          endingY = startingSite.y;
          startingWeight = startingSite.weight;
          endingWeight = computeUnderweight(startingSite, endingPolygons);
          startingValue = startingData.value;
          endingValue = 0;
          tweenType = EXIT_TWEEN_TYPE;
        }

        siteTweenData.push({
          startingData: startingData,
          endingData: endingData,
          key: k,
          startingX: startingX,
          endingX: endingX,
          startingY: startingY,
          endingY: endingY,
          startingWeight: startingWeight,
          endingWeight: endingWeight,
          startingValue: startingValue,
          endingValue: endingValue,
          tweenType: tweenType,
        });
      });
      shouldInitialize = false;
    }

    // when interpolating, all sites/data (entering, updated, exiting) are mapped to an interpolated site in order to produce an interpolated Voronoï tesselation; when interpolation value is 0, we want the interpolated tessellation looks like the starting tessellation (even with the added entering sites/data), and don't want the entering sites/data to produce a cell; in the same way, when interpolation value is 1, we want the interpolated tessellation looks like the ending tessellation (even with the exiting sites/data), and don't want the exiting sites/data to produce a cell
    // using a default weight such (as 0) doesn't insure this desired behavior (a site with weight 0 can produce a cell)
    // using a very low default weight (as -1000) will do the trick for first/starting and last/ending tessellation, BUT the interpolated weights during animation of tessellations may be weird because entering and exiting sites/data appear/disappear too quickly
    // so the below function

    // returns an underweighted weight so that the entering (or exiting) site/data is completly overweighted by the starting sites (or ending sites)
    // algo:
    //	[STEP 1] find the starting cell where the entering/exiting site/data comes in/out
    //	[STEP 2] compute the underweighted weight (depending on farest vertex from polygon's site and polygon's site's weight)
    function computeUnderweight(site, polygons) {
      var polygon = null;

      // [STEP 1] find the starting cell where the entering/exiting site/data comes in/out
      polygons.forEach(function (p) {
        if (!polygon) {
          if (d3.polygonContains(p, [site.x, site.y])) {
            polygon = p;
          }
        }
      });

      // [STEP 2] compute the overweighted weight (depending on farest vertex from polygon's site and polygon's site's weight)
      var pSite = polygon.site,
        squaredFarestDistance = -Infinity;
      var squaredD;
      polygon.forEach(function (vertex) {
        // squaredD = (pSite.x - vertex[0])**2 + (pSite.y - vertex[1]) ** 2;
        squaredD = squaredDistance([pSite.x, pSite.y], vertex);
        if (squaredD > squaredFarestDistance) {
          squaredFarestDistance = squaredD;
        }
      });

      var underweight = -squaredFarestDistance + pSite.weight;
      return underweight;
    }

    // linear interpolation between a starting value and an ending value
    function lerp(startingValue, endingValue, interpolationValue) {
      return (1 - interpolationValue) * startingValue + interpolationValue * endingValue;
    }

    return _voronoiMapTween;
  }

  exports.voronoiMapTween = voronoiMapTween;

  Object.defineProperty(exports, '__esModule', { value: true });

}));