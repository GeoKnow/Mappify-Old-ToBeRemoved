'use strict';

angular.module('mappifyApp')
  .controller('MainCtrl', function ($scope, $compile, $timeout,
      mappifyConceptsService, sponateService) {
    /**
     * This is the main controller of the Mappify application. It contains all
     * UI settings, map related settings and code managing Mappify Concepts
     */
    
    /*
     * UI related settings
     * ========================================================================
     */
    // makes the scroll bar in the controls div (on the left hand side) slim
    // and pretty :)
    $scope.slimScrollInit = function() {
      $('.slimscroll').slimScroll({
          height: '100%'
      });
    };
    $scope.$on('$viewContentLoaded', $scope.slimScrollInit);
    
    // Mappify Concept grid
    $scope.selectedMappifyConcept = null;
    $scope.selectionMade = function() {
      return $scope.selectedMappifyConcept !== null;
    };
    $scope.mcs = mappifyConceptsService.getConcepts();
    $scope.conceptGridOptions = {
        data : 'mcs',
        enableCellSelection : true,
        enableRowSelection : true,
        enableCellEdit : true,
        multiSelect : false,
        columnDefs : [{
          field : 'name',
          displayName : 'concepts',
          enableCellEdit : true}],
        afterSelectionChange : function(rowItem) {
          /* This function will be called twice when selecting a new row item:
           * Once for un-selecting the 'old' item and again for selecting the
           * new item. And I'm only interested in the latter case.
           */
          if (rowItem.selected) {
            $scope.$broadcast('mappify-concept-selection-changed');
          }
        },
        beforeSelectionChange: function(rowItem) {
          $scope.$broadcast('mappify-concept-selection-will-change');
          $scope.selectedMappifyConcept = rowItem.entity;
          // return false --> cancel selection; return true --> go on
          return true;
        }
    };
    
    $scope.activeTab = 'ui';
    $scope.getTabClass = function(tabName) {
      if($scope.activeTab === tabName) {
        return 'mappify-control-tab-active';
      } else {
        return undefined;
      }
    };
    
    
    /*
     * map related settings
     * ========================================================================
     */
    
    // call map initialization
    init();
    map.setCenter(
        //  8.85, 53.08  (10.3) --> Bremen
        // 12.35, 51.35  (10)   --> Leipzig
        new OpenLayers.LonLat(-3, 55).transform(
            new OpenLayers.Projection('EPSG:4326'),
            map.getProjectionObject()),
        5.4
    );
    
    // -- layers for initial and maximal map section --
    var initBoxLayer = new OpenLayers.Layer.Vector('initial box', {
      styleMap: new OpenLayers.StyleMap({
        fillColor: '#00FF00', fillOpacity: 0.2 })
      });
    
    var maxBoxLayer = new OpenLayers.Layer.Vector('maximal box', {
      styleMap: new OpenLayers.StyleMap({
        fillColor: '#FF0000', fillOpacity: 0.15 })
    });
    
    map.addLayer(initBoxLayer);
    map.addLayer(maxBoxLayer);
    
    $scope.initBoxDrawCtrl = new OpenLayers.Control.DrawFeature(initBoxLayer,
        OpenLayers.Handler.RegularPolygon,
        { handlerOptions: { sides: 4, irregular: true } }
    );
    map.addControl($scope.initBoxDrawCtrl);

    $scope.maxBoxDrawCtrl = new OpenLayers.Control.DrawFeature(maxBoxLayer,
        OpenLayers.Handler.RegularPolygon,
        { handlerOptions: { sides: 4, irregular: true } }
    );
    map.addControl($scope.maxBoxDrawCtrl);
    
    $scope.initBtn = {
        'active': false,
        'coords': null
    };
    $scope.maxBtn = {
        'active': false,
        'coords': null
    };
    
    
    $scope.toggleInitBoxDraw = function() {
      if ($scope.initBtn.active) {
        $scope.initBtn.active = false;
        if(!$scope.$$phase) {
          $scope.$apply();
        }
        $scope.initBoxDrawCtrl.deactivate();
      } else {
        $scope.initBtn.active = true;
        $scope.initBoxDrawCtrl.activate();
        // deactivate other button
        $scope.maxBtn.active = false;
        $scope.maxBoxDrawCtrl.deactivate();
      }
    };
    
    $scope.toggleMaxBoxDraw = function() {
      if ($scope.maxBtn.active) {
        $scope.maxBtn.active = false;
        if(!$scope.$$phase) {
          $scope.$apply();
        }
        $scope.maxBoxDrawCtrl.deactivate();
      } else {
        $scope.maxBtn.active = true;
        $scope.maxBoxDrawCtrl.activate();
        // deactivate other button
        $scope.initBtn.active = false;
        $scope.initBoxDrawCtrl.deactivate();
      }
    };
    
    // event listener to prevent the drawing of multiple rectangles
    $scope.featureRemover = function(event) {
      event.object.removeAllFeatures();
    };
    
    initBoxLayer.events.register('beforefeatureadded',
        initBoxLayer, $scope.featureRemover);
    initBoxLayer.events.register('featureadded',
        initBoxLayer, $scope.toggleInitBoxDraw);
    
    maxBoxLayer.events.register('beforefeatureadded',
        maxBoxLayer, $scope.featureRemover);
    maxBoxLayer.events.register('featureadded',
        maxBoxLayer, $scope.toggleMaxBoxDraw);
    

    // event listener to get the current values of the box coords
    $scope.coordListener = function(event) {
      var geometry = event.feature.geometry;
      if (event.object.name === 'initial box') {
        $scope.initBtn.coords = geometry;
      } else if (event.object.name === 'maximal box') {
        $scope.maxBtn.coords = geometry;
      }
    };
    initBoxLayer.events.register('featureadded',
        initBoxLayer, $scope.coordListener);
    maxBoxLayer.events.register('featureadded',
        maxBoxLayer, $scope.coordListener);
    
    $scope.updateMap = function(){
      
      if ($scope.selectionMade()) {
        mappifyConceptsService.saveCurrentValues($scope);
      }
      var mappifyConcepts = mappifyConceptsService.getConcepts();
      
      // get lat/lon constraints
      var boundsEPSG4326  = $scope.maxBtn.coords.getBounds().clone()
      .transform(map.getProjection(), new OpenLayers.Projection("EPSG:4326"));
      var bounds = {
          latMax: boundsEPSG4326.top,
          latMin: boundsEPSG4326.bottom,
          lonMin: boundsEPSG4326.left,
          lonMax: boundsEPSG4326.right
      };
      
      for (var i = 0; i < mappifyConcepts.length; i++) {
        var concept = mappifyConcepts[i];
        if (concept.sponateQuery === null) {
          console.log('[WARN] concept ' + concept.name +
          ' has no saved SPONATE mapping. Skipping...');
          continue;
        }
        var newScope = $scope.$new();
        // hand everything over to a controller with an own scope which will
        // care about displaying of the markers and setting up the pop ups
        MarkerDisplayCtrl(newScope, $compile, sponateService, concept, bounds);
      }
    };
    
    
    /*
     * Mappify Concept handling
     * ========================================================================
     */
    $scope.sponateMapping = null;
    $scope.infoTemplate = null;
    $scope.sponateQuery = null;
    $scope.markerFilePath = null;
    
    $scope.createConcept = function() {
      mappifyConceptsService.addConcept();
    };
    
    $scope.deleteConcept = function() {
      mappifyConceptsService.deleteConcept($scope.selectedMappifyConcept);
      $scope.selectedMappifyConcept = null;
      $scope.$broadcast('mappify-concept-deleted');
    };
    
    $scope.$on('mappify-concept-selection-will-change', function() {
      mappifyConceptsService.saveCurrentValues($scope);
    });
    
    
    /*
     * debug
     * ========================================================================
     */
    $scope.dummyFn = function() {
      console.log('dummy function called');
    };
  });




