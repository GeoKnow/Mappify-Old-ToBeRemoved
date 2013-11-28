'use strict';

angular.module('mui2App')
  .factory('facetService', function($rootScope, $q) {

    var qef = new Jassa.service.QueryExecutionFactoryHttp("http://10.23.0.1/sparql", []);
    
    var baseVar = Jassa.rdf.NodeFactory.createVar("s");
    var baseConcept = Jassa.facete.ConceptUtils.createSubjectConcept(baseVar);
    var rootFacetNode = Jassa.facete.FacetNode.createRoot(baseVar);;
    var constraintManager = new Jassa.facete.ConstraintManager();

    var facetConfigProvider = new Jassa.facete.FacetGeneratorConfigProviderIndirect(
      new Jassa.facete.ConceptFactoryConst(baseConcept),
      new Jassa.facete.FacetNodeFactoryConst(rootFacetNode),
      constraintManager
    );

    var fcgf = new Jassa.facete.FacetConceptGeneratorFactoryImpl(facetConfigProvider);
    var facetConceptGenerator = fcgf.createFacetConceptGenerator();

    var facetService = new Jassa.facete.FacetServiceImpl(qef, facetConceptGenerator);

    var expansionSet = new Jassa.util.HashSet();
    expansionSet.add(new Jassa.facete.Path());

    var facetTreeService = new Jassa.facete.FacetTreeServiceImpl(facetService, expansionSet);

    return {
        fetchFacets : function() {

          var promise = facetTreeService.fetchFacetTree(Jassa.facete.Path.parse("")).pipe(function(items) {
            var rootItem = new Jassa.facete.FacetItem(new Jassa.facete.Path(), Jassa.rdf.NodeFactory.createUri("http://example.org/root"), null);
          
            return {
                item: rootItem,
                state: new Jassa.facete.FacetStateImpl(true, null, null),
                children: items
              };
          });

          var result = Jassa.sponate.angular.bridgePromise(promise, $q.defer(), $rootScope);
          return result;
        },

        getExpansionSet : function() {
          return expansionSet;
        },

        createConcept : function(path) {
          return facetService.createConceptFacetValues(path);
        },

        fetchValues : function(concept) {
          var query = Jassa.facete.ConceptUtils.createQueryList(concept);
          var qe = qef.createQueryExecution(query);
          var promise = Jassa.service.ServiceUtils.fetchList(qe, concept.getVar()); 
          return promise;
        }
        
      };
  });