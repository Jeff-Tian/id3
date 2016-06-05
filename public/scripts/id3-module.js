angular.module('id3Module', ['pascalprecht.translate', 'ngSanitize', 'localeHelperModule', 'id3MathModule'])
    .config(['$translateProvider', 'localeHelperProvider', function ($translateProvider, localeHelperProvider) {
        $translateProvider.useLoader('translationLoader');
        console.log('localeHelperProvider', localeHelperProvider);
        var locale = localeHelperProvider.getLocale(window.location.pathname);
        console.log('locale = ', locale);
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
                .success(function (result) {
                    dfd.resolve(result);

                    console.log('localeResource:load');
                    $rootScope.$emit('localeResource:load');
                })
                .error(dfd.reject);

            return dfd.promise;
        };
    }])
    .controller('ID3Ctrl', ['$scope', 'id3', '$filter', '$q', function ($scope, id3, $filter, $q) {
        $scope.testData =
            [
                {GMAT: 650, GPA: 2.75, 'GMAT 定量评分': 35, '决策': 'No'},
                {GMAT: 580, GPA: 3.50, 'GMAT 定量评分': 70, '决策': 'No'},
                {GMAT: 600, GPA: 3.50, 'GMAT 定量评分': 75, '决策': 'Yes'},
                {GMAT: 450, GPA: 2.95, 'GMAT 定量评分': 80, '决策': 'No'},
                {GMAT: 700, GPA: 3.25, 'GMAT 定量评分': 90, '决策': 'Yes'},
                {GMAT: 590, GPA: 3.50, 'GMAT 定量评分': 80, '决策': 'Yes'},
                {GMAT: 400, GPA: 3.85, 'GMAT 定量评分': 45, '决策': 'No'},
                {GMAT: 640, GPA: 3.50, 'GMAT 定量评分': 75, '决策': 'Yes'},
                {GMAT: 540, GPA: 3.00, 'GMAT 定量评分': 60, '决策': '?'},
                {GMAT: 690, GPA: 2.85, 'GMAT 定量评分': 80, '决策': '?'},
                {GMAT: 490, GPA: 4.00, 'GMAT 定量评分': 65, '决策': '?'}
            ];

        function distribute(stats) {
            var total = 0;
            for (var i = 0; i < $scope.testData.length; i++) {
                total++;
                var row = $scope.testData[i];
                if (typeof stats['决策']['set'][row['决策']] === 'undefined') {
                    stats['决策']['set'][row['决策']] = 0;
                }

                stats['决策']['set'][row['决策']]++;
            }

            stats['决策'].sum = total;

            stats['决策'].entropy = id3.entropy(stats['决策']);
        }

        function getDataStats(data) {
            var stats = {
                '决策': {
                    set: {}
                }
            };

            distribute(stats);

            stats.range = id3.getAttributesRanges(data);
            stats.categories = id3.divideRanges(stats.range);

            stats.subCategories = {};
            stats.subGains = {};
            var maxGain = -Infinity;

            for (var attr in stats.range) {
                if (attr === '决策') {
                    continue;
                }

                stats.subCategories[attr] = id3.subDivide($scope.testData, attr, stats.categories[attr]);

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
            $scope.stats.showSplitDetail[initialStats.maxGainAttr] = true;

            for (var c in initialStats.subCategories[initialStats.maxGainAttr]) {
                var data = initialStats.subCategories[initialStats.maxGainAttr][c].rawData;
                c.stats = getDataStats(data);
            }
        };

        var container = document.getElementById('data-table');
        var hot = new Handsontable(container, {
            data: $scope.testData,
            colHeaders: [
                //{data: 'GMAT'}, {data: 'GPA'}, {data: 'GMAT 定量评分'}, {data: '决策'}
                'GMAT', 'GPA', 'GMAT 定量评分', '决策'
            ],
            maxCols: 4,
            rowHeaders: true,
            contextMenu: true,
            autoWrapRow: true,
            Controller: true,
            minSpareRows: 1,
            beforeChange: function (changes, source) {
            },
            afterChange: function () {
                $scope.testData = this.getData().filter(function (a) {
                    return (a[0] !== null && a[1] !== null && a[2] !== null && a[3] !== null);
                }).map(function (a) {
                    return {
                        GMAT: a[0],
                        GPA: a[1],
                        'GMAT 定量评分': a[2],
                        '决策': a[3]
                    }
                });
            }
        });
    }])
;