var MarkerDisplayCtrl = function($scope, $compile, sponateService, concept, bounds) {  
  // constants
  var popupContainerHTMLClass = 'mappify-popup-container';

  var popUpReplacements = {};
  var markerClick = function (event) {
    if (this.popup === null) {
      this.popup = this.createPopup(this.closeBox);
      map.addPopup(this.popup);
      this.popup.show();
      var id = this.popup.div.getElementsByClassName(
          popupContainerHTMLClass)[0].id;
      // compile actual template
      var popupElem = $compile(
          '<div class="mappify-info-popup" onload="refresh()">' +
          $scope.concept.infoTemplate + '</div>')(popUpReplacements[id]);
      // and append it
      $scope.$apply(function() {
        jQuery('#' + id).append(popupElem);
      });
      
      this.popup.registerImageListeners();
      this.popup.updateSize();
    } else {
      this.popup.toggle();
    }
    currentPopup = this.popup;
    OpenLayers.Event.stop(event);
  };
  
  $scope.concept = concept;
  // inject lat/lon constraints
  var closeBracePos = $scope.concept.sponateQuery.lastIndexOf('}');
  var length = $scope.concept.sponateQuery.length;
  var query = $scope.concept.sponateQuery.slice(0, closeBracePos) +
      ' FILTER( (xsd:float(?lat) < ' + bounds.latMax + ') && ' +
               '(xsd:float(?lat) > ' + bounds.latMin + ') && ' +
               '(xsd:float(?long) < ' + bounds.lonMax + ') && ' +
               '(xsd:float(?long) > ' + bounds.lonMin + ')' +
      ')' + $scope.concept.sponateQuery.slice(closeBracePos, length);
  
  // FIXME: this is a hack due to
  // https://github.com/GeoKnow/Jassa/issues/2
  if (sponateService[$scope.concept.id] !== undefined) {
    delete sponateService[$scope.concept.id];
    var service = sponateService.service;
    var prefixes = sponateService.context.getPrefixMap().getJson();
    sponateService.initialize(service, prefixes);
  }
  
  var sponateMapping = null;
  eval('sponateMapping = ' + $scope.concept.sponateMapping + ';');
  
  sponateService.addMap({
    'name' : $scope.concept.id,
    'template' : [ sponateMapping ],
    'from' : query
  });
  
  var res = sponateService[$scope.concept.id].find().asList(false);
  
  res.done(function(queryResults) {
    // general setup of markers parameters
    var size = new OpenLayers.Size(40,40);
    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
    var popupSize = new OpenLayers.Size(550,550);
    var layerName = 'mappify-markers-' + $scope.concept.id;
    var markerLayers =
        map.getLayersByName('mappify-markers-' + $scope.concept.id);
    for (var i = 0; i < markerLayers.length; i++) {
      var layer = markerLayers[i];
      map.removeLayer(layer);
    }
    // FIXME: popup layer needs to be deleted, too!!! 
    var markers = new OpenLayers.Layer.Markers(layerName);
    map.addLayer(markers);
    
    if ($scope.concept.id=='concept0' && queryResults.length > 0) {
      // add london airports
      
      // heathrow
      var heathrow = {
          'abstract' : 'London Heathrow Airport or Heathrow is a major ' +
              'international airport serving London, England, known as London ' +
              'Airport from 1946 until 1965. Located in the London Borough of ' +
              'Hillingdon, in West London, Heathrow is the busiest airport in ' +
              'the United Kingdom and the third busiest airport in the world ' +
              '(as of 2012) in total passenger traffic, handling more ' +
              'international passengers than any other airport around the ' +
              'globe. It is also the busiest airport in Europe by passenger ' +
              'traffic and the third busiest by traffic movements, with a ' +
              'figure surpassed only by Charles de Gaulle Airport and ' +
              'Frankfurt Airport. Heathrow is Londons main airport, having ' +
              'replaced RAF Northolt and the earlier Croydon Airport. The ' +
              'airport sustains 76,600 jobs directly and around 116,000 ' +
              'indirectly in the immediate area, and this, together with the ' +
              'large number of global corporations with offices close to the ' +
              'airport, makes Heathrow a modern aerotropolis which ' +
              'contributes an estimated 2.7% to Londons total GVA. The ' +
              'airport is owned and operated by Heathrow Airport Holdings, ' +
              'which also owns and operates three other UK airports, and is ' +
              'itself owned by FGP TopCo Limited, an international ' +
              'consortium led by the Spanish Ferrovial Group that includes ' +
              'Caisse de dépôt et placement du Québec and Government of ' +
              'Singapore Investment Corporation.[7] Heathrow is the primary ' +
              'hub for British Airways and the primary operating base for ' +
              'Virgin Atlantic. Heathrow lies 12 nautical miles west of ' +
              'Central London, and has two parallel east–west runways along ' +
              'with four operational terminals on a site that covers 3,000 ' +
              'acres (1,200 ha). A consultation process for the building of ' +
              'a third runway and a sixth terminal began in November 2007, ' +
              'and the project was controversially approved on 15 January ' + 
              '2009 by Labour government ministers.[9] It was subsequently ' +
              'cancelled on 12 May 2010 by the Cameron Government. The first ' +
              'phase of a new Terminal 2 complex which replaces the old ' +
              'terminal and adjacent Queens Building is due to open in June ' +
              '2014. The airport holds a Civil Aviation Authority Public Use ' +
              'Aerodrome Licence, which allows flights for public ' +
              'transportation of passengers or for flying instruction.',
          id: '<http://dbpedia.org/resource/London_Heathrow_Airport>',
          lat: 51.4775,
          long: -0.461389,
          name: 'London Heathrow Airport',
          pic: '<http://upload.wikimedia.org/wikipedia/commons/2/29/Heathrow_T5.jpg>'
      };
      
      // gatwick
      var gatwick = {
          'abstract' : 'Gatwick Airport is located 3.1 mi north of ' +
              'the centre of Crawley, West Sussex, and 29.5 mi south of ' +
              'Central London. Also known as London Gatwick, it is London\'s ' +
              'second largest international airport and second busiest by ' +
              'total passenger traffic in the United Kingdom after Heathrow. ' +
              'Furthermore, Gatwick is Europe\'s leading airport for ' +
              'point-to-point flights and has the world\'s busiest single-use ' +
              'runway with up to 53 aircraft movements per hour in late-2012 ' +
              'and a maximum capacity of 55 movements per hour. Its two ' +
              'terminals – North and South – cover an area of 98,000 m2 and ' +
              '160,000 m2 respectively. In 2013, 35.4 million passengers ' +
              'passed through Gatwick. From 1978 to 2008, many flights to and ' +
              'from the United States used Gatwick because of restrictions ' +
              'on the use of Heathrow implemented in the Bermuda II ' +
              'agreement between the UK and the US. US Airways, Gatwick\'s ' +
              'last remaining US carrier, ended service from the airport on ' +
              '30 March 2013. This leaves Gatwick without a scheduled US ' +
              'airline presence for the first time in over 35 years. The ' +
              'airport is a base for scheduled operators Aer Lingus, British ' +
              'Airways, EasyJet, Monarch Airlines, Norwegian Air Shuttle and ' +
              'Virgin Atlantic, as well as charter airlines including Thomas ' + 
              'Cook Airlines and Thomson Airways. Gatwick is unique amongst ' +
              'London\'s airports in having a significant airline presence ' +
              'representing each of the three main airline business models: ' +
              'full service, low/no frills and charter. In its 2011/12 ' +
              'financial year, these respectively accounted for 33, 55 and ' +
              '11% of total passenger traffic. BAA Limited and its ' +
              'predecessors, the British Airports Authority and BAA plc, ' +
              'owned and operated Gatwick continuously from 1 April 1966 ' +
              'until 2 December 2009. On 17 September 2008, BAA announced it ' +
              'would sell Gatwick following a report by the Competition ' +
              'Commission into BAA\'s market dominance in London and the ' +
              'South East. On 21 October 2009, it was announced that an ' +
              'agreement had been reached to sell Gatwick to a consortium ' +
              'led by Global Infrastructure Partners, who also have a ' +
              'controlling interest in London City and Edinburgh airports, ' +
              'for £1.51 billion. The sale was formally completed on 3 ' +
              'December 2009. On this day, Gatwick\'s ownership passed from ' +
              'BAA to the GIP-led consortium.',
          id: '<http://dbpedia.org/resource/Gatwick_Airport>',
          lat: 51.147222,
          long: -0.190278,
          name: 'Gatwick Airport',
          pic: '<http://upload.wikimedia.org/wikipedia/commons/0/01/London_Gatwick%2C_19_April_2011_-_Flickr_-_PhillipC.jpg>'
      };
      
      var stansted = {
          'abstract': 'London Stansted Airport is an international airport ' +
              'located at Stansted Mountfitchet in the local government ' +
              'district of Uttlesford in Essex, 48 km northeast of Central ' +
              'London and 1.5 km from the Hertfordshire border. Stansted is ' +
              'a base for a number of major European low-cost carriers, ' +
              'being the largest base for low-cost airline Ryanair with over ' +
              '100 destinations served by the airline. In 2012 it was the ' +
              'fourth busiest airport in the United Kingdom after Heathrow, ' +
              'Gatwick and Manchester. Stansted\'s runway is also used by ' +
              'private companies such as the Harrods Aviation terminal which ' +
              'is opposite the main terminal building and handles private ' +
              'jets and some state visits. The airport is owned and operated ' +
              'by the Manchester Airports Group (MAG), which also owns and ' +
              'operates three other UK airports. MAG agreed to buy the ' +
              'airport from Heathrow Airport Holdings, formerly BAA, on 18 ' +
              'January 2013, and the sale was completed for £1.5 billion on ' +
              '28 February 2013. BAA had been required to sell the airport ' +
              'following a ruling originally made by the Competition ' +
              'Commission in March 2009.',
          id: '<http://dbpedia.org/resource/London_Stansted_Airport>',
          lat: 51.885,
          long: 0.235,
          name: 'London Stansted Airport',
          pic: '<http://upload.wikimedia.org/wikipedia/commons/9/91/Stansted_Airport_-_geograph.org.uk_-_1622006.jpg>'
      };
      
      var luton = {
          'abstract': 'London Luton Airport (previously called Luton ' +
              'International Airport) is an international airport located ' +
              '1.5 NM east of the town centre in the Borough of Luton in ' +
              'Bedfordshire, England and is 30.5 NM north of Central London. ' +
              'The airport is 2 mi from Junction 10a of the M1 motorway. It ' +
              'is the fourth-largest airport serving the London area after ' +
              'Heathrow, Gatwick and Stansted, and is one of London\'s six ' +
              'international airports along with London City and Southend. ' +
              'In 2008, over 10 million passengers passed through the ' +
              'airport in a single year for the first time. However, ' +
              'passenger numbers were slightly lower during 2012 at 9.6 ' +
              'million, making Luton the fifth-busiest airport in the UK. ' +
              'The airport serves as a base for EasyJet, Monarch, Thomson ' +
              'Airways and Ryanair. The vast majority of the routes served ' +
              'are within Europe, although there are some charter and ' +
              'scheduled routes to destinations in Northern Africa and Asia.',
          id: '<http://dbpedia.org/resource/Luton_Airport>',
          lat: 51.874722,
          long: -0.368333,
          name: 'Luton Airport',
          pic: '<http://upload.wikimedia.org/wikipedia/commons/6/6d/Luton_airport.jpg>'
      };
      
      var city= {
          'abstract': 'London City Airport is an airport in London. It is ' +
              'located on a former Docklands site in the London Borough of ' +
              'Newham, some 6 NM east of the City of London and a rather ' +
              'smaller distance east of Canary Wharf. These are the twin ' +
              'centres of London\'s financial industry, which is a major ' +
              'user of the airport. The airport was developed by the ' +
              'engineering company Mowlem in 1986–87 and is now owned by a ' +
              'consortium comprising AIG Financial Products Corp. and Global ' +
              'Infrastructure Partners (GIP). London City Airport has a ' +
              'single 1,500 metres long runway, and a CAA Public Use ' +
              'Aerodrome Licence (Number P728) that allows flights for the ' +
              'public transport of passengers or for flight training. Only ' +
              'multi-engine, fixed-wing aircraft with special aircraft and ' +
              'aircrew certification to fly 5.5 degree approaches are allowed ' +
              'to conduct operations at London City Airport. In 2012, London ' +
              'City Airport served over 3 million passengers, a 0.8% increase ' +
              'compared with 2011. It was the fifth busiest airport in terms ' +
              'of passengers and aircraft movements serving the London area ' +
              'after Heathrow, Gatwick, Stansted and Luton and the 15th ' +
              'busiest in the UK. The airport has produced a masterplan ' +
              'outlining their vision for growth up to 2030. The plan shows ' +
              'an expansion of the airport to a maximum capacity of 8 ' +
              'million passengers per annum, without the addition of a ' +
              'second runway, or significant expansion of the airport ' +
              'boundaries. In early 2013 work is expected to start on a ' +
              '£15m investment programme to refurbish the western pier (new ' +
              'departure gates and improved lounges) and to redevelop the ' +
              'international arrivals hall and baggage handling areas.',
          id: '<http://dbpedia.org/resource/London_City_Airport>',
          lat: 51.505278,
          long: 0.055278,
          name: 'London City Airport',
          pic: '<http://upload.wikimedia.org/wikipedia/commons/e/e0/London_City_Airport_Zwart.jpg>'
      };
      
      var southend = {
          'abstract': 'London Southend Airport is an international airport ' +
              'in the district of Rochford within Essex, England, and is ' +
              'one of the six main airports serving London – along with ' +
              'Heathrow, Gatwick, Stansted, Luton and City airports. During ' +
              'the 1960s, Southend was the third-busiest airport in the ' +
              'United Kingdom. It remained London\'s third-busiest airport ' +
              'in terms of passengers handled until the end of the 1970s, ' +
              'when the role of "London\'s third airport" passed to Stansted. ' +
              'Following its purchase by Stobart Group in 2008, there has ' +
              'been an ongoing programme of development, and EasyJet started ' +
              'operating services by opening a base at Southend in April ' +
              '2012. A regular rail service runs from Southend Airport ' +
              'Station to London Liverpool Street Station in central London. ' +
              'The airport operators hope to increase passenger numbers to ' +
              'two million per year by 2020.',
          id: '<dbpedia.org/resource/London_Southend_Airport>',
          lat: 51.570278,
          long: 0.693333,
          name: 'London Southend Airport',
          pic: '<http://upload.wikimedia.org/wikipedia/commons/2/2a/Southend_Airport_terminal_building_02.jpg>'
      };
      
      queryResults.push(heathrow);
      queryResults.push(gatwick);
      queryResults.push(stansted);
      queryResults.push(luton);
      queryResults.push(city);
      queryResults.push(southend);
      
    }
    
    for (var i = 0; i < queryResults.length; i++) {
      var res = queryResults[i];
      var long = res.long;
      var lat = res.lat;
      var longLat = new OpenLayers.LonLat(long, lat).transform(
          new OpenLayers.Projection('EPSG:4326'),
          new OpenLayers.Projection('EPSG:900913'));
      
      var feature = new OpenLayers.Feature(markers, longLat);

      feature.closeBox = true;
      feature.popupClass = OpenLayers.Class(
          OpenLayers.Popup.FramedCloud, {
              'autoSize': true,
              'maxSize': popupSize
      });

      feature.data.overflow = 'auto';
      var dummyScope = $scope.$new();
      jQuery.extend(dummyScope, res);

      var popupId = 'mappify-' + $scope.concept.id + '-' + i;
      popUpReplacements[popupId] = dummyScope;
      feature.data.popupContentHTML =
          '<div id="' + popupId + '" class="' + popupContainerHTMLClass + '"/>';
      
      if ($scope.concept.markerIconPath === null) {
        // fallback marker
        var markerIconPath = 'bower_components/openlayers/img/marker.png';
        var size = new OpenLayers.Size(30,30);
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
        feature.data.icon = new OpenLayers.Icon(markerIconPath, size, offset);
        
      } else {
        feature.data.icon = new OpenLayers.Icon(
            $scope.concept.markerIconPath, size, offset);
      }
      
      var marker = feature.createMarker();
      marker.events.register('mousedown', feature, markerClick);
      markers.addMarker(marker);
    }
  });
};
