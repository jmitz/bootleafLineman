(function(){
  self.Locator = function(options){
    // options
    // serviceUrl - url of location map service
    // serviceExtent - Maximum extent of location service {xmin:, xmax:, ymix:, ymax:, spatialReference:{wkid:}} Default {xmin:-91.6,ymin:36.942,xmax:-87.523,ymax:42.507}
    // serviceExtent - Spatial reference - wkid of service - default {wkid: 4326}
    // serviceDisplaySize - Array of the  size of the pseudodislpay 
    var inputOptions = (typeof(options)==='object')?options:{};
    this.map = L.Map();
    this.serviceUrl = (typeof(inputOptions.serviceUrl) === 'string')?inputOptions.serviceUrl:'http://geoservices.epa.illinois.gov/ArcGIS/rest/services/SWAP/Location/MapServer/identify';
    this.spatialReference = (typeof(inputOptions.spatialReference) === 'number')?inputOptions.spatialReference:4326;
    this.serviceExtent = (typeof(inputOptions.serviceExtent) === 'object')?inputOptions.serviceExtent:{xmin:-91.6,ymin:36.942,xmax:-87.523,ymax:42.507,spatialReference:{wkid:this.spatialReference}};
    this.serviceDisplaySize = (typeof(inputOptions.serviceDisplaySize) === 'object')?inputOptions.serviceDisplaySize:[407700, 556500, 96];
    this.parameters = {
      f: 'json',
      tolerance: 0,
      returnGeometry: false,
      mapExtent: JSON.stringify(this.serviceExtent),
      imageDisplay: this.serviceDisplaySize.join(),
      geometryType: 'esriGeometryPoint',
      sr: this.spatialReference,
      layers: 'all'
    };
  };

  function formatLocationInfo (inLatLng, inLocationInfo){
    var outVals={
      inLocation: inLatLng,
      inResults: inLocationInfo
    };
    var precision = Math.round((this.map.getZoom()-4.5)*0.333);
    var templateData = {
      lat: inLatLng.lat.toPrecision(2+precision),
      lng: inLatLng.lng.toPrecision(2+precision)
    };
    var recordHtmls = [];
    /*jshint multistr: true */
    var template = '<table><tr><td>Latitude</td><td><%=lat%></td></tr>\
      <tr><td>Longitude</td><td><%=lng%></td></tr>\
      <%=ejHtml%><%=recordHtml%></table>';
    var infoRowTemplate = '<tr><td><%=field%></td><td><%=value%></td></tr>';
    var ejStatusCalc = {
      1: {
        minority: 0,
        poverty: 0
      },
      11: {
        minority: 0,
        poverty: 0
      },
      checkEj: function (inEjStatus, accumulator){
        if (inEjStatus >= 2){
          accumulator.poverty = 2;
        }
        if (inEjStatus % 2 === 1){
          accumulator.minority = 1;
        }
      },
      sumEj: function(accumulator){
        return accumulator.poverty + accumulator.minority;
      },
      htmlOut: function(){
        var returnValue = "<tr><td>Environmental Justice</td><td><span id='ej'>" + (ejStatusCalc.sumEj(ejStatusCalc[11])===0?"No":"Yes") + "</span>\
          <span id='ejVal' style='visibility: hidden;'>" + ejStatusCalc.sumEj(ejStatusCalc[11]) + "</span>\
          <span id='ejInVal' style='visibility: hidden;'>" + ejStatusCalc.sumEj(ejStatusCalc[1]) + "</span></td></tr>";
        return returnValue;
      }
    };
    var locationInfo = inLocationInfo.results;
    for (var record in locationInfo){
      var layerName = locationInfo[record].layerName;
      var fieldName = locationInfo[record].displayFieldName;
      var fieldValue = locationInfo[record].value;
      switch(locationInfo[record].layerId){
      case 1: // Environmental Justice
        ejStatusCalc.checkEj(locationInfo[record].attributes.EJstatus, ejStatusCalc[1]);
        break;
      case 3: // State House
        fieldValue="<span id='stateHouse'>" + politicalDistricts.House[fieldValue].name + "</span>";
        outVals.house = locationInfo[record].attributes;
        break;
      case 4: // Senate Districts
        fieldValue="<span id='stateSenate'>" + politicalDistricts.Senate[fieldValue].name + "</span>";
        outVals.senate = locationInfo[record].attributes;
        break;
      case 5: // Congressional Districts
        fieldValue="<span id='congress'>" + fieldValue + "</span>";
        break;
      case 10: // Counties
        outVals.county = locationInfo[record].attributes;
        var fipsStr = ""+locationInfo[record].attributes.CO_FIPS;
        var pad = "000";
        fieldValue = locationInfo[record].attributes.COUNTY_NAM + "<br>FIPS - <span id='fips'>" +  
        pad.substr(0, pad.length - fipsStr.length) + fipsStr + "</span>";
        break;
      case 11: // EJ buffers
        ejStatusCalc.checkEj(locationInfo[record].attributes.EJstatus, ejStatusCalc[11]);
        break;
      }
      if (locationInfo[record].layerId!==1 && locationInfo[record].layerId!==11){
        recordHtmls.push(_.template(infoRowTemplate,{
            field: layerName,
            value: fieldValue
          })
        );
      }
    }
    templateData.ejHtml = ejStatusCalc.htmlOut();
    templateData.recordHtml = recordHtmls.join("");
    console.log(templateData);
    outVals.htmlString = _.template(template,templateData);
    return outVals;
  }

  function prepareGeometry(inLocation){
    var geometry = {
      x: inLocation.lng,
      y: inLocation.lat,
      spatialReference: {
        wkid: this.spatialReference
      }
    };
    return JSON.stringify(geometry);
  }

  function onClick(evt){
    var geometry = {
      x: evt.latlng.lng,
      y: evt.latlng.lat,
      spatialReference: {
        wkid: this.spatialReference
      }
    };
    var popup = L.popup();
    var map = this.map;
    this.parameters.geometry = prepareGeometry(evt.latlng);
    $.getJSON(this.serviceUrl, this.parameters, function(data){
      popup.setLatLng(evt.latlng)
      .setContent(formatLocationInfo(evt.latlng, data).htmlString)
      .openOn(map);
    });
  }

  Locator.prototype = {
    addTo: function(inMap){
      this.map = inMap;
      L.DomEvent.on(inMap, 'click', onClick, this);
    },
    getLocationInfo: function(inLocation, inReturnFunction){
      this.parameters.geometry = prepareGeometry(inLocation);
      $.getJSON(this.serviceUrl, this.parameters, function(data){
        var returnObject = {
          location: inLocation,
          results: data.results
        };
        inReturnFunction(formatLocationInfo(inLocation, data));
      });
    }
  };
})();
