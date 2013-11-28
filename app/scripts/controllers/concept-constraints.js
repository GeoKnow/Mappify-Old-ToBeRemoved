'use strict';

angular.module('mui2App')
  .controller('ConceptConstraintsCtrl', function ($scope, facetService) {
    // -- settings --
    $scope.selectedFacets = [];
    $scope.activeConstrTab = 'value';
    $scope.disabledTabs = [];
    $scope.facetValues = [];

    /*[
      {'value' : 'dbo:Castle'}, {'value' : 'dbo:Airport'},
      {'value' : 'dbo:Place'}, {'value': 'dbo:ArchitecturalStructure'},
      {'value': 765.0}, {'value': 1110.39}, {'value': 1229.0},
      {'value': 1370.38}, {'value': 1395.98}, {'value': 1554.48},
      {'value': 1616.66}, {'value': 1782.0}, {'value': 1793.75},
      {'value': 1979.98}, {'value': 2048.56}, {'value': 2293.92},
      {'value': 2334.77}, {'value': 2555.75}, {'value': 2664.87},
      {'value': 2987.0}, {'value': 2995.57}, {'value': 3356.76},
      {'value': 3566.16}, {'value': 4604.0}, {'value': 7093.0},
      {'value': 9752.0}, {'value': 10700.0}]
    $scope.selectedFacetValues = [];
    $scope.minMax = [765.0, 10700.0];
    $scope.initMinMax = [765.0, 10700.0];
    */
    /** facets table settings */
    $scope.facetGridOptions = {
        data: 'facets',
        enableCellSelection: true,
        enableRowSelection: true,
        multiSelect: false,
        selectedItems: $scope.selectedFacets,
        columnDefs: [{field: 'name', displayName: 'facets'}],
        afterSelectionChange : function(rowItem, event) {
          /* this function will be called twice when selecting a new row item:
           * once for unselecting the 'old' item and again for selecting the
           * new item.
           */
          if (rowItem.selected) {
            $scope.facetValues = rowItem.entity.getValues();
            var vals = [];
            var numericVals = [];
            for (var i = 0; i < rowItem.entity.getValues().length; i++) {
              var val = rowItem.entity.getValues()[i].value;
              if (typeof val === 'number') {
                numericVals.push(val);
              }
              vals.push(val);
            }
            if (numericVals.length > 0) {
              var min = Math.min.apply(Math, numericVals);
              var max = Math.max.apply(Math, numericVals);
              // resetting slide this way doesn't work
              // $('.mui-concept-constr-slider')[0].value = null;
              $scope.initMinMax = [min, max];
              $scope.minMax = [min, max];
              $scope.disabledTabs = [];
            } else {
              $scope.disabledTabs.push('range');
              $scope.activeConstrTab = 'value';
            }
          }
        }
      };

    /** constraints table settings */
    $scope.constraintValuesGridOptions = {
        data: 'facetValues',
        selectWithCheckboxOnly: true,
        showSelectionCheckbox: true,
        enableCellEdit: false,
        multiSelect: true,
        selectedItems: $scope.selectedFacetValues,
        columnDefs: [{field: 'toString()', displayName: 'select values'}]
      };

    // -- ui functions --
    /* TODO: a little more needs to be done here, e.g.
     * - setting a CSS class to change the style of the disabled tab
     * - check if this changes are reset correctly when catching the
     *   'conceptDeleted' event
     * - reset acitve tab to the value tab after changing a facet
     */
    $scope.setActive = function(tabName) {
      if ($scope.disabledTabs.indexOf(tabName) === -1) {
        $scope.activeConstrTab = tabName;
      }
    };

    // -- event handling --
    $scope.$on('conceptDeleted', function(event, e){
      $scope.facetValues = [];
      $scope.minMax = [0, 0];
      $scope.initMinMax = [0, 1];
      $scope.disabledTabs = [];
    });

    // --debugging --
    $scope.currConceptsStr = '';
    $scope.test = function() {
      console.log($scope.concepts);
      $scope.currConceptsStr = '';
      for (var i = $scope.concepts.length - 1; i >= 0; i--) {
        $scope.currConceptsStr += $scope.concepts[i].name + ' ';
      }
    };
  });