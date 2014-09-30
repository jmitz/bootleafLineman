
var map, sidebar, countySearch = [];
var generalPermitLayer, legislativeDistricts;
var stateSummary = {
  locationCount: 0,
  totalCount: 0,
  permits: {},
  politicalDistricts:{
    House: {
      bhArray: [],
      '0': {
        title: '0 - Missing House District',
        permits: {}
      }
    },
    Senate: {
      bhArray: [],
      '0': {
        title: '0 - Missing ',
        permits: {}
      }
    }
  },
  counties:{}
};
var countyList;
var displayPermitTypes = [];
var currCountyFips;
var politicalDistrict;
var referenceLayers = {
  url :''
};
var controlPopupClose = true;
var infoPopupFlag = false; // true if infoPopup is open
var infoPopup = L.popup({
  keepInView: true,
  closeOnClick: false,
  autoPanPaddingTopLeft: L.point(50, 10),
  autoPanPaddingBottomRight: L.point(220,10),
  className: 'infoPopup'
});

var routing = new L.Routing.OSRM(); // used to calculate driving distance

var zoomControl = L.control.zoom({
  position: "topleft"
});

var measureControl = L.control.measure({
  position: 'topleft'
});

var templates = {
  fieldOffice: "<tr><td><%=name%> Field Office<br><%=types.join()%></td><td><span id='distance'><%=distance%></span> mi</td></tr>",
  permitFieldOffice: "Field Office - <%=name%> - <span id='distance'><%=distance%></span> mi"
};


var permits = {
  types: {
    "LIFETIME": {
      type: 'LIFETIME',
      fullName: 'Lifetime State Operating Permit',
      name: 'Lifetime Permits',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563E6',
      markerIcon: 'img/lifetimePermit.png',
      popupTemplate: "<h5>Air Permit - Lifetime<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p><p><%= milesToFieldOffice(properties.countyFips, properties.location ,templates.permitFieldOffice, 'boa') %></p>",
      markerTitle: "name",
      abbr: 'Lifetime'
    },
    "CONSTRUCTION": {
      type: 'CONSTRUCTION',
      fullName: 'BOA Construction Permits',
      name: 'Construction',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563E6',
      markerIcon: 'img/constrPermit.png',
      popupTemplate: "<h5>Air Permit - Construction<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p><p><%= milesToFieldOffice(properties.countyFips, properties.location ,templates.permitFieldOffice, 'boa') %></p>",
      markerTitle: "name",
      abbr: 'BOA Con'
    },
    "ROSS": {
      type: 'ROSS',
      fullName: 'Registration of Smaller Sources',
      name: 'ROSS Permits',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563B6',
      markerIcon: 'img/rossPermit.png',
      popupTemplate: "<h5>Air Permit - ROSS<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p><p><%= milesToFieldOffice(properties.countyFips, properties.location ,templates.permitFieldOffice, 'boa') %></p>",
      markerTitle: "name",
      abbr: 'ROSS'
    },
    "TITLE V": {
      type: 'TITLE V',
      fullName: 'Title V Permits',
      name: 'Title V Permits',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563E6',
      markerIcon: 'img/titleVPermit.png',
      popupTemplate: "<h5>Air Permit - Title V<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p><p><%= milesToFieldOffice(properties.countyFips, properties.location ,templates.permitFieldOffice, 'boa') %></p>",
      markerTitle: "name",
      abbr: 'TitleV'
    },
    "FESOP": {
      type: 'FESOP',
      fullName: 'Federally Enforceable State Operating Permit',
      name: 'FESOP Permits',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563E6',
      markerIcon: 'img/airPermit.png',
      popupTemplate: "<h5>Air Permit - FESOP<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p><p><%= milesToFieldOffice(properties.countyFips, properties.location ,templates.permitFieldOffice, 'boa') %></p>",
      markerTitle: "name",
      abbr: 'FESOP'
    },
    "JOINT": {
      type: 'JOINT',
      fullName: 'BOA Joint Permits',
      name: 'Joint Permits',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563E6',
      markerIcon: 'img/jointPermit.png',
      popupTemplate: "<h5>Air Permit - Joint Permit<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p><p><%= milesToFieldOffice(properties.countyFips, properties.location ,templates.permitFieldOffice, 'boa') %></p>",
      markerTitle: "name",
      abbr: 'Joint'
    },
    "OPERATING": {
      type: 'OPERATING',
      fullName: 'BOA Operating Permits',
      name: 'Operating Permits',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563E6',
      markerIcon: 'img/operatingPermit.png',
      popupTemplate: "<h5>Air Permit - Operating Permit<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p><p><%= milesToFieldOffice(properties.countyFips, properties.location ,templates.permitFieldOffice, 'boa') %></p>",
      markerTitle: "name",
      abbr: 'BOA Oper'
    },
    "Solid Waste Permitting": {
      type: 'Solid Waste Permitting',
      fullName: 'Solid Waste Permits',
      name: 'Solid Waste Permits',
      mediaType: 'LAND',
      mediaAbbr: 'BOL',
      color: '#E6995F',
      markerIcon: 'img/solidWaste.png',
      popupTemplate: "<h5>Land Permit - Solid Waste<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Permit ID <%= properties.permitId %></p><p><p><%= milesToFieldOffice(properties.countyFips, properties.location ,templates.permitFieldOffice, 'bol') %></p>",
      markerTitle: "name",
      abbr: 'Solid'
    },
    "Npdes": {
      type: 'Npdes',
      name: 'NPDES Permits',
      fullName: 'National Pollutant Discharge Elimination System Permits',
      mediaType: 'WATER',
      mediaAbbr: 'BOW',
      color: '#88F0D3',
      markerIcon: 'img/npdesPermit.png',
      popupTemplate: "<h5>Water Permit - NPDES<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Permit ID <%= properties.permitId %></p><p><p><%= milesToFieldOffice(properties.countyFips, properties.location ,templates.permitFieldOffice, 'dwpc') %></p>",
      markerTitle: "name",
      abbr: 'NPDES'
    },
    "WPC State Construction/Operating Permit": {
      type: 'WPC State Construction/Operating Permit',
      fullName: 'WPC State Construction/Operating Permit',
      name: 'WPC State Con',
      mediaType: 'WATER',
      mediaAbbr: 'BOW',
      color: '#88F0D3',
      markerIcon: 'img/stateConPermit.png',
      popupTemplate: "<h5>Water Permit - WPC State Construction/Operating Permit<h5><h4><%= properties.name %></h4><p>Agency SiteID<%= properties.agencySiteId %></p><p>Permit ID <%= properties.permitId %></p><p><%= milesToFieldOffice(properties.countyFips, properties.location ,templates.permitFieldOffice, 'dwpc') %></p>",
      markerTitle: "name",
      abbr: 'St Const'
    }
  }
};

