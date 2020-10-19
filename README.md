# WORK IN PROGRESS

# d3-voronoi-map-tween

This D3 plugin allows to interpolate from one [d3-voronoi-map](https://github.com/Kcnarf/d3-voronoi-map) to another.

Because a picture is worth a thousand words:

![simulation](./img/example0.gif)

Available only for **d3-voronoi-map v2**.

## Context

Animating a Voronoï map is already possible with the [live arrangement](https://github.com/Kcnarf/d3-voronoi-map#live) feature of the [d3-voronoi-map](https://github.com/Kcnarf/d3-voronoi-map) plugin. This feature is suffisant to handle updates of data (displayed as evolving cells' area), but can't handle addition or deletion of data (deletion = data that no longer exists at the end of the animation, addition = data not exisitng at the begining of the animation).

This is where the d3-voronoi-map-tween comes in: added data are displayed as entering/emmerging cells, and deleted data are displayed as exiting/shrinking cells.

## Examples

- Real life use cases
  - [Democratic Primaries: Preferential Poll Results](https://swayable.com/insights/primaries2019) by Nadieh Bremer in Swayable (more details at https://www.visualcinnamon.com/portfolio/swayable-preferential-polling); in reality, this real life use case does not use the plugin, but it was the premice of this plugin
- Examples with available code
  - [Voronoï playground: animating addition/removing of data](https://blockbuilder.org/Kcnarf/b2212ceafc875aac0e02a153fe9ff330)

## Installing

<!--If you use NPM, `npm install d3-voronoi-map-tween`. Otherwise, load `https://rawcdn.githack.com/Kcnarf/d3-voronoi-map-tween/v0.0.1/build/d3-voronoi-treemap.js`--> Load `https://raw.githack.com/Kcnarf/d3-voronoi-map-tween/master/build/d3-voronoi-map-tween.js`(or its `d3-voronoi-map-tween.min.js` version) to make it available in AMD, CommonJS, or vanilla environments. In vanilla, you must load the [d3-weighted-voronoi](https://github.com/Kcnarf/d3-weighted-voronoi) and [d3-voronoi-map](https://github.com/Kcnarf/d3-voronoi-map) plugins prior to this one, and a d3 global is exported:

```html
<script src="https://d3js.org/d3.v6.min.js"></script>
<script src="https://rawcdn.githack.com/Kcnarf/d3-weighted-voronoi/v1.0.1/build/d3-weighted-voronoi.js"></script>
<script src="https://rawcdn.githack.com/Kcnarf/d3-voronoi-map/v2.0.1/build/d3-voronoi-map.js"></script>
<!--script src="https://rawcdn.githack.com/Kcnarf/d3-voronoi-treemap/v0.0.1/build/d3-voronoi-map-tween.js"></script-->
<script src="https://rawcdn.githack.com/Kcnarf/d3-voronoi-treemap/master/build/d3-voronoi-map-tween.js"></script>
<script>
  var voronoiMapTween = d3.voronoiMapTween(...);
</script>
```

<!--
If you're interested in the latest developments, you can use the master build, available throught:

```html
<script src="https://raw.githack.com/Kcnarf/d3-voronoi-treemap/master/build/d3-voronoi-treemap.js"></script>
```
-->

## TL;DR;

In your javascript, in order to define the tween:

```javascript
var startingVoronoiMapSimulation = d3.voronoiMapSimulation(startingData);
goToFinalState(startingVoronoiMapSimulation); // get the most representative Voronoï map, using d3-voronoi-map's static* computation
var endingVoronoiMapSimulation = d3.voronoiMapSimulation(endingData);
goToFinalState(endingVoronoiMapSimulation); // get the most representative Voronoï map, using d3-voronoi-map's static* computation

function keyAccessor(d) {
  return d.identifier; // retrieve the key/identifer of a datum; used to map starting and ending data
}
var voronoiMapTween = d3
  .voronoiMapTween(startingVoronoiMapSimulation, endingVoronoiMapSimulation)
  .startingKey(keyAccessor) // set the key-accessor used on starting data
  .endingKey(keyAccessor); // set the key-accessor used on ending data
```

Then, later in your javascript, in order to compute the interpolated Voronoï map cells, set the desired interpolation value (in [0, 1]):

```javascript
var interpolatedVoronoiMapCells = voronoiMapTween(0.5); // basic use case, returns a set of polygons/cells
var startingVoronoiMapCells = voronoiMapTween(0); // at 0, similar to startingVoronoiMap.state().polygons
var endingVoronoiMapCells = voronoiMapTween(1); // at 1, similar to endingVoronoiMap.state().polygons
```

## API

<a name="voronoiMapTween" href="#voronoiMapTween">#</a> d3.<b>voronoiMapTween</b>()

Creates a new voronoiMapTween with the default configuration values and functions ([_startingKey_](#voronoiMapTween_keys), [_endingKey_](#voronoiMapTween_keys)).

<a name="_voronoiMapTween" href="#_voronoiMapTween">#</a> <i>voronoiMapTween</i>(<i>startingVoronoiMapSimluation</i>, <i>endingVoronoiMapSimluation</i>)

Returns a function _ƒ<sub>int</sub>_ which is the interpolator between the <i>startingVoronoiMapSimluation</i> and <i>endingVoronoiMapSimluation</i>.

Considering the data comming from either the starting data set or the ending data set, each single datum has a corresponding cell in the starting Voronoï map and another in the ending Voronoï map. The objective of the plugin is to provide a way (i.e. the interpolation function _ƒ<sub>int</sub>_) to smoothly interpolate between the starting cell and the ending cell of each data. To do so, we do not interpolate polygons of each single datum (in order to no have a mess of overlapping polygons), but rather interpolate the characteristics of the sites of each polygon and then compute a Voronoï map of these interpolated sites (thanks to [d3-weighted-voronoi](https://github.com/Kcnarf/d3-weighted-voronoi)).

Calling _ƒ<sub>int</sub>(interpolationValue)_ returns a voronoi map, which is a sparse array of polygons, one for each data comming from either the starting data set or the ending data set. The _interpolation value_ must be a float value within [0, 1]:

- _ƒ<sub>int</sub>(0)_ returns a Voronoï map _similar\*_ to `startingVoronoiMapSimluation.state().polygons`; _similar\*_ means same polygons, but not necessarily in the same order; there is no polygon for data exclusively in the <i>endingVoronoiMapSimluation</i>
- _ƒ<sub>int</sub>(1)_ returns a Voronoï map _similar\*_ to `endingVoronoiMapSimluation.state().polygons`; there is no polygon for data exclusively in the <i>startingVoronoiMapSimluation</i>
- otherwise, the returned Voronoï map is inbetween the starting and ending Voronoï maps

<a name="voronoiMapTween_keys" href="#voronoiMapTween_keys">#</a> <i>voronoiMapTween</i>.<b>startingKey</b>([<i>key</i>]), <i>voronoiMapTween</i>.<b>endingKey</b>([<i>key</i>])
In oredr to make the correpondance between the starting and ending polygon of a single datum, we assigns each starting and ending polygon/cell with their respective datum's key.

If _key_ is specified, sets the _key_ accessor. Strating and ending keys may be distinct. If _key_ is not specified, returns the current _key_ accessor, which defaults to:

```js
function key(d) {
  return d.id;
}
```

## Dependencies

- d3-voronoi-map.voronoiMapSimulation
- d3-polygon.polygonContains

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
