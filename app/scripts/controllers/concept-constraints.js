'use strict';

angular.module('mui2App')
  .controller('ConceptConstraintsCtrl', function ($scope) {
    // -- settings --
    $scope.selectedFacets = [];
    $scope.activeConstrTab = 'value';
    $scope.disabledTabs = [];
    $scope.facetValues = [];
    $scope.selectedFacetValues = [];
    $scope.minMax = [0, 0];
    $scope.initMinMax = [0, 1];
    $scope.$on('conceptDeleted', function(event, e){
      $scope.facetValues = [];
      $scope.minMax = [0, 0];
      $scope.initMinMax = [0, 1];
      $scope.disabledTabs = [];
    });

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
            var vals = []
            var numericVals = []
            for (var i = 0; i < rowItem.entity.getValues().length; i++) {
              var val = rowItem.entity.getValues()[i].value;
              if (typeof val == 'number') numericVals.push(val);
              vals.push(val);
            };
            if (numericVals.length > 0) {
              var min = Math.min.apply(Math, numericVals);
              var max = Math.max.apply(Math, numericVals);
              $('.mui-concept-constr-slider')[0].value = null;
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
        columnDefs: [{field: 'value', displayName: 'select values'}]
    }

    // -- ui functions --
    $scope.setActive = function(tabName) {
      if ($scope.disabledTabs.indexOf(tabName) == -1) {
        $scope.activeConstrTab = tabName;
      };
    }


    // --debugging --
    $scope.currConceptsStr = "";
    $scope.test = function() {
      console.log($scope.concepts);
      $scope.currConceptsStr = "";
      for (var i = $scope.concepts.length - 1; i >= 0; i--) {
        $scope.currConceptsStr += $scope.concepts[i].name + " ";
      };
    }
  });