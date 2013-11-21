'use strict';

angular.module('mui2App')
  .controller('UiSettingsCtrl', function ($scope) {
    /* TODO:
     * - check if syntax highlighting is feasable; found sth. for JSON but
     *   nothing for SPARLQ:
     *   - http://neverstopbuilding.net/how-to-integrate-codemirror-with-angular-ui/
     *   - http://ngmodules.org/modules/angular-highlightjs
     */
    // -- settings --
    // TODO: this uses just dummy data
    $scope.data = data;
    $scope.template = template;
    $scope.selectedMarkers = [];
    $scope.query = "SELECT * WHERE {\n    ?r <http://linkedgeodata.org/ontology/castle_type> ?ctype .\n    ?r rdfs:label ?label .\n    ?r <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?long .\n    ?r <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat .}";
    /*
    <http://linkedgeodata.org/ontology/castle_type>
    <http://linkedgeodata.org/ontology/version> (int)
    <http://www.w3.org/2000/01/rdf-schema#label> 
    */
    $scope.templateVars = new TemplateVars($scope.query);
    $scope.sponateMapping = '{"id": "?r", "type": "?ctype",\n"name" : "?label",\n"lat" : "?lat",\n"long": "?long"}';
    $scope.infoTemplate = "{{name}} ({{type}})";

    $scope.markerGridOptions = {
        data: 'data',
        selectWithCheckboxOnly: true,
        showSelectionCheckbox: true,
        enableCellEdit: false,
        multiSelect: false,
        rowHeight: 42,
        keepLastSelected: false,
        selectedItems: $scope.selectedMarkers,
        columnDefs: [{cellTemplate: $scope.template, field: 'img', displayName: 'marker'}],

        // TODO: adapt
        afterSelectionChange : function(rowItem, event) {
          /* this function will be called twice when selecting a new row item:
           * once for unselecting the 'old' item and again for selecting the
           * new item. And I'm only interested in the second case.
           */
          if (!rowItem.selected) {
            $scope.selectedMarkers.pop(rowItem.entity);
          }
        }
    }

    /** function for live displaying variables used in the SPARQL query */
    $scope.queryVars = function(query) {
      var regex = /(\?)([a-zA-Z][a-zA-Z_0-9_-]*)/g;
      var matches = [];
      var match;
      while (match = regex.exec(query)) {
        var res = match[2];
        if (matches.indexOf(res) == -1) {
          matches.push(res);
        }
      }
      return matches;
    };

    /** function to check if a given string contains valid JSON */
    $scope.validJSON = function(sponateMapping) {
      // I'm sorry for this line but couldn't find out how to split regexes 
      if (/^\s*{\s*(("[a-zA-Z_][a-zA-Z0-9_-]*"\s*:\s*("[a-zA-Z0-9_\?-]*"|\[\s*"[a-zA-Z0-9_\?-]*"(\s*,\s*"[a-zA-Z0-9_\?-]*")*\s*\]))(\s*,\s*"[a-zA-Z_\?-][a-zA-Z0-9_\?-]*"\s*\:\s*("[a-zA-Z0-9_\?-]*"|\[\s*"[a-zA-Z0-9_\?-]*"(\s*,\s*"[a-zA-Z0-9_\?-]*")*\s*\]))*)*\s*}\s*$/.test(sponateMapping)) {
        return true;
      } else {
        return false;
      }
    };

    $scope.updateQueryStatus = function(query) {
      $scope.query = query;
    };
    $scope.uiSettingsComplete = function() {
      //console.log($scope.query.blank());
      if ($scope.selectedConcepts.length == 1 && $scope.selectedMarkers.length == 1 && !$scope.query.blank()) {
        return true;
      } else {
        return false;
      }
    };

    $scope.saveUiSettings = function() {
      var concept = $scope.selectedConcepts[0];
      concept.markerImgPath = $scope.selectedMarkers[0].img;
      concept.sponateMapping = $scope.sponateMapping;
      concept.infoTemplate = $scope.infoTemplate;
      concept.query = $scope.query;
      concept.showOnMap();
    };

    $scope.updateMappingStatus = function(mapping) {
      $scope.sponateMapping = mapping;
    };

    $scope.updateTemplateStatus = function(template) {
      $scope.infoTemplate = template;
    }
  });

/**
 * template to be used for displaying a map marker selection grid
 */
var template = '<div class="ngCellText" ng-class="col.colIndex()">' +
      '<span ng-cell-text><img src="{{row.getProperty(col.field)}}"></span></div>';

var data = [
  {'img': 'img/markers/windsurfing.png'},
  {'img': 'img/markers/windturbine.png'},
  {'img': 'img/markers/winebar.png'},
  {'img': 'img/markers/winetasting.png'},
  {'img': 'img/markers/woodshed.png'},
  {'img': 'img/markers/workoffice.png'},
  {'img': 'img/markers/workshop.png'},
  {'img': 'img/markers/world.png'},
  {'img': 'img/markers/worldheritagesite.png'},
  {'img': 'img/markers/worldwildway.png'},
  {'img': 'img/markers/wrestling-2.png'},
  {'img': 'img/markers/yoga.png'},
  {'img': 'img/markers/yooner.png'},
  {'img': 'img/markers/you-are-here-2.png'},
  {'img': 'img/markers/youthhostel.png'},
  {'img': 'img/markers/zombie-outbreak1.png'},
  {'img': 'img/markers/zoo.png'},
  {'img': 'img/markers/zoom.png'}
];

var defaultQuery = "SELECT * WHERE {\n    ?? a ?class .\n    ?? rdfs:label ?label\n}";
var TemplateVars = function(queryTemplate) {
  this.queryTemplate = queryTemplate;
}