var countyListLoad = $.getJSON('data/countyList.json', function (data){
  stateSummary.counties = data;
  stateSummary.counties['0'] = {
    permits: {}
  };
  countyList = data; //To Be Removed
});

function makeOfficeMarker(inGeoJson, inLatLng){
  return L.marker(inLatLng, {
    icon: L.icon({
      iconUrl: 'img/star.png',
      iconRetinaUrl: 'img/star.png',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      //popupAnchor:[0, -27]
    }),
    title: inGeoJson.properties.name,
    riseOnHover: true
  });
}

var officeList = {
  testLayer: new L.geoJson(null),
  layer: new L.geoJson(null,{
    pointToLayer: makeOfficeMarker
  })
};

var officeListLoad = $.getJSON('data/officeList.json', function (data){
  officeList.data = data;
  var dataCollection = {
    type:'FeatureCollection',
    features: []
  };
  for (var office in officeList.data){
    officeList.data[office].location = new L.LatLng(officeList.data[office].location.lat, officeList.data[office].location.lon);
    officeList.data[office].permits = {};
    var currFeature = {
      type: 'Feature',
      id: office,
      properties: officeList.data[office],
      geometry: {
        type: 'Point',
        coordinates: [officeList.data[office].location.lng, officeList.data[office].location.lat]
      }
    };
    dataCollection.features.push(currFeature);
  }
  officeList.layer.addData(dataCollection);
});

var districtListLoad = $.getJSON('data/district.json', function(data){
  for (var tmpDistrict in data){
    data[tmpDistrict].title = data[tmpDistrict].district + ' - ' + data[tmpDistrict].name;
    stateSummary.politicalDistricts[data[tmpDistrict].type].bhArray.push(data[tmpDistrict]);
    data[tmpDistrict].permits = {};
    stateSummary.politicalDistricts[data[tmpDistrict].type][data[tmpDistrict].district] = data[tmpDistrict];
  }
});

var maxMapBounds = L.latLngBounds(L.latLng(36.9, -91.6),L.latLng(42.6, -87.4));

function getSidebarWidth(){
  return $(".leaflet-sidebar").css("width");
}

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

function getViewport() {
  if (sidebar.isVisible()) {
    if (infoPopupFlag){
      map.panTo(infoPopup.getLatLng());
    }
    map.setActiveArea({
      position: "absolute",
      top: "0px",
      left: $(".leaflet-sidebar").css("width"),
      right: "0px",
      height: $("#map").css("height")
    });
  } else {
    map.setActiveArea({
      position: "absolute",
      top: "0px",
      left: "0px",
      right: "0px",
      height: $("#map").css("height")
    });
  }
}

function computeMilesApart(inLocation1, inLocation2){
  return Math.round((inLocation1.distanceTo(inLocation2) / 1609.34) * 10) / 10;
}

function computeRoadMiles(inLocation1, inLocation2, inDiv){
  var waypoints = [{
    latLng: inLocation1,
    name: 'origin'
  },{
    latLng: inLocation2,
    name: 'destination'
  }];
  routing.route(waypoints, function(err, routes){
    $(inDiv).Html(Math.round(routes[0].summary.totalDistance * 0.00621371)/10);
  });
}

