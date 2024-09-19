export let questData:any = {
    "prerequisites": [
      {
        "id": "prerequisite_001",
        "type": "level",
        "value": 10,
        "description": "Player must be at least level 10"
      },
      {
        "id": "prerequisite_002",
        "type": "item",
        "value": "magic_key",
        "description": "Player must possess the magic key"
      },
      {
        "id": "prerequisite_003",
        "type": "quest_completion",
        "value": "quest_003",
        "description": "Player must have completed 'The Cave Awaits' quest"
      },
      {
        "id": "step_1",
        "type": "step_completion",
        "value": "step_1",
        "description": "Player must have completed Step 1"
      },
      {
        "id": "step_2",
        "type": "step_completion",
        "value": "step_2",
        "description": "Player must have completed Step 2"
      }
    ],
    "quests": [
  {
    "id": "quest_004",
    "name": "Epic Adventure",
    "description": "A quest with multiple steps, both linear and branching.",
    "availableAfter": "2024-09-13T00:00:00Z",  // Quest becomes available after this date
    "repeatable": true,
    "cooldown": 86400,  // Quest can be repeated after 24 hours
    "prerequisites": [
      {
        "id": "prerequisite_001"  // Player must be at least level 10
      },
      {
        "id": "prerequisite_002"  // Player must possess the magic key
      }
    ],
    "steps": [
      {
        "id": "step_1",
        "description": "Talk to the village elder",
        "type": "interaction",
        "prerequisites": [
          {
            "id": "prerequisite_001"  // Reuses the level 10 prerequisite
          }
        ]
      },
      {
        "id": "step_2",
        "description": "Collect 10 herbs or defeat the wild beast",
        "type": "branching",
        "prerequisites": [
          {
            "id": "step_1"  // Must have completed Step 1
          }
        ],
        "options": [
          {
            "id": "option_1",
            "description": "Collect 10 herbs",
            "type": "collection",
            "target": "herb",
            "quantity": 10,
            "prerequisites": []
          },
          {
            "id": "option_2",
            "description": "Defeat the wild beast",
            "type": "combat",
            "target": "wild_beast",
            "prerequisites": [
              {
                "id": "prerequisite_002"  // Must have magic key to defeat the beast
              }
            ]
          }
        ]
      },
      {
        "id": "step_3",
        "description": "Return to the village elder",
        "type": "interaction",
        "prerequisites": [
          {
            "id": "step_2"  // Must have completed Step 2
          }
        ]
      },
      {
        "id": "step_4",
        "description": "Explore the hidden cave (Optional)",
        "type": "exploration",
        "order": false,  // Optional step
        "prerequisites": [
          {
            "id": "prerequisite_003"  // Player must have completed 'The Cave Awaits' quest
          }
        ]
      }
    ],
    "rewards": {
      "xp": 1500,
      "items": ["healing_potion", "magic_sword"]
    }
  }
]
}  
  