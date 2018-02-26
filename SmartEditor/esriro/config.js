define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin"

], function (
        declare,
        _WidgetBase,
        _TemplatedMixin

        ) {
    var clasa = {
        urlFeatureLayer: 'https://services6.arcgis.com/Uwg97gPMK3qqaMen/arcgis/rest/services/HSSEInicdents/FeatureServer/0?token=-9dh1cRoZ4-E2RvhlUuJ2kPvxqSq32x6_LxvQV9q85IswlebkMqA3lFIOjd6AQY9f8c9BwJ1sDzZnpIYDL1S5geJ7Or97ie-msjXWZ9IAXW-eSjU7JoFxxX2W19DltB3_6LLMlTKwclmMbYJMmPmxX_SX7IbMOs1M5ZyhWdwq9hbOWK0I1gRa-X9XVk-afZm6nO9dLf_0eXKDbtGFsnrCLoLvuUj4FgJUp8vc80KfWuP7wfzi1dt75oMuxLqcfHU',
        urlGeometryService: 'http://localhost:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer'

    };
    return clasa;
});