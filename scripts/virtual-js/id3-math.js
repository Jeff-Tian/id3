(function() {
  function entropy(item) {
    var sum = 0;
    for (var c in item.set) {
      var f = item.set[c] / item.sum;
      sum -= f * Math.log2(f);
    }

    return sum;
  }

  function col(rows, index) {
    return rows.map(row => row[index]);
  }

  function getCols(dataArray) {
    var first = dataArray[0];
    var cols = {};
    for (var header in first) {
      cols[header] = col(dataArray, header);
    }

    return cols;
  }

  function getAttributesRanges(data, theAttr) {
    var cols = getCols(data);
    var ranges = {};

    for (var h in cols) {
      if (h === theAttr) {
        console.log("skipped same ", h);
        continue;
      } else {
        console.log("----- ", h);
      }

      if (cols[h] instanceof Array && typeof cols[h][0] === "number") {
        ranges[h] = [
          Math.min.apply(null, cols[h]),
          Math.max.apply(null, cols[h])
        ];
      } else {
        ranges[h] = Array.from(new Set(cols[h]));
      }
    }

    return ranges;
  }

  function divide(r, step) {
    var result = [];

    result.push([-Infinity, r[0]]);
    for (var i = r[0]; i < r[1]; i += step) {
      result.push([i, i + step]);
    }
    result.push([i, Infinity]);

    return result;
  }

  function trisector(r) {
    var range = r[1] - r[0];
    var step = range / 2;
    var mid = (r[0] + r[1]) / 2;
    var halfStep = step / 2;

    return [
      [-Infinity, mid - halfStep],
      [mid - halfStep, mid + halfStep],
      [mid + halfStep, Infinity]
    ];
  }

  function divideRange(r) {
    var result = {};

    if (typeof r[0] !== "number") {
      return r;
    }

    if (r[0] % 100 === 0 && r[1] % 100 === 0) {
      return divide(r, 100);
    }

    if (
      (r[0] * 100) % 25 === 0 &&
      (r[1] * 100) % 25 === 0 &&
      (r[0] % 1 !== 0 || r[1] % 1 != 0)
    ) {
      return divide(r, 0.25);
    }

    if (r[1] < 100) {
      var clone = [Math.floor(r[0] / 10) * 10, Math.ceil(r[1] / 10) * 10];
      return divide(clone, 10);
    }

    return result;
  }

  function divideRanges(ranges) {
    var res = {};

    for (var r in ranges) {
      if (
        ranges[r].reduce(function(prev, next) {
          return prev && !isNaN(next);
        }, true)
      ) {
        res[r] = trisector(ranges[r]);
      } else {
        res[r] = ranges[r];
      }
    }

    return res;
  }

  function hash(attr, range) {
    if (range instanceof Array) {
      return range[0] + " <= " + attr + " < " + range[1];
    } else {
      return attr + " = " + range;
    }
  }

  function subDivide(data, attr, categories) {
    var res = {};

    for (var i = 0; i < data.length; i++) {
      var r = categories.reduce(function(prev, next) {
        return prev && next instanceof Array;
      }, true)
        ? indexOfCategories(categories, data[i][attr])
        : data[i][attr];

      var h = hash(attr, r);
      if (!res.hasOwnProperty(h)) {
        res[h] = {};
      }

      if (!res[h].hasOwnProperty("rawData")) {
        res[h].rawData = [];
      }

      res[h].rawData.push(data[i]);

      res[h].sum = res[h].sum ? res[h].sum + 1 : 1;

      if (!res[h].hasOwnProperty("set")) {
        res[h].set = {};
      }

      res[h].set[data[i]["决策"]] = res[h].set[data[i]["决策"]]
        ? res[h].set[data[i]["决策"]] + 1
        : 1;
    }

    for (var j in res) {
      res[j].entropy = entropy(res[j]);
    }

    return res;
  }

  function indexOfCategories(categories, value) {
    var currentIndex = Math.floor(categories.length / 2);

    if (
      value >= categories[currentIndex][0] &&
      value < categories[currentIndex][1]
    ) {
      // console.log('found', value, ' ! ', currentIndex, ': ', categories[currentIndex]);
      return categories[currentIndex];
    }

    if (value < categories[currentIndex][0]) {
      // console.log('not found ', value, ' at ', currentIndex, ' yet at ', categories[currentIndex], ', goto lower');
      return indexOfCategories(categories.slice(0, currentIndex), value);
    }

    // console.log('not found  ', value, ' at ', currentIndex, ' yet at ', categories[currentIndex], ', goto upper');
    return indexOfCategories(categories.slice(currentIndex), value);
  }

  function gain(superItem, items) {
    var sum = 0;
    for (var c in items) {
      var item = items[c];
      sum += (item.entropy * item.sum) / superItem.sum;
    }

    return superItem.entropy - sum;
  }

  function mapObjectArrayToArrayArray(objectArray) {
    return [Object.keys(objectArray[0])].concat(
      objectArray.map(function(row) {
        return Object.values(row);
      })
    );
  }

  function mapArrayArrayToObjectArray(arrayArray) {
    return arrayArray.slice(1).map(function(row) {
      var o = {};

      arrayArray[0].map(function(col, index) {
        o[col] = row[index];
      });

      return o;
    });
  }

  var id3Math = {
    entropy: entropy,
    col: col,
    getCols: getCols,
    getAttributesRanges: getAttributesRanges,
    divideRange: divideRange,
    trisector: trisector,
    divideRanges: divideRanges,
    subDivide: subDivide,
    indexOfRange: indexOfCategories,
    gain: gain,
    mapArrayArrayToObjectArray: mapArrayArrayToObjectArray,
    mapObjectArrayToArrayArray: mapObjectArrayToArrayArray
  };

  if (typeof angular !== "undefined") {
    angular.module("id3MathModule", []).factory("id3", [
      function() {
        return id3Math;
      }
    ]);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = id3Math;
  }
})();
