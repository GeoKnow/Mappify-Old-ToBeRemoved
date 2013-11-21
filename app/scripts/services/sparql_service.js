'use strict';

angular.module('mui2App')
  .factory('sparqlService', function() {

    /**
     * SPARQL service class
     */
    var SparqlService = function(enpointUrl, defaultGraphs) {
      // TODO: also add default graph when https://github.com/GeoKnow/Sponate/issues/1
      // is closed
      this.conn = Jassa.sponate.ServiceUtils.createSparqlHttp(endpointUri, defaultGraphs);
      Jassa.creta
    };
    SparqlService.prototype = {
      // attributes
      test : 'huhu',

      // methods
      query : function(queryString) {
        return this.conn.execSelect(queryString);
      }

      // getFacetJSON : function(constraints) {
      //   // TODO: evaluate costraints to restrict available facets
      //   // FIXME: remove LIMIT!!!
      //   var queryWoConstraints = 'SELECT ?t { [] a ?t } LIMIT 10';
      //   var res = this.sparqlService.execSelect(queryWoConstraints);

      //   return res;
      // },

      // getChildFacetsJSON : function(facet, constraints) {
      //   // TODO: implement
      //   var query = "SELECT ";
      // },

      // getFacetsJSONFor : function(path) {
      //   // TODO: add concept contraints
      //   var i = 1;
      //   var lastIndex = path.length - 1;
      //   var query = 'SELECT (?r' + lastIndex + ' AS ?r) { [] <' + path[0] + '> ?r0 . ';
      //   while (i < path.length) {
      //     var property = path[i];
      //     query += '<' + property + '> ?r' + i + ' . ';
      //     i++;
      //   }
      //   query += ' }';
      //   query += ' LIMIT 10';
      //   var res = this.sparqlService.execSelect(query);
      //   return res;
      // }
    };

    /*
     * initialization
     */
    var endpointUri = 'http://10.23.0.1/sparql';
    var defaultGraphs = ['http://linkedgeodata.org/'];
    return new SparqlService(endpointUri, defaultGraphs);
  });
