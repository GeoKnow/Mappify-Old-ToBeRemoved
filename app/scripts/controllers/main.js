'use strict';

angular.module('mui2App')
  .controller('MainCtrl', function ($scope) {
    // -- settings --
    $scope.concepts = [];
    $scope.selectedConcepts = [];
    // needs to be defined here since the conceptGrid uses it
    $scope.facets = [];
    // ui-related
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
            $scope.facets = rowItem.entity.getFacets();
          }
        }
    };

    // -- scope functions --
    // concept-related
    $scope.createConcept = function() {
      $scope.concepts.push(new Concept());
      idCounter++;
    };

    $scope.deleteConcept = function() {
      var idx = $scope.concepts.indexOf($scope.selectedConcepts[0]);
      $scope.facets = [];
      $scope.concepts.splice(idx, 1);
      $scope.selectedConcepts.splice(0,1);
      $scope.$broadcast('conceptDeleted');
    };

    // -- debugging
    $scope.conceptStatus = function() {
      var foo = $scope.selectedConcepts.length > 0 ? $scope.selectedConcepts[0] : null
      console.log('##################');
    }
  });


var idCounter = 0;
var Concept = function() {
  this.name = 'Concept ' + idCounter;
  this.facets = [];
  // add 20 dummy facets
  for (var i = 0; i < 21; i++) {
    var facet = new Facet(this.name, i);
    this.facets.push(facet);
  };

  this.getFacets = function() {
    return this.facets;
  };
};

var Facet = function(conceptName, num) {
  //this.name = conceptName.replace(/ /g, '') + "Facet" + num;
  this.name = "Facet" + num;

  // init values
  this.values = [];
  var numValues = Math.floor(Math.random() * num);
  for (var i = 0; i <= numValues; i++) {
    var val = 100 * Math.random();
    this.values.push({'value': Math.ceil(val)});
  };

  this.getValues = function() {
    return this.values;
  }
}
