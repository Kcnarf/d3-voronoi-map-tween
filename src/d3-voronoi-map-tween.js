import { weightedVoronoi as d3WeightedVoronoi } from 'd3-weighted-voronoi';
import { polygonContains as d3PolygonContains } from 'd3-polygon';

export const ENTER_TWEEN_TYPE = 'enter'; // datum not in starting data, but in ending data; adds a cell to the starting Voronoï tessellation
export const UPDATE_TWEEN_TYPE = 'update'; // datum in starting data and in ending data; the corresponding cell in starting Voronoï tessellation evolves
export const EXIT_TWEEN_TYPE = 'exit'; // datum in starting data, but not in ending data; deletes a cell from the starting Voronoï tessellation

export function voronoiMapTween(_startingVoronoiMapSimulation, _endingVoronoiMapSimulation) {
  //begin: constants
  const DEFAULT_IDENTIFIER_ACCESSOR = function (d) {
    return d.id;
  }; // datum identified with its 'id' attribute
  const INTERPOLATED_X_ACCESSOR = function (site) {
    return site.interpolatedSiteX;
  }; // x-accessor of interpolated site
  const INTERPOLATED_Y_ACCESSOR = function (site) {
    return site.interpolatedSiteY;
  }; // y-accessor of interpolated site
  const INTERPOLATED_WEIGHT_ACCESSOR = function (site) {
    return site.interpolatedSiteWeight;
  }; // weight-accessor of interpolated site
  const DEFAULT_CLIP_INTERPOLATOR = function (interpolationValue) {
    return startingVoronoiMapSimulation.clip();
  }; // default interpolator of the clipping polygon; in fact, no interpolation at all, always used the starting clipping polygon
  //end: constants

  //begin: inputs
  var startingVoronoiMapSimulation = _startingVoronoiMapSimulation; // the starting d3-voronoi-map simulation
  var endingVoronoiMapSimulation = _endingVoronoiMapSimulation; // the ending d3-voronoi-map simulation
  var clipInterpolator = DEFAULT_CLIP_INTERPOLATOR; // used to know retrieve the interpolated clipping polygon;
  var startingKey = DEFAULT_IDENTIFIER_ACCESSOR; // used to identify starting data; used when maping starting data and ending data
  var endingKey = DEFAULT_IDENTIFIER_ACCESSOR; // used to identify ending data; used when maping starting data and ending data
  //end: inputs

  //begin: internals
  var weightedVoronoi = d3WeightedVoronoi()
      .x(INTERPOLATED_X_ACCESSOR)
      .y(INTERPOLATED_Y_ACCESSOR)
      .weight(INTERPOLATED_WEIGHT_ACCESSOR),
    shouldInitialize = true, // should initialize (or not) due to input changes via APIs
    startingSiteByKey = {}, // map datum's identifier => startingSite (which references starting site's weight, position and starting data)
    endingSiteByKey = {}, // map datum's identifier => endingSite (which references ending site's weight, position and ending data)
    allSiteKeys = new Set(), // all data identifiers (from starting data and ending data)
    siteTweenData = []; // tween information for each data
  //end: internals

  //begin: utils
  function sqr(d) {
    return Math.pow(d, 2);
  }

  function squaredDistance(s0, s1) {
    return sqr(s1[0] - s0[0]) + sqr(s1[1] - s0[1]);
  }

  function lerp(v0, v1, interpolationValue) {
    return (1 - interpolationValue) * v0 + interpolationValue * v1;
  }
  //end: utils

  ///////////////////////
  ///////// API /////////
  ///////////////////////
  const _voronoiMapTween = {
    mapInterpolator: function () {
      return function (interpolationValue) {
        // Produces a Voronoï tessellation inbetween a starting tessellation and an ending tessellation.
        // Currently uses a LERP interpollation. Param 'interpolationValue' gives the interpolation amount: 0->starting tessellation, 1->ending tessellation

        if (shouldInitialize) {
          initialize();
        }

        // [STEP 1] interpolate sites's coords and weights
        var interpolatedSites = siteTweenData.map(function (std) {
          return {
            key: std.key,
            startingData: std.startingData,
            endingData: std.endingData,
            interpolatedSiteX: lerp(std.startingX, std.endingX, interpolationValue),
            interpolatedSiteY: lerp(std.startingY, std.endingY, interpolationValue),
            interpolatedSiteWeight: lerp(std.startingWeight, std.endingWeight, interpolationValue),
            interpolatedDataWeight: lerp(std.startingDataWeight, std.endingDataWeight, interpolationValue),
            tweenType: std.tweenType,
          };
        });

        // [STEP 2] use d3-weighted-voronoi to compute the interpolated tessellation
        return weightedVoronoi.clip(clipInterpolator(interpolationValue))(interpolatedSites);
      };
    },

    clipInterpolator: function (_) {
      if (!arguments.length) {
        return clipInterpolator;
      }

      clipInterpolator = _;
      shouldInitialize = true;
      return _voronoiMapTween;
    },

    startingKey: function (_) {
      if (!arguments.length) {
        return startingKey;
      }

      startingKey = _;
      shouldInitialize = true;
      return _voronoiMapTween;
    },

    endingKey: function (_) {
      if (!arguments.length) {
        return endingKey;
      }

      endingKey = _;
      shouldInitialize = true;
      return _voronoiMapTween;
    },
  };

  ///////////////////////
  /////// Private ///////
  ///////////////////////

  function initialize() {
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
      k = startingKey(s.originalObject.data.originalData);
      startingSiteByKey[k] = s;
      allSiteKeys.add(k);
    });
    endingSiteByKey = {};
    endingSites.forEach(function (s) {
      k = endingKey(s.originalObject.data.originalData);
      endingSiteByKey[k] = s;
      allSiteKeys.add(k);
    });

    var startingSite,
      startingData,
      startingX,
      startingY,
      startingWeight,
      startingDataWeight,
      endingSite,
      endingData,
      endingX,
      endingY,
      endingWeight,
      endingDataWeight,
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
        startingDataWeight = startingSite.originalObject.data.weight;
        endingDataWeight = endingSite.originalObject.data.weight;
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
        startingDataWeight = 0;
        endingDataWeight = endingSite.originalObject.data.weight;
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
        startingDataWeight = startingSite.originalObject.data.weight;
        endingDataWeight = 0;
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
        startingDataWeight: startingDataWeight,
        endingDataWeight: endingDataWeight,
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
        if (d3PolygonContains(p, [site.x, site.y])) {
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

  return _voronoiMapTween;
}
