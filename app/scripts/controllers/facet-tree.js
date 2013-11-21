'use strict';

angular.module('mui2App')
    .controller('FacetTreeCtrl', function($scope) {
        $scope.rowHeight = 30;
        $scope.panelWidth = '10em';

        $scope.$on('mui-facets-deselect-up', function(event) {
            event.stopPropagation();
            $scope.$broadcast('mui-facets-deselect-down');
        });
/*
        $scope.facetTree = [
            {
                nodeId: '/',
                collapsed: false,
                getNodes: getNodes_,
                getNumNodes: getNumNodes_,
                selected: false,
                toggleSelected: toggleSelected_,
                nodes: [
                    {
                        nodeId: '/+rdf:type',
                        collapsed: false,
                        getNumNodes: getNumNodes_,
                        getNodes: getNodes_, nodes: [],
                        selected: false,
                        toggleSelected: toggleSelected_
                    },
                    {
                        nodeId: '/+foo:bar',
                        collapsed: true,
                        getNumNodes: getNumNodes_,
                        getNodes: getNodes_,
                        selected: false,
                        toggleSelected: toggleSelected_,
                        nodes: [
                          {
                              nodeId: '/+foo:bar+sth:special',
                              collapsed: true,
                              getNumNodes: getNumNodes_,
                              getNodes: getNodes_,
                              selected: false,
                              toggleSelected: toggleSelected_,
                              nodes: []
                          }
                        ]
                    },
                    {
                        nodeId: '/+ex:bar',
                        collapsed: true,
                        getNumNodes: getNumNodes_,
                        getNodes: getNodes_,
                        selected: false,
                        toggleSelected: toggleSelected_,
                        nodes: []
                    }
                ]
            },
            {
                nodeId:'?',
                collapsed: true,
                getNumNodes: getNumNodes_,
                getNodes: getNodes_,
                selected: false,
                toggleSelected: toggleSelected_,
                nodes: []
            }
        ];*/
    })

    .directive('facetTreeItem', function($compile) {
        return {
            restrict: 'E',
            scope: { facets: '=', view: '=', path: '=', depth: '='},
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