function activeDisplayTypes(){
  var outTypes = {};
  var tmpTypes = {};
  var typeCount = 0;
  for (var tmpType in displayPermitTypes){
    tmpTypes[displayPermitTypes[tmpType].permitType] = {
      mediaType: displayPermitTypes[tmpType].mediaType,
      name: displayPermitTypes[tmpType].name
    };
    if (displayPermitTypes[tmpType].active){
      typeCount++;
      outTypes[displayPermitTypes[tmpType].permitType] = tmpTypes[displayPermitTypes[tmpType].permitType];
    }
  }
  return (typeCount>0)?outTypes:tmpTypes;
}

function activeDisplayTypesArray(){
  var outArray = [];
  var tmpArray = [];
  for (var tmpType in displayPermitTypes){
    tmpArray.push(displayPermitTypes[tmpType].permitType);
    if (displayPermitTypes[tmpType].active){
      outArray.push(displayPermitTypes[tmpType].permitType);
    }
  }
  return (outArray.length>0)?outArray:tmpArray;
}

function getCountyChartValues(inFips){
  var tmpData = [];
  var tmpTypes = activeDisplayTypes();
  for (var tmpType in tmpTypes){
    if (typeof(stateSummary.counties[inFips].permits[tmpType])!=='undefined'){
      var tmpPermitInfo = {};
      tmpPermitInfo.value = stateSummary.counties[inFips].permits[tmpType].locatedPermits;
      tmpPermitInfo.color = permits.types[tmpType].color;
      tmpPermitInfo.label = permits.types[tmpType].abbr;
      tmpPermitInfo.labelColor = '#000';
      tmpPermitInfo.labelFontSize = '0.8em';
      tmpData.push(tmpPermitInfo);
    }
  }
  return tmpData;
}

function buildCountyChartOptions(countyFips){
  var options = {
    data: getCountyChartValues(countyFips)
  };
  return options;
}

function dispChart(divName,options){
  divString = '#' + divName;
  // if (!isCanvasSupported()){
  //   G_vmlCanvasManager.initElement(divString);
  // }
  var ctx = $(divString)[0].getContext("2d");
  var data = options.data;
  var chartOptions = {
    animation: false
  };
  var chart = new Chart(ctx).Pie(data, chartOptions);
  return this;
}

function getStateChartValues(){
  var tmpData = [];
  var tmpTypes = activeDisplayTypes();
  for (var tmpType in tmpTypes){
    if (typeof(stateSummary.permits[tmpType])!=='undefined'){
      var tmpPermitInfo = {};
      tmpPermitInfo.value = stateSummary.permits[tmpType].totalPermits;
      tmpPermitInfo.color = permits.types[tmpType].color;
      tmpPermitInfo.label = permits.types[tmpType].abbr;
      tmpPermitInfo.labelColor = '#000';
      tmpPermitInfo.labelFontSize = '0.8em';
      tmpData.push(tmpPermitInfo);
    }
  }
  return tmpData;
}

function buildStateChartOptions(){
  var options = {
    data: getStateChartValues()
  };
  return options;
}

$(document).ready(function() {
  getViewport();
  /* Hack to refresh tabs after append */
  $("#poi-tabs a[href='#counties']").tab("show");
});

function sidebarClick(lat, lng, id, layer) {
  /* If sidebar takes up entire screen, hide it and go to the map */
  if (document.body.clientWidth <= 767) {
    sidebar.hide();
    getViewport();
  }
  map.setView([lat, lng], 17);
  if (!map.hasLayer(layer)) {
    map.addLayer(layer);
  }
  map._layers[id].fire("click");
}

/* Basemap Layers */
var baseStreetMap = L.esri.basemapLayer("Topographic");
var baseSatteliteMap = L.esri.basemapLayer("Imagery");
var baseSatteliteWithTransportMap = new L.LayerGroup([
  L.esri.basemapLayer("Imagery"),
  L.esri.basemapLayer('ImageryTransportation')
]);


function getStatePermitCount(){
  var tmpTypes = activeDisplayTypesArray();
  var outPermitCount = 0;
  for (var tmpType in tmpTypes){
    outPermitCount += (typeof(stateSummary.permits[tmpTypes[tmpType]])!=='undefined')?stateSummary.permits[tmpTypes[tmpType]].totalPermits:0;
  }
  return outPermitCount;
}

function getCountyPermitCount(inFips){
  var tmpTypes = activeDisplayTypesArray();
  var outPermitCount = 0;
  for (var tmpType in tmpTypes){
    outPermitCount += (typeof(stateSummary.counties[inFips].permits[tmpTypes[tmpType]])!=='undefined')?stateSummary.counties[inFips].permits[tmpTypes[tmpType]].locatedPermits:0;
  }
  return outPermitCount;
}

