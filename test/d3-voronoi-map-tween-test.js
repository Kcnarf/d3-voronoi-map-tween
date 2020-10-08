const tape = require('tape'),
  d3VoronoiMap = require('d3-voronoi-map'),
  d3VoronoiMapTween = require('../build/d3-voronoi-map-tween');

tape('voronoiMapTween should provide tween types', function (test) {
  test.ok(voronoiMapTween.ENTER_TWEEN_TYPE);
  test.ok(voronoiMapTween.UPDATE_TWEEN_TYPE);
  test.ok(voronoiMapTween.EXIT_TWEEN_TYPE);
  test.end();
});

tape('voronoiMapTween(...) should set the expected defaults', function (test) {
  const startingData = [{ id: 0, weight: 1 }],
    endingData = [{ id: 0, weight: 1 }],
    voronoiMapSimulation0 = d3VoronoiMap.voronoiMapSimulation(startingData).stop(),
    voronoiMapSimulation1 = d3VoronoiMap.voronoiMapSimulation(endingData).stop();
  const voronoiMapTween = d3VoronoiMapTween.voronoiMapTween(voronoiMapSimulation0, voronoiMapSimulation1);

  test.equal(voronoiMapTween.startingKey()(startingData[0]), 0);
  test.equal(voronoiMapTween.endingKey()(startingData[0]), 0);
  test.end();
});

tape('voronoiMapTween.startingKey should set specified identifier accessor', function (test) {
  const datum = { id: 0, idPrime: 1, weight: 1 },
    voronoiMapSimulation0 = d3VoronoiMap.voronoiMapSimulation([datum]).stop(),
    voronoiMapSimulation1 = d3VoronoiMap.voronoiMapSimulation([datum]).stop(),
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
    voronoiMapSimulation0 = d3VoronoiMap.voronoiMapSimulation([datum]).stop(),
    voronoiMapSimulation1 = d3VoronoiMap.voronoiMapSimulation([datum]).stop(),
    newAccessor = function (d) {
      return d.idPrime;
    };
  const voronoiMapTween = d3VoronoiMapTween.voronoiMapTween(voronoiMapSimulation0, voronoiMapSimulation1);

  test.equal(voronoiMapTween.endingKey(newAccessor), voronoiMapTween);
  test.equal(voronoiMapTween.startingKey()(datum), 0);
  test.equal(voronoiMapTween.endingKey()(datum), 1);
  test.end();
});

tape('voronoiMapTween.endingKey should set specified identifier accessor', function (test) {
  const datum = { id: 0, idPrime: 1, weight: 1 },
    voronoiMapSimulation0 = d3VoronoiMap.voronoiMapSimulation([datum]).stop(),
    voronoiMapSimulation1 = d3VoronoiMap.voronoiMapSimulation([datum]).stop(),
    newAccessor = function (d) {
      return d.idPrime;
    };
  const voronoiMapTween = d3VoronoiMapTween.voronoiMapTween(voronoiMapSimulation0, voronoiMapSimulation1);

  test.equal(voronoiMapTween.endingKey(newAccessor), voronoiMapTween);
  test.equal(voronoiMapTween.startingKey()(datum), 0);
  test.equal(voronoiMapTween.endingKey()(datum), 1);
  test.end();
});

tape('voronoiMapTween(...) should idenditify added/deleted/updated data', function (test) {
  const deletedData = { id: 0, weight: 1 },
    updatedData = { id: 1, weight: 1 },
    addedData = { id: 2, weight: 1 },
    voronoiMapSimulation0 = d3VoronoiMap.voronoiMapSimulation([deletedData, updatedData]).stop(),
    voronoiMapSimulation1 = d3VoronoiMap.voronoiMapSimulation([updatedData, addedData]).stop();
  const voronoiMapTween = d3VoronoiMapTween.voronoiMapTween(voronoiMapSimulation0, voronoiMapSimulation1);

  const interpolatedVoronoiMapAt0 = voronoiMapTween(0);
  const polygonOfDeletedDataAt0 = interpolatedVoronoiMapAt0.find(function (p) {
    return p.site.originalObject.startingData === deletedData;
  });
  const polygonOfUpdatedDataAt0 = interpolatedVoronoiMapAt0.find(function (p) {
    return p.site.originalObject.startingData === updatedData;
  });
  test.equal(polygonOfDeletedDataAt0.site.originalObject.tweenType, d3VoronoiMapTween.EXIT_TWEEN_TYPE);
  test.equal(polygonOfUpdatedDataAt0.site.originalObject.tweenType, d3VoronoiMapTween.UPDATE_TWEEN_TYPE);

  const interpolatedVoronoiMapAt1 = voronoiMapTween(1);
  const polygonOfUpdatedDataAt1 = interpolatedVoronoiMapAt1.find(function (p) {
    return p.site.originalObject.endingData === updatedData;
  });
  const polygonOfAddedDataAt1 = interpolatedVoronoiMapAt1.find(function (p) {
    return p.site.originalObject.endingData === addedData;
  });
  test.equal(polygonOfUpdatedDataAt1.site.originalObject.tweenType, d3VoronoiMapTween.UPDATE_TWEEN_TYPE);
  test.equal(polygonOfAddedDataAt1.site.originalObject.tweenType, d3VoronoiMapTween.ENTER_TWEEN_TYPE);

  test.end();
});
