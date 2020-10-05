const tape = require('tape'),
  d3VoronoiMap = require('d3-voronoi-map'),
  d3VoronoiMapTween = require('../build/d3-voronoi-map-tween');

tape('voronoiMapTween(...) should set the expected defaults', function (test) {
  const startingData = [{ id: 0, weight: 1 }],
    endingData = [{ id: 0, weight: 1 }],
    voronoiMapSimulation0 = d3VoronoiMap.voronoiMapSimulation(startingData).stop().tick(),
    voronoiMapSimulation1 = d3VoronoiMap.voronoiMapSimulation(endingData).stop().tick();
  const voronoiMapTween = d3VoronoiMapTween.voronoiMapTween(voronoiMapSimulation0, voronoiMapSimulation1);

  test.equal(voronoiMapTween.startingKey()(startingData[0]), 0);
  test.equal(voronoiMapTween.endingKey()(startingData[0]), 0);
  test.end();
});

tape('voronoiMapTween.startingKey should set specified identifier accessor', function (test) {
  const datum = { id: 0, idPrime: 1, weight: 1 },
    voronoiMapSimulation0 = d3VoronoiMap.voronoiMapSimulation([datum]).stop().tick(),
    voronoiMapSimulation1 = d3VoronoiMap.voronoiMapSimulation([datum]).stop().tick(),
    newAccessor = function (d) {
      return d.idPrime;
    };
  const voronoiMapTween = d3VoronoiMapTween.voronoiMapTween(voronoiMapSimulation0, voronoiMapSimulation1);

  test.equal(voronoiMapTween.startingKey(newAccessor), voronoiMapTween);
  test.equal(voronoiMapTween.startingKey()(datum), 1);
  test.equal(voronoiMapTween.endingKey()(datum), 0);
  test.end();
});

tape('voronoiMapTween.endingKey should set specified identifier accessor', function (test) {
  const datum = { id: 0, idPrime: 1, weight: 1 },
    voronoiMapSimulation0 = d3VoronoiMap.voronoiMapSimulation([datum]).stop().tick(),
    voronoiMapSimulation1 = d3VoronoiMap.voronoiMapSimulation([datum]).stop().tick(),
    newAccessor = function (d) {
      return d.idPrime;
    };
  const voronoiMapTween = d3VoronoiMapTween.voronoiMapTween(voronoiMapSimulation0, voronoiMapSimulation1);

  test.equal(voronoiMapTween.endingKey(newAccessor), voronoiMapTween);
  test.equal(voronoiMapTween.startingKey()(datum), 0);
  test.equal(voronoiMapTween.endingKey()(datum), 1);
  test.end();
});
