'use strict';

angular.module('mui2App')
  .controller('MainCtrl', function ($scope, $compile, sparqlService, sponateService, strTemplateParser) {
    /*
     * event handlers
     */
    var markerClick = function (event) {
      if (this.popup == null) {
        this.popup = this.createPopup(this.closeBox);
        map.addPopup(this.popup);
        this.popup.show();
      } else {
        this.popup.toggle();
      }
      currentPopup = this.popup;
      OpenLayers.Event.stop(event);
    };


    /*
     * promise functions
     */
    var showResultsOnMap = function(queryResults) {
      // general setup of markers parameters
      var size = new OpenLayers.Size(40,40);
      var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
      var icon = new OpenLayers.Icon($scope.selectedConcepts[0].markerImgPath, size, offset);
      var popupSize = new OpenLayers.Size(1000,1000);
      var markers = map.getLayersByName('mui-markers')[0];  // defined in index.html
      map.setLayerIndex(markers, 99);

      var i = 0;
      for (i; i < queryResults.length; i++) {
        var res = queryResults[i];
        var long = res.long;
        var lat = res.lat;
        var longLat = new OpenLayers.LonLat(long, lat).transform(
            new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
        
        var feature = new OpenLayers.Feature(markers, longLat);

        feature.closeBox = true;
        feature.popupClass = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
            'autoSize': true,
            'maxSize': popupSize
        }); 

        feature.data.overflow = 'auto';
        console.log($scope.selectedConcepts[0].infoTemplate);
        feature.data.popupContentHTML = strTemplateParser.resolve(
            $scope.selectedConcepts[0].infoTemplate, res);
        feature.data.icon = new OpenLayers.Icon($scope.selectedConcepts[0].markerImgPath, size, offset);
        var marker = feature.createMarker();
        marker.events.register("mousedown", feature, markerClick);
        markers.addMarker(marker);
      }
    }

    var debug = function(res) {
      debugger;
    }


    /**
     * Facet class
     */
    var Facet = function(uri) {
      this.uri = uri;
    }
    Facet.prototype = {
      // attributes
      selected : false,
      collapsed : true,
      childFacets: [],
      childFacetsResolved: false,

      // methods
      toggleSelected : function() {
        if (this.selected == false) {
          $scope.$emit('mui-facets-deselect-up');
        }
        this.selected = !this.selected;
      },

      getNumNodes : function() {
        if (!this.childFacetsResolved) {
          return 1;
        } else {
          return this.childFacets.length
        }
      },

      toggleCollapsed : function() {
        if (this.collapsed == true && this.childFacetsResolved == false) {
          // FIXME: this looks ugly but I don't hava a better idea now
          //facetService.getChildFacetsJSON(this.uri, $scope.selectedConcepts[0].constraints);
          // TODO: implement fetching child facets
          //console.log('fetch child facets');
          //this.childFacetsResolved = true;
        }
        this.collapsed = !this.collapsed;
      },

      /**
       * Used to determine if the uncollapse sign (+) should be displayed.
       * If the child facets are not resolved, yet the uncollapse sign is
       * displayed. It will only be hidden in case there are no child factes.
       */
      hasChildFacets : function() {
        if (this.childFacetsResolved && facet.childFacets.length == 0) {
          return false;
        } else {
          return true;
        }
      }
    };


    /**
     * Concept class
     */
    var muiConceptIdCounter = 0;

    var Concept = function() {
        this.init();
    };
    Concept.prototype = {
      // attributes
      name : null,
      id : null,
      unCollapsedTree : {},
      constraints : [],
      selectionPath : [],
      markerImgPath : null,
      sponateMapping : null,
      infoTemplate : null,
      // dummy attributes
      dummyQuery : 'SELECT ?r { ?r a <http://linkedgeodata.org/ontology/Castle>}',
      dummySparqlService : new Jassa.sparql.SparqlServiceHttp('http://localhost/sparql'),

      // methods
      init : function() {
        this.name = 'Concept ' + muiConceptIdCounter;
        this.id = 'concept' + muiConceptIdCounter++;
        this.unCollapsedTree[$scope.rootFacet] = {};
      },
      showOnMap : function() {
        sponateService.addMap({
          "name" : $scope.selectedConcepts[0].id,
          "template" : [ JSON.parse($scope.selectedConcepts[0].sponateMapping) ],
          "from" : $scope.selectedConcepts[0].query
        });

        var res = sponateService[$scope.selectedConcepts[0].id].find().asList();
        res.done(showResultsOnMap);
      }
    };


    /*
     * settings
     */
    $scope.concepts = [];
    // even though there can only be one selected concept (or none) a list is expected
    $scope.selectedConcepts = [];
    $scope.facets = [];
    $scope.rootFacet = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    $scope.rootPath = [$scope.rootFacet];
    // $scope.facetTree = new FacetTree();

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
        data: 'concepts',
        enableCellSelection: true,
        enableRowSelection: true,
        enableCellEdit: true,
        multiSelect: false,
        selectedItems: $scope.selectedConcepts,
        columnDefs: [{field: 'name', displayName: 'concepts', enableCellEdit: true}],
        afterSelectionChange : function(rowItem, event) {
          /* this function will be called twice when selecting a new row item:
           * once for unselecting the 'old' item and again for selecting the
           * new item. And I'm only interested in the second case.
           */
          if (rowItem.selected) {
            // rowItem.entity.getFacets();
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
  })
