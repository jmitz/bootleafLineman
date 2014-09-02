

var map, sidebar, countySearch = [];
var generalPermitLayer, legislativeDistricts;
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
  className: ''
});

var zoomControl = L.control.zoom({
  position: "topleft"
});

var measureControl = L.control.measure({
  position: 'topleft'
});

var permits = {
  url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/PermitReviewViewSingleService/FeatureServer/0',
  types: {
    AIR: {
      typeName: 'Bureau of Air',
      abbr: 'BOA',
      PERMIT: {
        name: 'FESOP or LSO Permits',
        mediaType: 'AIR',
        interestType: 'PERMIT',
        color: '#C563E6',
        markerIcon: 'img/airPermit.png',
        popupTemplate: "<h5>Air Permit - FESOP or LSO<h5><h3><%= properties.Name %></h3><p><%= properties.Address %><br><%= properties.City %>,  IL</p><p><%= properties.SiteId %></p>",
        markerTitle: "Name",
        abbr: 'FESOP'
      },
      ROSS: {
        name: 'ROSS Permits',
        mediaType: 'AIR',
        interestType: 'ROSS',
        color: '#C563B6',
        markerIcon: 'img/rossPermit.png',
        popupTemplate: "<h5>Air Permit - ROSS<h5><h3><%= properties.Name %></h3><p><%= properties.Address %><br><%= properties.City %>,  IL</p><p><%= properties.SiteId %></p>",
        markerTitle: "Name",
        abbr: 'ROSS'
      },
      USEPA: {
        name: 'CAAPP Permits',
        mediaType: 'AIR',
        interestType: 'USEPA',
        color: '#C56386',
        markerIcon: 'img/caappPermit.png',
        popupTemplate: "<h5>Air Permit - CAAPP<h5><h3><%= properties.Name %></h3><p><%= properties.Address %><br><%= properties.City %>,  IL</p><p><%= properties.SiteId %></p>",
        markerTitle: "Name",
        abbr: 'CAAPP'
      }
    },
    WATER: {
      typeName: 'Bureau of Water',
      abbr: 'BOW',
      BOW: {
        name: 'NPDES Permits',
        mediaType: 'WATER',
        interestType: 'BOW',
        color: '#88F0D3',
        markerIcon: 'img/npdesPermit.png',
        popupTemplate: "<h5>Water Permit - NPDES<h5><h3><%= properties.Name %></h3><p><%= properties.Address %><br><%= properties.City %>,  IL</p><p><%= properties.SiteId %></p>",
        markerTitle: "Name",
        abbr: 'NPDES'
      },
      PWS: {
        name: 'PWS Permits',
        mediaType: 'WATER',
        interestType: 'PWS',
        color: '#88F0D3',
        markerIcon: 'img/pwsPermit.png',
        popupTemplate: "<h5>Water Permit - NPDES<h5><h3><%= properties.Name %></h3><p><%= properties.Address %><br><%= properties.City %>,  IL</p><p><%= properties.SiteId %></p>",
        markerTitle: "Name",
        abbr: 'PWS'
      },
      CAFO: {
        name: 'CAFO Permits',
        mediaType: 'WATER',
        interestType: 'CAFO',
        color: '#88F0D3',
        markerIcon: 'img/cafoPermit.png',
        popupTemplate: "<h5>Water Permit - NPDES<h5><h3><%= properties.Name %></h3><p><%= properties.Address %><br><%= properties.City %>,  IL</p><p><%= properties.SiteId %></p>",
        markerTitle: "Name",
        abbr: 'CAFO'
      },
      WQ401: {
        name: 'WQ 401 Certification',
        mediaType: 'WATER',
        interestType: '401',
        color: '#88F0D3',
        markerIcon: 'img/wq401.png',
        popupTemplate: "<h5>Water Permit - NPDES<h5><h3><%= properties.Name %></h3><p><%= properties.Address %><br><%= properties.City %>,  IL</p><p><%= properties.SiteId %></p>",
        markerTitle: "Name",
        abbr: 'WQ401'
      },
      AGCHM: {
        name: 'Ag Chemical Certification',
        mediaType: 'WATER',
        interestType: 'AGCHM',
        color: '#88F0D3',
        markerIcon: 'img/agChem.png',
        popupTemplate: "<h5>Water Permit - NPDES<h5><h3><%= properties.Name %></h3><p><%= properties.Address %><br><%= properties.City %>,  IL</p><p><%= properties.SiteId %></p>",
        markerTitle: "Name",
        abbr: 'AGCHM'
      }
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

function milesApart(inLocation1, inLocation2){
  return Math.round((inLocation1.distanceTo(inLocation2) / 1609.34) * 10) / 10;
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

function milesToFieldOffice(inLocationInfo){
  var offices = countyList[inLocationInfo.county.CO_FIPS].offices;
  var outOfficeList = {};
  for (var office in offices){
    var testOffice = officeList[offices[office]];
    if (!outOfficeList[offices[office]]){
      outOfficeList[offices[office]]={
        name: testOffice.name,
        distance: milesApart(testOffice.location, inLocationInfo.inLocation),
        types: []
      };
    }
    outOfficeList[offices[office]].types.push(office);
  }
  var template = "<tr><td><%=name%> Field Office<br><%=types.join()%></td><td><%=distance%> miles</td></tr>";
  var outHtmls = [];
  for (var outOffice in outOfficeList){
    outHtmls.push(_.template(template, outOfficeList[outOffice]));
  }
  outHtml = outHtmls.join('');
  return outHtml;
}


function updateLocalInfo(inLocationInfo){
  if (!measureControl.isActive()){
    var reTable = /<\/table>/;

    infoPopup.setLatLng(inLocationInfo.inLocation)
      .setContent(inLocationInfo.htmlString.replace(reTable,milesToFieldOffice(inLocationInfo)))
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

localPermitMarkers.on("loading", function(evt){
  console.log('Permits Loading');
  $("#loading").show();
});

localPermitMarkers.on("load", function(evt){
  console.log('Permits Loaded');
  $("#loading").hide();
});

function bindPermitMarker(inGeoJson, inMarker){
  var permitType = permits.types[inGeoJson.properties.MediaCode][inGeoJson.properties.InterestType];
  inMarker.bindPopup(_.template(permitType.popupTemplate,inGeoJson));
}

function makePermitMarker(inGeoJson, inLatLng){
  var permitType = permits.types[inGeoJson.properties.MediaCode][inGeoJson.properties.InterestType];
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
  console.log(inVal);
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

permitCluster = new L.esri.ClusteredFeatureLayer(permits.url,{
  precision: 5,
  createMarker: makePermitMarker,
  onEachMarker: bindPermitMarker,
  where: standardWhere
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
  layers: [baseStreetMap, legislativeDistricts, generalPermitLayer],
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
    map.removeLayer(generalPermitLayer);
    $('#heatPatch').css('visibility', 'hidden');
    map.closePopup();
    map.addLayer(permitCluster);
  }
  else{
    map.removeLayer(permitCluster);
    $('#heatPatch').css('visibility', 'visible');
    map.addLayer(generalPermitLayer);
  }
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e){
  var index;
  for (index = 0; index < displayPermitTypes.length; ++index){
    if (e.layer === displayPermitTypes[index].testLayer) {
      displayPermitTypes[index].active = true;
      updatePermitDisplay();
    }
  }
});

map.on('popupclose', function(e){
  infoPopupFlag = false;
});

map.on('overlayremove', function(e){
  var index;
  var removeLayer;
  for (index = 0; index < displayPermitTypes.length; ++index){
    if (e.layer === displayPermitTypes[index].testLayer){
      displayPermitTypes[index].active = false;
      updatePermitDisplay();
    }
  }
});

function buildPermitInfo(inPermitType){
  var newPermitLayer = {};
  newPermitLayer.name = inPermitType.name;
  newPermitLayer.testLayer = L.geoJson(null);
  newPermitLayer.mediaType = inPermitType.mediaType;
  newPermitLayer.interestType = inPermitType.interestType;
  newPermitLayer.active = true;
  map.addLayer(newPermitLayer.testLayer);
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
  "State House Districts": "TEST"
};


function buildGroupedOverlays(inPermitArray, inDisplayPermitTypes){
  var outGroupedOverlay = {};
  var types = inPermitArray.types;
  var layerNameTemplate = "<img src='<%=markerIcon%>' width='24' height='28'>&nbsp;<%=name%>";
  for (var type in types){
    if (types[type].hasOwnProperty('abbr')){
      var group = types[type];
      var groupName = types[type].abbr + ' Permits';
      outGroupedOverlay[groupName] = {};
      for (var layer in group){
        if (group[layer].hasOwnProperty('abbr')){
          var layerName = _.template(layerNameTemplate,group[layer]);
          var testName = group[layer].name;
          for (var j in inDisplayPermitTypes){
            if (inDisplayPermitTypes[j].name === testName){
              outGroupedOverlay[groupName][layerName] = inDisplayPermitTypes[j].testLayer;
            }
          }
        }
      }
    }
  }
  return outGroupedOverlay;
}

var groupedOverlays = buildGroupedOverlays(permits, displayPermitTypes);
//Build with Function
// var groupedOverlays = {
//   "BOA Permits": {
//     "<img src='img/airPermit.png' width='24' height='28'>&nbsp;FESOP or LSO  Permits": displayPermitTypes[0].testLayer,
//     "<img src='img/rossPermit.png' width='24' height='28'>&nbsp;ROSS Permits": displayPermitTypes[1].testLayer,
//     "<img src='img/caappPermit.png' width='24' height='28'>&nbsp;CAAPP Permits": displayPermitTypes[2].testLayer
//   },
//   "BOW Permits": {
//     "<img src='img/npdesPermit.png' width='24' height='28'>&nbsp;NPDES Permits": displayPermitTypes[3].testLayer,
//     "<img src='img/npdesPermit.png' width='24' height='28'>&nbsp;PWS Permits": displayPermitTypes[4].testLayer,
//     "<img src='img/npdesPermit.png' width='24' height='28'>&nbsp;CAFO Permits": displayPermitTypes[5].testLayer,
//     "<img src='img/npdesPermit.png' width='24' height='28'>&nbsp;WQ 401 Certifications": displayPermitTypes[6].testLayer,
//     "<img src='img/npdesPermit.png' width='24' height='28'>&nbsp;Ag Chemical Certifications": displayPermitTypes[7].testLayer
//   }
// };

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
}).addTo(map);

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