/* Overlay Layers */
function colorCountyFeature(feature){
  var tmpCount = getCountyPermitCount(feature.properties.CO_FIPS);

  var colorVal = '#F00';
  if (tmpCount === 0){
    colorVal = '#CCC';
  }
  else if (tmpCount < 50){
    colorVal = '#0FF';
  }
  else if (tmpCount < 100){
    colorVal = '#0F0';
  }
  else if (tmpCount < 300){
    colorVal = '#FF0';
  }
  else if (tmpCount < 1000){
    colorVal = '#F60';
  }
  return {color: colorVal};
}

function buildStateInfo(){
  var infoHtml = '<ul>';
  var currMediaType = '';
  for (var type in permits.types){
    if (currMediaType !== permits.types[type].mediaType){
      infoHtml += (currMediaType.length>0)?'</table></li>':'';
      currMediaType = permits.types[type].mediaType;
      infoHtml += '<li>' + permits.types[type].mediaAbbr + ' Permits<table class="table table-condensed">';
    }
    
    if(permits.types[type].hasOwnProperty('name')){
      infoHtml += '<tr><td class="text-right">' + ((stateSummary.permits.hasOwnProperty(type))?stateSummary.permits[type].totalPermits:0)  +  '</td>';
      infoHtml += '<td>' + permits.types[type].name + '</td></tr>';
    }
  }
  infoHtml += '</table></li></ul>';
  $('#stateInfo').html(infoHtml);
  $('#stateTotal').html(getStatePermitCount());
}

function buildCountyInfo(inName, inFips){
  currCountyFips = inFips;
  $('#featureName').html(inName);
  $('#featureCount').html(getCountyPermitCount(inFips));
  $('#featureChart').html('<canvas id="localChart" class="pieChart"></canvas>');
  var html = '<span id="localTable"></span>';
  $('#divFeatureInfo').html(html);
  dispChart("localChart",buildCountyChartOptions(inFips));

  var infoHtml = '<ul>';
  var currMediaType = '';
  for (var type in permits.types){
    if (currMediaType !== permits.types[type].mediaType){
      infoHtml += (currMediaType.length>0)?'</table></li>':'';
      currMediaType = permits.types[type].mediaType;
      infoHtml += '<li>' + permits.types[type].mediaAbbr + ' Permits<table class="table table-condensed">';
    }
    
    if(permits.types[type].hasOwnProperty('name')){
      infoHtml += '<tr><td class="text-right">' + ((stateSummary.counties[inFips].permits.hasOwnProperty(type))?stateSummary.counties[inFips].permits[type].locatedPermits:0) +  '</td>';
      infoHtml += '<td>' + permits.types[type].name + '</td></tr>';
    }
  }
  infoHtml += '</table></li></ul>';
  $('#localTable').html(infoHtml);
}

function milesToFieldOffice(inFips, inLocation, inTemplate, inType){
  var officeType = (typeof(inType) === 'string')?inType:null;
  var offices = countyList[inFips].offices;
  var outOfficeList = {};
  for (var office in offices){
    var testOffice = officeList.data[offices[office]];
    if (officeType === null || officeType === office){
      if (!outOfficeList[offices[office]]){
        outOfficeList[offices[office]]={
          name: testOffice.name,
          distance: computeMilesApart(testOffice.location, inLocation),
          types: []
        };
      }
      outOfficeList[offices[office]].types.push(office);
    }
  }
  var outHtmls = [];
  for (var outOffice in outOfficeList){
    outHtmls.push(_.template(inTemplate, outOfficeList[outOffice]));
  }
  outHtml = outHtmls.join('');
  return outHtml;
}

function getOfficer(inArray, inType){
  var outString = '$1$2 - ' + stateSummary.politicalDistricts[inType][inArray[2]].name;
  return outString;
}

function updateLocalInfo(inLocationInfo){
  if (!measureControl.isActive()){
    var popupHtml;
    if(typeof(inLocationInfo.county) === 'object'){
      console.log(inLocationInfo);
      var reTable = /<\/table>/;
      var reHouse = /(id='stateHouse'>)(\d+)(?=<)/; // replace(reHouse, "$1$2 - Representative Name")
      var reSenate = /(id='stateSenate'>)(\d+)(?=<)/; // replace(reHouse, "$1$2 - Senator Name")
      var reCongress = /<tr><td>US Congress.+Section.+\d<\/td><\/tr>/; // replace(reCongress, '$1')
      var reFips = /<br>FIPS.+\d{3}<\/span>/; // replace(reFips,'')
      var reVehicleTesting = /<tr><td>Vehicle Testing Areas<\/td><td>\d{5}<\/td><\/tr>/; // replace(reVehicleTesting, '')
      var reGroundWaterOrd = /<tr><td>Groundwater Ordinance<\/td><td>[\D\s]+<\/td><\/tr>/; // replace(reGroundWaterOrd, '')
      popupHtml = inLocationInfo.htmlString
        .replace(reTable,milesToFieldOffice(inLocationInfo.county.CO_FIPS, inLocationInfo.inLocation, templates.fieldOffice))
        .replace(reHouse, getOfficer(inLocationInfo.htmlString.match(reHouse),'House'))
        .replace(reSenate, getOfficer(inLocationInfo.htmlString.match(reSenate), 'Senate'))
        .replace(reCongress, '')
        .replace(reFips, '')
        .replace(reVehicleTesting, '')
        .replace(reGroundWaterOrd, '');
      buildCountyInfo(inLocationInfo.county.COUNTY_NAM, inLocationInfo.county.CO_FIPS);
      $('#collapseGenOne').collapse('hide');
      $('#collapseGenTwo').collapse('show');
      getViewport();
    }
    else{
      popupHtml = 'Point is outside<br>State boundaries<br><button onclick="zoomToFullExtent()">Zoom to Illinois</button>';
    }
    infoPopupFlag = true;
    infoPopup.setLatLng(inLocationInfo.inLocation)
    .setContent(popupHtml)
    .openOn(map);
  }
}


