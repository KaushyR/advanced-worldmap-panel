'use strict';

System.register(['app/plugins/sdk', 'app/core/time_series2', 'app/core/utils/kbn', 'lodash', './map_renderer', './data_formatter', './css/worldmap-panel.css!', './colors'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, TimeSeries, kbn, _, mapRenderer, DataFormatter, Colors, _createClass, panelDefaults, mapCenters, WorldmapCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_map_renderer) {
      mapRenderer = _map_renderer.default;
    }, function (_data_formatter) {
      DataFormatter = _data_formatter.default;
    }, function (_cssWorldmapPanelCss) {}, function (_colors) {
      Colors = _colors.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      panelDefaults = {
        maxDataPoints: 1,
        mapCenter: '(0°, 0°)',
        mapCenterLatitude: 0,
        mapCenterLongitude: 0,
        initialZoom: 1,
        valueName: 'total',
        circleMinSize: 2,
        circleMaxSize: 30,
        boundsChangeTriggerDelta: 0.5,
        locationData: 'countries',
        thresholds: '0,10',
        colors: ['rgba(245, 54, 54, 0.9)', 'rgba(237, 129, 40, 0.89)', 'rgba(50, 172, 45, 0.97)'],
        unitSingle: '',
        unitPlural: '',
        showLegend: true,
        mouseWheelZoom: false,
        showTrail: false,
        showAsAntPath: false,
        antPathDelay: 400,
        useCustomAntPathColor: false,
        antPathColor: 'rgba(50, 172, 45, 0.97)',
        antPathPulseColor: '#FFFFFF',
        extraLineColors: ['#ff4d4d', '#1aff8c'],
        extraLineSecondaryColors: ['#eeeeee', '#eeeeee'],
        mapTileServer: 'CartoDB',
        esMetric: 'Count',
        decimals: 0,
        hideEmpty: false,
        hideZero: false,
        stickyLabels: false,
        tableQueryOptions: {
          queryType: 'geohash',
          geohashField: 'geohash',
          latitudeField: 'latitude',
          longitudeField: 'longitude',
          metricField: 'metric',
          markerField: 'marker',
          customLabelField: 'label',
          urlField: 'url'
        }

      };
      mapCenters = {
        '(0°, 0°)': { mapCenterLatitude: 0, mapCenterLongitude: 0 },
        'North America': { mapCenterLatitude: 40, mapCenterLongitude: -100 },
        'Europe': { mapCenterLatitude: 46, mapCenterLongitude: 14 },
        'West Asia': { mapCenterLatitude: 26, mapCenterLongitude: 53 },
        'SE Asia': { mapCenterLatitude: 10, mapCenterLongitude: 106 },
        'Last GeoHash': { mapCenterLatitude: 0, mapCenterLongitude: 0 }
      };

      WorldmapCtrl = function (_MetricsPanelCtrl) {
        _inherits(WorldmapCtrl, _MetricsPanelCtrl);

        function WorldmapCtrl($scope, $injector, contextSrv, datasourceSrv, variableSrv) {
          _classCallCheck(this, WorldmapCtrl);

          var _this = _possibleConstructorReturn(this, (WorldmapCtrl.__proto__ || Object.getPrototypeOf(WorldmapCtrl)).call(this, $scope, $injector));

          _this.context = contextSrv;
          _.defaults(_this.panel, panelDefaults);
          _this.tileServer = _this.panel.mapTileServer;
          _this.currentTileServer = _this.panel.mapTileServer;
          _this.setMapProvider(contextSrv);
          _this.variableSrv = variableSrv;

          _this.dataFormatter = new DataFormatter(_this, kbn);

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('panel-teardown', _this.onPanelTeardown.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataSnapshotLoad.bind(_this));

          _this.loadLocationDataFromFile();
          return _this;
        }

        _createClass(WorldmapCtrl, [{
          key: 'setMapProvider',
          value: function setMapProvider(contextSrv) {
            switch (this.panel.mapTileServer) {
              case 'Open Street Maps':
                this.tileServer = 'Open Street Maps';
                break;
              case 'Stamen Maps':
                this.tileServer = 'Stamen Maps';
                break;
              case 'Esri(Standard)':
                this.tileServer = 'Esri Standard';
                break;
              case 'Esri(Transportation)':
                this.tileServer = 'Esri Transportation';
                break;
              case 'Esri(Terrain)':
                this.tileServer = 'Esri Terrain';
                break;
              case 'CartoDB':
              default:
                this.tileServer = contextSrv.user.lightTheme ? 'CartoDB Positron' : 'CartoDB Dark';
                break;
            }
            this.setMapSaturationClass();
          }
        }, {
          key: 'changeBoundsChangeTriggerDelta',
          value: function changeBoundsChangeTriggerDelta() {
            if (this.panel.boundsChangeTriggerDelta < 0 || this.panel.boundsChangeTriggerDelta > 3) {
              this.panel.boundsChangeTriggerDelta = 0.5;
            }
          }
        }, {
          key: 'changeMapProvider',
          value: function changeMapProvider() {
            if (this.panel.mapTileServer !== this.currentTileServer) {
              this.setMapProvider(this.context);
              if (this.map) {
                this.map.remove();
                this.map = null;
              }

              this.currentTileServer = this.tileServer;
              this.render();
            }
          }
        }, {
          key: 'setMapSaturationClass',
          value: function setMapSaturationClass() {
            if (this.tileServer === 'CartoDB Dark') {
              this.saturationClass = 'map-darken';
            } else {
              this.saturationClass = '';
            }
          }
        }, {
          key: 'loadLocationDataFromFile',
          value: function loadLocationDataFromFile(reload) {
            var _this2 = this;

            if (this.map && !reload) return;

            if (this.panel.snapshotLocationData) {
              this.locations = this.panel.snapshotLocationData;
              return;
            }

            if (this.panel.locationData === 'jsonp endpoint') {
              if (!this.panel.jsonpUrl || !this.panel.jsonpCallback) return;

              window.$.ajax({
                type: 'GET',
                url: this.panel.jsonpUrl + '?callback=?',
                contentType: 'application/json',
                jsonpCallback: this.panel.jsonpCallback,
                dataType: 'jsonp',
                success: function success(res) {
                  _this2.locations = res;
                  _this2.render();
                }
              });
            } else if (this.panel.locationData === 'json endpoint') {
              if (!this.panel.jsonUrl) return;

              window.$.getJSON(this.panel.jsonUrl).then(function (res) {
                _this2.locations = res;
                _this2.render();
              });
            } else if (this.panel.locationData === 'table') {
              // .. Do nothing
            } else if (this.panel.locationData !== 'geohash' && this.panel.locationData !== 'json result') {
              window.$.getJSON('public/plugins/grafana-custom-worldmap-panel/data/' + this.panel.locationData + '.json').then(this.reloadLocations.bind(this));
            }
          }
        }, {
          key: 'reloadLocations',
          value: function reloadLocations(res) {
            this.locations = res;
            this.refresh();
          }
        }, {
          key: 'showTableGeohashOptions',
          value: function showTableGeohashOptions() {
            return this.panel.locationData === 'table' && this.panel.tableQueryOptions.queryType === 'geohash';
          }
        }, {
          key: 'showTableCoordinateOptions',
          value: function showTableCoordinateOptions() {
            return this.panel.locationData === 'table' && this.panel.tableQueryOptions.queryType === 'coordinates';
          }
        }, {
          key: 'onPanelTeardown',
          value: function onPanelTeardown() {
            if (this.map) this.map.remove();
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Worldmap', 'public/plugins/grafana-custom-worldmap-panel/partials/editor.html', 2);
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            if (!dataList) return;

            if (this.dashboard.snapshot && this.locations) {
              this.panel.snapshotLocationData = this.locations;
            }

            var data = [];

            if (this.panel.locationData === 'geohash') {
              this.dataFormatter.setGeohashValues(dataList, data);
            } else if (this.panel.locationData === 'table') {
              var tableData = dataList.map(DataFormatter.tableHandler.bind(this));
              this.dataFormatter.setTableValues(tableData, data);
            } else if (this.panel.locationData === 'json result') {
              this.series = dataList;
              this.dataFormatter.setJsonValues(data);
            } else {
              this.series = dataList.map(this.seriesHandler.bind(this));
              this.dataFormatter.setValues(data);
            }
            this.data = data;

            this.updateThresholdData();

            if (this.data && this.data.length > 0 && this.data[0].length && this.panel.mapCenter === 'Last GeoHash') {
              this.centerOnLastGeoHash();
            } else {
              this.render();
            }
          }
        }, {
          key: 'centerOnLastGeoHash',
          value: function centerOnLastGeoHash() {
            mapCenters[this.panel.mapCenter].mapCenterLatitude = _.last(this.data[0]).locationLatitude;
            mapCenters[this.panel.mapCenter].mapCenterLongitude = _.last(this.data[0]).locationLongitude;
            this.setNewMapCenter();
          }
        }, {
          key: 'onDataSnapshotLoad',
          value: function onDataSnapshotLoad(snapshotData) {
            this.onDataReceived(snapshotData);
          }
        }, {
          key: 'seriesHandler',
          value: function seriesHandler(seriesData) {
            var series = new TimeSeries({
              datapoints: seriesData.datapoints,
              alias: seriesData.target
            });

            series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
            return series;
          }
        }, {
          key: 'setNewMapCenter',
          value: function setNewMapCenter() {
            if (this.panel.mapCenter !== 'custom') {
              this.panel.mapCenterLatitude = mapCenters[this.panel.mapCenter].mapCenterLatitude;
              this.panel.mapCenterLongitude = mapCenters[this.panel.mapCenter].mapCenterLongitude;
            }
            this.mapCenterMoved = true;
            this.render();
          }
        }, {
          key: 'setZoom',
          value: function setZoom() {
            this.map.setZoom(this.panel.initialZoom || 1);
          }
        }, {
          key: 'toggleLegend',
          value: function toggleLegend() {
            if (!this.panel.showLegend) {
              this.map.removeLegend();
            }
            this.render();
          }
        }, {
          key: 'toggleMouseWheelZoom',
          value: function toggleMouseWheelZoom() {
            this.map.setMouseWheelZoom();
            this.render();
          }
        }, {
          key: 'toggleStickyLabels',
          value: function toggleStickyLabels() {
            this.map.clearCircles();
            this.render();
          }
        }, {
          key: 'toggleShowTrail',
          value: function toggleShowTrail() {
            this.map.showTrail(this.panel.showTrail);
          }
        }, {
          key: 'toggleShowAsAntPath',
          value: function toggleShowAsAntPath() {
            this.map.setShowAsAntPath(this.panel.showAsAntPath);
          }
        }, {
          key: 'changeAntpathOptions',
          value: function changeAntpathOptions() {
            this.map.setAntPathOptions(this.panel.antPathDelay, this.panel.useCustomAntPathColor, this.panel.antPathColor, this.panel.antPathPulseColor);
            this.render();
          }
        }, {
          key: 'changePathColors',
          value: function changePathColors() {
            this.map.setPathColors(this.panel.pathColor1, this.panel.pathColor2);
          }
        }, {
          key: 'addExtraLineColor',
          value: function addExtraLineColor() {
            this.panel.extraLineColors.push(Colors.random());
            this.panel.extraLineSecondaryColors.push(Colors.random());
            this.render();
          }
        }, {
          key: 'removeLastExtraLineColor',
          value: function removeLastExtraLineColor() {
            if (this.panel.extraLineColors.length > 0) {
              var removed = this.panel.extraLineColors.pop();
              if (removed && this.panel.extraLineSecondaryColors.length > 0) {
                this.panel.extraLineSecondaryColors.pop();
              }
              this.render();
            }
          }
        }, {
          key: 'changeExtraLineColors',
          value: function changeExtraLineColors() {
            this.map.setExtraLineColors(this.panel.extraLineColors);
          }
        }, {
          key: 'changeExtraLineSecondaryColors',
          value: function changeExtraLineSecondaryColors() {
            this.map.setExtraLineSecondaryColors(this.panel.extraLineSecondaryColors);
          }
        }, {
          key: 'changeThresholds',
          value: function changeThresholds() {
            this.updateThresholdData();
            this.map.legend.update();
            this.render();
          }
        }, {
          key: 'updateThresholdData',
          value: function updateThresholdData() {
            if (!this.data || this.data.length === 0) {
              return;
            }
            this.data[0].thresholds = this.panel.thresholds.split(',').map(function (strValue) {
              return Number(strValue.trim());
            });
            while (_.size(this.panel.colors) > _.size(this.data[0].thresholds) + 1) {
              // too many colors. remove the last one.
              this.panel.colors.pop();
            }
            while (_.size(this.panel.colors) < _.size(this.data[0].thresholds) + 1) {
              // not enough colors. add one.
              var newColor = 'rgba(50, 172, 45, 0.97)';
              this.panel.colors.push(newColor);
            }
          }
        }, {
          key: 'changeLocationData',
          value: function changeLocationData() {
            this.loadLocationDataFromFile(true);

            if (this.panel.locationData === 'geohash') {
              this.render();
            }
          }
        }, {
          key: 'onBoundsChange',
          value: function onBoundsChange(boundsObj) {
            if (boundsObj.maxChangeDelta < 0.5) {
              console.log('bounds change delta %o is too small to update variable', boundsObj.maxChangeDelta);
              return;
            }
            var boundsJson = boundsObj;
            var boundsVar = _.find(this.variableSrv.variables, function (check) {
              return check.name === 'bounds';
            });
            if (boundsVar) {
              this.variableSrv.setOptionAsCurrent(boundsVar, {
                text: boundsJson,
                value: boundsJson
              });
              this.variableSrv.variableUpdated(boundsVar, true);
              // console.log('variable set to %o', boundsJson);
              // console.log(boundsVar);
              // console.log(this);
            } else {
              console.log("no variable 'bounds'");
            }
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            mapRenderer(scope, elem, attrs, ctrl);
          }
        }]);

        return WorldmapCtrl;
      }(MetricsPanelCtrl);

      _export('default', WorldmapCtrl);

      WorldmapCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=worldmap_ctrl.js.map
