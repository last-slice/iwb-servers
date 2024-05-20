export let testData:any = 
[
  {
    "id": "mwnJU",
    "n": "lobby",
    "d": "",
    "o": "0x3edfae1ce7aeb54ed6e171c4b13e343ba81669b6",
    "ona": "BuilderWorld",
    "cat": "",
    "bpcl": "1,1",
    "w": "BuilderWorld.dcl.eth",
    "im": "",
    "bps": [],
    "pcls": [
      "1,1",
      "0,1",
      "0,0",
      "1,0"
    ],
    "sp": [
      "0,0,0"
    ],
    "cp": [
      "0,0,0"
    ],
    "cd": 1711644442,
    "upd": 1711644442,
    "si": -691328,
    "toc": 0,
    "pc": -1516,
    "pcnt": 4,
    "isdl": false,
    "e": true,
    "priv": false,
    "lim": true,

    "components":{
      "IWB":{},
      "Pointers":{
        "bEQXB0":{
          "pointerEvents":[
            {
              "eventType":1,
              "eventInfo":{
                "button":0,
                "hoverText":"Testing Click",
                "maxDistance":20,
                "showFeedback":true
              }
            }
          ]
        }
      },
      "Transform":{
        "bEQXB0":{
          "p": {
            "x": 10.33,
            "y": 1.06,
            "z": -2.25
          },
          "r": {
            "x": 0,
            "y": 342.72,
            "z": 0
          },
          "s": {
            "x": 1,
            "y": 1,
            "z": 1
          }
        },
        "bEQXB1":{
          "p": {
            "x": 10.33,
            "y": 1.06,
            "z": 2.25
          },
          "r": {
            "x": 0,
            "y": 0,
            "z": 0
          },
          "s": {
            "x": 1,
            "y": 1,
            "z": 1
          }
        }
      },
      "Names":{
        "bEQXB0":{
          "value":"Test Catalog Item"
        },
        "bEQXB1":{
          "value":"Test Catalog Item 2"
        }
      },
      "Visibility":{
        "bEQXB0":{
          "visible":true
        },
        "bEQXB1":{
          "visible":false
        }
      },
      "Parenting":[
        {"entity":"0", "children":["bEQXB0", "bEQXB1"]},
        {"entity":"1", "children":[]},
        {"entity":"2", "children":[]},
        {"entity":"bEQXB0", "children":[]},
        {"entity":"bEQXB1", "children":[]},
      ],
      "Text":{
        "bEQXB0":{
          "text": "Enemies Spawned",
          "font": 2,
          "fontSize": 3,
          "fontAutoSize": false,
          "textAlign": 4,
          "paddingTop": 0,
          "paddingRight": 0,
          "paddingBottom": 0,
          "paddingLeft": 0,
          "lineSpacing": 0,
          "outlineWidth": 0,
          "outlineColor": [1,1,1],
          "textColor": [1,1,1,1]
        }
      },
      "Counters":{
        "bEQXB0":{
          "counters":{
            "lives":3,
            "score":4
          }
        }
      },
      "Triggers":{
        "bEQXB0":{
          "triggers":[
            {
              "type":"on_input_action",
              "conditions":[],
              "actions":[
                {
                  "id":"3xi2k3"
                }
              ]
            }
          ]
        }
      },
      "Actions":{
        "bEQXB1":{
          "actions":[
            {
              "id":"3xi2k3",
              "name":"Test Action 1",
              "type":"show_text",
              "text":"Hello"
            }
          ]
        }
      }
    }
  }
]