/*
MIT License

Copyright (c) 2022 Arnaud Leclerc

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function (exports, azmaps, azanimations, scalebar, overviewmap, geolocationcontrol, fullscreencontrol, griddeddatasource, azdrawings, indoor) {
    'use strict';

    var Extensions = /** @class */ (function () {
        function Extensions() {
        }
        return Extensions;
    }());

    var toMarkerEvent = function (event, markerId) {
        var _a;
        var result = { type: event.type, markerId: markerId };
        var targetOptions = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.options;
        if (targetOptions) {
            result.options = {
                anchor: targetOptions.anchor,
                color: targetOptions.color,
                draggable: targetOptions.draggable,
                htmlContent: targetOptions.htmlContent,
                pixelOffset: targetOptions.pixelOffset,
                position: targetOptions.position,
                secondaryColor: targetOptions.secondaryColor,
                text: targetOptions.text,
                visible: targetOptions.visible
            };
        }
        return result;
    };

    var mapEvents = [
        'boxzoomend',
        'boxzoomstart',
        'drag',
        'dragend',
        'dragstart',
        'idle',
        'load',
        'move',
        'moveend',
        'movestart',
        'pitch',
        'pitchend',
        'pitchstart',
        'render',
        'resize',
        'rotate',
        'rotateend',
        'tokenacquired',
        'wheel',
        'zoom',
        'zoomend',
        'zoomstart'
    ];
    var mapMouseEvents = [
        'click',
        'contextmenu',
        'dblclick',
        'mousedown',
        'mousemove',
        'mouseout',
        'mouseover',
        'mouseup'
    ];
    var mapDataEvents = [
        'data',
        'sourcedata',
        'styledata'
    ];
    var mapLayerEvents = [
        'layeradded',
        'layerremoved'
    ];
    var mapSourceEvents = [
        'sourceadded',
        'sourceremoved'
    ];
    var mapStringEvents = [
        'styleimagemissing'
    ];
    var mapTouchEvents = [
        'touchcancel',
        'touchend',
        'touchstart'
    ];

    var Core = /** @class */ (function () {
        function Core() {
        }
        Core.addControls = function (controls) {
            var _this = this;
            controls.forEach(function (control) {
                var mapControl;
                switch (control.type) {
                    case 'compass':
                        mapControl = new azmaps.control.CompassControl(control.options);
                        break;
                    case 'pitch':
                        mapControl = new azmaps.control.PitchControl(control.options);
                        break;
                    case 'style':
                        mapControl = new azmaps.control.StyleControl(control.options);
                        break;
                    case 'zoom':
                        mapControl = new azmaps.control.ZoomControl(control.options);
                        break;
                    case 'scalebar':
                        mapControl = new scalebar.control.ScaleBarControl(control.options);
                        break;
                    case 'overviewmap':
                        mapControl = new overviewmap.control.OverviewMap(control.options);
                        break;
                    case 'geolocation':
                        mapControl = new geolocationcontrol.control.GeolocationControl(control.options);
                        break;
                    case 'fullscreen':
                        mapControl = new fullscreencontrol.control.FullscreenControl(control.options);
                        break;
                }
                mapControl.amc = {
                    id: control.id
                };
                _this._map.controls.add(mapControl, {
                    position: control.position
                });
            });
        };
        Core.addHtmlMarkers = function (htmlMarkerDefinitions, eventHelper) {
            var _this = this;
            htmlMarkerDefinitions.forEach(function (htmlMarkerDefinition) {
                var marker = _this.getHtmlMarkerFromDefinition(htmlMarkerDefinition);
                if (htmlMarkerDefinition.events) {
                    htmlMarkerDefinition.events.forEach(function (htmlMarkerEvent) {
                        _this._map.events.add(htmlMarkerEvent, marker, function (event) {
                            eventHelper.invokeMethodAsync('NotifyEventAsync', toMarkerEvent(event, marker.amc.id));
                        });
                    });
                }
                _this._map.markers.add(marker);
            });
        };
        Core.getHtmlMarkerFromDefinition = function (htmlMarkerOptions) {
            var options = {
                anchor: htmlMarkerOptions.options.anchor,
                color: htmlMarkerOptions.options.color,
                draggable: htmlMarkerOptions.options.draggable,
                htmlContent: htmlMarkerOptions.options.htmlContent,
                pixelOffset: htmlMarkerOptions.options.pixelOffset,
                position: htmlMarkerOptions.options.position,
                secondaryColor: htmlMarkerOptions.options.secondaryColor,
                text: htmlMarkerOptions.options.text,
                visible: htmlMarkerOptions.options.visible
            };
            if (htmlMarkerOptions.popupOptions) {
                options.popup = new azmaps.Popup(htmlMarkerOptions.popupOptions.options);
            }
            var marker = new azmaps.HtmlMarker(options);
            marker.amc = {
                id: htmlMarkerOptions.id
            };
            return marker;
        };
        Core.attachEventsToHtmlMarker = function (marker, events, eventHelper) {
            var _this = this;
            events.forEach(function (htmlMarkerEvent) {
                _this._map.events.add(htmlMarkerEvent, marker, function (event) {
                    eventHelper.invokeMethodAsync('NotifyEventAsync', toMarkerEvent(event, marker.amc.id));
                });
            });
        };
        Core.addLayer = function (id, before, layerType, layerOptions, enabledEvents, eventHelper) {
            var _this = this;
            var layer;
            switch (layerType) {
                case 'tileLayer':
                    layer = new azmaps.layer.TileLayer(layerOptions, id);
                    break;
                case 'imageLayer':
                    layer = new azmaps.layer.ImageLayer(layerOptions, id);
                    break;
                case 'bubbleLayer':
                    layer = new azmaps.layer.BubbleLayer(this._map.sources.getById(layerOptions.source), id, layerOptions);
                    break;
                case 'heatmapLayer':
                    layer = new azmaps.layer.HeatMapLayer(this._map.sources.getById(layerOptions.source), id, layerOptions);
                    break;
                case 'lineLayer':
                    layer = new azmaps.layer.LineLayer(this._map.sources.getById(layerOptions.source), id, layerOptions);
                    break;
                case 'polygonExtrusionLayer':
                    layer = new azmaps.layer.PolygonExtrusionLayer(this._map.sources.getById(layerOptions.source), id, layerOptions);
                    break;
                case 'polygonLayer':
                    layer = new azmaps.layer.PolygonLayer(this._map.sources.getById(layerOptions.source), id, layerOptions);
                    break;
                case 'symbolLayer':
                    layer = new azmaps.layer.SymbolLayer(this._map.sources.getById(layerOptions.source), id, layerOptions);
                    break;
            }
            if (layer) {
                enabledEvents.forEach(function (layerEvent) {
                    _this._map.events.add(layerEvent, layer, function (e) {
                        var _a, _b;
                        eventHelper.invokeMethodAsync('NotifyEventAsync', {
                            type: layerEvent,
                            layerId: layer.getId(),
                            pixel: e.pixel,
                            pixels: e.pixels,
                            position: e.position,
                            positions: e.positions,
                            shapes: (_a = e.shapes) === null || _a === void 0 ? void 0 : _a.filter(function (shape) { return shape instanceof azmaps.Shape; }).map(function (shape) { return _this.getSerializableShape(shape); }),
                            features: (_b = e.shapes) === null || _b === void 0 ? void 0 : _b.filter(function (shape) { return shape instanceof azmaps.data.Feature || shape.type === 'Feature'; }).map(function (feature) { return _this.getSerializableFeature(feature); })
                        });
                    });
                });
                this._map.layers.add(layer, before);
            }
        };
        Core.addMap = function (mapId, configuration, serviceOptions, enabledEvents, eventHelper) {
            var _this = this;
            if (configuration.authType === 'aad') {
                azmaps.setAuthenticationOptions({
                    authType: configuration.authType,
                    aadAppId: configuration.aadAppId,
                    aadTenant: configuration.aadTenant,
                    clientId: configuration.clientId
                });
            }
            else if (configuration.authType === 'subscriptionKey') {
                azmaps.setAuthenticationOptions({
                    authType: configuration.authType,
                    subscriptionKey: configuration.subscriptionKey,
                    clientId: configuration.clientId
                });
            }
            else {
                azmaps.setAuthenticationOptions({
                    authType: configuration.authType,
                    getToken: Extensions.getTokenCallback,
                    clientId: configuration.clientId
                });
            }
            var map = new azmaps.Map(mapId, serviceOptions);
            if (enabledEvents.includes('error')) {
                map.events.add('error', function (event) {
                    eventHelper.invokeMethodAsync('NotifyEventAsync', {
                        type: event.type,
                        error: event.error.stack
                    });
                });
            }
            map.events.addOnce('ready', function (event) {
                _this._map = map;
                eventHelper.invokeMethodAsync('NotifyEventAsync', { type: event.type });
                mapEvents.filter(function (value) { return enabledEvents.includes(value); }).forEach(function (value) {
                    map.events.add(value, function () {
                        eventHelper.invokeMethodAsync('NotifyEventAsync', { type: value });
                    });
                });
                mapMouseEvents.filter(function (value) { return enabledEvents.includes(value); }).forEach(function (value) {
                    map.events.add(value, function (mouseEvent) {
                        var _a, _b;
                        eventHelper.invokeMethodAsync('NotifyEventAsync', {
                            type: value,
                            layerId: mouseEvent.layerId,
                            pixel: mouseEvent.pixel,
                            position: mouseEvent.position,
                            shapes: (_a = mouseEvent.shapes) === null || _a === void 0 ? void 0 : _a.filter(function (shape) { return shape instanceof azmaps.Shape; }).map(function (shape) { return _this.getSerializableShape(shape); }),
                            features: (_b = mouseEvent.shapes) === null || _b === void 0 ? void 0 : _b.filter(function (shape) { return shape instanceof azmaps.data.Feature; }).map(function (feature) { return _this.getSerializableFeature(feature); })
                        });
                    });
                });
                mapDataEvents.filter(function (value) { return enabledEvents.includes(value); }).forEach(function (value) {
                    map.events.add(value, function (dataEvent) {
                        var mapEvent = {
                            dataType: dataEvent.dataType,
                            isSourceLoaded: dataEvent.isSourceLoaded,
                            source: dataEvent.source ? {
                                id: dataEvent.source.getId()
                            } : null,
                            sourceDataType: dataEvent.sourceDataType,
                            tile: dataEvent.tile,
                            type: value
                        };
                        if (value === 'styledata') {
                            mapEvent.style = map.getStyle().style;
                        }
                        eventHelper.invokeMethodAsync('NotifyEventAsync', mapEvent);
                    });
                });
                mapLayerEvents.filter(function (value) { return enabledEvents.includes(value); }).forEach(function (value) {
                    map.events.add(value, function (layer) {
                        eventHelper.invokeMethodAsync('NotifyEventAsync', {
                            type: value,
                            id: layer.getId()
                        });
                    });
                });
                mapSourceEvents.filter(function (value) { return enabledEvents.includes(value); }).forEach(function (value) {
                    map.events.add(value, function (source) {
                        eventHelper.invokeMethodAsync('NotifyEventAsync', {
                            type: value,
                            source: {
                                id: source.getId()
                            }
                        });
                    });
                });
                mapStringEvents.filter(function (value) { return enabledEvents.includes(value); }).forEach(function (value) {
                    map.events.add(value, function (stringEvent) {
                        eventHelper.invokeMethodAsync('NotifyEventAsync', {
                            type: value,
                            message: stringEvent
                        });
                    });
                });
                mapTouchEvents.filter(function (value) { return enabledEvents.includes(value); }).forEach(function (value) {
                    map.events.add(value, function (touchEvent) {
                        var _a;
                        eventHelper.invokeMethodAsync('NotifyEventAsync', {
                            type: value,
                            layerId: touchEvent.layerId,
                            pixel: touchEvent.pixel,
                            pixels: touchEvent.pixels,
                            position: touchEvent.position,
                            positions: touchEvent.positions,
                            shapes: (_a = touchEvent.shapes) === null || _a === void 0 ? void 0 : _a.filter(function (shape) { return shape instanceof azmaps.Shape; }).map(function (shape) { return _this.getSerializableShape(shape); })
                        });
                    });
                });
            });
        };
        Core.addPopup = function (id, options, events, eventHelper) {
            var _this = this;
            var popup = new azmaps.Popup(options);
            this._popups.set(id, popup);
            this._map.popups.add(popup);
            events.forEach(function (key) {
                _this._map.events.add(key, popup, function () {
                    eventHelper.invokeMethodAsync('NotifyEventAsync', {
                        type: key,
                        id: id
                    });
                });
            });
            if (options === null || options === void 0 ? void 0 : options.openOnAdd) {
                popup.open();
            }
        };
        Core.addPopupWithTemplate = function (id, options, properties, template, events, eventHelper) {
            options.content = azmaps.PopupTemplate.applyTemplate(Core.formatProperties(properties), template);
            this.addPopup(id, options, events, eventHelper);
        };
        Core.addSource = function (id, options, type, events, eventHelper) {
            var _this = this;
            if (type === 'datasource') {
                var dataSource_1 = new azmaps.source.DataSource(id, options);
                this._map.sources.add(dataSource_1);
                events === null || events === void 0 ? void 0 : events.forEach(function (event) {
                    _this._map.events.add(event, dataSource_1, function (e) {
                        var args = {
                            type: event,
                            id: id
                        };
                        if (!(e instanceof azmaps.source.DataSource)) {
                            args.shapes = e.map(function (shape) { return Core.getSerializableShape(shape); });
                        }
                        eventHelper.invokeMethodAsync('NotifyEventAsync', args);
                    });
                });
            }
            else if (type === 'vectortilesource') {
                this._map.sources.add(new azmaps.source.VectorTileSource(id, options));
            }
            else if (type === 'griddeddatasource') {
                var griddedDatasource = new griddeddatasource.source.GriddedDataSource(id, options);
                this._map.sources.add(griddedDatasource);
            }
        };
        Core.clearHtmlMarkers = function () {
            this._map.markers.clear();
        };
        Core.clearLayers = function () {
            this._map.layers.clear();
        };
        Core.clearPopups = function () {
            this._map.popups.clear();
            this._popups.clear();
        };
        Core.clearSources = function () {
            this._map.sources.clear();
        };
        Core.clearMap = function () {
            this._map.clear();
            this._popups.clear();
        };
        Core.getMap = function () {
            return this._map;
        };
        Core.getPopup = function (id) {
            return this._popups.has(id) ? this._popups.get(id) : null;
        };
        Core.getPopups = function () {
            return this._popups;
        };
        Core.removeHtmlMarkers = function (markerIds) {
            this._map.markers.remove(this._map.markers.getMarkers().find(function (marker) { return markerIds.indexOf(marker.amc.id) > -1; }));
        };
        Core.removeLayers = function (ids) {
            this._map.layers.remove(ids);
        };
        Core.removeSource = function (id) {
            this._map.sources.remove(id);
        };
        Core.removePopup = function (id) {
            if (this._popups.has(id)) {
                this._popups.delete(id);
            }
        };
        Core.setCameraOptions = function (cameraOptions) {
            var options = {
                bearing: cameraOptions.bearing,
                centerOffset: cameraOptions.centerOffset,
                duration: cameraOptions.duration,
                maxZoom: cameraOptions.maxZoom,
                minZoom: cameraOptions.minZoom,
                pitch: cameraOptions.pitch,
                type: cameraOptions.type
            };
            if (cameraOptions.bounds) {
                options.bounds = cameraOptions.bounds;
                options.maxBounds = cameraOptions.maxBounds;
                options.offset = cameraOptions.offset;
                options.padding = cameraOptions.padding;
            }
            else {
                if (cameraOptions.center) {
                    options.center = cameraOptions.center;
                }
                options.zoom = cameraOptions.zoom;
            }
            this._map.setCamera(options);
        };
        Core.setOptions = function (cameraOptions, styleOptions, userInteractionOptions, trafficOptions) {
            this.setCameraOptions(cameraOptions);
            this.setStyleOptions(styleOptions);
            this.setUserInteraction(userInteractionOptions);
            this.setTraffic(trafficOptions);
        };
        Core.setStyleOptions = function (styleOptions) {
            this._map.setStyle(styleOptions);
        };
        Core.setTraffic = function (trafficOptions) {
            this._map.setTraffic(trafficOptions);
        };
        Core.setUserInteraction = function (userInteractionOptions) {
            this._map.setUserInteraction(userInteractionOptions);
        };
        Core.updateHtmlMarkers = function (htmlMarkerOptions) {
            var _this = this;
            htmlMarkerOptions.forEach(function (htmlMarkerOption) {
                var options = {};
                if (htmlMarkerOption.options.anchor) {
                    options.anchor = htmlMarkerOption.options.anchor;
                }
                if (htmlMarkerOption.options.color) {
                    options.color = htmlMarkerOption.options.color;
                }
                if (htmlMarkerOption.options.draggable) {
                    options.draggable = htmlMarkerOption.options.draggable;
                }
                if (htmlMarkerOption.options.htmlContent) {
                    options.htmlContent = htmlMarkerOption.options.htmlContent;
                }
                if (htmlMarkerOption.options.position) {
                    options.position = htmlMarkerOption.options.position;
                }
                if (htmlMarkerOption.options.pixelOffset) {
                    options.pixelOffset = htmlMarkerOption.options.pixelOffset;
                }
                if (htmlMarkerOption.options.secondaryColor) {
                    options.secondaryColor = htmlMarkerOption.options.secondaryColor;
                }
                if (htmlMarkerOption.options.text) {
                    options.text = htmlMarkerOption.options.text;
                }
                if (htmlMarkerOption.options.visible) {
                    options.visible = htmlMarkerOption.options.visible;
                }
                if (htmlMarkerOption.popupOptions) {
                    options.popup = new azmaps.Popup(htmlMarkerOption.popupOptions.options);
                }
                _this._map.markers.getMarkers().find(function (marker) { return marker.amc.id === htmlMarkerOption.id; }).setOptions(options);
            });
        };
        Core.createImageFromTemplate = function (imageTemplate) {
            this._map.imageSprite.createFromTemplate(imageTemplate.id, imageTemplate.templateName, imageTemplate.color, imageTemplate.secondaryColor, imageTemplate.scale);
        };
        Core.setCanvasStyleProperty = function (property, value) {
            this._map.getCanvas().style.setProperty(property, value);
        };
        Core.setCanvasStyleProperties = function (properties) {
            var canvas = this._map.getCanvas();
            properties.forEach(function (property) {
                canvas.style.setProperty(property.key, property.value);
            });
        };
        Core.setCanvasContainerStyleProperty = function (property, value) {
            this._map.getCanvasContainer().style.setProperty(property, value);
        };
        Core.setCanvasContainerStyleProperties = function (properties) {
            var canvasContainer = this._map.getCanvasContainer();
            properties.forEach(function (property) {
                canvasContainer.style.setProperty(property.key, property.value);
            });
        };
        Core.getCamera = function () {
            return this._map.getCamera();
        };
        Core.getStyle = function () {
            var style = this._map.getStyle();
            return {
                autoResize: style.autoResize,
                language: style.language,
                light: style.light,
                preserveDrawingBuffer: style.preserveDrawingBuffer,
                renderWorldCopies: style.renderWorldCopies,
                showBuildingModels: style.showBuildingModels,
                showFeedbackLink: style.showFeedbackLink,
                showLogo: style.showLogo,
                showTileBoundaries: style.showTileBoundaries,
                style: style.style,
                view: style.view
            };
        };
        Core.getTraffic = function () {
            var traffic = this._map.getTraffic();
            return {
                flow: traffic.flow,
                incidents: traffic.incidents
            };
        };
        Core.getUserInteraction = function () {
            var userInteraction = this._map.getUserInteraction();
            return {
                boxZoomInteraction: userInteraction.boxZoomInteraction,
                dblClickZoomInteraction: userInteraction.dblClickZoomInteraction,
                dragPanInteraction: userInteraction.dragPanInteraction,
                dragRotateInteraction: userInteraction.dragRotateInteraction,
                interactive: userInteraction.interactive,
                keyboardInteraction: userInteraction.keyboardInteraction,
                scrollZoomInteraction: userInteraction.scrollZoomInteraction,
                touchInteraction: userInteraction.touchInteraction,
                wheelZoomRate: userInteraction.wheelZoomRate
            };
        };
        Core.getSerializableShape = function (shape) {
            return {
                geometry: shape.toJson().geometry,
                id: shape.getId(),
                properties: shape.getProperties()
            };
        };
        Core.formatProperties = function (properties) {
            if (properties) {
                for (var key in properties) {
                    if (typeof properties[key] === 'string' && properties[key].startsWith('azureMapsControl.datetime:')) {
                        var date = Date.parse(properties[key].replace('azureMapsControl.datetime:', ''));
                        if (!isNaN(date)) {
                            properties[key] = new Date(date);
                        }
                    }
                }
            }
            return properties;
        };
        Core.getSerializableFeature = function (feature) {
            return {
                bbox: feature.bbox,
                geometry: feature.geometry,
                id: feature.id,
                properties: feature.properties
            };
        };
        Core._popups = new Map();
        return Core;
    }());

    var GeometryBuilder = /** @class */ (function () {
        function GeometryBuilder() {
        }
        GeometryBuilder.buildFeature = function (feature) {
            var geometry = this.buildGeometry(feature.geometry);
            return new azmaps.data.Feature(geometry, Core.formatProperties(feature.properties), feature.id, feature.bbox ? new azmaps.data.BoundingBox(feature.bbox) : null);
        };
        GeometryBuilder.buildShape = function (shape) {
            return new azmaps.Shape(this.buildGeometry(shape.geometry), shape.id, Core.formatProperties(shape.properties));
        };
        GeometryBuilder.buildGeometry = function (geometry) {
            switch (geometry.type) {
                case 'Point':
                    return this.buildPoint(geometry);
                case 'LineString':
                    return this.buildLineString(geometry);
                case 'Polygon':
                    return this.buildPolygon(geometry);
                case 'MultiPoint':
                    return this.buildMultiPoint(geometry);
                case 'MultiLineString':
                    return this.buildMultiLineString(geometry);
                case 'MultiPolygon':
                    return this.buildMultiPolygon(geometry);
                default:
                    return null;
            }
        };
        GeometryBuilder.buildPoint = function (geometry) {
            return new azmaps.data.Point(geometry.coordinates);
        };
        GeometryBuilder.buildLineString = function (geometry) {
            return new azmaps.data.LineString(geometry.coordinates, geometry.bbox ? new azmaps.data.BoundingBox(geometry.bbox) : null);
        };
        GeometryBuilder.buildPolygon = function (geometry) {
            return new azmaps.data.Polygon(geometry.coordinates, geometry.bbox ? new azmaps.data.BoundingBox(geometry.bbox) : null);
        };
        GeometryBuilder.buildMultiPoint = function (geometry) {
            return new azmaps.data.MultiPoint(geometry.coordinates, geometry.bbox ? new azmaps.data.BoundingBox(geometry.bbox) : null);
        };
        GeometryBuilder.buildMultiLineString = function (geometry) {
            return new azmaps.data.MultiLineString(geometry.coordinates, geometry.bbox ? new azmaps.data.BoundingBox(geometry.bbox) : null);
        };
        GeometryBuilder.buildMultiPolygon = function (geometry) {
            return new azmaps.data.MultiPolygon(geometry.coordinates, geometry.bbox ? new azmaps.data.BoundingBox(geometry.bbox) : null);
        };
        return GeometryBuilder;
    }());

    var Animation = /** @class */ (function () {
        function Animation() {
        }
        Animation.drop = function (animationId, shapes, datasourceId, height, options) {
            var map = Core.getMap();
            var source = map.sources.getById(datasourceId);
            var animation = azanimations.animations.drop(shapes, source, height, options);
            if (!options.disposeOnComplete) {
                this._animations.set(animationId, animation);
            }
        };
        Animation.dropMarkers = function (animationId, markerOptions, height, options, eventInvokeHelper) {
            var map = Core.getMap();
            var markers = [];
            markerOptions.forEach(function (markerOption) {
                var marker = Core.getHtmlMarkerFromDefinition(markerOption);
                markers.push(marker);
                if (markerOption.events) {
                    Core.attachEventsToHtmlMarker(marker, markerOption.events, eventInvokeHelper);
                }
            });
            var animation = azanimations.animations.dropMarkers(markers, map, height, options);
            if (!options.disposeOnComplete) {
                this._animations.set(animationId, animation);
            }
        };
        Animation.setCoordinates = function (animationId, shapeId, datasourceId, newCoordinates, options) {
            var map = Core.getMap();
            var shape = datasourceId ?
                map.sources.getById(datasourceId).getShapeById(shapeId)
                : map.markers.getMarkers().find(function (marker) { return marker.amc && marker.amc.id === shapeId; });
            var animation = azanimations.animations.setCoordinates(shape, newCoordinates, options);
            if (!options.disposeOnComplete) {
                this._animations.set(animationId, animation);
            }
        };
        Animation.snakeline = function (animationId, lineId, dataSourceId, options) {
            var source = Core.getMap().sources.getById(dataSourceId);
            var shape = source.getShapeById(lineId);
            var animation = azanimations.animations.snakeline(shape, options);
            if (!options.disposeOnComplete) {
                this._animations.set(animationId, animation);
            }
        };
        Animation.moveAlongPath = function (animationId, line, lineSourceId, pinId, pinSourceId, options) {
            var map = Core.getMap();
            var path = null;
            if (typeof line === 'string') {
                var lineSource = map.sources.getById(lineSourceId);
                path = lineSource.getShapeById(line);
            }
            else {
                path = line;
            }
            var shape = null;
            if (pinSourceId) {
                var pinSource = map.sources.getById(pinSourceId);
                shape = pinSource.getShapeById(pinId);
            }
            else {
                shape = map.markers.getMarkers().find(function (marker) { return marker.amc.id === pinId; });
            }
            var animation = azanimations.animations.moveAlongPath(path, shape, options);
            if (!options.disposeOnComplete) {
                this._animations.set(animationId, animation);
            }
        };
        Animation.moveAlongRoute = function (animationId, routePoints, pinSourceId, pinId, options) {
            var map = Core.getMap();
            var shape = null;
            if (pinSourceId) {
                var pinSource = map.sources.getById(pinSourceId);
                shape = pinSource.getShapeById(pinId);
            }
            else {
                shape = map.markers.getMarkers().find(function (marker) { return marker.amc.id === pinId; });
            }
            var route = routePoints.map(function (routePoint) {
                var point = GeometryBuilder.buildPoint(routePoint);
                return new azmaps.data.Feature(point, { _timestamp: new Date(routePoint.timestamp).getTime() });
            });
            this._animations.set(animationId, azanimations.animations.moveAlongRoute(route, shape, options));
        };
        Animation.flowingDashedLine = function (animationId, lineLayerId, options) {
            var layer = Core.getMap().layers.getLayerById(lineLayerId);
            this._animations.set(animationId, azanimations.animations.flowingDashedLine(layer, options));
        };
        Animation.morph = function (animationId, shapeId, datasourceId, newGeometry, options) {
            var map = Core.getMap();
            var shape = map.sources.getById(datasourceId).getShapeById(shapeId);
            var animation = azanimations.animations.morph(shape, GeometryBuilder.buildGeometry(newGeometry), options);
            if (!options.disposeOnComplete) {
                this._animations.set(animationId, animation);
            }
        };
        Animation.groupAnimations = function (groupAnimationId, animationsIds, options) {
            var _this = this;
            var animations = [];
            animationsIds.forEach(function (animationId) {
                if (_this._animations.has(animationId)) {
                    var animation = _this._animations.get(animationId);
                    if (animation !== null) {
                        animations.push(animation);
                    }
                }
            });
            this._animations.set(groupAnimationId, new azanimations.animations.GroupAnimation(animations, options));
        };
        Animation.dispose = function (animationId) {
            if (this._animations.has(animationId)) {
                var animation = this._animations.get(animationId);
                animation.dispose();
                this._animations.delete(animationId);
            }
        };
        Animation.pause = function (animationId) {
            if (this._animations.has(animationId)) {
                var animation = this._animations.get(animationId);
                if (animation !== null) {
                    animation.pause();
                }
            }
        };
        Animation.play = function (animationId) {
            if (this._animations.has(animationId)) {
                var animation = this._animations.get(animationId);
                if (animation !== null) {
                    animation.play();
                }
            }
        };
        Animation.reset = function (animationId) {
            if (this._animations.has(animationId)) {
                var animation = this._animations.get(animationId);
                if (animation !== null) {
                    animation.reset();
                }
            }
        };
        Animation.seek = function (animationId, progress) {
            if (this._animations.has(animationId)) {
                var animation = this._animations.get(animationId);
                if (animation !== null) {
                    animation.seek(progress);
                }
            }
        };
        Animation.stop = function (animationId) {
            if (this._animations.has(animationId)) {
                var animation = this._animations.get(animationId);
                if (animation !== null) {
                    animation.stop();
                }
            }
        };
        Animation.setOptions = function (animationId, options) {
            if (this._animations.has(animationId)) {
                var animation = this._animations.get(animationId);
                if (animation !== null) {
                    animation.setOptions(options);
                }
            }
        };
        Animation._animations = new Map();
        return Animation;
    }());

    var Drawing = /** @class */ (function () {
        function Drawing() {
        }
        Drawing.addDrawingToolbar = function (drawingToolbarOptions, eventHelper) {
            var _this = this;
            this._toolbar = new azdrawings.control.DrawingToolbar({
                buttons: drawingToolbarOptions.buttons,
                containerId: drawingToolbarOptions.containerId,
                numColumns: drawingToolbarOptions.numColumns,
                position: drawingToolbarOptions.position,
                style: drawingToolbarOptions.style,
                visible: drawingToolbarOptions.visible
            });
            var drawingManagerOptions = {
                freehandInterval: drawingToolbarOptions.freehandInterval,
                interactionType: drawingToolbarOptions.interactionType,
                mode: drawingToolbarOptions.mode,
                shapeDraggingEnabled: drawingToolbarOptions.shapeDraggingEnabled,
                toolbar: this._toolbar
            };
            if (drawingToolbarOptions.dragHandleStyle) {
                drawingManagerOptions.dragHandleStyle = new azmaps.HtmlMarker({
                    anchor: drawingToolbarOptions.dragHandleStyle.anchor,
                    color: drawingToolbarOptions.dragHandleStyle.color,
                    draggable: drawingToolbarOptions.dragHandleStyle.draggable,
                    htmlContent: drawingToolbarOptions.dragHandleStyle.htmlContent,
                    pixelOffset: drawingToolbarOptions.dragHandleStyle.pixelOffset,
                    position: drawingToolbarOptions.dragHandleStyle.position,
                    secondaryColor: drawingToolbarOptions.dragHandleStyle.secondaryColor,
                    text: drawingToolbarOptions.dragHandleStyle.text,
                    visible: drawingToolbarOptions.dragHandleStyle.visible
                });
            }
            if (drawingToolbarOptions.secondaryDragHandleStyle) {
                drawingManagerOptions.secondaryDragHandleStyle = new azmaps.HtmlMarker({
                    anchor: drawingToolbarOptions.secondaryDragHandleStyle.anchor,
                    color: drawingToolbarOptions.secondaryDragHandleStyle.color,
                    draggable: drawingToolbarOptions.secondaryDragHandleStyle.draggable,
                    htmlContent: drawingToolbarOptions.secondaryDragHandleStyle.htmlContent,
                    pixelOffset: drawingToolbarOptions.secondaryDragHandleStyle.pixelOffset,
                    position: drawingToolbarOptions.secondaryDragHandleStyle.position,
                    secondaryColor: drawingToolbarOptions.secondaryDragHandleStyle.secondaryColor,
                    text: drawingToolbarOptions.secondaryDragHandleStyle.text,
                    visible: drawingToolbarOptions.secondaryDragHandleStyle.visible
                });
            }
            var map = Core.getMap();
            this._drawingManager = new azdrawings.drawing.DrawingManager(map, drawingManagerOptions);
            if (drawingToolbarOptions.events) {
                drawingToolbarOptions.events.forEach(function (drawingToolbarEvent) {
                    map.events.add(drawingToolbarEvent, _this._drawingManager, function (e) {
                        if (drawingToolbarEvent === 'drawingmodechanged') {
                            eventHelper.invokeMethodAsync('NotifyEventAsync', {
                                type: drawingToolbarEvent,
                                newMode: e
                            });
                        }
                        else if (drawingToolbarEvent === 'drawingstarted') {
                            eventHelper.invokeMethodAsync('NotifyEventAsync', { type: drawingToolbarEvent });
                        }
                        else {
                            eventHelper.invokeMethodAsync('NotifyEventAsync', {
                                type: drawingToolbarEvent,
                                data: e.data
                            });
                        }
                    });
                });
            }
        };
        Drawing.removeDrawingToolbar = function () {
            this._drawingManager.dispose();
            Core.getMap().controls.remove(this._toolbar);
            this._drawingManager = null;
            this._toolbar = null;
        };
        Drawing.updateDrawingToolbar = function (drawingToolbarOptions) {
            this._toolbar.setOptions({
                buttons: drawingToolbarOptions.buttons,
                containerId: drawingToolbarOptions.containerId,
                numColumns: drawingToolbarOptions.numColumns,
                position: drawingToolbarOptions.position,
                style: drawingToolbarOptions.style,
                visible: drawingToolbarOptions.visible
            });
        };
        return Drawing;
    }());

    var Popup = /** @class */ (function () {
        function Popup() {
        }
        Popup.close = function (id) {
            var popup = Core.getPopup(id);
            if (popup) {
                popup.close();
            }
        };
        Popup.open = function (id) {
            var popup = Core.getPopup(id);
            if (popup) {
                popup.open();
            }
        };
        Popup.remove = function (id) {
            var popup = Core.getPopup(id);
            if (popup) {
                popup.remove();
                Core.removePopup(id);
            }
        };
        Popup.setOptions = function (id, options) {
            var popup = Core.getPopup(id);
            if (popup) {
                var popupOptions = {
                    draggable: options.draggable,
                    closeButton: options.closeButton,
                    content: options.content,
                    fillColor: options.fillColor,
                    pixelOffset: options.pixelOffset,
                    position: options.position,
                    showPointer: options.showPointer
                };
                popup.setOptions(popupOptions);
            }
        };
        Popup.applyTemplate = function (id, options, properties, template) {
            options.content = azmaps.PopupTemplate.applyTemplate(properties, template);
            this.setOptions(id, options);
        };
        return Popup;
    }());

    var Datasource = /** @class */ (function () {
        function Datasource() {
        }
        Datasource.getShapes = function (id) {
            var shapes = Core.getMap().sources.getById(id).getShapes();
            return shapes === null || shapes === void 0 ? void 0 : shapes.map(function (shape) { return Core.getSerializableShape(shape); });
        };
        return Datasource;
    }());

    var GriddedDatasource = /** @class */ (function () {
        function GriddedDatasource() {
        }
        GriddedDatasource.getCellChildren = function (sourceId, cellId) {
            return Core.getMap().sources.getById(sourceId)
                .getCellChildren(cellId)
                .map(function (feature) { return Core.getSerializableFeature(feature); });
        };
        GriddedDatasource.getGridCells = function (sourceId) {
            return Core.getMap().sources.getById(sourceId)
                .getGridCells().features.map(function (feature) { return Core.getSerializableFeature(feature); });
        };
        GriddedDatasource.getPoints = function (sourceId) {
            return Core.getMap().sources.getById(sourceId)
                .getPoints().features.map(function (feature) { return Core.getSerializableFeature(feature); });
        };
        GriddedDatasource.setFeatureCollectionPoints = function (sourceId, featureCollection) {
            Core.getMap().sources.getById(sourceId).setPoints(featureCollection);
        };
        GriddedDatasource.setFeaturePoints = function (sourceId, features) {
            var points = features.map(function (feature) { return GeometryBuilder.buildFeature(feature); });
            Core.getMap().sources.getById(sourceId).setPoints(points);
        };
        GriddedDatasource.setPoints = function (sourceId, geometries) {
            var points = geometries.map(function (geometry) { return GeometryBuilder.buildPoint(geometry); });
            Core.getMap().sources.getById(sourceId).setPoints(points);
        };
        GriddedDatasource.setShapePoints = function (sourceId, shapes) {
            var points = shapes.map(function (shape) { return GeometryBuilder.buildShape(shape); });
            Core.getMap().sources.getById(sourceId).setPoints(points);
        };
        return GriddedDatasource;
    }());

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var Source = /** @class */ (function () {
        function Source() {
        }
        Source.addShapes = function (id, shapes) {
            var mapsShapes = shapes.map(function (shape) { return GeometryBuilder.buildShape(shape); });
            Core.getMap().sources.getById(id).add(mapsShapes);
        };
        Source.addFeatures = function (id, features) {
            var mapsFeatures = features.map(function (feature) { return GeometryBuilder.buildFeature(feature); });
            Core.getMap().sources.getById(id).add(mapsFeatures);
        };
        Source.addFeatureCollection = function (id, featureCollection) {
            Core.getMap().sources.getById(id).add(featureCollection);
        };
        Source.clear = function (id) {
            Core.getMap().sources.getById(id).clear();
        };
        Source.importDataFromUrl = function (id, url) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Core.getMap().sources.getById(id).importDataFromUrl(url)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        Source.remove = function (id, geometryIds) {
            Core.getMap().sources.getById(id).remove(geometryIds);
        };
        Source.dispose = function (id) {
            Core.getMap().sources.getById(id).dispose();
        };
        Source.getOptions = function (id) {
            return Core.getMap().sources.getById(id).getOptions();
        };
        Source.setOptions = function (id, options) {
            (Core.getMap().sources.getById(id)).setOptions(options);
        };
        return Source;
    }());

    var HtmlMarker = /** @class */ (function () {
        function HtmlMarker() {
        }
        HtmlMarker.togglePopup = function (id, popupId, events, eventHelper) {
            var map = Core.getMap();
            var popups = Core.getPopups();
            var marker = map.markers.getMarkers().find(function (m) { return m.amc.id === id; });
            marker.togglePopup();
            if (!popups.has(popupId)) {
                var popup_1 = marker.getOptions().popup;
                popups.set(popupId, popup_1);
                events.forEach(function (key) {
                    map.events.add(key, popup_1, function () {
                        eventHelper.invokeMethodAsync('NotifyEventAsync', {
                            type: key,
                            id: popupId
                        });
                    });
                });
            }
        };
        return HtmlMarker;
    }());

    var GeolocationControl = /** @class */ (function () {
        function GeolocationControl() {
        }
        GeolocationControl.getLastKnownPosition = function (controlId) {
            var position = this._getGeolocationControl(controlId).getLastKnownPosition();
            return {
                geometry: position.geometry,
                properties: Core.formatProperties(position.properties)
            };
        };
        GeolocationControl.isGeolocationSupported = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, geolocationcontrol.control.GeolocationControl.isSupported()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        GeolocationControl.dispose = function (controlId) {
            this._getGeolocationControl(controlId).dispose();
        };
        GeolocationControl.setOptions = function (controlId, options) {
            this._getGeolocationControl(controlId).setOptions(options);
        };
        GeolocationControl.addEvents = function (controlId, events, eventHelper) {
            var control = this._getGeolocationControl(controlId);
            var map = Core.getMap();
            events.forEach(function (event) {
                map.events.add(event, control, function (args) {
                    eventHelper.invokeMethodAsync('NotifyEventAsync', {
                        code: args.code,
                        message: args.message,
                        feature: {
                            bbox: args.bbox,
                            geometry: args.geometry,
                            properties: Core.formatProperties(args.properties)
                        },
                        type: event
                    });
                });
            });
        };
        GeolocationControl._getGeolocationControl = function (controlId) {
            return Core.getMap().controls.getControls().find(function (ctrl) { return ctrl.amc && ctrl.amc.id === controlId; });
        };
        return GeolocationControl;
    }());

    var OverviewMapControl = /** @class */ (function () {
        function OverviewMapControl() {
        }
        OverviewMapControl.setOptions = function (controlId, options) {
            Core.getMap().controls.getControls().find(function (ctrl) { return ctrl.amc && ctrl.amc.id === controlId; }).setOptions(options);
        };
        return OverviewMapControl;
    }());

    var FullscreenControl = /** @class */ (function () {
        function FullscreenControl() {
        }
        FullscreenControl.isFullscreenSupported = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Promise.resolve(fullscreencontrol.control.FullscreenControl.isSupported())];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        FullscreenControl.dispose = function (id) {
            this._getFullscreenControl(id).dispose();
        };
        FullscreenControl.setOptions = function (id, options) {
            this._getFullscreenControl(id).setOptions(options);
        };
        FullscreenControl.isFullscreen = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Promise.resolve(this._getFullscreenControl(id).isFullscreen())];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        FullscreenControl.addEvents = function (controlId, events, eventHelper) {
            var control = this._getFullscreenControl(controlId);
            var map = Core.getMap();
            events.forEach(function (event) {
                map.events.add(event, control, function (_) {
                    eventHelper.invokeMethodAsync('NotifyEventAsync', control.isFullscreen());
                });
            });
        };
        FullscreenControl._getFullscreenControl = function (controlId) {
            return Core.getMap().controls.getControls().find(function (ctrl) { return ctrl.amc && ctrl.amc.id === controlId; });
        };
        return FullscreenControl;
    }());

    var Indoor = /** @class */ (function () {
        function Indoor() {
        }
        Indoor.createIndoorManager = function (id, options, events, eventHelper) {
            var levelControl;
            if (options.levelControl) {
                levelControl = new indoor.control.LevelControl(options.levelControl.options);
            }
            if (!options.theme) {
                options.theme = 'auto';
            }
            if (!options.geography) {
                options.geography = 'us';
            }
            var map = Core.getMap();
            var indoorManager = new indoor.indoor.IndoorManager(map, {
                levelControl: levelControl,
                statesetId: options.statesetId,
                theme: options.theme,
                tilesetId: options.tilesetId,
                geography: options.geography
            });
            if (events) {
                var _loop_1 = function (event_1) {
                    map.events.add(event_1, indoorManager, function (e) {
                        eventHelper.invokeMethodAsync('NotifyEventAsync', {
                            facilityId: e.facilityId,
                            levelNumber: e.levelNumber,
                            prevFacilityId: e.prevFacilityId,
                            prevLevelNumber: e.prevLevelNumber,
                            type: event_1
                        });
                    });
                };
                for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
                    var event_1 = events_1[_i];
                    _loop_1(event_1);
                }
            }
            this._indoorManagers.set(id, indoorManager);
        };
        Indoor.dispose = function (id) {
            var indoorManager = this._getIndoorManager(id);
            indoorManager.dispose();
            this._indoorManagers.delete(id);
        };
        Indoor.initialize = function (id) {
            var indoorManager = this._getIndoorManager(id);
            indoorManager.initialize();
        };
        Indoor.getCurrentFacility = function (id) {
            var indoorManager = this._getIndoorManager(id);
            var currentFacility = indoorManager.getCurrentFacility();
            return { facilityId: currentFacility[0], levelOrdinal: currentFacility[1] };
        };
        Indoor.getOptions = function (id) {
            var indoorManager = this._getIndoorManager(id);
            var options = indoorManager.getOptions();
            return {
                statesetId: options.statesetId,
                theme: options.theme,
                tilesetId: options.tilesetId,
                geography: options.geography
            };
        };
        Indoor.getStyleDefinition = function (id) {
            var indoorManager = this._getIndoorManager(id);
            return indoorManager.getStyleDefinition();
        };
        Indoor.setDynamicStyling = function (id, enabled) {
            var indoorManager = this._getIndoorManager(id);
            indoorManager.setDynamicStyling(enabled);
        };
        Indoor.setFacility = function (id, facilityId, levelOrdinal) {
            var indoorManager = this._getIndoorManager(id);
            indoorManager.setFacility(facilityId, levelOrdinal);
        };
        Indoor.setOptions = function (id, options) {
            var indoorManager = this._getIndoorManager(id);
            var levelControl;
            if (options.levelControl) {
                levelControl = new indoor.control.LevelControl(options.levelControl.options);
            }
            if (!options.theme) {
                options.theme = 'auto';
            }
            indoorManager.setOptions({
                levelControl: levelControl,
                statesetId: options.statesetId,
                theme: options.theme,
                tilesetId: options.tilesetId
            });
        };
        Indoor._getIndoorManager = function (id) {
            if (this._indoorManagers.has(id)) {
                return this._indoorManagers.get(id);
            }
            return null;
        };
        Indoor._indoorManagers = new Map();
        return Indoor;
    }());

    var Layer = /** @class */ (function () {
        function Layer() {
        }
        Layer.setOptions = function (layerId, options) {
            var layer = Core.getMap().layers.getLayerById(layerId);
            layer.setOptions(options);
        };
        return Layer;
    }());

    exports.Animation = Animation;
    exports.Core = Core;
    exports.Datasource = Datasource;
    exports.Drawing = Drawing;
    exports.Extensions = Extensions;
    exports.FullscreenControl = FullscreenControl;
    exports.GeolocationControl = GeolocationControl;
    exports.GriddedDatasource = GriddedDatasource;
    exports.HtmlMarker = HtmlMarker;
    exports.Indoor = Indoor;
    exports.Layer = Layer;
    exports.OverviewMapControl = OverviewMapControl;
    exports.Popup = Popup;
    exports.Source = Source;

    Object.defineProperty(exports, '__esModule', { value: true });

}(this.azureMapsControl = this.azureMapsControl || {}, atlas, atlas, atlas, atlas, atlas, atlas, atlas, atlas, atlas));