var locator = new Locator();

function configureCountyFeature(feature, layer) {
  countySearch.push({
    name: layer.feature.properties.COUNTY_NAM,
    source: "Counties",
    id: L.stamp(layer),
    bounds: layer.getBounds()
  });
  feature.properties.PermitTotal = stateSummary.counties[feature.properties.CO_FIPS].total;
  generalPermitLayer.setStyle(colorCountyFeature);
  layer.on('mouseover mousemove', function(e){
    if (!infoPopupFlag){
      var hover_bubble = new L.Rrose({
        offset: new L.Point(0,-10),
        closeButton: false,
        autoPan: false})
        .setContent('<p>'+feature.properties.COUNTY_NAM+'<br>'+ getCountyPermitCount(feature.properties.CO_FIPS) + ' Permits</p>')
        .setLatLng(e.latlng)
        .openOn(map);
    }
  });
  layer.on('mouseout', function(e){
    if(!infoPopupFlag){
      map.closePopup();
    }
  });
  layer.on('click', function(e){
   if (!sidebar.isVisible()){
     sidebar.show();
   }
   locator.getLocationInfo(e.latlng, updateLocalInfo);
 });
  layer.on('dblclick', function(e){
    console.log('doubleclick');
    if (infoPopupFlag){
      map.closePopup();
    }
    map.fitBounds(e.target.getBounds());

  });
}

baseIllinoisLayer = new L.esri.DynamicMapLayer('http://geoservices.epa.illinois.gov/arcgis/rest/services/SWAP/Location/MapServer',{
  opacity: 0.5,
  position: 'back'
});

generalPermitTestLayer = new L.geoJson(null);

generalPermitLayer = new L.esri.FeatureLayer("http://geoservices.epa.illinois.gov/arcgis/rest/services/Boundaries/Counties/FeatureServer/0", {
  style: colorCountyFeature,
  precision: 5,
  onEachFeature: configureCountyFeature
});


legislativeDistricts = new L.esri.FeatureLayer("http://geoservices.epa.illinois.gov/arcgis/rest/services/Boundaries/LegislativeDistricts/FeatureServer/2", {
  where: "DistrictNum = 0",
  precision: 5
});

// legislativeDistricts.on("load", function(evt){
//   try {
//     if (!zoomedPolitical){
//         map.fitBounds(legislativeDistricts.getBounds());
//         zoomedPolitical = true;
//       }
//   }
//   catch(err){
//     console.log(err.message);
//   }
// });

/* Single marker cluster layer to hold all clusters */
var localPermitMarkers = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true
});

localPermitMarkers.on("clusterclick", function(evt){
 if(infoPopupFlag){
  map.closePopup();
 }
});

function clearPoliticalDistrict(){
  legislativeDistricts.setWhere("DistrictNum = 0");
  politicalDistrict = null;
  $('#searchbox').val('');
}

function zoomToFullExtent(){
  clearPoliticalDistrict();
  map.closePopup();
  map.fitBounds(maxMapBounds);
  return false;
}

// localPermitMarkers.on("load", function(evt){
//   console.log('Permits Loaded');
//   $("#loading").hide();
// });

function bindPermitMarker(inGeoJson, inMarker){
  var permitType = permits.types[inGeoJson.properties.type];
  inMarker.bindPopup(_.template(permitType.popupTemplate,inGeoJson));
  //inMarker.bindPopup( L.popup({className: 'permitPopup'}).setContent(_.template(permitType.popupTemplate,inGeoJson)));
}

function makePermitMarker(inGeoJson, inLatLng){
  var permitType = permits.types[inGeoJson.properties.type];
  var iconUrl = permitType.markerIcon;
  var markerTitle = permitType.markerTitle;
  return L.marker(inLatLng, {
    icon: L.icon({
      iconUrl: iconUrl,
      iconRetinaUrl: iconUrl,
      iconSize: [32, 37],
      iconAnchor: [16, 37],
      popupAnchor:[0, -27]
    }),
    title: inGeoJson.properties[markerTitle],
    riseOnHover: true
  });
}

