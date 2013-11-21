'use strict';

angular.module('mui2App')
    .controller('FacetTreeCtrl', function($scope) {
        $scope.rowHeight = 30;
        $scope.panelWidth = '10em';
    })

    .directive('facetTreeItem', function($compile) {
        return {
            restrict: 'E',
            scope: { facets: '=', depth: '='},
            templateUrl: 'views/facet-tree-item.html',
            compile: function(tElement, tAttr, transclude) {
                var contents = tElement.contents().remove();
                var compiledContents;

                return function(scope, iElement, iAttr) {
                    if(!compiledContents) {
                        compiledContents = $compile(contents);
                    }

                    compiledContents(scope, function(clone, scope) {
                        // event handler that deselects all facets of the
                        // scope at hand
                        scope.$on('mui-facets-deselect-down', function() {
                            for(var facetNr in scope.facets) {
                                scope.facets[facetNr].selected = false;
                            }
                        });
                        iElement.append(clone);
                    });
                }
            }
        };
  });