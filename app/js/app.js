var map, sidebar, countySearch = []; //, theaterSearch = [], museumSearch = [];
var featureCount = 0;
var permitCount;
var permitTypes = [{
  name: 'FESOP or LSO Permits',
  interestType: 'PERMIT',
  mediaType: 'Air',
  color: '#C563E6',
  markerIcon: 'img/airPermit.png',
  url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/AcesPermits/FeatureServer/1',
  popupTemplate: "<h5>Air Permit - FESOP or LSO<h5><h3><%= properties.NAME %></h3><p><%= properties.LOCATION_ADDR_3 %><br><%= properties.CITY_NAME %>,  IL</p><p><%= properties.SITE_ID %></p>",
  markerTitle: "NAME"
},
{
  name: 'ROSS Permits',
  interestType: 'ROSS',
  mediaType: 'Air',
  color: '#C563E6',
  markerIcon: 'img/rossPermit.png',
  url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/AcesPermits/FeatureServer/2',
  popupTemplate: "<h5>Air Permit - ROSS<h5><h3><%= properties.NAME %></h3><p><%= properties.LOCATION_ADDR_3 %><br><%= properties.CITY_NAME %>,  IL</p><p><%= properties.SITE_ID %></p>",
  markerTitle: "NAME"
},
{
  name: 'CAAPP Permits',
  interestType: 'USEPA',
  mediaType: 'Air',
  color: '#C563E6',
  markerIcon: 'img/caappPermit.png',
  url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/AcesPermits/FeatureServer/3',
  popupTemplate: "<h5>Air Permit - CAAPP<h5><h3><%= properties.NAME %></h3><p><%= properties.LOCATION_ADDR_3 %><br><%= properties.CITY_NAME %>,  IL</p><p><%= properties.SITE_ID %></p>",
  markerTitle: "NAME"
},
{
  name: 'NPDES Permits',
  interestType: 'BOW',
  mediaType: 'Water',
  color: '#88F0D3',
  markerIcon: 'img/npdesPermit.png',
  url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/AcesPermits/FeatureServer/4',
  popupTemplate: "<h5>Water Permit - NPDES<h5><h3><%= properties.NAME %></h3><p><%= properties.LOCATION_ADDR_3 %><br><%= properties.CITY_NAME %>,  IL</p><p><%= properties.SITE_ID %></p>",
  markerTitle: "NAME"
}
];

$.getJSON('data/permitCount.json', function(data){
  permitCount = data;
});

var maxMapBounds = L.latLngBounds(L.latLng(36.9, -91.6),L.latLng(42.6, -87.4));

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

function getViewport() {
  if (sidebar.isVisible()) {
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

function buildCountyChartOptions(countyAttributes){
  var options = {
    data: [
    {
      value: countyAttributes.Total_BOA,
      color:"#C563E6",
      label: 'BOA',
      labelColor: '#000',
      labelFontSize: '.8em'
    },
    {
      value : countyAttributes.Total_BOW,
      color : "#88F0D3",
      label: 'BOW',
      labelColor: '#000',
      labelFontSize: '.8em'
    }
    ]
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
]
};

dispChart('stateChart', stateChartOptions);

$(document).ready(function() {
  getViewport();
  /* Hack to refresh tabs after append */
  $("#poi-tabs a[href='#museums']").tab("show");
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
var baseSatteliteMap = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});
var baseSatteliteWithTransportMap = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);

/* Overlay Layers */
function colorCountyFeature(feature){
  var colorVal = '#F00';
  if (feature.properties.TotalBOA_BOW < 50){
    colorVal = '#0FF';
  }
  else if (feature.properties.TotalBOA_BOW < 100){
    colorVal = '#0F0';
  }
  else if (feature.properties.TotalBOA_BOW < 300){
    colorVal = '#FF0';
  }
  else if (feature.properties.TotalBOA_BOW < 1000){
    colorVal = '#F60';
  }
  return {color: colorVal};
}

function configureCountyFeature(feature, layer) {
  countySearch.push({
    name: layer.feature.properties.NAME_LC,
    source: "Counties",
    id: L.stamp(layer),
    bounds: layer.getBounds()
  });
  layer.on('mouseover mousemove', function(e){
    var hover_bubble = new L.Rrose({
      offset: new L.Point(0,-10),
      closeButton: false,
      autoPan: false}
      ).setContent('<p>'+feature.properties.NAME_LC+'<br>'+feature.properties.TotalBOA_BOW + ' Permits</p>')
    .setLatLng(e.latlng)
    .openOn(map);
  });
  layer.on('mouseout', function(e){
    map.closePopup();
  });
  layer.on('click', function(e){
    if (!sidebar.isVisible()){
      sidebar.show();
    }
    var html = '<h4>{{CountyName}} County</h4><p><canvas id="localChart" class="pieChart"></canvas></p><span id="localTable"></span>';
    $('#divFeatureInfo').html('<h4>'+feature.properties.NAME_LC+' County</h4><p><canvas id="localChart" class="pieChart"></canvas></p><span id="localTable"></span>');
    dispChart("localChart",buildCountyChartOptions(feature.properties));
       // Put together an UL with the Total Permits for the County and the Total for each of the bureaus.
       var infoHtml = '<ul><li>Total Permits - ' + feature.properties.TotalBOA_BOW + '</li><li>Bureau of Air - ' +
       feature.properties.Total_BOA + '</li><li>Bureau of Water - ' +
       feature.properties.Total_BOW + '</li></ul>';
       $('#localTable').html(infoHtml);
     });
  layer.on('dblclick', function(e){
    console.log('doubleclick');
    map.fitBounds(e.target.getBounds());

  });
}

var generalPermitLayer = new L.esri.FeatureLayer("http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/TPservices/PermitTotalsCounty_WM/FeatureServer/0", {
  style: colorCountyFeature,
  onEachFeature: configureCountyFeature
});


var localPermitLayer = new L.LayerGroup();

/* Single marker cluster layer to hold all clusters */
var permitMarkers = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true
});