function testFunction(inVal){
  //<p><%=milesToFieldOffice(properties.CountyFips, L.latLng(geometry.coordinates[1],geometry.coordinates[0]), templates.fieldOffice%></p>
  console.log(inVal);
  return inVal;
}

function getPermitTypes (inPermitTypes, inFunction){
  for (var key in inPermitTypes){
    if (typeof(inPermitTypes[key]) === "object"){
      if (inPermitTypes[key].hasOwnProperty('name')){
        inFunction(inPermitTypes[key]);
      }
      getPermitTypes(inPermitTypes[key], inFunction);
    }
  }
}

var standardWhere = "(MediaCode = 'AIR' and InterestType = 'PERMIT') or (MediaCode = 'AIR' and InterestType = 'ROSS') or (MediaCode = 'AIR' and InterestType = 'USEPA') or (MediaCode = 'WATER' and InterestType = 'BOW')";

function getLegislativeWhere(type){
  var testValue;
  if (type === 'Search'){
    testValue = queryDistrict.searchFields[politicalDistrict.type];
  }
  else {
    testValue = queryDistrict.filterFields[politicalDistrict.type];
  }
  var testString = testValue + ' = ' + politicalDistrict.district;
  return testString;
}

function buildWhere(inArray){
  var returnWhere = '';
  var buildArray = [];
  var template = "(MediaCode = '<%= mediaType %>' and InterestType = '<%= permitType %>')";
  var index;
  for (index = 0; index < inArray.length; ++index){
    if (inArray[index].active) {
      buildArray.push(_.template(template,inArray[index]));
    }
  }
//  return "(MediaCode = 'AIR' and InterestType = 'PERMIT') or (MediaCode = 'AIR' and InterestType = 'ROSS') or (MediaCode = 'AIR' and InterestType = 'USEPA') or (MediaCode = 'WATER' and InterestType = 'BOW')";
returnWhere = (buildArray.length > 0)? buildArray.join(' or ') : "MediaCode = 'NONSENSE'";

if (politicalDistrict){
  var testString = getLegislativeWhere('Filter');
  returnWhere = testString + ' and (' + returnWhere + ')';
}

return returnWhere;
}

function createPermitLayer(){
  return new L.geoJson(
    null,{
    pointToLayer: makePermitMarker,
    onEachFeature: bindPermitMarker
  });
}

function createDataCollection(){
  return {
    type: 'FeatureCollection',
    features: [],
    totalRecords: 0
  };
}

function summatePermitLocations(inPermit){
  if (typeof(stateSummary.permits[inPermit.type]) === 'undefined'){
    stateSummary.permits[inPermit.type] = {
      locatedPermits: 0,
      totalPermits:0
    };
  }
  ++stateSummary.locationCount;
  ++stateSummary.permits[inPermit.type].locatedPermits;
  if(inPermit.countyFips !== null && typeof(stateSummary.counties[inPermit.countyFips].permits[inPermit.type]) === 'undefined'){
    stateSummary.counties[inPermit.countyFips.toString()].permits[inPermit.type] = {
      locatedPermits: 0
    };
  }
  ++stateSummary.counties[inPermit.countyFips].permits[inPermit.type].locatedPermits;

  if (typeof(stateSummary.politicalDistricts.House[inPermit.stateHouseDist].permits[inPermit.type]) === 'undefined'){
    stateSummary.politicalDistricts.House[inPermit.stateHouseDist].permits[inPermit.type] = {
      locatedPermits: 0
    };
  }
  ++stateSummary.politicalDistricts.House[inPermit.stateHouseDist].permits[inPermit.type].locatedPermits;

  if (typeof(inPermit.senateDist !== null && 
    stateSummary.politicalDistricts.Senate[inPermit.senateDist].permits[inPermit.type]) === 'undefined'){
    stateSummary.politicalDistricts.Senate[inPermit.senateDist].permits[inPermit.type] = {
      locatedPermits: 0
    };
  }
  ++stateSummary.politicalDistricts.Senate[inPermit.senateDist].permits[inPermit.type].locatedPermits;
}

