const tape = require('tape'),
  d3VoronoiMap = require('d3-voronoi-map'),
  d3VoronoiMapTween = require('../build/d3-voronoi-map-tween');

tape('voronoiMapTween should provide tween types', function (test) {
  test.ok(d3VoronoiMapTween.ENTER_TWEEN_TYPE);
  test.ok(d3VoronoiMapTween.UPDATE_TWEEN_TYPE);
  test.ok(d3VoronoiMapTween.EXIT_TWEEN_TYPE);
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

tape('voronoiMapTween(...)', function (test) {
  tape('voronoiMapTween(...) should idenditify added/entered, exited/deleted, and updated data', function (test) {
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

  tape('voronoiMapTween(...) should correctly map data thanks to starting/ending keys', function (test) {
    const dataOnlyAtStart = { identifier: 0, weight: 1 },
      data1AtStart = { identifier: 1, weight: 1 },
      data2AtStart = { identifier: 2, weight: 1 },
      data1AtEnd = { idPrime: 1, weight: 1 },
      data2AtEnd = { idPrime: 2, weight: 1 },
      dataOnlyAtEnd = { identifier: 3, weight: 1 },
      startingKey = function (d) {
        return d.identifier;
      },
      endingKey = function (d) {
        return d.idPrime;
      },
      voronoiMapSimulation0 = d3VoronoiMap.voronoiMapSimulation([dataOnlyAtStart, data1AtStart, data2AtStart]).stop(),
      voronoiMapSimulation1 = d3VoronoiMap.voronoiMapSimulation([data1AtEnd, data2AtEnd, dataOnlyAtEnd]).stop();
    const voronoiMapTween = d3VoronoiMapTween
      .voronoiMapTween(voronoiMapSimulation0, voronoiMapSimulation1)
      .startingKey(startingKey)
      .endingKey(endingKey);

    let interpolatedVoronoiMap = voronoiMapTween(0);
    const interpolatedPolygonOfDataOnlyAtStart = interpolatedVoronoiMap.find(function (p) {
      return p.site.originalObject.startingData === dataOnlyAtStart;
    });
    let interpolatedPolygonOfData1 = interpolatedVoronoiMap.find(function (p) {
      return p.site.originalObject.startingData === data1AtStart;
    });
    let interpolatedPolygonOfData2 = interpolatedVoronoiMap.find(function (p) {
      return p.site.originalObject.startingData === data2AtStart;
    });
    test.equal(interpolatedPolygonOfDataOnlyAtStart.site.originalObject.endingData, null); // no mapping, added/entering data
    test.equal(interpolatedPolygonOfData1.site.originalObject.endingData, data1AtEnd);
    test.equal(interpolatedPolygonOfData2.site.originalObject.endingData, data2AtEnd);

    interpolatedVoronoiMap = voronoiMapTween(1);
    interpolatedPolygonOfData1 = interpolatedVoronoiMap.find(function (p) {
      return p.site.originalObject.endingData === data1AtEnd;
    });
    interpolatedPolygonOfData2 = interpolatedVoronoiMap.find(function (p) {
      return p.site.originalObject.endingData === data2AtEnd;
    });
    const interpolatedPolygonOfDataOnlyAtEnd = interpolatedVoronoiMap.find(function (p) {
      return p.site.originalObject.endingData === dataOnlyAtEnd;
    });
    test.equal(interpolatedPolygonOfData1.site.originalObject.startingData, data1AtStart);
    test.equal(interpolatedPolygonOfData2.site.originalObject.startingData, data2AtStart);
    test.equal(interpolatedPolygonOfDataOnlyAtEnd.site.originalObject.startingData, null); // no mapping, deleted/exiting data
    test.end();
  });
  test.end();
});
