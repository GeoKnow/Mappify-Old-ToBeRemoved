'use strict';

angular.module('mui2App')
  .controller('MapSettingsCtrl', function ($scope) {
    var map = new OpenLayers.Map("map");
    var osm = new OpenLayers.Layer.OSM();
    map.addLayer(osm);
    map.zoomToMaxExtent();

  });