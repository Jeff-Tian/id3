var id3Math = require("../public/scripts/virtual-js/id3-math");
var assert = require("assert");

describe("ID3 Math", function() {
  var data = [
    {
      id: 1,
      data: 2,
      d: "Yes"
    },
    {
      id: 2,
      data: 4,
      d: "No"
    },
    {
      id: 3,
      data: 8,
      d: "Yes"
    },
    {
      id: 4,
      data: 9,
      d: "Yes"
    }
  ];

  it("returns columns of an array of data", function() {
    assert.deepStrictEqual(id3Math.col(data, "id"), [1, 2, 3, 4]);
  });

  it("transform data", function() {
    assert.deepStrictEqual(id3Math.getCols(data), {
      id: [1, 2, 3, 4],
      data: [2, 4, 8, 9],
      d: ["Yes", "No", "Yes", "Yes"]
    });
  });

  it("ranges data", function() {
    assert.deepStrictEqual(id3Math.getAttributesRanges(data), {
      id: [1, 4],
      data: [2, 9],
      d: ["Yes", "No"]
    });
  });
});

describe("ID3 Math for enjoySports", () => {
  const data = [
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
    }
  ];

  it("ranges correctly", () => {
    assert.deepStrictEqual(id3Math.getAttributesRanges(data), {
      Sky: ["Sunny", "Rainy"],
      AirTemp: ["Warm", "Cold"],
      Humidity: ["Normal", "High"],
      Wind: ["Strong"],
      Water: ["Warm", "Cool"],
      Forecast: ["Same", "Change"],
      决策: ["Yes", "No"]
    });
  });
});

describe("ID3 Math 2", function() {
  it("descrets continous range", function() {
    var r = [400, 700];

    assert.deepStrictEqual(id3Math.divideRange(r), [
      [-Infinity, 400],
      [400, 500],
      [500, 600],
      [600, 700],
      [700, Infinity]
    ]);

    assert.deepStrictEqual(id3Math.trisector(r), [
      [-Infinity, 475],
      [475, 625],
      [625, Infinity]
    ]);

    r = [2.75, 4];

    assert.deepStrictEqual(id3Math.divideRange(r), [
      [-Infinity, 2.75],
      [2.75, 3],
      [3, 3.25],
      [3.25, 3.5],
      [3.5, 3.75],
      [3.75, 4],
      [4, Infinity]
    ]);

    r = [35, 90];

    assert.deepStrictEqual(id3Math.divideRange(r), [
      [-Infinity, 30],
      [30, 40],
      [40, 50],
      [50, 60],
      [60, 70],
      [70, 80],
      [80, 90],
      [90, Infinity]
    ]);
  });
});

describe("Index of categories", function() {
  it("find index of categories given a value", function() {
    var categories = [
      [-Infinity, 30],
      [30, 40],
      [40, 50],
      [50, 60],
      [60, 70],
      [70, 80],
      [80, 90],
      [90, Infinity]
    ];

    assert.deepStrictEqual(id3Math.indexOfRange(categories, 33), [30, 40]);
    assert.deepStrictEqual(id3Math.indexOfRange(categories, 9), [
      -Infinity,
      30
    ]);
    assert.deepStrictEqual(id3Math.indexOfRange(categories, 99), [
      90,
      Infinity
    ]);
  });
});

