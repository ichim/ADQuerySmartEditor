define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    'dojo/_base/lang',
    'dojo/_base/array',

    "./config",

    "esri/layers/FeatureLayer",
    "esri/tasks/query",
        "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/Color",

    "esri/tasks/ProjectParameters",
    "esri/tasks/GeometryService",
    "esri/tasks/BufferParameters"

], function (
        declare,
        _WidgetBase,
        _TemplatedMixin,
        lang,
        array,

        config,

        FeatureLayer,
        Query,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        SimpleFillSymbol,
        Color,

        ProjectParameters,
        GeometryService,
        BufferParameters

        ) {
    var clasa = new declare([], {
        postCreate: function () {

        },
        constructor: function () {
            declare.safeMixin(this, arguments);
            this.map = arguments[0].map;
            this.configInfos = arguments[0].configInfos;

        },
        verificaSiExecuta:function( callback)
        {
            var objectid = this.param()['objectid']
            if (typeof objectid !== 'undefined')
            {
                var raspuns = { feature: null, currentLayerInfo: null }
                var featureLayer = new FeatureLayer(config.urlFeatureLayer);
                featureLayer.on('load', lang.hitch(this, (result) => {
                    var query = new Query();
                    query.objectIds = [objectid];
                    query.outFields = ["*"];

                    result.layer.queryFeatures(query, lang.hitch(this, (featureSet) => {
                        if (featureSet.features.length == 1) {
                            var featureCurent = featureSet.features[0]
                            this.map.infoWindow.hide();
                            var layers = this.map.getLayersVisibleAtScale().filter(lang.hitch(this, function (lyr) {

                                if (lyr.type && lyr.type === "Feature Layer" && lyr.url) {
                                    return array.some(this.configInfos, function (configInfo) {
                                        if (configInfo.layerId === lyr.id &&
                                          configInfo.configFeatureLayer.layerAllowsUpdate === true) {
                                            return true;
                                        }
                                        else {
                                            return false;
                                        }
                                    });
                                }
                                else {
                                    return false;
                                }
                            }));

                            array.forEach(layers, lang.hitch(this, function (layer) {

                                featureCurent = featureSet.features[0];

                                if (featureCurent._layer.name == layer.name) {
                                    this.currentLayerInfo = this._getLayerInfoByID(layer.id);
                                    layer.setSelectionSymbol(this._getSelectionSymbol(layer.geometryType, false));

                                    var selectQuery = new Query();
                                    featureCurent.attributes.hasOwnProperty =  ()=> { return true; };
                                    featureCurent.preEditAttrs = JSON.parse(JSON.stringify(featureCurent.attributes));;
                                    console.log(layer.spatialReference)
                                    console.log(featureSet.features[0].geometry.spatialReference)
                                                                                                                                        //Linia 95
                                    this._project(featureSet.features[0].geometry, lang.hitch(this, (projectResult) => {                //
                                        if (projectResult!==null && typeof projectResult!=='undefined' && projectResult.length === 1)   //
                                        {                                                                                               //
                                            console.log(JSON.stringify(projectResult[0]))
                                            //selectQuery.geometry = projectResult[0];                                                    //
                                            selectQuery.objectIds = [objectid];
                                            layer.selectFeatures(selectQuery,
                                              FeatureLayer.SELECTION_NEW,
                                              lang.hitch(this, (features) => {
                                                  //zoom pe feature
                                                  if (features.length == 1)
                                                      this.map.centerAndZoom(features[0].geometry, 12);

                                              }));
                                        }                                                                                               //
                                    }));                                                                                                //

                                    raspuns['feature'] = featureCurent;
                                    raspuns['currentLayerInfo'] = this.currentLayerInfo;
                                    callback(raspuns)
                                } else { callback(null); }
                            }));
                        }
                    }));
                }));
            } else {
                callback(-1);
            }
        },
        _project:function(point,callback)
        {
            var geometryService = new GeometryService(config.urlGeometryService);
            var params = new ProjectParameters();
            params.geometries = [point];
            params.outSR = this.map.spatialReference;
            
            geometryService.project(params, function (result) {
                callback(result);
            });
        },
        _buffer:function(point, callback)
        {
            var geometryService = new GeometryService(config.urlGeometryService);
            var params = new BufferParameters();
            params.geometries = [point];

            params.distances = [10];
            params.unit = GeometryService.UNIT_METER;
            params.bufferSpatialReference = point.spatialReference;
            params.outSpatialReference = point.spatialReference;
            geometryService.buffer(params, (result) => {
                callback(result);
            });
        },
        _getLayerInfoByID: function (id) {

            if (id.indexOf("_lfl") > 0) {
                id = id.replace("_lfl", "");
            }
            var result = null;
            this.configInfos.some(function (configInfo) {
                return configInfo.featureLayer.id === id ? ((result = configInfo), true) : false;
            });
            return result;

        },
        _getSelectionSymbol: function (geometryType, highlight) {
            if (!geometryType || geometryType === "") { return null; }

            var selectionSymbol;
            switch (geometryType) {
                case "esriGeometryPoint":
                    if (highlight === true) {
                        selectionSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE,
                                          20,
                                          new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                              new Color([255, 0, 0, 1]), 2),
                                          new Color([0, 230, 169, 0.65]));
                    } else {
                        selectionSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE,
                                          20,
                                          new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                              new Color([255, 0, 0, 1]), 2),
                                           new Color([255, 255, 0, 0.65]));
                    }
                    break;
                case "esriGeometryPolyline":
                    if (highlight === true) {
                        selectionSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                              new Color([0, 255, 255, 0.65]), 2);
                    } else {
                        selectionSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                              new Color([0, 230, 169, 0.65]), 2);
                    }
                    break;
                case "esriGeometryPolygon":
                    var line;
                    if (highlight === true) {
                        selectionSymbol = new SimpleFillSymbol().setColor(new Color([0, 230, 169, 0.65]));
                        line = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([192, 192, 192, 1]), 2);
                    } else { 
                        selectionSymbol = new SimpleFillSymbol().setColor(new Color([255, 255, 0, 0.65]));
                        line = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([192, 192, 192, 1]), 2);
                    }
                    selectionSymbol.setOutline(line);
                    break;
            }
            return selectionSymbol;
        },
        param: function () {

            var parse = function (params, pairs) {
                var pair = pairs[0];
                var parts = pair.split('=');
                var key = decodeURIComponent(parts[0]);
                var value = decodeURIComponent(parts.slice(1).join('='));
                if (typeof params[key] === "undefined") {
                    params[key] = value;
                } else {
                    params[key] = [].concat(params[key], value);
                }

                return pairs.length == 1 ? params : parse(params, pairs.slice(1))
            }
            return document.location.search.length == 0 ? {} : parse({}, document.location.search.substr(1).split('&'));
        }


    });
    return clasa;
});