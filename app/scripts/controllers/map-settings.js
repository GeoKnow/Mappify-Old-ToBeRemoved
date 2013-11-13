'use strict';

angular.module('mui2App')
  .controller('MapSettingsCtrl', function($scope) {
    // call map initialization function defined in index.html
    init();
    
    // -- settings --
    map.setCenter(
        new OpenLayers.LonLat(12.35, 51.35).transform(
            new OpenLayers.Projection('EPSG:4326'),
            map.getProjectionObject()
          ), 10
      );

    // -- layers for initial and maximal map section --
    var initBoxLayer = new OpenLayers.Layer.Vector('initial box', {
        styleMap: new OpenLayers.StyleMap({
          fillColor: '#00FF00',
          fillOpacity: 0.2
        }),
      });

    var maxBoxLayer = new OpenLayers.Layer.Vector('maximal box', {
        styleMap: new OpenLayers.StyleMap({
          fillColor: '#FF0000',
          fillOpacity: 0.15
        }),
    });

    map.addLayer(initBoxLayer);
    map.addLayer(maxBoxLayer);
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.addControl(new OpenLayers.Control.MousePosition()); 

    $scope.initBoxDrawCtrl = new OpenLayers.Control.DrawFeature(initBoxLayer,
        OpenLayers.Handler.RegularPolygon, {
          handlerOptions: { sides: 4, irregular: true }
        }
      );
    map.addControl($scope.initBoxDrawCtrl);

    $scope.maxBoxDrawCtrl = new OpenLayers.Control.DrawFeature(maxBoxLayer,
        OpenLayers.Handler.RegularPolygon, {
          handlerOptions: { sides: 4, irregular: true }
        }
      );
    map.addControl($scope.maxBoxDrawCtrl);

    // -- ui --
    $scope.initBtn = {
      'active': false,
      'coords': null
    }
    $scope.maxBtn = {
      'active': false,
      'coords': null
    }

    // event listener to prevent the drawing of multiple rectangles
    $scope.featureRemover = function(event) {
      event.object.removeAllFeatures();
    };
    initBoxLayer.events.register('beforefeatureadded', initBoxLayer, $scope.featureRemover);
    maxBoxLayer.events.register('beforefeatureadded', maxBoxLayer, $scope.featureRemover);

    // event listener to get the current values of the box coords
    $scope.coordListener = function(event) {
      var geometry = event.feature.geometry;
      if (event.object.name == 'initial box') $scope.initBtn.coords = geometry;
      else if (event.object.name == 'maximal box') $scope.maxBtn.coords = geometry;
    };
    initBoxLayer.events.register('featureadded', initBoxLayer, $scope.coordListener);
    maxBoxLayer.events.register('featureadded', maxBoxLayer, $scope.coordListener);

    $scope.toggleInitBoxDraw = function() {
      if ($scope.initBtn.active) {
        $scope.initBtn.active = false;
        $scope.initBoxDrawCtrl.deactivate();
      } else {
        $scope.initBtn.active = true;
        $scope.initBoxDrawCtrl.activate();
        // deactivate other button
        $scope.maxBtn.active = false;
        $scope.maxBoxDrawCtrl.deactivate();
      }
        
    };

    $scope.toggleMaxBoxDraw = function() {
      if ($scope.maxBtn.active) {
        $scope.maxBtn.active = false;
        $scope.maxBoxDrawCtrl.deactivate();
      } else {
        $scope.maxBtn.active = true;
        $scope.maxBoxDrawCtrl.activate();
        // deactivate other button
        $scope.initBtn.active = false;
        $scope.initBoxDrawCtrl.deactivate();
      }
        
    };

    // -- debug --
    $scope.logPositions = function() {
      console.log('init/max:');
      console.log($scope.initBtn.coords);
      console.log($scope.maxBtn.coords);
      console.log('######################');
    };
  });