describe("Sub divide", function() {
  it("sub divides data", function() {
    var data = [
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
    var attribute = "GMAT";
    var range = [[-Infinity, 600], [600, Infinity]];
    assert.deepStrictEqual(id3Math.subDivide(data, attribute, range), {
      "600 <= GMAT < Infinity": {
        entropy: 1.3709505944546687,
        sum: 5,
        set: {
          No: 1,
          Yes: 3,
          "?": 1
        },
        rawData: [
          {
            GMAT: 650,
            "GMAT 定量评分": 35,
            GPA: 2.75,
            决策: "No"
          },
          {
            GMAT: 600,
            "GMAT 定量评分": 75,
            GPA: 3.5,
            决策: "Yes"
          },
          {
            GMAT: 700,
            "GMAT 定量评分": 90,
            GPA: 3.25,
            决策: "Yes"
          },
          {
            GMAT: 640,
            "GMAT 定量评分": 75,
            GPA: 3.5,
            决策: "Yes"
          },
          {
            GMAT: 690,
            "GMAT 定量评分": 80,
            GPA: 2.85,
            决策: "?"
          }
        ]
      },
      "-Infinity <= GMAT < 600": {
        entropy: 1.4591479170272446,
        sum: 6,
        set: {
          No: 3,
          Yes: 1,
          "?": 2
        },
        rawData: [
          {
            GMAT: 580,
            "GMAT 定量评分": 70,
            GPA: 3.5,
            决策: "No"
          },
          {
            GMAT: 450,
            "GMAT 定量评分": 80,
            GPA: 2.95,
            决策: "No"
          },
          {
            GMAT: 590,
            "GMAT 定量评分": 80,
            GPA: 3.5,
            决策: "Yes"
          },
          {
            GMAT: 400,
            "GMAT 定量评分": 45,
            GPA: 3.85,
            决策: "No"
          },
          {
            GMAT: 540,
            "GMAT 定量评分": 60,
            GPA: 3,
            决策: "?"
          },
          {
            GMAT: 490,
            "GMAT 定量评分": 65,
            GPA: 4,
            决策: "?"
          }
        ]
      }
    });
  });
});

describe("entropy", function() {
  it("calculates entropy", function() {
    assert.equal(
      id3Math.entropy({
        sum: 5,
        set: {
          No: 1,
          Yes: 3,
          "?": 1
        }
      }),
      1.3709505944546687
    );
    assert.equal(
      id3Math.entropy({
        sum: 6,
        set: {
          No: 3,
          Yes: 1,
          "?": 2
        }
      }),
      1.4591479170272446
    );
  });
});

describe("Information Gain", function() {
  it("calculates gain", function() {
    assert.equal(
      id3Math.gain(
        {
          entropy: 1.5726236638951638,
          set: {
            "?": 3,
            No: 4,
            Yes: 4
          },
          sum: 11
        },
        {
          "600 <= GMAT < Infinity": {
            entropy: 1.3709505944546687,
            sum: 5,
            set: {
              No: 1,
              Yes: 3,
              "?": 1
            }
          },
          "-Infinity <= GMAT < 600": {
            entropy: 1.4591479170272446,
            sum: 6,
            set: {
              No: 3,
              Yes: 1,
              "?": 2
            }
          }
        }
      ),
      0.15356543894636276
    );
  });
});

describe("Information gain for enjoySports", () => {
  it("calculates gain", () => {
    assert.equal(
      id3Math.gain(
        {
          entropy: 0.81127812445913286391,
          set: {
            No: 1,
            Yes: 3
          },
          sum: 4
        },
        {
          "Sky = Sunny": {
            entropy: 0,
            sum: 3,
            set: {
              Yes: 3
            }
          },
          "Sky = Rainy": {
            entropy: 0,
            sum: 1,
            set: {
              No: 1
            }
          }
        }
      ),
      0.8112781244591328
    );
  });
});

describe("map", function() {
  const arrayArray = [
    ["", "Tesla", "Nissan", "Toyota", "Honda", "Mazda", "Ford"],
    ["2017", 10, 11, 12, 13, 15, 16],
    ["2018", 10, 11, 12, 13, 15, 16],
    ["2019", 10, 11, 12, 13, 15, 16],
    ["2020", 10, 11, 12, 13, 15, 16],
    ["2021", 10, 11, 12, 13, 15, 16]
  ];

  const objectArray = [
    {
      "": "2017",
      Tesla: 10,
      Nissan: 11,
      Toyota: 12,
      Honda: 13,
      Mazda: 15,
      Ford: 16
    },
    {
      "": "2018",
      Tesla: 10,
      Nissan: 11,
      Toyota: 12,
      Honda: 13,
      Mazda: 15,
      Ford: 16
    },
    {
      "": "2019",
      Tesla: 10,
      Nissan: 11,
      Toyota: 12,
      Honda: 13,
      Mazda: 15,
      Ford: 16
    },
    {
      "": "2020",
      Tesla: 10,
      Nissan: 11,
      Toyota: 12,
      Honda: 13,
      Mazda: 15,
      Ford: 16
    },
    {
      "": "2021",
      Tesla: 10,
      Nissan: 11,
      Toyota: 12,
      Honda: 13,
      Mazda: 15,
      Ford: 16
    }
  ];

  it("converts arrayArray to objectArray", () => {
    assert.deepStrictEqual(
      id3Math.mapArrayArrayToObjectArray(arrayArray),
      objectArray
    );
  });

  it("converts objectArray to arrayArray", () => {
    assert.deepStrictEqual(
      id3Math.mapObjectArrayToArrayArray(objectArray),
      arrayArray
    );
  });
});
