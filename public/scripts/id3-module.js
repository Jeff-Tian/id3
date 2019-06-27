angular
  .module("id3Module", [
    "pascalprecht.translate",
    "ngSanitize",
    "localeHelperModule",
    "id3MathModule"
  ])
  .config([
    "$translateProvider",
    "localeHelperProvider",
    function($translateProvider, localeHelperProvider) {
      $translateProvider.useLoader("translationLoader");
      var locale = localeHelperProvider.getLocale(window.location.pathname);
      $translateProvider.preferredLanguage(locale);
      $translateProvider.useSanitizeValueStrategy("escapeParameters");

      window.locale = locale;
    }
  ])
  .factory("translationLoader", [
    "$http",
    "$q",
    "$rootScope",
    function($http, $q, $rootScope) {
      return function(options) {
        var dfd = $q.defer();

        // Filled by grunt
        var data = {};

        if (data[options.key]) {
          dfd.resolve(data[options.key]);

          return dfd.promise;
        }

        $http({
          method: "GET",
          url: "/locales/" + options.key + ".json"
        }).then(function(result) {
          dfd.resolve(result);

          console.log("localeResource:load");
          $rootScope.$emit("localeResource:load");
        }, dfd.reject);

        return dfd.promise;
      };
    }
  ])
  .directive("tree", [
    function() {
      if (window.locale === "en") {
        return {
          templateUrl: "/templates/en/stats.html",
          scope: {
            stats: "="
          },
          link: function(scope, element, attrs) {}
        };
      }

      return {
        templateUrl: "/templates/stats.html",
        scope: {
          stats: "="
        },
        link: function(scope, element, attrs) {}
      };
    }
  ])
  .controller("ID3Ctrl", [
    "$scope",
    "id3",
    "$filter",
    "$q",
    function($scope, id3, $filter, $q) {
      $scope.testData =
        location.search.indexOf("enjoySports") >= 0
          ? [
              {
                Sky: "Sunny",
                AirTemp: "Warm",
                Humidity: "Normal",
                Wind: "Strong",
                Water: "Warm",
                Forecast: "Same",
                决策: "Yes"
              },
              {
                Sky: "Sunny",
                AirTemp: "Warm",
                Humidity: "High",
                Wind: "Strong",
                Water: "Warm",
                Forecast: "Same",
                决策: "Yes"
              },
              {
                Sky: "Rainy",
                AirTemp: "Cold",
                Humidity: "High",
                Wind: "Strong",
                Water: "Warm",
                Forecast: "Change",
                决策: "No"
              },
              {
                Sky: "Sunny",
                AirTemp: "Warm",
                Humidity: "High",
                Wind: "Strong",
                Water: "Cool",
                Forecast: "Change",
                决策: "Yes"
              },
              {
                Sky: "Sunny",
                AirTemp: "Warm",
                Humidity: "Normal",
                Wind: "Weak",
                Water: "Warm",
                Forecast: "Same",
                决策: "No"
              }
            ]
          : [
              {
                GMAT: 650,
                GPA: 2.75,
                "GMAT 定量评分": 35,
                决策: "No"
              },
              {
                GMAT: 580,
                GPA: 3.5,
                "GMAT 定量评分": 70,
                决策: "No"
              },
              {
                GMAT: 600,
                GPA: 3.5,
                "GMAT 定量评分": 75,
                决策: "Yes"
              },
              {
                GMAT: 450,
                GPA: 2.95,
                "GMAT 定量评分": 80,
                决策: "No"
              },
              {
                GMAT: 700,
                GPA: 3.25,
                "GMAT 定量评分": 90,
                决策: "Yes"
              },
              {
                GMAT: 590,
                GPA: 3.5,
                "GMAT 定量评分": 80,
                决策: "Yes"
              },
              {
                GMAT: 400,
                GPA: 3.85,
                "GMAT 定量评分": 45,
                决策: "No"
              },
              {
                GMAT: 640,
                GPA: 3.5,
                "GMAT 定量评分": 75,
                决策: "Yes"
              },
              {
                GMAT: 540,
                GPA: 3.0,
                "GMAT 定量评分": 60,
                决策: "?"
              },
              {
                GMAT: 690,
                GPA: 2.85,
                "GMAT 定量评分": 80,
                决策: "?"
              },
              {
                GMAT: 490,
                GPA: 4.0,
                "GMAT 定量评分": 65,
                决策: "?"
              }
            ];

      function distribute(data, stats) {
        var total = 0;
        for (var i = 0; i < data.length; i++) {
          total++;
          var row = data[i];
          if (typeof stats["决策"]["set"][row["决策"]] === "undefined") {
            stats["决策"]["set"][row["决策"]] = 0;
          }

          stats["决策"]["set"][row["决策"]]++;
        }

        stats["决策"].sum = total;

        stats["决策"].entropy = id3.entropy(stats["决策"]);
      }

      function getDataStats(data, theAttr) {
        var stats = {
          决策: {
            set: {}
          }
        };

        distribute(data, stats);

        stats.range = id3.getAttributesRanges(data, theAttr);
        stats.categories = id3.divideRanges(stats.range);

        stats.subCategories = {};
        stats.subGains = {};
        var maxGain = -Infinity;

        for (var attr in stats.range) {
          if (attr === "决策") {
            continue;
          }

          stats.subCategories[attr] = id3.subDivide(
            data,
            attr,
            stats.categories[attr]
          );

          stats.subGains[attr] = id3.gain(
            stats["决策"],
            stats.subCategories[attr]
          );

          if (stats.subGains[attr] > maxGain) {
            maxGain = stats.subGains[attr];
            stats.maxGainAttr = attr;
          }
        }

        return stats;
      }

      $scope.subDivide = id3.subDivide;
      $scope.gain = id3.gain;

      $scope.stats = {};
      $scope.$watch("testData", function(oldValue, newValue) {
        console.log("testData updated");
        $scope.stats = getDataStats($scope.testData);

        $scope.id3();
      });

      $scope.stats.showSplitDetail = {};

      var $ = go.GraphObject.make;
      var myDiagram = $(go.Diagram, "myDiagramDiv", {
        initialAutoScale: go.Diagram.UniformToFill,
        layout: $(go.TreeLayout, { comparer: go.LayoutVertex.smartComparer }) // have the comparer sort by numbers as well as letters
        // other properties are set by the layout function, defined below
      });

      myDiagram.nodeTemplate = $(
        go.Node,
        "Auto", // the Shape will go around the TextBlock
        $(
          go.Shape,
          "RoundedRectangle",
          { strokeWidth: 0, fill: "white" }, // default fill is white
          // Shape.fill is bound to Node.data.color
          new go.Binding("fill", "color")
        ),
        $(
          go.TextBlock,
          { margin: 8 }, // some room around the text
          // TextBlock.text is bound to Node.data.key
          new go.Binding("text", "key")
        )
      );

      // but use the default Link template, by not setting Diagram.linkTemplate

      // create the model data that will be represented by Nodes and Links
      myDiagram.model = new go.GraphLinksModel(
        [
          { key: "Alpha", color: "lightblue" },
          { key: "Beta", color: "orange" },
          { key: "Gamma", color: "lightgreen" },
          { key: "Delta", color: "pink" }
        ],
        [
          { from: "Alpha", to: "Beta" },
          { from: "Alpha", to: "Gamma" },
          { from: "Beta", to: "Beta" },
          { from: "Gamma", to: "Delta" },
          { from: "Delta", to: "Alpha" }
        ]
      );

      $scope.id3 = function() {
        var models = [];
        var links = [];

        var initialStats = $scope.stats;
        $scope.stats.showSplitDetail = $scope.stats.showSplitDetail || {};
        $scope.stats.showSplitDetail[initialStats.maxGainAttr] = true;

        models.push({
          key: "决策"
        });

        models.push({
          key: initialStats.maxGainAttr
        });
        links.push({
          from: models[models.length - 2].key,
          to: initialStats.maxGainAttr
        });

        var statsQueue = [initialStats];

        var loops = 0;
        while (statsQueue.length && loops < 10000) {
          loops++;

          var theStats = statsQueue.shift();

          if (theStats["决策"].entropy <= 0) {
            continue;
          }

          for (var c in theStats.subCategories[theStats.maxGainAttr]) {
            var s = theStats.subCategories[theStats.maxGainAttr][c];

            models.push({ key: c });
            links.push({ from: theStats.maxGainAttr, to: c });

            if (s.entropy <= 0) {
              var key = Object.entries(s.set)[0][0];

              if (
                models.filter(function(m) {
                  return m.key === key;
                }).length <= 0
              ) {
                models.push({ key: key });
              }
              links.push({ from: c, to: key });

              continue;
            }

            var data = s.rawData;

            var dataStats = getDataStats(data, theStats.maxGainAttr);
            s.stats = dataStats;

            models.push({ key: dataStats.maxGainAttr });
            links.push({
              from: c,
              to: dataStats.maxGainAttr
            });

            if (
              dataStats["决策"].entropy > 0 &&
              Object.values(dataStats.subGains).reduce(function(prev, next) {
                return prev + next;
              }, 0) > 0
            ) {
              statsQueue.push(dataStats);
            }
          }
        }

        console.log("stats = ", $scope.stats, models, links);
        myDiagram.model = new go.GraphLinksModel(models, links);
      };

      var container = document.getElementById("data-table");
      var hot = new Handsontable(container, {
        data: id3.mapObjectArrayToArrayArray($scope.testData),
        colHeaders: true,
        rowHeaders: true,
        contextMenu: {
          callback: function() {
            $scope.testData = id3.mapArrayArrayToObjectArray(
              this.getData().filter(function(a) {
                return a.reduce(function(prev, next) {
                  return prev && next !== null;
                }, true);
              })
            );

            $scope.$apply();
          }
        },
        autoWrapRow: true,
        Controller: true,
        minSpareRows: 1,
        enterBeginsEditing: false,
        beforeChange: function(changes, source) {},
        afterChange: function() {
          $scope.testData = id3.mapArrayArrayToObjectArray(
            this.getData().filter(function(a) {
              return a.reduce(function(prev, next) {
                return prev && next !== null;
              }, true);
            })
          );
        }
      });
    }
  ]);
