
var map, sidebar, countySearch = [];
var generalPermitLayer, legislativeDistricts;
var permitLayers = {};
var permitCount;
var countyList;
var displayPermitTypes = [];
var officeList;
var politicalDistricts = {};
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
    "Npdes": {
      type: 'Npdes',
      name: 'NPDES Permits',
      mediaType: 'WATER',
      mediaAbbr: 'BOW',
      color: '#88F0D3',
      markerIcon: 'img/npdesPermit.png',
      popupTemplate: "<h5>Water Permit - NPDES<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Permit ID <%= properties.permitId %></p><p>",
      markerTitle: "name",
      abbr: 'NPDES'
    },
    "WPC State Construction/Operating Permit": {
      type: 'WPC State Construction/Operating Permit',
      name: 'WPC State Construction/Operating Permit',
      mediaType: 'WATER',
      mediaAbbr: 'BOW',
      color: '#C563E6',
      markerIcon: 'img/stateConPermit.png',
      popupTemplate: "<h5>Water Permit - WPC State Construction/Operating Permit<h5><h4><%= properties.name %></h4><p>Agency SiteID<%= properties.agencySiteId %></p><p>Permit ID <%= properties.permitId %></p>",
      markerTitle: "name",
      abbr: 'WPC State Con'
    },
    "LIFETIME": {
      type: 'LIFETIME',
      name: 'Lifetime Permits',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563E6',
      markerIcon: 'img/lifetimePermit.png',
      popupTemplate: "<h5>Air Permit - Lifetime<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p>",
      markerTitle: "name",
      abbr: 'Lifetime'
    },
    "CONSTRUCTION": {
      type: 'CONSTRUCTION',
      name: 'Construction',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563E6',
      markerIcon: 'img/constrPermit.png',
      popupTemplate: "<h5>Air Permit - Construction<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p>",
      markerTitle: "name",
      abbr: 'BOA Con'
    },
    "ROSS": {
      type: 'ROSS',
      name: 'ROSS Permits',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563B6',
      markerIcon: 'img/rossPermit.png',
      popupTemplate: "<h5>Air Permit - ROSS<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p>",
      markerTitle: "name",
      abbr: 'ROSS'
    },
    "TITLE V": {
      type: 'TITLE V',
      name: 'Title V Permits',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563E6',
      markerIcon: 'img/titleVPermit.png',
      popupTemplate: "<h5>Air Permit - Title V<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p>",
      markerTitle: "name",
      abbr: 'TitleV'
    },
    "FESOP": {
      type: 'FESOP',
      name: 'FESOP Permits',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563E6',
      markerIcon: 'img/airPermit.png',
      popupTemplate: "<h5>Air Permit - FESOP<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p>",
      markerTitle: "name",
      abbr: 'FESOP'
    },
    "JOINT": {
      type: 'JOINT',
      name: 'Joint Permits',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563E6',
      markerIcon: 'img/jointPermit.png',
      popupTemplate: "<h5>Air Permit - Joint Permit<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p>",
      markerTitle: "name",
      abbr: 'Joint'
    },
    "OPERATING": {
      type: 'OPERATING',
      name: 'Operating Permits',
      mediaType: 'AIR',
      mediaAbbr: 'BOA',
      color: '#C563E6',
      markerIcon: 'img/operatingPermit.png',
      popupTemplate: "<h5>Air Permit - Operating Permit<h5><h4><%= properties.name %></h4><p>Agency SiteID <%= properties.agencySiteId %></p><p>Bureau SiteID <%= properties.bureauId %></p><p>Permit ID <%= properties.permitId%> <%= properties.permitStatus%></p>",
      markerTitle: "name",
      abbr: 'BOA Oper'
    }
  }
};

$.getJSON('data/countyList.json', function (data){
  countyList = data;
});

$.getJSON('data/officeList.json', function (data){
  officeList = data;
  for (var office in officeList){
    officeList[office].location = new L.LatLng(officeList[office].location.lat, officeList[office].location.lon);
  }
});

$.getJSON('data/permitCount.json', function (data){
  var tmpPermits = {};
  for (var tmpCounty in data){
    tmpPermits[data[tmpCounty].countyFips] = {
      info: countyList[data[tmpCounty].countyFips],
      total: data[tmpCounty].count
    };
    for (var tmpPermit in data[tmpCounty].detail){
      tmpPermits[data[tmpCounty].countyFips][data[tmpCounty].detail[tmpPermit].interestType] = data[tmpCounty].detail[tmpPermit].count;
    }
  }
  permitCount = tmpPermits;
});