// This may result in a race conditions since it is loading data into the displayPermitTypes array
$.when(countyListLoad, districtListLoad, officeListLoad).done(function(){
  $.getJSON('data/permits.json', function(data){
    var dataCollections = {};
    var reDate = /\/Date\(\d+\)\//;
    for (var i = data.length - 1; i >= 0; i--) {
      var mediaType = permits.types[data[i].type].mediaType;
      console.log(mediaType);
      stateSummary.totalCount++;
      if (typeof(dataCollections[mediaType]) === 'undefined'){
        dataCollections[mediaType] = {
          abbr: permits.types[data[i].type].mediaAbbr
        };
      }
      if (typeof (dataCollections[mediaType][data[i].type]) === 'undefined'){
        dataCollections[mediaType][data[i].type] = createDataCollection();
      }
      ++dataCollections[mediaType][data[i].type].totalRecords;
      for (var attribute in data[i]){
        if (reDate.test(data[i][attribute])){
          data[i][attribute] = new Date(parseInt(data[i][attribute].substr(6), 10));
        }
      }
      if(data[i].lon!=null && data[i].lat!=null){
        data[i].location = new L.LatLng(data[i].lat,data[i].lon);
        summatePermitLocations(data[i]);
        var feature = {
          type: 'Feature',
          id: i,
          properties: data[i],
          geometry: {
            type: 'Point',
            coordinates: [
              data[i].lon,
              data[i].lat
            ]
          }
        };
        dataCollections[mediaType][data[i].type].features.push(feature);
      }
      ++stateSummary.permits[data[i].type].totalPermits;
    }
    for (var permitType in displayPermitTypes){
      var currPermitType = displayPermitTypes[permitType];
      currPermitType.actionLayer.addData(dataCollections[currPermitType.mediaType][currPermitType.permitType]);
      currPermitType.totalRecords = dataCollections[currPermitType.mediaType][currPermitType.permitType].totalRecords;
    }
  });
});

function updatePermitDisplay(){
  try{
    generalPermitLayer.setStyle(colorCountyFeature);
  }
  catch(err){
    console.log(err.message);
  } //swallow error when where is set while layer is not displayed
}

var map = L.map("map", {
  maxZoom: 17,
  minZoom:6,
  zoom: 7,
  center: [40, -89.5],
  layers: [baseStreetMap, baseIllinoisLayer, legislativeDistricts, localPermitMarkers],
  zoomControl: false,
  attributionControl: true,
//  maxBounds: maxMapBounds,
  bounceAtZoomLimits: false
});

map.on('click', function (e) {
     locator.getLocationInfo(e.latlng, updateLocalInfo);
});

map.on('viewreset', function(e){
  if (map.hasLayer(generalPermitTestLayer)){
    if (map.getZoom()>10) {
      map.removeLayer(generalPermitLayer);
      $('#heatPatch').css('visibility', 'hidden');
      map.closePopup();
    }
    else {
     $('#heatPatch').css('visibility', 'visible');
      map.addLayer(generalPermitLayer);
    }
  }
});

map.on('dragend', function(e){
  var mapDimension = map.getSize();
  var minMoveDimension = Math.min(mapDimension.x, mapDimension.y) * 0.5;
  if (e.distance > minMoveDimension && infoPopupFlag){
    map.closePopup();
  }
});

function updateSideBar(){
  dispChart('stateChart', buildStateChartOptions());
  if (typeof(currCountyFips) !== 'undefined'){
    dispChart('localChart',buildCountyChartOptions(currCountyFips));
    $('#featureCount').html(getCountyPermitCount(currCountyFips));
  }
  $('#stateTotal').html(getStatePermitCount());
}

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e){
  if (e.layer === officeList.testLayer){
    map.addLayer(officeList.layer);
  }
  else if (e.layer === generalPermitTestLayer){
    map.addLayer(generalPermitLayer);
    $('#heatPatch').css('visibility', 'visible');
  }
  else{
    for (var index = 0; index < displayPermitTypes.length; ++index){
      if (e.layer === displayPermitTypes[index].testLayer) {
        displayPermitTypes[index].active = true;
        localPermitMarkers.addLayer(displayPermitTypes[index].actionLayer);
        updatePermitDisplay();
      }
      updateSideBar();
    }
  }
});

map.on('popupopen', function(e){
  if (e.popup.options.className === 'infoPopup'){
    console.log(e.popup.options.className);
  }
});

map.on('popupclose', function(e){
  infoPopupFlag = false;
});

map.on('overlayremove', function(e){
  if (e.layer === officeList.testLayer){
    map.removeLayer(officeList.layer);
  }
  else if (e.layer === generalPermitTestLayer){
    map.removeLayer(generalPermitLayer);
    $('#heatPatch').css('visibility', 'hidden');
  }
  else{
    for (var index = 0; index < displayPermitTypes.length; ++index){
      if (e.layer === displayPermitTypes[index].testLayer){
        displayPermitTypes[index].active = false;
        localPermitMarkers.removeLayer(displayPermitTypes[index].actionLayer);
        updatePermitDisplay();
        updateSideBar();
      }
    }
  }
});

function buildPermitInfo(inPermitType){
  var newPermitLayer = {};
  newPermitLayer.name = inPermitType.name;
  newPermitLayer.actionLayer = createPermitLayer();
  newPermitLayer.testLayer = L.geoJson(null);
  newPermitLayer.mediaType = inPermitType.mediaType;
  newPermitLayer.permitType = inPermitType.type;
  newPermitLayer.active = false;
  //map.addLayer(newPermitLayer.testLayer);
  displayPermitTypes.push(newPermitLayer);  
}

