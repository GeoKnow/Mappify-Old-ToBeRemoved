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

      $rootScope.$broadcast("facetSelected", path);
    };
  });