$.getJSON('data/district.json', function(data){
  politicalDistricts.Senate = [];
  politicalDistricts.House = [];
  for (var tmpDistrict in data){
    data[tmpDistrict].title = data[tmpDistrict].district + ' - ' + data[tmpDistrict].name;
    politicalDistricts[data[tmpDistrict].type].push(data[tmpDistrict]);
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
  for (var tmpType in displayPermitTypes){
    if (displayPermitTypes[tmpType].active){
      outTypes[displayPermitTypes[tmpType].interestType] = {
        mediaType: displayPermitTypes[tmpType].mediaType,
        name: displayPermitTypes[tmpType].name
      };
    }
  }
  return outTypes;
}

function activeDisplayTypesArray(){
  var outArray = [];
  for (var tmpType in displayPermitTypes){
    if (displayPermitTypes[tmpType].active){
      outArray.push(displayPermitTypes[tmpType].interestType);
    }
  }
  return outArray;
}

function getCountyChartValues(inFips){
  var tmpData = [];
  var tmpTypes = activeDisplayTypes();
  for (var tmpType in tmpTypes){
    if (typeof(permitCount[inFips][tmpType])!=='undefined'){
      var tmpBureau = tmpTypes[tmpType].mediaType;
      var tmpPermitInfo = {};
      tmpPermitInfo.value = permitCount[inFips][tmpType];
      tmpPermitInfo.color = permits.types[tmpBureau][tmpType].color;
      tmpPermitInfo.label = permits.types[tmpBureau][tmpType].abbr;
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

var stateChartOptions = {
  data: [
  {
    value: 18880,
    color:"#C563E6",
    label: 'BOA',
    labelColor: '#000',
    labelFontSize: '.8em'
  },
  {
    value : 3384,
    color : "#88F0D3",
    label: 'BOW',
    labelColor: '#000',
    labelFontSize: '.8em'
  // },
  // {
  //   value : 5262,
  //   color : "#69D2E7",
  //   label: 'BOL',
  //   labelColor: '#000',
  //   labelFontSize: '.8em'
}
]};

dispChart('stateChart', stateChartOptions);

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


function getCountyPermitCount(inFips){
  var tmpTypes = activeDisplayTypesArray();
  var outPermitCount = 0;
  for (var tmpType in tmpTypes){
    outPermitCount += (typeof(permitCount[inFips][tmpTypes[tmpType]])!=='undefined')?permitCount[inFips][tmpTypes[tmpType]]:0;
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

function buildLocalInfo(inName, inFips){
  var html = '<h4>{{CountyName}} County</h4><p><canvas id="localChart" class="pieChart"></canvas></p><span id="localTable"></span>';
  $('#divFeatureInfo').html('<h4>'+inName+' County</h4><p><canvas id="localChart" class="pieChart"></canvas></p><span id="localTable"></span>');
  dispChart("localChart",buildCountyChartOptions(inFips));
  // Put together an UL with the Total Permits for the County and the Total for each of the bureaus.

  var infoHtml = '<h5 class="text-center">' + permitCount[inFips].total + ' Total Permits' + '</h5><ul>';
  for (var tmpBureau in permits.types){
    infoHtml += '<li>' + permits.types[tmpBureau].typeName + '<table class="table">';
    for (var tmpType in permits.types[tmpBureau]){
      if(permits.types[tmpBureau][tmpType].hasOwnProperty('name')){
        infoHtml += '<tr><td class="text-right">' + ((permitCount[inFips].hasOwnProperty(tmpType))?permitCount[inFips][tmpType]:0) +  '</td>';
        infoHtml += '<td>' + permits.types[tmpBureau][tmpType].name + '</td></tr>';
      }
    }
    infoHtml += '</table></li>';
  }
  infoHtml += '</ul>';
  $('#localTable').html(infoHtml);
}

function milesToFieldOffice(inFips, inLocation, inTemplate, inType){
  var officeType = (typeof(inType) === 'string')?inType:null;
  var offices = countyList[inFips].offices;
  var outOfficeList = {};
  for (var office in offices){
    var testOffice = officeList[offices[office]];
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
  var outString = '$1$2 - ' + politicalDistricts[inType][inArray[2]-1].name;
  return outString;
}

function updateLocalInfo(inLocationInfo){
  if (!measureControl.isActive()){
    var reTable = /<\/table>/;
    var reHouse = /(id='stateHouse'>)(\d+)(?=<)/; // replace(reHouse, "$1$2 - Representative Name")
    var reSenate = /(id='stateSenate'>)(\d+)(?=<)/; // replace(reHouse, "$1$2 - Senator Name")
    var reCongress = /<tr><td>US Congress.+Section.+\d<\/td><\/tr>/; // replace(reCongress, '$1')
    var reFips = /<br>FIPS.+\d{3}<\/span>/; // replace(reFips,'')
    var popupHtml = inLocationInfo.htmlString
      .replace(reTable,milesToFieldOffice(inLocationInfo.county.CO_FIPS, inLocationInfo.inLocation, templates.fieldOffice))
      .replace(reHouse, getOfficer(inLocationInfo.htmlString.match(reHouse),'House'))
      .replace(reSenate, getOfficer(inLocationInfo.htmlString.match(reSenate), 'Senate'))
      .replace(reCongress, '')
      .replace(reFips, '');
    infoPopup.setLatLng(inLocationInfo.inLocation)
      .setContent(popupHtml)
      .openOn(map);
    buildLocalInfo(inLocationInfo.county.COUNTY_NAM, inLocationInfo.county.CO_FIPS);
    infoPopupFlag = true;
    getViewport();
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
  feature.properties.PermitTotal = permitCount[feature.properties.CO_FIPS].total;
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
    map.fitBounds(e.target.getBounds());

  });
}

generalPermitTestLayer = new L.geoJson(null);

generalPermitLayer = new L.esri.FeatureLayer("http://geoservices.epa.illinois.gov/arcgis/rest/services/Boundaries/Counties/FeatureServer/0", {
  style: colorCountyFeature,
  precision: 5,
  onEachFeature: configureCountyFeature
});

generalPermitLayer.on("loading", function(evt){
  $("#loading").show();
});

generalPermitLayer.on("load", function(evt){
  $("#loading").hide();
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

// localPermitMarkers.on("loading", function(evt){
//   console.log('Permits Loading');
//   $("#loading").show();
// });

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
  var template = "(MediaCode = '<%= mediaType %>' and InterestType = '<%= interestType %>')";
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

// This may result in a race conditions since it is loading data into the displayPermitTypes array
$.getJSON('data/permits.json', function(data){
  var dataCollections = {};
  var reDate = /\/Date\(\d+\)\//;
  for (var i = data.length - 1; i >= 0; i--) {
    var mediaType = permits.types[data[i].type].mediaType;
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
  }
  for (var permitType in displayPermitTypes){
    var currPermitType = displayPermitTypes[permitType];
    console.log(currPermitType);
    currPermitType.actionLayer.addData(dataCollections[currPermitType.mediaType][currPermitType.permitType]);
    currPermitType.totalRecords = dataCollections[currPermitType.mediaType][currPermitType.permitType].totalRecords;
  }
});


function updatePermitDisplay(){
  try{
    permitCluster.setWhere(buildWhere(displayPermitTypes));
  }
  catch(err){
    console.log(err.message);
  } //swallow error when where is set while layer is not displayed
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
  layers: [baseStreetMap, legislativeDistricts, localPermitMarkers],
  zoomControl: false,
  attributionControl: true,
//      maxBounds: maxMapBounds,
bounceAtZoomLimits: false
});

map.on('click', function (e) {
     locator.getLocationInfo(e.latlng, updateLocalInfo);
});

map.on('viewreset', function(e){
  if (map.getZoom()>10){
//    map.removeLayer(generalPermitLayer);
//    $('#heatPatch').css('visibility', 'hidden');
//    map.closePopup();
//    map.addLayer(permitCluster);
  }
  else{
//    map.removeLayer(permitCluster);
//   $('#heatPatch').css('visibility', 'visible');
//    map.addLayer(generalPermitLayer);
  }
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e){
  console.log(e);
  for (var index = 0; index < displayPermitTypes.length; ++index){
    if (e.layer === displayPermitTypes[index].testLayer) {
      displayPermitTypes[index].active = true;
      localPermitMarkers.addLayer(displayPermitTypes[index].actionLayer);
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
  for (var index = 0; index < displayPermitTypes.length; ++index){
    if (e.layer === displayPermitTypes[index].testLayer){
      displayPermitTypes[index].active = false;
      localPermitMarkers.removeLayer(displayPermitTypes[index].actionLayer);
    }
  }
});

function buildPermitInfo(inPermitType){
  console.log('Building displayPermitTypes');
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
  "County Permit Counts": generalPermitTestLayer
};


function buildGroupedOverlays(inPermitArray, inDisplayPermitTypes){
  var outGroupedOverlay = {};
  console.log(outGroupedOverlay);
  var types = inPermitArray.types;
  var layerNameTemplate = "<img src='<%=markerIcon%>' width='24' height='28'>&nbsp;<%=name%>";
  for (var type in types){
    var groupName = types[type].mediaAbbr + ' Permits';
    if (typeof(outGroupedOverlay[groupName]) === 'undefined'){
      outGroupedOverlay[groupName] = {};
    }
    
    var layerName = _.template(layerNameTemplate,types[type]);
    var testName = types[type].name;
    console.log(testName);
    for (var j in inDisplayPermitTypes){
      if (inDisplayPermitTypes[j].name === testName){
        outGroupedOverlay[groupName][layerName] = inDisplayPermitTypes[j].testLayer;
        console.log(outGroupedOverlay[groupName][layerName]);
        console.log(layerName);
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

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {


  var senateBH = new Bloodhound({
    name: "senateDistricts",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.title);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: politicalDistricts.Senate,
    limit: 10
  });

  senateBH.initialize();

  var houseBH = new Bloodhound({
    name: "houseDistricts",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.title);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: politicalDistricts.House,
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
    if (datum.source === "PoliticalDistricts") {
        datum.bounds = queryDistrict.findDistrict(datum, map);
        politicalDistrict = datum;
        legislativeDistricts.setWhere(getLegislativeWhere('Search'));
        permitCluster.setWhere(buildWhere(displayPermitTypes));
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