getPermitTypes(permits.types, buildPermitInfo);


/* Attribution control */
// function updateAttribution(e) {
//   $.each(map._layers, function(index, layer) {
//     if (layer.getAttribution) {
//       $("#attribution").html((layer.getAttribution()));
//     }
//   });
// }
// map.on("layeradd", updateAttribution);
// map.on("layerremove", updateAttribution);

// var attributionControl = L.control({
//   position: "bottomright"
// });
// attributionControl.onAdd = function (map) {
//   var div = L.DomUtil.create("div", "leaflet-control-attribution");
//   div.innerHTML = "Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | <a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
//   return div;
// };
//map.addControl(attributionControl);

zoomControl.addTo(map);

measureControl.addTo(map);


var baseLayers = {
  "Street Map": baseStreetMap,
  "Aerial Imagery": baseSatteliteMap,
  "Imagery with Streets": baseSatteliteWithTransportMap
};

var referenceLayers = {
  "County Permit Counts": generalPermitTestLayer,
  "<img src='img/star.png' width='20' height='20'>&nbsp;Regional Offices": officeList.testLayer
};


function buildGroupedOverlays(inPermitArray, inDisplayPermitTypes){
  var outGroupedOverlay = {};
  var types = inPermitArray.types;
  var layerNameTemplate = "<img src='<%=markerIcon%>' width='24' height='28'>&nbsp;<%=name%>";
  for (var type in types){
    var groupName = types[type].mediaAbbr + ' Permits';
    if (typeof(outGroupedOverlay[groupName]) === 'undefined'){
      outGroupedOverlay[groupName] = {};
    }
    
    var layerName = _.template(layerNameTemplate,types[type]);
    var testName = types[type].name;
    for (var j in inDisplayPermitTypes){
      if (inDisplayPermitTypes[j].name === testName){
        outGroupedOverlay[groupName][layerName] = inDisplayPermitTypes[j].testLayer;
      }
    }
  }
  return outGroupedOverlay;
}

var groupedOverlays = buildGroupedOverlays(permits, displayPermitTypes);

groupedOverlays.Reference = referenceLayers;

/* Larger screens get expanded layer control */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed,
  closeButton: true,
  position: 'topleft'
});

layerControl.addTo(map);

sidebar = L.control.sidebar("sidebar", {
  closeButton: true,
  position: "left"
}).on("shown", function () {
  getViewport();
}).on("hidden", function () {
  getViewport();
}).addTo(map);


/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

// Actions to run after all AJAX calls have completed
$(document).one("ajaxStop", function () {

  // Apply open/close click event to genAccordion in sidebar
  $('.genCollapse').click(function(){
    $('.genCollapse').children('.collapse').collapse('hide');
    $(this).children('.collapse').collapse('show');
  });
  dispChart('stateChart', buildStateChartOptions());
  $("#loading").hide();

  buildStateInfo();

  var senateBH = new Bloodhound({
    name: "senateDistricts",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.title);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: stateSummary.politicalDistricts.Senate.bhArray,
    limit: 10
  });

  senateBH.initialize();

  var houseBH = new Bloodhound({
    name: "houseDistricts",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.title);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: stateSummary.politicalDistricts.House.bhArray,
    limit: 10
  });

  houseBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 1,
    highlight: true,
    hint: false
  },
  {
    name: "Senators",
    displayKey: "title",
    source: senateBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Senators</h4>"
    }
  },
  {
    name: "Representatives",
    displayKey: "title",
    source: houseBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Representatives</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (infoPopupFlag){
      map.closePopup();
    }
    if (datum.source === "PoliticalDistricts") {
        datum.bounds = queryDistrict.findDistrict(datum, map);
        politicalDistrict = datum;
        legislativeDistricts.setWhere(getLegislativeWhere('Search'));
        //permitCluster.setWhere(buildWhere(displayPermitTypes));
        //map.fitBounds(legislativeDistricts.getBounds());
      }
      if ($(".navbar-collapse").height() > 50) {
        $(".navbar-collapse").collapse("hide");
      }
    }).on("typeahead:opened", function () {
      $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
      $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
    }).on("typeahead:closed", function () {
      $(".navbar-collapse.in").css("max-height", "");
      $(".navbar-collapse.in").css("height", "");
    });
    $(".twitter-typeahead").css("position", "static");
    $(".twitter-typeahead").css("display", "block");
  });

/* Placeholder hack for IE */
if (navigator.appName === "Microsoft Internet Explorer") {
  $("input").each(function () {
    if ($(this).val() === "" && $(this).attr("placeholder") !== "") {
      $(this).val($(this).attr("placeholder"));
      $(this).focus(function () {
        if ($(this).val() === $(this).attr("placeholder")) {
          $(this).val("");
        }
      });
      $(this).blur(function () {
        if ($(this).val() === "") {
          $(this).val($(this).attr("placeholder"));
        }
      });
    }
  });
}
