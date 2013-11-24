'use strict';

angular.module('mui2App')
  .controller('MainCtrl', function ($scope, $compile, sparqlService, sponateService, strTemplateParser) {
    /*
     * event handlers
     */
    var markerClick = function (event) {
      if (this.popup === null) {
        this.popup = this.createPopup(this.closeBox);
        map.addPopup(this.popup);
        this.popup.show();
      } else {
        this.popup.toggle();
      }
      currentPopup = this.popup;
      OpenLayers.Event.stop(event);
    };

    $scope.$on('mui-facets-deselect-up', function(event) {
      event.stopPropagation();
      $scope.$broadcast('mui-facets-deselect-down');
    });


    /**
     * Facet class
     */
    var Facet = function(uri) {
      this.uri = uri;
      this.childFacets = [];
      this.selected = false;
      this.collapsed = true;
    };
    Facet.prototype = {
      toggleSelected : function() {
        if (this.selected === false) {
          $scope.$emit('mui-facets-deselect-up');
        }
        this.selected = !this.selected;
      },

      toggleCollapsed : function() {
        this.collapsed = !this.collapsed;
      },

      addChildFacet : function(childFacet) {
        this.childFacets.push(childFacet);
      },

      addChildFacets : function(childFacets) {
        var i = 0;
        for (i; i < childFacets.length; i++) {
          var childFacet = childFacets[i];
          this.addChildFacet(childFacet);
        }
      },
    };


    /**
     * Concept class
     */
    var muiConceptIdCounter = 0;

    var Concept = function() {
        this.init();
        this.markerImgPath = null;
        this.sponateMapping = null;
        this.infoTemplate = null;
        this.query = null;
      };
    Concept.prototype = {
      init : function() {
        this.name = 'Concept ' + muiConceptIdCounter;
        this.id = 'concept' + muiConceptIdCounter++;
      },
      update : function(markerImgPath, query, sponateMapping, infoTemplate) {
        this.markerImgPath = markerImgPath;
        this.infoTemplate = infoTemplate;

        // if anything concerning the sponate mapping changed, the sponateService
        // has to be updated:
        if ((this.query !== null && this.query !== query)
              || (this.sponateMapping !== null && this.sponateMapping !== sponateMapping)) {
          delete sponateService[this.id];
          var service = sponateService.service;
          var prefixes = sponateService.context.getPrefixMap().getJson();
          sponateService.initialize(service, prefixes);
        }

        this.sponateMapping = sponateMapping;
        sponateService.addMap({
            'name' : this.id,
            // TODO: use eval instead of JSON.parse
            'template' : [ JSON.parse(sponateMapping) ],
            'from' : query
          });
        this.infoTemplate = infoTemplate;
        console.log('Concept ' + this.name + ' updated');
      },

      showOnMap : function() {
        console.log('showOnMap called for ' + this.name);
        if (this.sponateMapping === null) {
          console.log('[WARN] concept ' + this.name + ' has no saved sponate mapping. Skipping...');
        } else {
          var res = sponateService[this.id].find().asList();
          var concept = this;

          // show results on map
          res.done(function(queryResults) {
            // general setup of markers parameters
            var size = new OpenLayers.Size(40,40);
            var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
            var popupSize = new OpenLayers.Size(1000,1000);
            var layerName = 'mui-markers-' + concept.id;
            var markerLayers = map.getLayersByName('mui-markers');
            for (var i = 0; i < markerLayers.length; i++) {
              var layer = markerLayers[i];
              map.removeLayer(layer);
            }
            var markers = new OpenLayers.Layer.Markers(layerName);
            map.addLayer(markers);
            //map.setLayerIndex(markers, 99);

            for (var i = 0; i < queryResults.length; i++) {
              var res = queryResults[i];
              var long = res.long;
              var lat = res.lat;
              var longLat = new OpenLayers.LonLat(long, lat).transform(
                  new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:900913'));
              
              var feature = new OpenLayers.Feature(markers, longLat);

              feature.closeBox = true;
              feature.popupClass = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
                  'autoSize': true,
                  'maxSize': popupSize
                });

              feature.data.overflow = 'auto';
              feature.data.popupContentHTML = strTemplateParser.resolve(
                  concept.infoTemplate, res);
              feature.data.icon = new OpenLayers.Icon(concept.markerImgPath, size, offset);
              var marker = feature.createMarker();
              marker.events.register('mousedown', feature, markerClick);
              markers.addMarker(marker);
            }
          });
        }
      }
    };


    /*
     * settings
     */
    $scope.concepts = [];
    // even though there can only be one selected concept (or none) a list is expected
    $scope.selectedConcepts = [];
    $scope.facets = [];
    /*
     * Dummy facet initialization
     * tree should look sth like this:
     * rdf:type
     *   |- dbpprop:name
     *   |    `- rdfs:label
     *   |- dcterms:subject
     *   |- rdfs:label
     *   |- dbpedia-owl:location
     *   |    `- rdfs:label
     *   |- dbpprop:latitude
     *   `- dbpprop:longitude
     */
    // create dbpprop:name
    var dbpName_rdfsLabel = new Facet('rdfs:label');
    var dbpName = new Facet('dbp:name');
    dbpName.addChildFacet(dbpName_rdfsLabel);
    // create dcterms:subject
    var dctermsSubject = new Facet('dcterms:subject');
    // create rdfs:label
    var rdfsLabel = new Facet('rdfs:label');
    // create dbpedia-owl:location
    var dboLocation_rdfsLabel = new Facet('rdfs:label');
    var dboLocation = new Facet('dbo:location');
    dboLocation.addChildFacet(dboLocation_rdfsLabel);
    // create dbpprop:latitude
    var dbpLatitude = new Facet('dbp:latitude');
    // create dbpprop:longitude
    var dbpLongitude = new Facet('dbp:longitude');
    // add all facets to root facet rdf:type
    var rdfType = new Facet('rdf:type');
    rdfType.addChildFacets([dbpName, dctermsSubject, rdfsLabel, dboLocation, dbpLatitude, dbpLongitude]);
    $scope.facets.push(rdfType);

    /*
     * ui-related settings
     */
    /** method to check if the delete button should be shown */
    $scope.selectionMade = function() {
      return $scope.selectedConcepts.length > 0;
    };
    $scope.activeTab = 'constraints';

    /** concepts table settings */
    $scope.conceptGridOptions = {
        data : 'concepts',
        enableCellSelection : true,
        enableRowSelection : true,
        enableCellEdit : true,
        multiSelect : false,
        selectedItems : $scope.selectedConcepts,
        columnDefs : [{field : 'name', displayName : 'concepts', enableCellEdit : true}],
        afterSelectionChange : function(rowItem) {
          /* this function will be called twice when selecting a new row item:
           * once for unselecting the 'old' item and again for selecting the
           * new item. And I'm only interested in the second case.
           */
          if (rowItem.selected) {
            // rowItem.entity.getFacets();
            $scope.$broadcast('mui-concept-selection-changed');
          }
        }
      };

    /*
     * scope functions
     */
    // concept-related
    $scope.createConcept = function() {
      $scope.concepts.push(new Concept());
    };

    $scope.deleteConcept = function() {
      var idx = $scope.concepts.indexOf($scope.selectedConcepts[0]);
      $scope.facets = [];
      $scope.concepts.splice(idx, 1);
      $scope.selectedConcepts.splice(0,1);
      $scope.$broadcast('conceptDeleted');
    };
  });
