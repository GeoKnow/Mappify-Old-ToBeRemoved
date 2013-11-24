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
    $scope.data = data;
    $scope.template = template;

    // TODO: remove this; not needed since the same value is held in
    // $scope.markerGridOptions.selectedItems
    $scope.selectedMarkers = [];

    // var query = "SELECT * WHERE {\n    ?r <http://linkedgeodata.org/ontology/castle_type> ?ctype .\n    ?r rdfs:label ?label .\n    ?r <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?long .\n    ?r <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat .}";
    var query = 'SELECT * WHERE {\n    ?r rdfs:label ?label .\n    ?r foaf:depiction ?d .\n    ?r <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?long .\n    ?r <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat .}';
    $scope.query = query;

    // var sponateMapping = '{"id": "?r", "type": "?ctype",\n"name" : "?label",\n"lat" : "?lat",\n"long": "?long"}';
    var sponateMapping = '{"id": "?r", "name" : "?label",\n"pic": "?d",\n"lat" : "?lat",\n"long": "?long"}';
    $scope.sponateMapping = sponateMapping;

    var infoTemplate = '{{name}}\n<img src="{{pic}}">';
    $scope.infoTemplate = infoTemplate;

    $scope.$on('mui-concept-selection-changed', function() {
      var selConcept = $scope.selectedConcepts[0];

      // update template
      if (selConcept.infoTemplate != null) {
        $scope.infoTemplate = selConcept.infoTemplate;
      } else {
        $scope.infoTemplate = infoTemplate;
      }
      jQuery('#mui-template textarea').val($scope.infoTemplate);

      // update marker selection
      if (selConcept.markerImgPath != null) {
        $scope.selectedMarkers = [selConcept.markerImgPath];
        for (var i = 0; i < $scope.markerGridOptions.$gridScope.data.length; i++) {
          // debugger;
          if ($scope.markerGridOptions.$gridScope.data[i].img === selConcept.markerImgPath) {
            $scope.markerGridOptions.selectItem(i, true);
            break;
          }
        }
      } else {
        $scope.selectedMarkers = [];
        $scope.markerGridOptions.$gridScope.toggleSelectAll(null, false);
      }
      
      // update sponate mapping
      if (selConcept.sponateMapping != null) {
        $scope.sponateMapping = selConcept.sponateMapping;
      } else {
        $scope.sponateMapping = sponateMapping;
      }
      jQuery('#mui-sponate textarea').val($scope.sponateMapping);

      // update query
      if (selConcept.query != null) {
        $scope.query = selConcept.query;
      } else {
        $scope.query = query;
      }
      jQuery('#mui-query textarea').val($scope.query);
    });

    $scope.markerGridOptions = {
        data: 'data',
        selectWithCheckboxOnly: true,
        showSelectionCheckbox: true,
        enableCellEdit: false,
        multiSelect: false,
        rowHeight: 42,
        keepLastSelected: false,
        // selectedItems: $scope.selectedMarkers,
        columnDefs: [{cellTemplate: $scope.template, field: 'img', displayName: 'marker'}],

        // TODO: adapt
        afterSelectionChange : function(rowItem) {
          /* this function will be called twice when selecting a new row item:
           * once for unselecting the 'old' item and again for selecting the
           * new item. And I'm only interested in the second case.
           */
          if (!rowItem.selected) {
            $scope.selectedMarkers.pop(rowItem.entity);
          } else {
            $scope.selectedMarkers = [rowItem.entity];
          }
        }
      };

    /** function for live displaying variables used in the SPARQL query */
    $scope.queryVars = function() {
      var regex = /(\?)([a-zA-Z][a-zA-Z_0-9_-]*)/g;
      var matches = [];
      var match;
      while (match = regex.exec($scope.query)) {
        var res = match[2];
        if (matches.indexOf(res) === -1) {
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
      if ($scope.selectedConcepts.length === 1
          && $scope.selectedMarkers.length === 1 && !$scope.query.blank()) {
        return true;
      } else {
        return false;
      }
    };

    $scope.saveUiSettings = function() {
      var concept = $scope.selectedConcepts[0];
      concept.update(
          $scope.selectedMarkers[0].img,
          $scope.query,
          $scope.sponateMapping,
          $scope.infoTemplate);
    };

    $scope.updateMappingStatus = function(mapping) {
      $scope.sponateMapping = mapping;
    };

    $scope.updateTemplateStatus = function(template) {
      $scope.infoTemplate = template;
    };
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