function makePermitMarker(inPermitType){
  return function(geojson, latlng){
    return L.marker(latlng, {icon: L.icon({
      iconUrl: inPermitType.markerIcon,
      iconRetinaUrl: inPermitType.markerIcon,
      iconSize: [32, 37],
      iconAnchor: [16, 37],
      popupAnchor:[0, -27]
    }),
    title: geojson.properties[inPermitType.markerTitle],
    riseOnHover: true
  });
  };
}

function makePermitBindMarker(inPermitType){
  return function(geojson, marker){
    marker.bindPopup(_.template(inPermitType.popupTemplate,geojson));
    featureCount++;
  };
}

function loadFeatureLayerInfos (featureArray){
  var layerInfos = [];
  var index;
  for (index = 0; index < featureArray.length; ++index){
    var newFeatureLayer = {};
    newFeatureLayer.name = permitTypes[index].name;
    newFeatureLayer.testLayer = L.geoJson(null);
    newFeatureLayer.url = permitTypes[index].url;
    newFeatureLayer.bindMarker = makePermitBindMarker(permitTypes[index]);
    newFeatureLayer.createMarker = makePermitMarker(permitTypes[index]);
    layerInfos.push(newFeatureLayer);
  }
  return layerInfos;
}

var featureLayerInfos = loadFeatureLayerInfos(permitTypes);

function loadFeatureLayer (featureLayerInfo, markerLayer, loadLayer){
  var curLayer = new L.esri.ClusteredFeatureLayer(featureLayerInfo.url,{
    cluster: markerLayer,
    createMarker: featureLayerInfo.createMarker,
    onEachMarker: featureLayerInfo.bindMarker
  });
  loadLayer.addLayer(curLayer);
}

function addFeatureLayers (inArray, loadLayer){
  permitMarkers.clearLayers();
  var index;
  for(index = 0; index < inArray.length; ++index){
    loadFeatureLayer(featureLayerInfos[inArray[index]], permitMarkers, loadLayer);
  }
}

addFeatureLayers([0, 1, 2, 3], localPermitLayer);


map = L.map("map", {
  maxZoom: 17,
  minZoom:6,
  zoom: 7,
  center: [40, -89.5],
  layers: [baseStreetMap, generalPermitLayer],
  zoomControl: false,
  attributionControl: true,
//      maxBounds: maxMapBounds,
bounceAtZoomLimits: false
});

map.on('viewreset', function(e){
  console.log(map.getZoom());
  if (map.getZoom()>10){
    map.removeLayer(generalPermitLayer);
    $('#heatPatch').css('visibility', 'hidden');
    map.closePopup();
    map.addLayer(localPermitLayer);
  }
  else{
    map.removeLayer(localPermitLayer);
    $('#heatPatch').css('visibility', 'visible');
    map.addLayer(generalPermitLayer);
  }
});

/* Layer control listeners that allow for a single markerClusters layer */
// map.on("overlayadd", function(e) {
//   if (e.layer === featureLayerInfos[0].testLayer) {
//     markerClusters.addLayer(theaters);
//   }
//   if (e.layer === museumLayer) {
//     markerClusters.addLayer(museums);
//   }
// });

// map.on("overlayremove", function(e) {
//   if (e.layer === featureLayerInfos[0].testLayer) {
//     markerClusters.removeLayer(theaters);
//   }
//   if (e.layer === museumLayer) {
//     markerClusters.removeLayer(museums);
//   }
// });

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

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "icon-direction",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 17,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

// var baseLayers = {
//   "Street Map": baseStreetMap,
//   "Aerial Imagery": baseSatteliteMap,
//   "Imagery with Streets": baseSatteliteWithTransportMap
// };

var groupedOverlays = {
  "Permit Types": {
    "<img src='assets/img/airPemit.png' width='24' height='28'>&nbsp;FESOP or LSO  Permits": featureLayerInfos[0].testLayer,
    "<img src='assets/img/rossPemit.png' width='24' height='28'>&nbsp;ROSS Permits": featureLayerInfos[1].testLayer,
    "<img src='assets/img/caappPemit.png' width='24' height='28'>&nbsp;CAAPP Permits": featureLayerInfos[2].testLayer,
    "<img src='assets/img/npdesPermit.png' width='24' height='28'>&nbsp;NPDES Permits": featureLayerInfos[3].testLayer
  },
  "Reference":{
    "Counties": generalPermitLayer
  }
};

/* Larger screens get expanded layer control */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var layerControl = L.control.groupedLayers(groupedOverlays, {
  collapsed: isCollapsed,
  closeButton: true,
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
  /* Fit map to boroughs bounds */
  map.fitBounds(generalPermitLayer.getBounds());
  $("#loading").hide();

  var countyBH = new Bloodhound({
    name: "Counties",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: countySearch,
    limit: 10
  });

  countyBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Counties",
    displayKey: "name",
    source: countyBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Counties</h4>"
    }}).on("typeahead:selected", function (obj, datum) {
      if (datum.source === "Counties") {
        map.fitBounds(datum.bounds);
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
