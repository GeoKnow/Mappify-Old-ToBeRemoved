'use strict';

angular.module('mui2App')
  .controller('FacetTreeCtrl', function($rootScope, $scope, facetService) {
    $scope.rowHeight = 30;
    $scope.panelWidth = '10em';

    $scope.refreshFacets = function() {
      facetService.fetchFacets().then(function(data) {
        $scope.facet = data;
      });
    };
    
    $scope.init = function() {
      $scope.refreshFacets();
    };
    
    $scope.toggleCollapsed = function(path) {
      console.log('toggle collapsed called');
      var expansionSet = facetService.getExpansionSet();
      Jassa.util.CollectionUtils.toggleItem(expansionSet, path);
      
      console.log("ExpansionSet: " + expansionSet);
      
      $scope.refreshFacets();
    };
    
    
    $scope.toggleSelected = function(path) {
      $scope.selectedFacet = path.getLastStep();
      $rootScope.$broadcast("facetSelected", path);

      // TODO: rename... term concept already used in this context
      var concept = facetService.createConcept(path);
      var promise = facetService.fetchValues(concept);
      promise.done(function(items) {
        // empty facet values of former selected facet
        while ($scope.facetValues.length > 0) {
          $scope.facetValues.pop();
        }
        // add facet values of the currently selected facet
        for (var i = 0; i < items.length; i++) {
          $scope.facetValues.push(items[i]);
        }
        $rootScope.$apply();
      });
    };
  });