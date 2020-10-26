var globals = {
  'd3-weighted-voronoi': 'd3',
  flubber: 'flubber',
};

export default {
  entry: 'index.js',
  moduleName: 'd3',
  globals: globals,
  external: Object.keys(globals),
  format: 'umd',
  dest: 'build/d3-voronoi-map-tween.js',
};
