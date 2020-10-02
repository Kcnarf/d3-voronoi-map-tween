# WORK IN PROGRESS

# d3-voronoi-map-tween

This D3 plugin allows to interpolate from one [d3-voronoi-map](https://github.com/Kcnarf/d3-voronoi-map) to another.

Because a picture is worth a thousand words:

![simulation](./img/example0.gif)

Available only for **d3-voronoi-map v2**.

## Context

- why this plugon knwoing that d3-voronoi-map is a simulation and thus can be animated ? d3-voronoi-map does nnot handle addition/removing of data.

## Examples

- Real life use cases
  - [Democratic Primaries: Preferential Poll Results](https://swayable.com/insights/primaries2019) by Nadieh Bremer in Swayable (more details at https://www.visualcinnamon.com/portfolio/swayable-preferential-polling); in reality, this real life use case does not use the plugin, but it was the premice of this plugin
- Examples with available code
  - [Voronoï playground: animating addition/removing of data](https://blockbuilder.org/Kcnarf/b2212ceafc875aac0e02a153fe9ff330)

## Installing

<!--
If you use NPM, `npm install d3-voronoi-map-tween`. Otherwise, load `https://rawcdn.githack.com/Kcnarf/d3-voronoi-map-tween/v0.0.1/build/d3-voronoi-treemap.js` (or its `d3-voronoi-map-tween.min.js` version) to make it available in AMD, CommonJS, or vanilla environments. In vanilla, you must load the [d3-weighted-voronoi](https://github.com/Kcnarf/d3-weighted-voronoi) and [d3-voronoi-map](https://github.com/Kcnarf/d3-voronoi-map) plugins prioir to this one, and a d3 global is exported:

```html
<script src="https://d3js.org/d3.v6.min.js"></script>
<script src="https://rawcdn.githack.com/Kcnarf/d3-weighted-voronoi/v1.0.1/build/d3-weighted-voronoi.js"></script>
<script src="https://rawcdn.githack.com/Kcnarf/d3-voronoi-map/v2.0.1/build/d3-voronoi-map.js"></script>
<script src="https://rawcdn.githack.com/Kcnarf/d3-voronoi-treemap/v0.0.1/build/d3-voronoi-map-tween.js"></script>
<script>
  var voronoiMapTween = d3.voronoiMapTween();
</script>
```
-->

If you're interested in the latest developments, you can use the master build, available throught:

```html
<script src="https://raw.githack.com/Kcnarf/d3-voronoi-treemap/master/build/d3-voronoi-treemap.js"></script>
```

## TL;DR;

- TODO

## API

- TODO

## Dependencies

- d3-voronoi-map.voronoiMap

## Semantic Versioning

d3-voronoi-map-tween attempts to follow [semantic versioning](https://semver.org) and
bump major version only when backward incompatible changes are released.

## Testing

In order to test the code

```sh
git clone https://github.com/Kcnarf/d3-voronoi-map-tween.git
[...]
yarn install
[...]
yarn test
```
