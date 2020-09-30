var tape = require('tape'),
  d3VoronoiMapTween = require('../build/d3-voronoi-map-tween');

tape('testing test', function (test) {
  var voronoiMapTween = d3VoronoiMapTween.voronoiMapTween();

  test.ok(true);
  test.end();
});
