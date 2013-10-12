'use strict';

angular.module('mui2App')
  .controller('UiSettingsCtrl', function ($scope) {
    $scope.data = data;
    $scope.template = template;
    $scope.selectedMarkers = [];
    $scope.query = defaultQuery;
    $scope.templateVars = new TemplateVars($scope.query);
    // TODO: JSON validator
    $scope.sponateMapping = "";
    $scope.infoTemplate = "";
    $scope.markerGridOptions = {
        data: 'data',
        selectWithCheckboxOnly: true,
        showSelectionCheckbox: true,
        enableCellEdit: false,
        multiSelect: false,
        rowHeight: 42,
        selectedItems: $scope.selectedMarkers,
        columnDefs: [{cellTemplate: $scope.template, field: 'img', displayName: 'marker'}]
    }
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
    $scope.validJSON = function(sponateMapping) {
      // taken from:
      // http://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try

      if (/^[\],:{}\s]*$/.test(sponateMapping.replace(/\\["\\\/bfnrtu]/g, '@')
        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
          .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return true;
      } else {
        return false;
      }
    };
  });


var defaultQuery = "SELECT * WHERE {\n    ?? a ?class .\n    ?? rdfs:label ?label\n}";
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

var TemplateVars = function(queryTemplate) {
  this.queryTemplate = queryTemplate;
  //this.vars = this.queryTemplate.match(/\?[a-zA-Z][a-zA-Z_0-9-]*/g);
  this.getVars = function() {
    return this.queryTemplate.match(/\?[a-zA-Z][a-zA-Z_0-9-]*/g);
  }
}