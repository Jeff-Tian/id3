angular.module('id3Module', ['pascalprecht.translate', 'ngSanitize', 'localeHelperModule', 'id3MathModule'])
    .config(['$translateProvider', 'localeHelperProvider', function ($translateProvider, localeHelperProvider) {
        $translateProvider.useLoader('translationLoader');
        var locale = localeHelperProvider.getLocale(window.location.pathname);
        $translateProvider.preferredLanguage(locale);
        $translateProvider.useSanitizeValueStrategy('escapeParameters');
    }])
    .factory('translationLoader', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
        return function (options) {
            var dfd = $q.defer();

            // Filled by grunt
            var data = {};

            if (data[options.key]) {
                dfd.resolve(data[options.key]);

                return dfd.promise;
            }

            $http({
                    method: 'GET',
                    url: '/locales/' + options.key + '.json'
                })
                .then(
                    function (result) {
                        dfd.resolve(result);

                        console.log('localeResource:load');
                        $rootScope.$emit('localeResource:load');
                    },
                    dfd.reject
                );

            return dfd.promise;
        };
    }])
    .directive('tree', [function () {
        return {
            templateUrl: '/templates/stats.html',
            scope: {
                stats: '='
            },
            link: function (scope, element, attrs) {

            }
        };
    }])
    .controller('ID3Ctrl', ['$scope', 'id3', '$filter', '$q', function ($scope, id3, $filter, $q) {
        $scope.testData = location.search.indexOf('enjoySports') >= 0 ? [{
            Sky: 'Sunny',
            AirTemp: 'Warm',
            Humidity: 'Normal',
            Wind: 'Strong',
            Water: 'Warm',
            Forecast: 'Same',
            决策: 'Yes'
        }, {
            Sky: 'Sunny',
            AirTemp: 'Warm',
            Humidity: 'High',
            Wind: 'Strong',
            Water: 'Warm',
            Forecast: 'Same',
            决策: 'Yes'
        }, {
            Sky: 'Rainy',
            AirTemp: 'Cold',
            Humidity: 'High',
            Wind: 'Strong',
            Water: 'Warm',
            Forecast: 'Change',
            决策: 'No'
        }, {
            Sky: 'Sunny',
            AirTemp: 'Warm',
            Humidity: 'High',
            Wind: 'Strong',
            Water: 'Cool',
            Forecast: 'Change',
            决策: 'Yes'
        }] : [{
                GMAT: 650,
                GPA: 2.75,
                'GMAT 定量评分': 35,
                '决策': 'No'
            },
            {
                GMAT: 580,
                GPA: 3.50,
                'GMAT 定量评分': 70,
                '决策': 'No'
            },
            {
                GMAT: 600,
                GPA: 3.50,
                'GMAT 定量评分': 75,
                '决策': 'Yes'
            },
            {
                GMAT: 450,
                GPA: 2.95,
                'GMAT 定量评分': 80,
                '决策': 'No'
            },
            {
                GMAT: 700,
                GPA: 3.25,
                'GMAT 定量评分': 90,
                '决策': 'Yes'
            },
            {
                GMAT: 590,
                GPA: 3.50,
                'GMAT 定量评分': 80,
                '决策': 'Yes'
            },
            {
                GMAT: 400,
                GPA: 3.85,
                'GMAT 定量评分': 45,
                '决策': 'No'
            },
            {
                GMAT: 640,
                GPA: 3.50,
                'GMAT 定量评分': 75,
                '决策': 'Yes'
            },
            {
                GMAT: 540,
                GPA: 3.00,
                'GMAT 定量评分': 60,
                '决策': '?'
            },
            {
                GMAT: 690,
                GPA: 2.85,
                'GMAT 定量评分': 80,
                '决策': '?'
            },
            {
                GMAT: 490,
                GPA: 4.00,
                'GMAT 定量评分': 65,
                '决策': '?'
            }
        ];

        function distribute(data, stats) {
            var total = 0;
            for (var i = 0; i < data.length; i++) {
                total++;
                var row = data[i];
                if (typeof stats['决策']['set'][row['决策']] === 'undefined') {
                    stats['决策']['set'][row['决策']] = 0;
                }

                stats['决策']['set'][row['决策']]++;
            }

            stats['决策'].sum = total;

            stats['决策'].entropy = id3.entropy(stats['决策']);
        }

        function getDataStats(data, theAttr) {
            var stats = {
                '决策': {
                    set: {}
                }
            };

            console.log('theAttr = ', theAttr)
            console.log('stats = ', JSON.stringify(stats))
            distribute(data, stats);

            stats.range = id3.getAttributesRanges(data, theAttr);
            stats.categories = id3.divideRanges(stats.range);

            stats.subCategories = {};
            stats.subGains = {};
            var maxGain = -Infinity;

            for (var attr in stats.range) {
                if (attr === '决策') {
                    continue;
                }

                stats.subCategories[attr] = id3.subDivide(data, attr, stats.categories[attr]);

                stats.subGains[attr] = id3.gain(stats['决策'], stats.subCategories[attr]);

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
        $scope.$watch('testData', function (oldValue, newValue) {
            $scope.stats = getDataStats($scope.testData);
        });

        $scope.stats.showSplitDetail = {};
        $scope.id3 = function () {
            var initialStats = $scope.stats;
            $scope.stats.showSplitDetail = $scope.stats.showSplitDetail || {};
            $scope.stats.showSplitDetail[initialStats.maxGainAttr] = true;

            var statsQueue = [initialStats];

            var loops = 0;
            while (statsQueue.length && loops < 100) {
                loops++;

                var theStats = statsQueue.shift();

                if (theStats['决策'].entropy <= 0) {
                    console.log('skip ', theStats);
                    continue;
                }

                for (var c in theStats.subCategories[theStats.maxGainAttr]) {
                    var s = theStats.subCategories[theStats.maxGainAttr][c];

                    if (s.entropy <= 0) {
                        continue;
                    }

                    var data = s.rawData;

                    var dataStats = getDataStats(data, theStats.maxGainAttr);
                    s.stats = dataStats;

                    if (dataStats['决策'].entropy > 0) {
                        statsQueue.push(dataStats);
                    }
                }
            }
        };

        var container = document.getElementById('data-table');
        var hot = new Handsontable(container, {
            data: $scope.testData,
            colHeaders: Object.keys($scope.testData[0]),
            maxCols: Object.keys($scope.testData[0]).length,
            rowHeaders: true,
            contextMenu: true,
            autoWrapRow: true,
            Controller: true,
            minSpareRows: 1,
            beforeChange: function (changes, source) {},
            afterChange: function () {
                $scope.testData = this.getData().filter(function (a) {
                    return a.reduce(function (prev, next) {
                        return prev && next !== null;
                    }, true);
                }).map(function (a) {
                    var res = {};

                    var keys = Object.keys($scope.testData[0]);

                    for (var i = 0; i < keys.length; i++) {
                        res[keys[i]] = a[i];
                    }

                    return res;
                });
            }
        });
    }]);