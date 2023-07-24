RPGDATABASES.default={
    id:"default",
    description:"Default RPG database.",
    load:()=>{
            
        const
            PERSON_TAGS=["person"],
            PLACE_ICONTAGS=["place"],
            ITEM_TAGS=["items"],
            DANGER_TAGS=[ "plot", "quest", "enemy", "story", "danger" ],
            PERSONIDENTITY_TAGS=[ "class", "type", "identity", "stats", "person" ],
            PERSON_ICONTAGS=["person"],
            PLACE_TAGS=["place"],
            NEWPERSON_TAGS=["person","name"],
            NEWPLACE_TAGS=["place","name"],
            EVENT_TAGS=["story","event"],
            ITEMNAME_TAGS=["items", "name" ],
            SHOPITEMNAME_TAGS=["shop","merchant"],
            SPECIALITEM_TAGS=["special", "rare"],
            PLACECREATURES_TAGS=[ "people" ],
            PLACECREATURE_TAGS=[ "creature" ],
            PLACEANIMAL_TAGS=[ "animal" ],
            PLACEINSECT_TAGS=[ "insect" ],
            PLACEELF_TAGS=[ "elf" ],
            PLACEDWARF_TAGS=[ "dwarf" ],
            PLACEHUMANOID_TAGS=[ ],
            CLASSES=[
                { id:"classBarbarian", label:"Barbarian", oracleClassLabel:"It's a barbarian...", oracleLabel:"Tell me a barbarian identity", stats:{ str:16, dex:12, con:15, int:9, cha:8, dmg:10 }, hpBonus:8, alignment:[ "chaotic", "neutral" ], tags:[ "barbarian" ], classTags:[ "strong", "muscle", "fighter" ] }, // wis:9
                { id:"classBard", label:"Bard", oracleClassLabel:"It's a bard...", oracleLabel:"Tell me a bard identity", stats:{ str:9, dex:12, con:8, int:15, cha:16, dmg:6 }, hpBonus:6, alignment:[ "good", "chaotic", "neutral" ], tags:[ "bard" ], classTags:[ "sing", "charm", "love" ] }, // wis:9
                { id:"classCleric", label:"Cleric", oracleClassLabel:"It's a cleric...", oracleLabel:"Tell me a cleric identity", stats:{ str:8, dex:9, con:16, int:15, cha:12, dmg:6 }, hpBonus:8, alignment:[ "good", "lawful", "evil" ], tags:[ "cleric" ], classTags:[ "pray", "light", "god" ] }, // wis:9
                { id:"classDruid", label:"Druid", oracleClassLabel:"It's a druid...", oracleLabel:"Tell me a druid identity", stats:{ str:12, dex:15, con:9, int:16, cha:8, dmg:6 }, hpBonus:6, alignment:[ "chaotic", "good", "neutral" ], tags:[ "druid" ], classTags:[ "nature", "wizard" ] }, // wis:9
                { id:"classWarrior", label:"Warrior", oracleClassLabel:"It's a warrior...", oracleLabel:"Tell me a warrior identity", stats:{ str:15, dex:16, con:12, int:8, cha:9, dmg:10 }, hpBonus:10, alignment:[ "good", "neutral", "evil" ], tags:[ "warrior" ], classTags:[ "strong", "mercenary", "weapon" ] }, // wis:9
                { id:"classThief", label:"Thief", oracleClassLabel:"It's a thief...", oracleLabel:"Tell me a thief identity", stats:{ str:8, dex:15, con:9, int:12, cha:16, dmg:8 }, hpBonus:6, alignment:[ "chaotic", "neutral", "evil" ], tags:[ "thief" ], classTags:[ "steal", "hide", "murder" ] }, // wis:9
                { id:"classWizard", label:"Wizard", oracleClassLabel:"It's a wizard...", oracleLabel:"Tell me a wizard identity", stats:{ str:9, dex:8, con:12, int:16, cha:15, dmg:4 }, hpBonus:4, alignment:[ "good", "neutral", "evil" ], tags:[ "wizard" ], classTags:[ "spell", "knowledge", "book" ] }, // wis:9
                { id:"classPaladin", label:"Paladin", oracleClassLabel:"It's a paladin...", oracleLabel:"Tell me a paladin identity", stats:{ str:15, dex:9, con:16, int:8, cha:12, dmg:10 }, hpBonus:10, alignment:[ "good", "neutral", "evil" ], tags:[ "paladin" ], classTags:[ "righteous", "shield", "protect" ] }, // wis:9
                { id:"classTraveler", label:"Traveler", oracleClassLabel:"It's a traveler...", oracleLabel:"Tell me a traveler identity", stats:{ str:12, dex:16, con:8, int:9, cha:15, dmg:8 }, hpBonus:8, alignment:[ "chaotic", "neutral", "evil" ], tags:[ "traveler" ], classTags:[ "travel", "orientation", "guide" ] }, // wis:9
            ],
            FAIL_ACTIONS=[
                { onContext:["person"], type:"changeStat", to:[ { section:"attributes", stat:"xp" } ], value:[ { type:"sumValue", value:1 }], label:"Learn from mistakes"}
            ],
            CHALLENGE_RESULTS={
                fail:[ { type:"text", text:"You failed." } ].concat(FAIL_ACTIONS),
                failSuccess:[ { type:"text", text:"You succedeed but you fell, hesitated, or stepped back. Decide a price for your success." } ],
                success:[ { type:"text", text:"You succedeed!" } ]
            },
            DEFENSE_OPTIONS=[
                { type:"roleAction", label:"Redirect the attack to yourself"},
                { type:"roleAction", label:"Half the damage"},
                { type:"roleAction", label:"Advantage an ally"},
                { type:"roleAction", label:"Deal as damage as your level"}
            ],
            PERCEPTION_OPTIONS=[
                { type:"roleAction", label:"What happened recently?" },
                { type:"roleAction", label:"What's going to happen?" },
                { type:"roleAction", label:"Of who or what you've to be aware?" },
                { type:"roleAction", label:"Is there something useful or valuable for me here?" },
                { type:"roleAction", label:"Who is truly controlling everything?" },
                { type:"roleAction", label:"What's not as it appears here?" }
            ],
            PARTY_OPTIONS=[
                { type:"roleAction", label:"You found a friendly NPC" },
                { type:"roleAction", label:"You hear about an opportunity" },
                { type:"roleAction", label:"You hear something useful" },
                { type:"roleAction", label:"You don't end up cheated" }
            ],
            SPECIALROLE_ACTIONS=[
                { id:"lightAction", tags:["light","bright","fire","flaming","torch"], label:"Light up the environment", action:[
                    { type:"text", text:"A soft light now allows you to look around..." },
                    { type:"oracle", id:"whatsNextPerson" },
                    { type:"oracle", id:"whatsNextPlace" },
                ] }
            ],
            ENVIRONMENTS=[
                {
                    id:"cavern",
                    tags:[ "cavern", "cave", "grotto" ],
                    oracleLabel:"Tell me a cavern creature",
                    anyCreatureLabel:"It's coming from the caverns!",
                    creatures:[
                        {
                            type: PLACEANIMAL_TAGS,
                            id:"giantSnail",
                            label:"Giant Snail",
                            stats:{ hp:10 },
                            group: [ "horde" ],
                            weapon:[ "spit", "acid" ],
                            appearance:[ "snail", "giant" ],
                            habit:[ "digging" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"jellyCube",
                            label:"Jelly Cube",
                            stats:{ hp:20 },
                            group: [ "loner" ],
                            weapon:[ "corrosive", "dissolve" ],
                            appearance:[ "jelly", "transparent", "cube" ],
                            habit:[ "cleaning" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"earthElemental",
                            label:"Earth Elemental",
                            stats:{ hp:27 },
                            group: [ "loner" ],
                            weapon: [ "fists"],
                            appearance:[ "giant", "stone" ],
                            habit:[ "strength" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"gargoyle",
                            label:"Gargoyle",
                            stats:{ hp:3 },
                            group: [ "horde" ],
                            weapon: [ "claws" ],
                            appearance:[ "statue" ],
                            habit:[ "stealth", "collector", "surprise", "hide" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"goblin",
                            label:"Goblin",
                            stats:{ hp:3 },
                            group: [ "horde" ],
                            weapon: [ "spear" ],
                            appearance:[ "small", "green" ],
                            habit:[ "smart", "organized", "charge", "help", "run" ]
                        },{
                            type: PLACEDWARF_TAGS,
                            id:"dwarfWarrior",
                            label:"Dwarf Warrior",
                            isSentient:true,
                            stats:{ hp:7 },
                            group: [ "horde" ],
                            weapon: [ "axe" ],
                            appearance: [ ],
                            habit:[ "organized", "defensive" ]
                        },{
                            type: PLACEINSECT_TAGS,
                            id:"consumingLarva",
                            label:"Consuming Larva",
                            stats:{ hp:3 },
                            group: [ "horde" ],
                            weapon: [ "crawl", "flesh" ],
                            appearance: [ "tiny", "larva" ],
                            habit:[ "lay", "eggs" ]
                        },{
                            type: PLACEANIMAL_TAGS,
                            id:"caveOctopus",
                            label:"Cave Octopus",
                            stats:{ hp:20 },
                            group: [ "loner" ],
                            weapon: [ "tentacles" ],
                            appearance: [ "giant", "octopus" ],
                            habit:[ "soil", "infect", "throw" ]
                        },{
                            type: PLACEANIMAL_TAGS,
                            id:"caveRat",
                            label:"Cave Rat",
                            stats:{ hp:7 },
                            group: [ "horde" ],
                            weapon: [ "bite" ],
                            appearance: [ "small", "rat" ],
                            habit:[ "devour" ]
                        },{
                            type: PLACEINSECT_TAGS,
                            id:"fireBeetle",
                            label:"Fire Beetle",
                            stats:{ hp:3 },
                            group: [ "horde" ],
                            weapon: [ "burn" ],
                            appearance: [ "flame", "beetle" ],
                            habit:[ "crawl", "spray" ]
                        },{
                            type: PLACEINSECT_TAGS,
                            id:"kingSpider",
                            label:"King Spider",
                            stats:{ hp:16 },
                            group: [ "loner" ],
                            weapon: [ "bite" ],
                            appearance: [ "giant", "spider" ],
                            habit:[ "crawl", "web", "plan" ]
                        }
                    ]
                },{
                    id:"swamp",
                    tags:[ "swamp", "mud" ],
                    oracleLabel:"Tell me a swamp creature",
                    anyCreatureLabel:"It's coming from the swamps!",
                    creatures:[
                        {
                            type: PLACEANIMAL_TAGS,
                            id:"fireEel",
                            label:"Fire Eel",
                            stats:{ hp:3 },
                            group: [ "horde" ],
                            weapon:[ "burning", "touch" ],
                            appearance:[ "flaming", "eel" ],
                            habit:[ "swim" ]
                        },{
                            type: PLACEANIMAL_TAGS,
                            id:"dragonTurtle",
                            label:"Dragon Turtle",
                            stats:{ hp:16 },
                            group: [ "loner" ],
                            weapon:[ "bite" ],
                            appearance:[ "giant", "turtle" ],
                            habit:[ "devour", "illusion", "chase" ]
                        },{
                            type: PLACEANIMAL_TAGS,
                            id:"petrifyingSnake",
                            label:"Petrifying Snake",
                            stats:{ hp:12 },
                            group: [ "loner" ],
                            weapon:[ "bite" ],
                            appearance:[ "snake", "gray" ],
                            habit:[ "gaze", "transform", "stone" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"kobold",
                            label:"Kobold",
                            stats:{ hp:3 },
                            group: [ "horde" ],
                            weapon:[ "spear" ],
                            appearance:[ "small", "lizard", "man" ],
                            habit:[ "stealth", "smart", "organized" ]
                        },{
                            type: PLACEANIMAL_TAGS,
                            id:"giantCrocodile",
                            label:"Giant Crocodile",
                            stats:{ hp:10 },
                            group: [ "group" ],
                            weapon:[ "bite" ],
                            appearance:[ "giant", "crocodile" ],
                            habit:[ "surprise", "run", "squeeze" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"littleDragon",
                            label:"Little Dragon",
                            stats:{ hp:16 },
                            group: [ "loner" ],
                            weapon:[ "elemental", "breathe" ],
                            appearance:[ "small", "dragon" ],
                            habit:[ "deal" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"doppelganger",
                            label:"Doppelganger",
                            stats:{ hp:12 },
                            group: [ "loner" ],
                            weapon:[ "dagger" ],
                            appearance:[ "doppelganger", "person", "copy" ],
                            habit:[ "smart", "elusive" ]
                        },{
                            type: PLACEANIMAL_TAGS,
                            id:"hydra",
                            label:"Hydra",
                            stats:{ hp:16 },
                            group: [ "loner" ],
                            weapon:[ "bite" ],
                            appearance:[ "giant", "dragon", "heads" ],
                            habit:[ "grow", "regenerate" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"medusa",
                            label:"Medusa",
                            stats:{ hp:12 },
                            group: [ "loner" ],
                            weapon:[ "claws" ],
                            appearance:[ "gorgeous", "woman", "snake", "hair" ],
                            habit:[ "elusive", "smart" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"troll",
                            label:"Troll",
                            stats:{ hp:20 },
                            group: [ "loner" ],
                            weapon:[ "club" ],
                            appearance:[ "big", "tough", "dirty" ],
                            habit:[ "regenerate", "throw", "destroy" ]
                        }
                    ]
                },{
                    id:"forest",
                    tags:[ "forest", "trees" ],
                    oracleLabel:"Tell me a forest creature",
                    anyCreatureLabel:"It's coming from the forests!",
                    creatures:[
                        {
                            type: PLACECREATURE_TAGS,
                            id:"centaur",
                            label:"Centaur",
                            stats:{ hp:11 },
                            group: [ "horde" ],
                            weapon:[ "bow" ],
                            appearance:[ "horse", "human" ],
                            habit:[ "smart", "organized", "precise", "fast" ]
                        },{
                            type: PLACEANIMAL_TAGS,
                            id:"boar",
                            label:"Boar",
                            stats:{ hp:16 },
                            group: [ "fangs" ],
                            weapon:[ "bow" ],
                            appearance:[ "big", "boar" ],
                            habit:[ "tear", "scratch", "charge" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"treesLady",
                            label:"Trees Lady",
                            stats:{ hp:12 },
                            group: [ "loner" ],
                            weapon:[ "magic", "crush", "tendrils" ],
                            appearance:[ "gorgeous", "woman", "tree" ],
                            habit:[ "seduce", "defend" ]
                        },{
                            type: PLACEELF_TAGS,
                            id:"warriorElf",
                            label:"Warrior Elf",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "group" ],
                            weapon:[ "sword" ],
                            appearance:[ "warrior" ],
                            habit:[ "smart", "agile", "hide", "plan" ]
                        },{
                            type: PLACEELF_TAGS,
                            id:"arcaneElf",
                            label:"Arcane Elf",
                            isSentient:true,
                            stats:{ hp:12 },
                            group: [ "group" ],
                            weapon:[ "arcane", "flame" ],
                            appearance:[ "mage" ],
                            habit:[ "nature" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"giantHills",
                            label:"Hill Giant",
                            stats:{ hp:10 },
                            group: [ "group" ],
                            weapon:[ "throw", "stones" ],
                            appearance:[ "giant" ],
                            habit:[ "dumb", "angry", "crush", "shake" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"werewolf",
                            label:"Werewolf",
                            stats:{ hp:12 },
                            group: [ "loner" ],
                            weapon:[ "bite" ],
                            appearance:[ "wolf", "human" ],
                            habit:[ "smart", "disguise", "hunt" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"ogre",
                            label:"Ogre",
                            stats:{ hp:10 },
                            group: [ "loner" ],
                            weapon:[ "club" ],
                            appearance:[ "big", "human" ],
                            habit:[ "smart", "hold", "lunatic" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"treeMan",
                            label:"Tree Man",
                            stats:{ hp:21 },
                            group: [ "group" ],
                            weapon:[ "cutting", "branches" ],
                            appearance:[ "giant", "tree", "man" ],
                            habit:[ "move", "spread", "magic" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"sprite",
                            label:"Sprite",
                            stats:{ hp:3 },
                            group: [ "horde" ],
                            weapon:[ "dagger" ],
                            appearance:[ "small", "sprite" ],
                            habit:[ "confuse", "fly", "lift" ]
                        }
                    ]
                },{
                    id:"undead",
                    tags:[ "undead", "zombie", "vampire", "ghost", "soul", "bone", "cursed", "mummy", "vampire", "graveyard", "cemetery", "tombstone" ],
                    oracleLabel:"Tell me an undead creature",
                    anyCreatureLabel:"It's an undead!",
                    creatures:[
                        {
                            type: PLACECREATURE_TAGS,
                            id:"corpseCollage",
                            label:"Corpse Collage",
                            stats:{ hp:20 },
                            group: [ "loner" ],
                            weapon:[ "smash", "scratch", "vomit" ],
                            appearance:[ "abomination", "composed" ],
                            habit:[ "kill" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"deathBird",
                            label:"Bird of Death",
                            stats:{ hp:7 },
                            group: [ "horde" ],
                            weapon:[ "scratch" ],
                            appearance:[ "big", "black", "bird" ],
                            habit:[ "scream", "hunt" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"darkLady",
                            label:"Dark Lady",
                            stats:{ hp:16 },
                            group: [ "loner" ],
                            weapon: [ "scream", "strangle" ],
                            appearance:[ "suffering", "woman", "dark" ],
                            habit:[ "scream", "hide" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"soulEater",
                            label:"Soul Eater",
                            stats:{ hp:16 },
                            group: [ "loner" ],
                            weapon: [ "bite" ],
                            appearance:[ "dark", "magic", "monk" ],
                            habit:[ "trap", "bargain" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"boneDragon",
                            label:"Bone Dragon",
                            stats:{ hp:20 },
                            group: [ "loner" ],
                            weapon: [ "bite" ],
                            appearance:[ "huge", "dragon", "bones" ],
                            habit:[ "serve" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"cursedWarrior",
                            label:"Cursed Warrior",
                            stats:{ hp:7 },
                            group: [ "horde" ],
                            weapon: [ "ice" ],
                            appearance: [ "warrior", "cold" ],
                            habit:[ "vengeful" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"ghost",
                            label:"Ghost",
                            stats:{ hp:16 },
                            group: [ "loner" ],
                            weapon: [ "touch", "scratch" ],
                            appearance: [ "ghost", "transparent" ],
                            habit:[ "haunt", "sell", "information" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"fleshGoblin",
                            label:"Flesh Goblin",
                            stats:{ hp:10 },
                            group: [ "group" ],
                            weapon: [ "bite" ],
                            appearance: [ "hungry", "goblin", "flesh" ],
                            habit:[ "eat", "flesh", "collect" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"mummy",
                            label:"Mummy",
                            stats:{ hp:16 },
                            group: [ "loner" ],
                            weapon: [ "punch" ],
                            appearance: [ "bandages" ],
                            habit:[ "curse", "wrap", "resurrect" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"skeleton",
                            label:"Skeleton",
                            stats:{ hp:7 },
                            group: [ "horde" ],
                            weapon: [ "punch", "scratch" ],
                            appearance: [ "living", "bones" ],
                            habit:[ "kill", "reconstruct" ]
                        },{
                            type: PLACECREATURE_TAGS,
                            id:"vampire",
                            label:"Vampire",
                            stats:{ hp:10 },
                            group: [ "group" ],
                            weapon: [ "spell", "bite" ],
                            appearance: [ "beautiful", "noble" ],
                            habit:[ "drink", "blood", "plan", "charm" ]
                        }
                    ]
                },{
                    id:"human",
                    tags:[ "someone", "somebody", "human", "place", "city", "town" ],
                    oracleLabel:"Tell me a human creature",
                    anyCreatureLabel:"It's a human...",
                    creatures:[
                        {
                            type: PLACEHUMANOID_TAGS,
                            id:"monk",
                            label:"Monk",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "horde" ],
                            weapon:[ ],
                            appearance:[ "monk", "tunic" ],
                            habit:[ "serve", "duty", "religion" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"adventurer",
                            label:"Adventurer",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "horde" ],
                            weapon:[ "sword" ],
                            appearance:[ "adventurer", "young" ],
                            habit:[ "enthusiasm", "brave" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"bandit",
                            label:"Bandit",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "loner" ],
                            weapon:[ "knife" ],
                            appearance:[ "bandit", "cloak", "shady" ],
                            habit:[ "lead" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"minstrel",
                            label:"Minstrel",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "loner" ],
                            weapon: [ ],
                            appearance:[ "smiling" ],
                            habit:[ "sing", "convince" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"fool",
                            label:"Fool",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "loner" ],
                            weapon: [ ],
                            appearance:[ "fool", "painted" ],
                            habit:[ "mock", "funny" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"mercenary",
                            label:"Mercenary",
                            isSentient:true,
                            stats:{ hp:6 },
                            group: [ "loner" ],
                            weapon: [ "spear" ],
                            appearance:[ "mercenary", "armor" ],
                            habit:[ "follow", "orders", "profit" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"thief",
                            label:"Thief",
                            isSentient:true,
                            stats:{ hp:12 },
                            group: [ "loner" ],
                            weapon: [ "dagger" ],
                            appearance:[ "thief", "small" ],
                            habit:[ "friendly", "fake", "steal" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"apprenticeWizard",
                            label:"Apprentice Wizard",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "loner" ],
                            weapon: [ "magic" ],
                            appearance: [ "wizard", "young" ],
                            habit:[ "learn", "spell", "deal" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"highPriest",
                            label:"High Priest",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "loner" ],
                            weapon: [ ],
                            appearance: [ "priest", "gold" ],
                            habit:[ "lead", "god", "reveal" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"priest",
                            label:"Priest",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "loner" ],
                            weapon: [ ],
                            appearance: [ "priest" ],
                            habit:[ "pray", "invoke", "god" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"hunter",
                            label:"Hunter",
                            isSentient:true,
                            stats:{ hp:6 },
                            group: [ "group" ],
                            weapon: [ "bow" ],
                            appearance: [ "hunter", "quiet", "solemn" ],
                            habit:[ "survive", "hunt", "guide" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"knight",
                            label:"Knight",
                            isSentient:true,
                            stats:{ hp:12 },
                            group: [ "loner" ],
                            weapon: [ "sword" ],
                            appearance: [ "knight", "steel", "armored" ],
                            habit:[ "pride", "righteous", "lead" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"merchant",
                            label:"Merchant",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "loner" ],
                            weapon: [ ],
                            appearance: [ "merchant", "friendly" ],
                            habit:[ "profit", "deal", "business" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"noble",
                            label:"Noble",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "loner" ],
                            weapon: [ ],
                            appearance: [ "noble", "rich" ],
                            habit:[ "rule", "order", "reward" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"peasant",
                            label:"Peasant",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "group" ],
                            weapon: [ ],
                            appearance: [ "peasant", "worker" ],
                            habit:[ "live", "ask", "help" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"rebel",
                            label:"Rebel",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "horde" ],
                            weapon: [ "axe" ],
                            appearance: [ "rebel", "civilian" ],
                            habit:[ "upset", "sacrifice", "inspire" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"soldier",
                            label:"Soldier",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "horde" ],
                            weapon: [ "spear" ],
                            appearance: [ "soldier", "uniform" ],
                            habit:[ "fight", "march" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"spy",
                            label:"Spy",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "loner" ],
                            weapon: [ ],
                            appearance: [ "spy", "mysterious", "intriguing" ],
                            habit:[ "infiltrate", "betray", "report" ]
                        },{
                            type: PLACEHUMANOID_TAGS,
                            id:"tinkerer",
                            label:"Tinkerer",
                            isSentient:true,
                            stats:{ hp:3 },
                            group: [ "loner" ],
                            weapon: [ ],
                            appearance: [ "tinkerer", "funny", "strange" ],
                            habit:[ "create", "sell", "oddities" ]
                        }
                    ]
                }
            ]
            BASICATTACK_OPTIONS=[
                { type:"melee", id:"fangAttack", tags:["fang","slice","cut","scratch","crawl","crush"], label:"Perform a basic scratching melee attack", bonus:[ { section:"attributes", stat:"dex" } ], action:[
                    { onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage", value:[
                        { type:"rollDice", dice:6, ratio:1 }
                    ]}
                ] },
                { type:"melee", id:"burningAttack", tags:["fire","flame","burn"], label:"Perform a basic burning melee attack", bonus:[ { section:"attributes", stat:"int" } ], action:[
                    { onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage", value:[
                        { type:"rollDice", dice:6, ratio:1 }
                    ]}
                ] },
                { type:"melee", id:"fangAttack", tags:["sword"], label:"Perform a basic blade melee attack", bonus:[ { section:"attributes", stat:"str" } ], action:[
                    { onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage", value:[
                        { type:"rollDice", dice:6, ratio:1 },
                        { type:"sumValue", value:2 }
                    ]}
                ] },
                { type:"melee", id:"lacerateAttack", tags:["bite","teeth","crunch","beast","animal","beak","knife","blade","dagger","cutter","claw","crawl","crush"], label:"Perform a basic lacerating melee attack", bonus:[ { section:"attributes", stat:"str" } ], action:[
                    { onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage", value:[
                        { type:"rollDice", dice:8, ratio:1 },
                        { type:"sumValue", value:1 }
                    ]}
                ] },
                { type:"melee", id:"shallowAttack", tags:["shallow","eat","absorb","corrosive","acid","blob","jelly"], label:"Perform a basic shallowing melee attack", bonus:[ { section:"attributes", stat:"con" } ], action:[
                    { onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage", value:[
                        { type:"rollDice", dice:10, ratio:1 },
                        { type:"sumValue", value:1 }
                    ]}
                ] },
                { type:"melee", id:"heavyAttack", tags:["heavy","huge","giant"], label:"Perform a basic heavy melee attack", bonus:[ { section:"attributes", stat:"str" } ], action:[
                    { onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage", value:[
                        { type:"rollDice", dice:8, ratio:1 },
                        { type:"sumValue", value:7 }
                    ]}
                ] },
                { type:"ranged", id:"projectileAttack", tags:["arrow","bow","crossbow","throw","launch","longbow"], label:"Perform a basic projectile ranged attack", bonus:[ { section:"attributes", stat:"dex" } ], action:[
                    { onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage", value:[
                        { type:"rollDice", dice:6, ratio:1 },
                        { type:"sumValue", value:2 }
                    ]}
                ] },
                { type:"ranged", id:"beamAttack", tags:["light","ray","laser","beam","religion","magic"], label:"Perform a basic beam ranged attack", bonus:[ { section:"attributes", stat:"int" } ], action:[
                    { onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage", value:[
                        { type:"rollDice", dice:8, ratio:1 },
                        { type:"sumValue", value:2 }
                    ]}
                ] },
                { type:"ranged", id:"corrosiveAttack", tags:["spit","corrosive","blob","jelly","acid"], label:"Perform a basic corrosive ranged attack", bonus:[ { section:"attributes", stat:"con" } ], action:[
                    { onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage", value:[
                        { type:"rollDice", dice:10, ratio:1 },
                        { type:"sumValue", value:1 }
                    ]}
                ] },
                { type:"ranged", id:"giantRangeAttack", tags:["wind","heavy","huge","giant","tornado"], label:"Perform a basic heavy ranged attack", bonus:[ { section:"attributes", stat:"int" } ], action:[
                    { onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage", value:[
                        { type:"rollDice", dice:10, ratio:1 },
                        { type:"sumValue", value:2 }
                    ]}
                ] }
            ],
            SPELL_LIST=[
                // Adapted from Cairn's CC-BY-SA 4.0 spellbook (https://cairnrpg.com/resources/more-spellbooks)
                { name:"Adaptive Skin", description:"The target can exist comfortably in hot or cold environments."},
                { name:"Addle Brain", description:"The target must succeed in a Resist Magic move or can't use Intelligence-based moves for 1 hour."},
                { name:"Animal Call", description:"Summons a mundane beast. It holds no loyalty towards you or your allies."},
                { name:"Anti-Magic Globe", description:"A thin shell of magical protection surrounds a small area around the caster. It lasts 5 minutes."},
                { name:"Arachnid's Finesse", description:"The target can walk on walls and ceilings."},
                { name:"Arcane Arrow", description:"Green energy bursts from your fingers, dealing damage."},
                { name:"Arcane Confinement", description:"The target is bound by a magical rope, able only to speak but nothing more."},
                { name:"Arcane Epistle", description:"You write a letter that only its intended reader can understand."},
                { name:"Arcane Fireworks", description:"The target flame becomes a great conflagration of heat, light, and sound."},
                { name:"Arcane Stain", description:"Inscribes an invisible rune you can feel. It can't be easily removed."},
                { name:"Architect's Eye", description:"Any hidden doors nearby light up as if on fire."},
                { name:"Architect's Perfection", description:"Create a holographic wall, floor, or ceiling that looks absolutely real."},
                { name:"Astral Step", description:"You and anyone touching you instantly transport to a known location you have been to before."},
                { name:"Banishment", description:"Success in a Resist Magic move or the creature returns to its native plane."},
                { name:"Become Unseen", description:"The target becomes invisible for 1 hour and is still able to use abilities and attack without detection. Afterward, they become weakened."},
                { name:"Beguilement", description:"The target humanoid must succeed in a Resist Magic move or is controlled telepathically."},
                { name:"Bewildering Fog", description:"A hazy fog surrounds you. Attacks within the mist are weakened."},
                { name:"Blazing Defense", description:"You manifest a shield of flame. Fire cannot hurt you."},
                { name:"Blessing", description:"The target's attacks are stronger and direct attacks are weakened against them until they next take damage."},
                { name:"Bolster", description:"A person you can see is emboldened by your words for a few minutes: their attacks are stronger and they cannot become weakened."},
                { name:"Bound", description:"The target can make a single jump to any place they can see."},
                { name:"Boundless Message", description:"Delivers a single sentence to any one creature instantaneously, no matter the distance."},
                { name:"Breath Soup", description:"Blocks vision and slows movement."},
                { name:"Burning Missile", description:"You fire an acid missile."},
                { name:"Burnishing Bubble", description:"The target is enclosed by an impenetrable sphere that rolls along the ground unless they succeed in a Use Agility move."},
                { name:"Calcify", description:"The target object turns to stone at the caster's touch. Succeed in Use Brute Force move to resist."},
                { name:"Catsense", description:"The target has heightened senses for the next hour, especially at night."},
                { name:"Chilling Graze", description:"The target loses 3 HP and is weakened."},
                { name:"Cinder Flesh", description:"Energy beams burn enemies in a straight line."},
                { name:"Circle of Arcane Protection", description:"Magical or godly beings cannot get close."},
                { name:"Cleanse", description:"Rotten or poisoned food becomes edible."},
                { name:"Cold Spray", description:"A spray of cold air damages around in one direction."},
                { name:"Conceal Object", description:"Masks an object against divination or scrying."},
                { name:"Conquer Gravity", description:"The target moves up or down according to your whims."},
                { name:"Cosmic Fingertips", description:"Your hands sculpt stone, rock, or minerals into any form you please."},
                { name:"Coup de Grâce", description:"An ally's next attack ignores armor."},
                { name:"Craft from Clay", description:"Any natural, earthen target is transformed (rock to mud, lava to rock, etc)."},
                { name:"Create Unlife", description:"Creates 2 undead skeletons and zombies from corpses. Success in a Resist Magic move every hour to control them."},
                { name:"Curse of the Sightless", description:"Anyone within eyesight must succeed in a Resist Magic move or be blinded."},
                { name:"Curse Unlife", description:"Deals damage to one undead, ignoring armor and resistances."},
                { name:"Cure-All", description:"A single illness or disease dissipates at your touch."},
                { name:"Cute Ink", description:"A single page in a book can be altered to hide its true content."},
                { name:"Darksight", description:"The target can see nearby in total darkness."},
                { name:"Death's Breath", description:"You summon a poisonous cloud you can control."},
                { name:"Devil's Comedian", description:"Success in a Resist Magic move or target laughs uncontrollably, unable to take any action."},
                { name:"Disaster Fluid", description:"Anything close becomes slippery; success in a Use Agility move to avoid slipping."},
                { name:"Disrupt Scry", description:"Future divinations of one creature or object are misled according to your will."},
                { name:"Doppelganger", description:"You spawn multiple decoy duplicates of someone you touch. Decoys are dispelled with a touch."},
                { name:"Doubleskin", description:"The target humanoid doubles in size."},
                { name:"Dreampoison", description:"The target is weakened after suffering a night of bad dreams."},
                { name:"Dreamtalker", description:"Sends a message to anyone currently asleep."},
                { name:"Earsplit", description:"Anyone within earshot is deafened."},
                { name:"Easy Descent", description:"Objects or creatures nearby fall very slowly."},
                { name:"Edifice", description:"You summon a stone wall up to around wide that you can control."},
                { name:"Energize Rope", description:"A rope-like object moves at your command."},
                { name:"Ensorcelled", description:"Creatures are enraptured for a few minutes unless they succeed in a Resist Magic move."},
                { name:"Envision", description:"Spies on a target you have met, even across vast distances. On success in a Resist Magic move, they can feel your presence."},
                { name:"Ephemeral Audio", description:"Point to a spot. Anyone nearby hears a sound you choose at any volume."},
                { name:"Epidemic", description:"Infects target with a disease, which spreads until the source of magic is destroyed."},
                { name:"Extraplanar Convocation", description:"Summons any extraplanar being onto your plane. It holds no loyalty towards you or your allies."},
                { name:"Extraplanar Request", description:"Ask a single question to a random extraplanar entity."},
                { name:"Feline Dexterity", description:"The target becomes limber, lithe, and as fast as quicksilver."},
                { name:"Find Virulence", description:"Detects poison in any creature or object nearby."},
                { name:"Fire Curse", description:"An object you touch is imbued with a hidden flame trap dealing damage."},
                { name:"Firey Missile", description:"A bow you touch can fire flaming arrows for one minute."},
                { name:"Fish Lung", description:"A target can breathe underwater until they surface again."},
                { name:"Fleetfooted", description:"One creature moves at double speed."},
                { name:"Flicker", description:"The target randomly vanishes and reappears once at will."},
                { name:"Fog of Nausea", description:"A cloud of nauseating vapors pours out from the spell book's pages. Anyone nearby must succeed in a Physical Resistance Challenge move or vomit uncontrollably."},
                { name:"Fold Portal", description:"A door you touch opens into another door you've stepped through before until it is shut again."},
                { name:"Foolishness", description:"A target you touch becomes vulnerable to wild mood swings, sweeping conclusions, and silly behavior. They also can't use Intelligence-based moves for 24 hours."},
                { name:"Fortify", description:"Damage from heat, ice, acid, or electricity is weakened against a target for the next hour."},
                { name:"Frozen Corpse", description:"A corpse you touch is preserved."},
                { name:"Gale", description:"You summon an impenetrable wall of energy."},
                { name:"Ghost Whisper", description:"You and a sympathetic ally are linked, able to converse in short sentences for an hour."},
                { name:"Gift of Flight", description:"The target can fly for a short while."},
                { name:"Glacier", description:"You create a wall of ice around a creature you choose."},
                { name:"Gorgon's Gaze", description:"The target is transformed into a statue on a fail in a Resist Magic move. A success reverses the spell; the holder must succeed in a Resist Magic move or the book is destroyed."},
                { name:"Great Ball of Fire", description:"You fire a ball of flame nearby."},
                { name:"Hand of the Protector", description:"A giant, floating hand blocks all damage from a single opponent until you are safe from danger."},
                { name:"Healing Grace", description:"A target heals up to 3 HP, and you become weakened until you take the time to meditate, pray or sleep."},
                { name:"Heatless Torch", description:"Turns any object into a permanent, heatless torch."},
                { name:"Hedgemagick", description:"You perform a minor magical trick (create flame, wind, light, or sound)."},
                { name:"Hempen Hoop", description:"A rope moves at your command."},
                { name:"Hide Mind", description:"The next person to scry your mind or your whereabouts is fooled."},
                { name:"Hoodwink Monster", description:"The target monster must succeed in a Resist Magic move or treats you as an ally."},
                { name:"Hoodwink Person", description:"The target becomes a friend until out of sight."},
                { name:"Hovering Protection", description:"A hovering, transparent disk materializes around an ally defending him."},
                { name:"Ice Ray", description:"Ice and snow flow from your fingerprints, dealing damage in a straight line."},
                { name:"Icy Tempest", description:"Hail deals damage around."},
                { name:"Ill Fate", description:"The target automatically fails next their next move."},
                { name:"Illusory Landscape", description:"You can make one type of terrain appear like another."},
                { name:"Incorporeal Shrug", description:"Ignore any one attack."},
                { name:"Induce Despair", description:"The target must succeed in a Resist Magic move or its attacks are weakened."},
                { name:"Induce Horror", description:"The target must succeed in a Resist Magic move or flees."},
                { name:"Inferno", description:"You summon a flaming wall. Anyone passing through is damaged."},
                { name:"Influence", description:"The target is more resistant to damage but running and swimming are impossible."},
                { name:"Insubstantiate", description:"The target becomes insubstantial and can float."},
                { name:"Kraken's Curse", description:"Tentacles grapple anything close, success in a Use Brute Force move to break free."},
                { name:"Lamp's Hue", description:"The target object shines like a torch for one hour."},
                { name:"Latch", description:"An unlocked box, cabinet, or door opens or closes at your command."},
                { name:"Librarian's Trap", description:"Deals damage when read."},
                { name:"Lichsense", description:"You feel any undead nearby. Success in a Resist Magic move to avoid detection by intelligent undead."},
                { name:"Light Show", description:"You control a dazzling display of light and color."},
                { name:"Lightning Strike", description:"Electricity flings from your fingertips."},
                { name:"Linguist", description:"For the next hour you can speak and understand any mundane language."},
                { name:"Magic Seal", description:"Magically locks a door, portal, or chest."},
                { name:"Major Genesis", description:"Creates an object of nonliving stone or metal no greater than a chest."},
                { name:"Maker", description:"Transforms raw materials into finished items."},
                { name:"Manic Fury", description:"A target's attacks are stronger. They must succeed in a Resist Magic move after a successful killing or lose control, attacking anyone in sight."},
                { name:"Masquerade", description:"You assume the likeness of a similar creature you have seen."},
                { name:"Master Undead", description:"Undead creatures obey your command. Intelligent undead must succeed in a Resist Magic move."},
                { name:"Mental Tripwire", description:"Intruders set off an alarm audible only to you."},
                { name:"Mind Bond", description:"Two allies can communicate via a mental link for the rest of the day."},
                { name:"Mind Reader", description:"You can see or hear any person you have met before."},
                { name:"Miniaturize", description:"An object shrinks to one-tenth its size."},
                { name:"Minor Aegis", description:"A target you touch ignores the next instance of harm from a specific source."},
                { name:"Minor Genesis", description:"Creates an object of nonliving matter no greater than a jewel case."},
                { name:"Mirage", description:"You summon a noiseless and simple illusion of your choice."},
                { name:"Molasses Veins", description:"A single target moves at half speed."},
                { name:"Murky Bubble", description:"You create a bubble supernatural shadow around."},
                { name:"Necrotic Touch", description:"The target must succeed in a Use Agility move or is paralyzed."},
                { name:"Obfuscate", description:"The target cannot be observed either through divination or scrying."},
                { name:"Obfuscation", description:"Changes your appearance."},
                { name:"Obscuring Mist", description:"A rolling fog obscures vision."},
                { name:"Opaque Cover", description:"Details about your person become obscured and unmemorable."},
                { name:"Orb of Ignus", description:"You control a floating ball of fire for a short while."},
                { name:"Orb of Immortality", description:"Mundane attacks cannot harm anyone around, or vice-versa."},
                { name:"Otherworldly Pet", description:"Summons an unintelligent extraplanar creature up to the size of a small dog. It holds no loyalty towards you or your allies."},
                { name:"Otherworldly Gate", description:"Opens a portal to another reality. It works in both directions."},
                { name:"Paincurrent", description:"An arc of electricity passes from your fingertips to a target you touch. "},
                { name:"Passage", description:"Creates a temporary passage through wood, stone, or brick."},
                { name:"Passive Invisibility", description:"The target is invisible until they attempt to harm."},
                { name:"Peeping Warlock", description:"You control a pair of floating eyes so long as yours remain closed."},
                { name:"Perfect Illusion", description:"Creates an image with sound, smell, and thermal effects, activated according to a trigger you choose. Touching the image or making a successful success in a Resist Magic move will reveal the illusion."},
                { name:"Perfect Preservation", description:"A weapon you touch becomes immune to wear, mundane damage, or elemental effects. The spell wears off after a day."},
                { name:"Phantom Hound", description:"A ghostly canine obeys your commands for up to one hour."},
                { name:"Phase Anchor", description:"Binds an extraplanar creature to your will until it performs a task-specific task, after which it must succeed in a Resist Magic move to escape (good luck)."},
                { name:"Phase Sneak", description:"Anyone around is rendered invisible."},
                { name:"Phase Touch", description:"A disembodied, floating hand obeys your whims but is immaterial. The next spell book, ability, or item that relies on touch now works from a distance."},
                { name:"Philolomancy", description:"You understand all spoken and written languages."},
                { name:"Philosopher's Mind", description:"The target is immune to spiritual or psychic attacks, as well as any attempts at mental or spiritual manipulation or persuasion."},
                { name:"Planar Anchor", description:"Bars extradimensional movement."},
                { name:"Plant Scourge", description:"Plants within eyesight wither and die."},
                { name:"Pocket Container", description:"Summons a chest from an immaterial plane. It holds up to 6 items. The chest is dismissed at will."},
                { name:"Pocket Sun", description:"You create a halo of bright light nearby."},
                { name:"Prisma Shard", description:"An array of hypnotic lights fascinate nearby creatures unless they succeed in a Resist Magic move."},
                { name:"Profane Reveal", description:"Target an empty space to reveal invisible objects or creatures."},
                { name:"Psychic Eye", description:"Invisible floating eye allowing you to observe a single location as present."},
                { name:"Psychokinesis", description:"Magically moves an object up to half your weight."},
                { name:"Puppeteer", description:"You can throw your voice a great distance away."},
                { name:"Purge Text", description:"Mundane or magical writing vanishes at your touch."},
                { name:"Pyramid of Passivity", description:"The target creatures must succeed in a Use Agility move or their attacks are weakened."},
                { name:"Psychic Touch", description:"You can hear the target's surface thoughts, so long as you touch them."},
                { name:"Rat-Tat-Tat", description:"Loudly opens a locked or magically sealed door or chest."},
                { name:"Ravenless Message", description:"You send a short message 1 mile that anyone along its path can hear."},
                { name:"Reject Unlife", description:"Nearby undead are immobilized for 30 seconds or until you take another action."},
                { name:"Remembered Voice", description:"A spot you mark becomes the trigger for a supernatural recording of your voice, delivering a short message of your choice."},
                { name:"Reverie", description:"The targets become dazed for a moment as if lost in a daydream."},
                { name:"Runic Harm", description:"A rune you draw causes great pain to the reader, who must succeed in a Resist Magic move or scream until they pass out. A successful save destroys the rune."},
                { name:"Runic Slumber", description:"A rune you draw puts the reader into a magical sleep that lasts 3 hours."},
                { name:"Safe Haven", description:"You summon a floating, invisible refuge for 8 hours. It fits up to 8 people comfortably."},
                { name:"Scintillate", description:"The target must succeed in a Resist Magic move or their attacks become weakened."},
                { name:"Scry Creature", description:"Indicates the precise location of a familiar creature."},
                { name:"Scry Object", description:"Indicates the precise location of an object, known or otherwise."},
                { name:"Scrying Ward", description:"For 24 hours you become aware of any magical eavesdropping."},
                { name:"Sculpt Water", description:"Raise, lower, or part nearby water."},
                { name:"Secret Attaché", description:"You summon an invisible creature of great power that obeys your every command. Reading from other spell books dispels the creature."},
                { name:"Shelter", description:"Creates a standing edifice that can shelter up to 10 creatures, disappearing after 24 hours."},
                { name:"Shrinking Cant", description:"A humanoid creature you touch halves in size."},
                { name:"Signal", description:"Sends up a flare that can be seen for some distance."},
                { name:"Simple Illusion", description:"Creates a simple image with sound. A cursory investigation will reveal the illusory image."},
                { name:"Sinister Flame", description:"The target's palms are lined with flames for one minute."},
                { name:"Sinister Polymorph", description:"Success in a Resist Magic move or target is transformed into a harmless animal."},
                { name:"Skillful Repair", description:"You make minor repairs to a nonliving object."},
                { name:"Sky Raft", description:"You summon a floating disk that holds up the weight of a fruit box."},
                { name:"Solar Portal", description:"Sends an extraplanar message to all beings that wish to enter your plane. You have no choice which being will answer and it holds no loyalty to you or your allies."},
                { name:"Song of Repose", description:"The target falls into a deep slumber."},
                { name:"Sonic Shattering", description:"A sonic wave damages susceptible objects or crystalline creatures, ignoring armor."},
                { name:"Sorcerer's Lock", description:"Any door (magical or otherwise) is held shut until you leave its vicinity."},
                { name:"Soul Annex", description:"The target's spirit is caged within their body and replaced with the caster's. If the body is slain the original soul departs, but the caster must succeed in a Resist Magic move to return to their body."},
                { name:"Steer's Strength", description:"The target's strength triples; unarmed attacks are stronger."},
                { name:"Strength Tap", description:"A target you touch loses 3 HP, which is transferred to you."},
                { name:"Stumbling Steps", description:"A target you touch becomes weakened and loses 1 HP."},
                { name:"Stupefaction", description:"The target temporarily loses the sense of place and time. Success in a Resist Magic move to overcome."},
                { name:"Sudden Slumber", description:"The target falls asleep."},
                { name:"Summon Elemental", description:"A being of fire, wire, earth, or wind manifests from available matter to perform a single task for the caster. It follows this command against its will."},
                { name:"Sway Will", description:"A target is compelled to follow a stated course of action, without understanding why."},
                { name:"Temporary Reprieve", description:"The target regains any lost HP, but loses it again after a few minutes."},
                { name:"Terrify", description:"The targets within eyesight must succeed in a Resist Magic move or flee."},
                { name:"Terrifying Illusion", description:"A target is hunted by a terrible creature only they can see. If fighting the creature for too long it must succeed in a Resist Magic move or become catatonic."},
                { name:"Thief's Bane", description:"An object appears trapped, even to an experienced thief."},
                { name:"Thwart the Elements", description:"Elemental group damage is weakened against a target for the next hour."},
                { name:"Tongue of the Blue Serpent", description:"Rust-colored, serpentine letters materialize on a surface you choose. Anyone reading these words becomes immobilized unless they succeed in a Resist Magic move."},
                { name:"Torrential Moat", description:"You summon a powerful wind that deflects arrows, smaller creatures, and noxious gases."},
                { name:"Toxic Blast", description:"A small orb of acid deals damage to a target."},
                { name:"Transform Aura", description:"The target's aura is made non-magical or vice-versa."},
                { name:"True Name", description:"Determines the properties of a magical item you touch."},
                { name:"Trueshift", description:"A willing target takes on a new form, but must succeed in a Resist Magic move to shift out."},
                { name:"Twilight Steed", description:"Summons an arcane steed that never tires, but dissipates within daylight."},
                { name:"Ultimate Sacrifice", description:"The book's holder transfers their life force into a corpse, reviving both body and soul."},
                { name:"Uncurse", description:"A person or object you touch is freed from a curse or nefarious spell."},
                { name:"Undefinable Target", description:"An ally becomes immune to mundane ranged attacks for one round."},
                { name:"Undeniable Courage", description:"The target will succeed in the next Intelligence move and their attacks are stronger."},
                { name:"Unflappable Endurance", description:"The target does not take Fatigue from non-magical activities or become weakened until their next rest."},
                { name:"Vermin Plague", description:"Summons a swarm of bats, rats, spiders, or similar creatures of your choice. They are harmless but distracting and hold no loyalty toward you or your allies."},
                { name:"Vines of Ichor", description:"You spread sticky spiderwebs on the walls, floor, and ceilings around."},
                { name:"Warrior's Edge", description:"The target weapon is enhanced, and the victim can't avoid a fatal wound."},
                { name:"Windborn", description:"You direct a powerful wind in a straight line, strong enough to blow over small boulders."},
                { name:"Winter's Woe", description:"An icy storm assails multiple targets, obscuring visibility and making the ground icy and treacherous."},
                { name:"Witch Sight", description:"Magical auras become visible to you for one hour."},
                { name:"Wizard's Exit", description:"You and anyone you touch can flee to safety at double speed."},
                { name:"Wizard's Grasp", description:"You control a phantasmal hand that can lift up the weight of a fruit basket."},
                { name:"Wizard's Haven", description:"A small, walled-in area cannot be scryed."},
                { name:"Wizardsniff", description:"You can feel any magic nearby."},
                { name:"Word of Pain", description:"A single phrase from your lips does group damage. Affected targets are also deafened."}
            ]
            TABLES_SIMPLE=[
                { id:"dungeonRoom", label:"Room",values:[
                    "An intersection towards 2 exits.", "An intersection towards 3 exits.",
                    "A corridor.", "A bridge.",
                    "A room with a single exit.", "A room with multiple exits.",
                    "A large room.", "A small room.",
                    "A staircase going up.", "A staircase going down."
                ] },
                { id:"trapType", label:"Trap Type",values:[
                    "It's an Stun trap: now you are a bit confused!",
                    "It's an Alarm trap: now they know you're here!",
                    "It's an Immobilizing trap: you can't move!",
                    "It's an Wounding trap: it damages you!",
                    "It's an Chasing trap: it's following you!",
                    "It's an Trapdoor trap: it opens below your feets!"
                ] },
                { id:"miscTopics", label:"Topic",values:[
                    "That's one of its usual stunts...",
                    "Sometimes you can relax...",
                    "Love got in the way...",
                    "What wouldn't you do for a friend?",
                    "A little job never hurts...",
                    "Never neglect training...",
                    "Discipline and rigor is all you need.",
                    "Here's what happens if you step on the wrong person's toes...",
                    "Someone owes you a favor...",
                    "There's a disease...",
                    "That debt you owed...",
                    "What is lost is forever...",
                    "Here comes a challenger!",
                    "Never back down if someone is in danger!",
                    "You can't take your eyes off it...",
                    "What you have discovered is amazing...",
                    "They imprisoned you!",
                    "What is it doing here?",
                    "It's time to do business...",
                    "An unexpected blessing...",
                    "An unexpected curse..."
                ] },
                { id:"syllabe1", label:"Syllabe", values:[ "ab", "al", "am", "an", "ar", "as", "av", "aw", "ay", "ba", "bo", "bi", "be", "bra", "bro", "bri", "bre", "bru", "bar", "ban", "baw", "bal", "bay", "ber", "bor", "bur", "bar", "bol", "bul", "bel", "bil", "ben", "bon", "bun", "bin", "bow", "by", "ca", "co", "cu", "cra", "cro", "cru", "con", "can", "cun", "caw", "cay", "cam", "com", "cor", "car", "cur", "cal", "col", "cul", "da", "do", "de", "di", "du", "dra", "dro", "dre", "dri", "dru", "dray", "day", "dal", "dol", "dul", "dil", "del", "dan", "den", "din", "don", "dun", "dam", "dem", "dim", "dom", "das", "dos", "dis", "des", "dus", "dur", "dor", "dar", "dir", "der", "dag", "dog", "dig", "dy", "el", "en", "em", "eg", "es", "eb", "ev", "ee", "er", "ez", "ex", "ein", "fa", "fe", "fo", "fi", "fu", "fla", "fle", "flo", "fli", "flu", "fy", "fay", "fan", "fen", "fin", "fon", "fal", "fel", "fol", "ful", "fil", "fes", "fas", "fos", "ga", "go", "gu", "gla", "glo", "gle", "gra", "gro", "gre", "gri", "gru", "gar", "gur", "gor", "gad", "gid", "gus", "gos", "gal", "gil", "gol", "gul", "gun", "gan", "gon", "gam", "gaz", "goz", "gruf", "graf", "grif", "gram", "grim", "grom", "grum", "griz", "graz", "groz", "grez", "ho", "ha", "hi", "he", "hu", "hay", "hal", "hel", "hol", "hul", "hil", "han", "hen", "has", "hes", "hus", "har", "hor", "hur", "hy", "in", "ish", "il", "im", "ir", "is", "iz", "ix", "ith", "ig", "ja", "je", "ji", "jo", "ju", "jan", "jon", "jen", "jin", "jun", "jar", "jor", "jer", "jig", "jag", "jas", "jes", "jos", "jus", "jal", "jel", "jil", "jol", "jam", "jem", "jom", "jim", "jad", "jed", "jud", "jod", "jaz", "joz", "jez", "joy", "jay", "jy", "ka", "ke", "ki", "ko", "ku", "kra", "kre", "kro", "kru", "kay", "kan", "ken", "kon", "kun", "kin", "kar", "ker", "kor", "kur", "kam", "kal", "kul", "kol", "kil", "kel", "kas", "kes", "kos", "kar", "ker", "kir", "kor", "kaz", "koz", "ky", "la", "le", "li", "lo", "lu", "lan", "lon", "len", "lin", "lun", "lyn", "lar", "lor", "lam", "lum", "lom", "lim", "lem", "law", "lew", "las", "les", "lus", "los", "lis", "lib", "ly", "ma", "me", "mi", "mo", "mu", "man", "men", "min", "mon", "mun", "mar", "mor", "mer", "mur", "mas", "mis", "mes", "mus", "mos", "moth", "mith", "myth", "mag", "meg", "mog", "mal", "me", "mol", "mul", "mil", "mad", "med", "mid", "mod", "mud", "maw", "my", "na", "ni", "ne", "no", "nu", "nil", "nel", "nal", "nol", "nul", "nis", "nes", "nos", "nas", "nar", "nor", "nur", "nir", "nim", "nam", "nav", "niv", "nev", "nov", "naz", "niz", "noz", "nes", "new", "ny", "oo", "ol", "on", "om", "og", "or", "oth", "osh", "os", "ox", "oz", "pa", "po", "pi", "pe", "pla", "pra", "plo", "pro", "pri", "pre", "pru", "pan", "pen", "pon", "par", "per", "por", "pas", "pos", "pel", "pol", "pul", "pil", "pal", "pam", "pom", "plum", "py", "qua", "quo", "que", "qui", "quiz", "quoz", "quaz", "quil", "quel", "qual", "quan", "quin", "quen", "quag", "queg", "quad", "quay", "ry", "ra", "ro", "ri", "re", "ru", "rad", "red", "rid", "rud", "rod", "rel", "ral", "rol", "run", "ran", "ren", "rin", "ron", "ram", "rim", "rem", "rom", "rum", "roz", "raz", "riz", "rez", "rex", "rax", "rox", "rux", "rix", "row", "raw", "ror", "sy", "so", "sa", "si", "se", "su", "slo", "sla", "sli", "sle", "slu", "sno", "sna", "smi", "sho", "sha", "shi", "she", "shu", "shu", "sam", "sim", "sum", "som", "sal", "sel", "sol", "sul", "sil", "soth", "seth", "sath", "suth", "sith", "stan", "sten", "stun", "stam", "stom", "swan", "swen", "sor", "ser", "sar", "sur", "sir", "saw", "star", "stur", "six", "tan", "tin", "ten", "ton", "tun", "tim", "tom", "tam", "tum", "tar", "tur", "tor", "tal", "til", "tol", "tel", "tul", "tas", "tes", "tis", "tos", "tus", "tay", "ty", "ta", "to", "ti", "te", "tu", "tha", "tho", "thi", "the", "thu", "tra", "tro", "tri", "tre", "tru", "uv", "un", "um", "ug", "uz", "ul", "ur", "ush", "uth", "va", "vi", "vo", "ve", "val", "vil", "vel", "vol", "vul", "van", "ven", "vin", "von", "vam", "vem", "vom", "vim", "var", "ver", "vor", "ver", "vay", "voy", "vas", "ves", "vis", "vos", "wa", "we", "wo", "wi", "wal", "wel", "wol", "wil", "was", "wes", "wis", "wiz", "waz", "wez", "way", "wax", "wix", "wox", "wex", "west", "wist", "win", "wen", "won", "wan", "war", "wor", "wur", "wer", "wy", "xa", "xo", "xi", "xe", "xan", "xin", "xon", "xen", "xar", "xor", "xel", "xal", "xol", "xom", "xam", "xad", "xy", "ya", "yo", "ye", "yan", "yin", "yun", "yon", "yen", "yew", "yaw", "yow", "yor", "yar", "yos", "yas", "yosh", "yash", "yel", "yol", "yal", "za", "zo", "ze", "zi", "zu", "zan", "zin", "zen", "zon", "zun", "zil", "zal", "zol", "zul", "zel", "zar", "zur", "zer", "zor", "zy" ] },
                { id:"syllabe2", label:"Syllabe", values:[ "ban", "ben", "bin", "bon", "bur", "bar", "bor", "bit", "bat", "bet", "bit", "but", "bot", "bak", "bek", "bik", "bok", "buk", "bad", "bud", "bid", "cad", "cam", "can", "cal", "cat", "cot", "cut", "cul", "car", "cor", "cur", "cox", "con", "col", "cath", "coth", "din", "dan", "den", "don", "dun", "dam", "dim", "dom", "daz", "dez", "diz", "doz", "dol", "dal", "dil", "del", "dash", "dosh", "dith", "deth", "doth", "dev", "dib", "dub", "duc", "dac", "dic", "dec", "doc", "dar", "der", "dor", "dur", "gad", "god", "good", "gray", "grim", "grod", "grad", "grif", "grun", "gren", "gran", "gron", "goss", "gor", "gar", "gan", "gen", "gon", "gin", "gaz", "goz", "gas", "gis", "gos", "gus", "gul", "gal", "gil", "jab", "jib", "jeb", "jan", "jen", "jin", "jon", "jun", "jaw", "jak", "jor", "jar", "jay", "joy", "kel", "kal", "kil", "kul", "kan", "ken", "kin", "kun", "kam", "kim", "kar", "kor", "kaz", "koz", "kaw", "lam", "lem", "lim", "leg", "log", "lug", "lin", "len", "lon", "lar", "lor", "lur", "ler", "lad", "lev", "laz", "mar", "mor", "mer", "mur", "mac", "mec", "muc", "moc", "mid", "med", "mud", "mod", "mad", "mil", "mel", "mal", "mol", "mul", "man", "men", "min", "mon", "mun", "may", "moy", "mas", "mis", "mes", "mus", "mos", "mat", "met", "mit", "mot", "mut", "mag", "meg", "mig", "mog", "mug", "mez", "maz", "miz", "moz", "muz", "max", "mox", "maw", "nic", "nac", "nec", "noc", "nuc", "nal", "nel", "nil", "nol", "nul", "nar", "nor", "ner", "nir", "nur", "nas", "nes", "nos", "nus", "nis", "nad", "nid", "nod", "nay", "nog", "neg", "nug", "nig", "nin", "nen", "non", "nan", "pan", "pen", "pon", "pin", "par", "per", "por", "pir", "pur", "pel", "pol", "pul", "pal", "pren", "pran", "prin", "ran", "ren", "rin", "ron", "run", "ras", "rus", "res", "ris", "ros", "ral", "rel", "ril", "rul", "rol", "raw", "ray", "roy", "rey", "rex", "rix", "rux", "raz", "rez", "riz", "roz", "rom", "rim", "rem", "rum", "ram", "rid", "rad", "rud", "red", "rod", "rev", "rav", "ric", "rec", "roc", "ruc", "rig", "ry", "sam", "sim", "som", "san", "sin", "son", "sun", "sen", "sig", "seg", "sten", "stan", "ston", "stun", "stin", "sly", "sy", "sed", "sid", "sal", "sel", "sol", "sul", "sil", "shan", "shen", "shin", "shon", "sar", "ser", "sir", "sor", "sur", "ses", "sas", "sos", "sis", "sus", "shaw", "shay", "shar", "sham", "shem", "shal", "shel", "six", "sax", "set", "sit", "set", "stoy", "tal", "tel", "til", "tol", "tul", "tar", "ter", "tor", "tur", "tran", "tren", "trin", "tron", "trun", "ty", "try", "tay", "tan", "ten", "tin", "ton", "tun", "tam", "tem", "tim", "tom", "tum", "taz", "tez", "tas", "tes", "tis", "tos", "tus", "tic", "tac", "tec", "toc", "tuc", "var", "ver", "vor", "van", "vin", "ven", "von", "vay", "vad", "vid", "ved", "vod", "vix", "vox", "vax", "vex", "vic", "vac", "voc", "vel", "val", "vol", "vil", "vash", "vish", "vesh", "vosh", "vas", "ves", "vis", "vos", "vy", "way", "wan", "wen", "win", "won", "war", "wer", "wor", "wal", "wel", "wil", "wol", "weg", "wig", "wag", "wog", "wug", "wic", "wac", "woc", "war", "wer", "wor", "wex", "wix", "yan", "yin", "yen", "yon", "yun", "yel", "yal", "yar", "yer", "yor", "zan", "zen", "zin", "zon", "zun", "zic", "zac", "zim", "zy", "zer", "zar", "zor" ] },
                { id:"syllabe3", label:"Syllabe", values:[ "bar", "ber", "bor", "bur", "ban", "ben", "bin", "bon", "car", "cor", "cur", "tas", "tes", "tis", "tos", "tak", "tok", "tan", "ten", "tin", "ton", "tar", "ter", "tor", "try", "sin", "sen", "son", "san", "sun", "shan", "shen", "shin", "shon", "shun", "man", "men", "min", "mon", "nor", "y", "gris", "gren", "grin", "gran", "grun", "gash", "gor", "gar", "ger", "lan", "len", "lin", "lon", "lun", "let", "lit", "lig", "leg", "lic", "lac", "loc", "lec" ] },
                { id:"syllabe4", label:"Syllabe", values:[ "a", "e", "o", "i", "u", "an", "on", "en", "in", "nor", "ish", "at", "as", "es", "is", "os", "us", "ma", "mo", "mi", "my", "na", "ni", "no", "nu", "ny", "ra", "ro", "ri", "ry", "by", "bo", "ba", "la", "lo", "ly", "lan", "len", "lin", "lon", "ler", "lar", "lor", "sic", "sec", "san", "sen", "sin", "son", "sa", "so", "si", "y" ] },
                { id:"place1", label:"Place part", values:["amber", "angel", "spirit", "basin", "lagoon", "basin", "arrow", "autumn", "bare", "bay", "beach", "bear", "bell", "black", "bleak", "blind", "bone", "boulder", "bridge", "brine", "brittle", "bronze", "castle", "cave", "chill", "clay", "clear", "cliff", "cloud", "cold", "crag", "crow", "crystal", "curse", "dark", "dawn", "dead", "deep", "deer", "demon", "dew", "dim", "dire", "dirt", "dog", "dragon", "dry", "dusk", "dust", "eagle", "earth", "east", "ebon", "edge", "elder", "ember", "ever", "fair", "fall", "false", "far", "fay", "fear", "flame", "flat", "frey", "frost", "ghost", "glimmer", "gloom", "gold", "grass", "gray", "green", "grim", "grime", "hazel", "heart", "high", "hollow", "honey", "hound", "ice", "iron", "kil", "knight", "lake", "last", "light", "lime", "little", "lost", "mad", "mage", "maple", "mid", "might", "mill", "mist", "moon", "moss", "mud", "mute", "myth", "never", "new", "night", "north", "oaken", "ocean", "old", "ox", "pearl", "pine", "pond", "pure", "quick", "rage", "raven", "red", "rime", "river", "rock", "rogue", "rose", "rust", "salt", "sand", "scorch", "shade", "shadow", "shimmer", "shroud", "silent", "silk", "silver", "sleek", "sleet", "sly", "small", "smooth", "snake", "snow", "south", "spring", "stag", "star", "steam", "steel", "steep", "still", "stone", "storm", "summer", "sun", "swamp", "swan", "swift", "thorn", "timber", "trade", "west", "whale", "whit", "white", "wild", "wilde", "wind", "winter", "wolf" ] },
                { id:"place2", label:"Place part", values:["acre", "band", "barrow", "bay", "bell", "born", "borough", "bourne", "breach", "break", "brook", "burgh", "burn", "bury", "cairn", "call", "chill", "cliff", "coast", "crest", "cross", "dale", "denn", "drift", "fair", "fall", "falls", "fell", "field", "ford", "forest", "fort", "front", "frost", "garde", "gate", "glen", "grasp", "grave", "grove", "guard", "gulch", "gulf", "hall", "hallow", "ham", "hand", "harbor", "haven", "helm", "hill", "hold", "holde", "hollow", "horn", "host", "keep", "land", "light", "maw", "meadow", "mere", "mire", "mond", "moor", "more", "mount", "mouth", "pass", "peak", "point", "pond", "port", "post", "reach", "rest", "rock", "run", "scar", "shade", "shear", "shell", "shield", "shore", "shire", "side", "spell", "spire", "stall", "wich", "minster", "star", "storm", "strand", "summit", "tide", "town", "vale", "valley", "vault", "vein", "view", "ville", "wall", "wallow", "ward", "watch", "water", "well", "wharf", "wick", "wind", "wood", "yard" ] },
                { id:"itemAttribute", label:"Attribute", values:[
                    "light", "heavy",
                    "burning", "cold",
                    "bloody", "blessed",
                    "poisonous", "healing",
                    "dark", "bright",
                    "enchanted", "regular",
                    "strong", "fragile",
                    "mythic", "exiled",
                    "silver", "golden",
                    "thunder", "earth",
                    "water", "wind",
                    "giant", "small",
                    "cheap", "valuable",
                    "foggy", "clear",
                    "mystic", "heretic",
                    "sleep", "charging",
                    "time", "sky",
                    "sentient", "vicious",
                    "vermin", "blossoming",
                    "pityful", "vengeance",
                    "mystery", "sentient"
                ] },
                { id:"weaponType", label:"Weapon Type", values:[
                    "knife", "dagger", "shortsword", "stiletto", "machete",
                    "sword", "broadsword", "longsword", "rapier", "scimitar",
                    "hammer", "club", "axe", "morning star", "mace",
                    "bow", "bow", "crossbow", "longbow", "composite bow", 
                    "spear", "javelin", "whip", "lance", "chain",
                    "wand", "staff", "sphere", "cube", "rod",
                    "blowgun", "darts", "sling", "throwing axe", "throwing knives"
                ] },
                { id:"accessoryType", label:"Accessory Type", values:[
                    "diamond", "pearl", "ruby",
                    "ring", "bracelet", "amulet",
                    "helm", "crown", "tiara", 
                    "necklace", "scarf", "pendant",
                    "gloves", "bracers", "knuckles",
                    "vest", "tunic", "dress",
                    "belt", "bag", "quiver",
                    "trousers", "skirt", "shorts",
                    "shoes", "greaves", "sandals",
                    "doll", "totem", "orb",
                    "book", "tablet", "tome"
                ] },
                { id:"consumableType", label:"Item", values:[
                    "egg", "bread", "meat", "mushroom", "cake", "biscuit", "milk", "fruit", "wine", "cup", "fish",
                    "potion", "powder", "ointment", "tonic", "water", "essence", "salt", "infuse", "vial", "philter", "solvent",
                    "bomb", "feather", "repellent", "perfume", "venom", "rope", "decanter", "candle", "horn", "flute", "shard",
                    "key", "map", "compass", "pen", "deck", "scroll", "dice", "mirror", "lamp", "handkerchief", "telescope"
                ]},
                { id:"largePlaceTypes", label:"Type", addTag:["place"], values:[
                    "castle", "city", "valley", "dungeon", "crypt", "lake", "beach", "swamp", "temple", "rock", "forest", "desert", "mountain", "volcano", "canyons", "valley", "sea", "cavern"
                ]},
                { id:"smallPlaceTypes", label:"Type", addTag:["place"], values:[
                    "town", "church", "house", "shrine", "tower", "pub", "shop", "inn", "armory", "academy", "graveyard"
                ]},
                { id:"routeTypes", label:"Type", addTag:["place"], values:[
                    "road", "crossroads", "trail", "pathway", "passage", "avenue", "track", "walk", "route"
                ]},
                { id:"ambitiousOrganizations", label:"Type", values:[
                    "extremist moralists, doing what's right for them at any cost",
                    "thieves, gaining power with lies",
                    "cultists, spreading influence around the kingdom",
                    "fanatical believers, spreading and imposing its god's doctrine",
                    "corrupt politicians, keeping the power",
                    "anonymous, recruiting powerful adepts and growing in secret"
                ]},
                { id:"organizationAgenda", label:"Target", values:[
                    "They want to get rid of an inconvenient person.",
                    "They want to influence an important person.",
                    "They want the favor of a powerful institution.",
                    "They want to set up a new rule within their organization.",
                    "They want to reclaim something that was once theirs.",
                    "They want to negotiate a contract.",
                    "They want to keep a close eye on a suspected enemy."
                ]},
                { id:"planarPowers", label:"Type", values:[
                    "a God, thirsty for believers",
                    "the Prince of the Demons, eager to return to earth",
                    "an Elemental Lord, who wants the world to go back to its origins",
                    "the Army of Chaos, eager to erase any established order",
                    "the Angel of Judgment, that is coming to judge men",
                    "the Avatar of Law, that came to eliminate perceived disorder"
                ]},
                { id:"powerAgenda", label:"Target", values:[
                    "He wants to take control of a powerful organization to achieve his goals.",
                    "Prophetic dreams herald its arrival.",
                    "It will curse his archenemy.",
                    "It wants to get a promise in exchange for a benefit.",
                    "It will use his intermediaries to achieve his goals.",
                    "It waits for the stars to align to launch its final attack.",
                    "It wants to come into conflict with a power with the same goals.",
                    "It will show the truth to someone, at any cost."
                ]},
                { id:"arcaneEnemy", label:"Type", values:[
                    "the Undead Lord, looking for true immortality",
                    "a Wizard obsessed by power, looking for a magic power",
                    "a Sentient Artifact, looking for a worthy owner",
                    "an Ancient Curse, looking for its next host",
                    "a Chosen One, undecided about his future",
                    "a Dragon, looking for more gold and jewels"
                ]},
                { id:"arcaneAgenda", label:"Target", values:[
                    "It wants to aquire a forbidden knowledge.",
                    "It wants to corrupt space and time.",
                    "It wants to attack its enemy with magic.",
                    "It wants to spy someone with a spell or divination.",
                    "It wants to recruit a new disciple.",
                    "It wants to tempt someone with a promise.",
                    "It asked for a sacrifice."
                ]},
                { id:"hordes", label:"Type", values:[
                    "Nomad Barbarians, thirsty for revenge and violence",
                    "Humanoid Parasites, eager to consume and reproduce",
                    "Underground People, defending their city from outsiders",
                    "Undead, eager to spread everywhere"
                ]},
                { id:"hordeAgenda", label:"Target", values:[
                    "They are storming a city.",
                    "They are bringing chaos to help someone.",
                    "They suddenly changed direction.",
                    "They are overwhelming a weaker group.",
                    "They are going to show off their power.",
                    "They are abandoning a home and find a new one.",
                    "They are dangerously increasing in number.",
                    "They named a fearsome champion among them.",
                    "They declared war and it seems that nothing can stop them."
                ]},
                { id:"cursedPlaces", label:"Type", values:[
                    "Abandoned Tower, luring the weak of will",
                    "Desecrated Ground, breeding evil for centuries",
                    "Elemental Vortex, which continues to grow engulfing everything and everyone",
                    "Dark Portal, which brings demons to this world relentlessly",
                    "Shadow Realm, corrupting or consumimg the living",
                    "Place of Power, which many want to conquer"
                ]},
                { id:"placesAgenda", label:"Target", values:[
                    "From there, a dangerous monster appeared.",
                    "Now it is expanding far beyond its borders.",
                    "Someone very important has been drawn to that place.",
                    "Its power suddenly increased.",
                    "Someone has been affected by it.",
                    "He's offering his power to someone.",
                    "For some reason it's changing and that's never good news.",
                    "Its influence is corrupting minds.",
                    "It's altering the laws of nature."
                ]}
            ],
            YESNO_MODELS={
                range:[1,20],
                bases:[
                    { id:"unlikely", value:12, label:"Unlikely", oracleLabel:"My answer is..." },
                    { id:"quiteUnlikely", value:11, label:"Quite unlikely", oracleLabel:"My answer is..." },
                    { id:"fair", value:10, label:"Fair", oracleLabel:"My answer is..." },
                    { id:"quiteLikely", value:9, label:"Quite likely", oracleLabel:"My answer is..." },
                    { id:"likely", value:8, label:"Likely", oracleLabel:"My answer is..." }
                ],
                outcomes:[
                    { from:-20, to:-6, action:[ { type:"text", text:"Absolutely not, and there will be consequences." } ] },
                    { from:-5, to:-3, action:[ { type:"text", text:"No." } ] },
                    { from:-2, to:-1, action:[ { type:"text", text:"No, but..." } ] },
                    { from:0, to:0, action:[ { type:"text", text:"Something unexpected happened!" } ] },
                    { from:1, to:2, action:[ { type:"text", text:"Yes, but..." } ] },
                    { from:3, to:5, action:[ { type:"text", text:"Yes." } ] },
                    { from:6, to:20, action:[ { type:"text", text:"Absolutely yes, and something good happens!" } ] }
                ]
            },
            BONUS_TAGS={
                "str":[ "str", "strength" ],
                "dex":[ "dex", "dexterity" ],
                "con":[ "con", "constitution" ],
                "int":[ "int", "intelligence" ],
                "cha":[ "cha", "charisma" ]
            };
            

        let rpgData={
            anyWeight:0.2,
            statsModel:[
                { id:"str", shortGuiLabel:"STR", label:"Strength", editorLabel:"Strength" },
                { id:"dex", shortGuiLabel:"DEX", label:"Dexterity", editorLabel:"Dexterity" },
                { id:"con", shortGuiLabel:"CON", label:"Constitution", editorLabel:"Constitution" },
                { id:"int", shortGuiLabel:"INT", label:"Intelligence", editorLabel:"Intelligence" },
                // { id:"wis", shortGuiLabel:"WIS", label:"Wisdom", editorLabel:":"Wisdom" },
                { id:"cha", shortGuiLabel:"CHA", label:"Charisma", editorLabel:"Charisma" },
                { id:"dmg", shortGuiLabel:"DMG", label:"Damage", editorLabel:"Damage / Damage bonus" },
                { id:"xp", shortGuiLabel:"XP", label:"Experience Points", editorLabel:"Experience Points / Level" },
                { id:"hp", shortGuiLabel:"HP", label:"Health", editorLabel:"Health / Max Health" },
            ],
            rpgContexts:{
                people:"person",
                place:"place",
                name:"name",
                stats:"stats",
                items:"item",
                notes:"notes",
                tags:"tags"
            },
            rpgLabels:{
                personDeleteMessage:"Do you really want to remove <b>{name}</b> from this story?",
                placeDeleteMessage:"Do you really want to remove <b>{name}</b> from this story?",
                attributes_str:"Strength",
                attributes_dex:"Dexterity",
                attributes_con:"Constitution",
                attributes_int:"Intelligence",
                attributes_cha:"Charisma",
                attributes_dmg:"Damage",
                attributes_xp:"Experience",
                attributes_hp:"Health",
                max_dmg:"Damage bonus",
                max_hp:"Max Health",
                max_xp:"Level",
                short_attributes_str:"STR",
                short_attributes_dex:"DEX",
                short_attributes_con:"CON",
                short_attributes_int:"INT",
                short_attributes_cha:"CHA",
                short_attributes_dmg:"DMG",
                short_attributes_xp:"XP",
                short_attributes_hp:"HP",
                short_max_dmg:"DMG+",
                short_max_hp:"MAX HP",
                short_max_xp:"LV",
                visiting:"Visitor",
                quantity:"Amount",
                item:"Item",
                person:"Person",
                people:"Person",
                place:"Place",
                name:"Name",
                stats:"Stats",
                items:"Item",
                notes:"Notes",
                tags:"Tags",
                noPersonPlaceholder:"Someone",
                noPlacePlaceholder:"Somewhere",
            },
            search:SEARCHENGINES.embeddingsjs,
            onNewPerson:()=>{
                return { name:"", place:-1, stats:{ max:{ hp:5, xp:1, dmg:0 }, attributes:{ str:12, dex:12, con:12, int:12, cha:12, hp:5, xp:0, dmg:6 } } }
            },
            onNewPlace:()=>{
                return { name:"" }
            },
            symbols:{
                person:{
                    tags:[ "normal" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-user"></i>'
                },
                personFriend:{
                    tags:[ "friend" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-face-smile"></i>'
                },
                personHelp:{
                    tags:[ "helper" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-handshake"></i>'
                },
                personRich:{
                    tags:[ "rich" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-coins"></i>'
                },
                personMain:{
                    tags:[ "protagonist" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-star"></i>'
                },
                personMachine:{
                    tags:[ "machine" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-gear"></i>'
                },
                personWizard:{
                    tags:[ "wizard", "magic", "sprite" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-hat-wizard"></i>'
                },
                personExplorer:{
                    tags:[ "explorer", "traveler" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-compass"></i>'
                },
                personArcher:{
                    tags:[ "archer" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-bullseye"></i>'
                },
                personThief:{
                    tags:[ "thief", "spy", "bandit", "shady" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-mask"></i>'
                },
                personInsect:{
                    tags:[ "insect", "larva", "bug", "spider", "bee" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-bug"></i>'
                },
                personMerchant:{
                    tags:[ "merchant" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-shop"></i>'
                },
                personGardener:{
                    tags:[ "nature", "gardener", "druid", "tree", "elf" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-seedling"></i>'
                },
                personDragon:{
                    tags:[ "dragon" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-dragon"></i>'
                },
                personCleric:{
                    tags:[ "cleric", "god", "sacred", "monk", "religion" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-place-of-worship"></i>'
                },
                personSailor:{
                    tags:[ "sailor" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-anchor"></i>'
                },
                personDeath:{
                    tags:[ "dark", "death", "undead", "zombie", "abomination", "blood", "bite" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-skull"></i>'
                },
                personHeal:{
                    tags:[ "heal", "healer", "cure", "priest" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-hand-holding-heart"></i>'
                },
                personWait:{
                    tags:[ "wait" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-clock"></i>'
                },
                personPlague:{
                    tags:[ "plague", "sickness" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-virus"></i>'
                },
                personKing:{
                    tags:[ "king" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-crown"></i>'
                },
                personDrink:{
                    tags:[ "drink", "inn" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-beer-mug-empty"></i>'
                },
                personKnowledge:{
                    tags:[ "knowledge" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-glasses"></i>'
                },
                personStrong:{
                    tags:[ "strong", "armored", "armor", "barbarian" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-dumbbell"></i>'
                },
                personNinja:{
                    tags:[ "ninja" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-torii-gate"></i>'
                },
                personInjured:{
                    tags:[ "injured", "broken" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-user-injured"></i>'
                },
                personBeast:{
                    tags:[ "animal", "bite", "boar", "snail", "crocodile", "turtle", "snake", "rat" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-paw"></i>'
                },
                personFiring:{
                    tags:[ "firing" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-meteor"></i>'
                },
                personAlchemy:{
                    tags:[ "chemical" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-flask-vial"></i>'
                },
                personEnemy:{
                    tags:[ "enemy", "angry", "lunatic", "doppelganger", "giant", "sad" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-face-angry"></i>'
                },
                personFool:{
                    tags:[ "funny" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-face-smile"></i>'
                },
                personHorse:{
                    tags:[ "horse" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-horse"></i>'
                },
                personMusic:{
                    tags:[ "music", "bard" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-guitar"></i>'
                },
                personLuck:{
                    tags:[ "luck" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-clover"></i>'
                },
                personGhost:{
                    tags:[ "undead", "ghost" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-ghost"></i>'
                },
                personFire:{
                    tags:[ "fire" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-fire"></i>'
                },
                personLiquid:{
                    tags:[ "liquid", "jelly" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-water"></i>'
                },
                personFish:{
                    tags:[ "fish", "octopus", "eel" ].concat(PERSON_ICONTAGS),
                    label:'<i class="fa-solid fa-fish"></i>'
                },
                place:{
                    tags:[ "normal" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-map-location"></i>'
                },
                placeHouse:{
                    tags:[ "house" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-house"></i>'
                },
                placeClosed:{
                    tags:[ "blocked" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-lock"></i>'
                },
                placeSky:{
                    tags:[ "sky", "floating" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-cloud"></i>'
                },
                placeThunder:{
                    tags:[ "thunder" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-bolt"></i>'
                },
                placeGhost:{
                    tags:[ "ghost" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-ghost"></i>'
                },
                placeInn:{
                    tags:[ "eat", "drink" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-mug-hot"></i>'
                },
                placeBook:{
                    tags:[ "book" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-book"></i>'
                },
                placeFire:{
                    tags:[ "fire" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-fire"></i>'
                },
                placeRich:{
                    tags:[ "rich", "treasure" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-coins"></i>'
                },
                placeSecret:{
                    tags:[ "secret" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-eye-slash"></i>'
                },
                placeKey:{
                    tags:[ "key" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-key"></i>'
                },
                placeTree:{
                    tags:[ "forest" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-tree"></i>'
                },
                placeRoad:{
                    tags:[ "road", "way", "passage", "trail" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-route"></i>'
                },
                placeCold:{
                    tags:[ "cold", "frost" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-snowflake"></i>'
                },
                placeHot:{
                    tags:[ "hot", "desert", "sunny" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-sun"></i>'
                },
                placeLake:{
                    tags:[ "lake", "river", "sea", "falls", "water", "underwater", "flooded" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-water"></i>'
                },
                placePort:{
                    tags:[ "port" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-anchor"></i>'
                },
                placeFish:{
                    tags:[ "fish" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-fish"></i>'
                },
                placeShop:{
                    tags:[ "shop" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-shop"></i>'
                },
                placeGod:{
                    tags:[ "temple", "church", "god", "sacred" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-place-of-worship"></i>'
                },
                placeMountain:{
                    tags:[ "mountain", "top", "canyon" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-mountain"></i>'
                },
                placeGoal:{
                    tags:[ "goal", "target", "destination" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-flag-checkered"></i>'
                },
                placeDark:{
                    tags:[ "dark" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-moon"></i>'
                },
                placeGarden:{
                    tags:[ "garden" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-seedling"></i>'
                },
                placePlague:{
                    tags:[ "plague", "sickness" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-virus"></i>'
                },
                placeKingdom:{
                    tags:[ "kingdom", "castle" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-crown"></i>'
                },
                placeDragon:{
                    tags:[ "dragon" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-dragon"></i>'
                },
                placeVolcano:{
                    tags:[ "volcano" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-volcano"></i>'
                },
                placeTornado:{
                    tags:[ "tornado" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-tornado"></i>'
                },
                placeCamp:{
                    tags:[ "camp" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-tents"></i>'
                },
                placeRainbow:{
                    tags:[ "rainbow" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-rainbow"></i>'
                },
                placeEgg:{
                    tags:[ "egg" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-egg"></i>'
                },
                placeDungeon:{
                    tags:[ "dungeon", "maze" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-dungeon"></i>'
                },
                placeFarm:{
                    tags:[ "farm" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-cow"></i>'
                },
                placeTower:{
                    tags:[ "tower" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-chess-rook"></i>'
                },
                placeInn:{
                    tags:[ "inn" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-beer-mug-empty"></i>'
                },
                placeSchool:{
                    tags:[ "school" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-school"></i>'
                },
                placeBlood:{
                    tags:[ "blood" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-droplet"></i>'
                },
                personGrave:{
                    tags:[ "grave", "graveyard" ].concat(PLACE_ICONTAGS),
                    label:'<i class="fa-solid fa-skull"></i>'
                }
            },
            tables:{
                classes:{
                    label:"Class",
                    entries:[]
                },
                masterMoves:{
                    label:"Event",
                    entries:[
                        [ { type:"text", text:"An enemy is attacking!" } ],
                        [ { type:"text", text:"You learned an unconfortable truth!" } ],
                        [ { type:"text", text:"There are signs of a incoming menace!" } ],
                        [ { type:"text", text:"Something unexpected does harm!" } ],
                        [ { type:"text", text:"Something is trying to consume an item!" } ],
                        [ { type:"text", text:"Something backfired!" } ],
                        [ { type:"text", text:"Something is splitting up the group!" } ],
                        [ { type:"text", text:"You have to do something you're good at!" } ],
                        [ { type:"text", text:"You have to do something you're not good at!" } ],
                        [ { type:"text", text:"There is an opportunity... but at a cost!" } ],
                        [ { type:"text", text:"Things are not going right!" } ],
                        [ { type:"text", text:"You learned something more about the price you've to pay to reach your goal." } ],
                    ]
                },
                placeMoves:{
                    label:"Event",
                    entries:[
                        [ { type:"text", text:"The environment changed!" } ],
                        [ { type:"text", text:"A menace is coming!" } ],
                        [ { type:"text", text:"A new faction or creature is coming!" } ],
                        [ { type:"text", text:"A familiar faction or creature came back!" } ],
                        [ { type:"text", text:"For some reason you need to go back!" } ],
                        [ { type:"text", text:"There is something precious that you can only get for a price." } ],
                        [ { type:"text", text:"A challenge appeared!" } ],
                        [ { type:"text", text:"It's a trap!" } ],
                        [ { type:"text", text:"You meet someone..." } ]
                    ]
                },
                personAttitude:{
                    label:"Attitude",
                    entries:[
                        [ { onContext:["person"], type:"addTag", tags:["hostile"] } ],
                        [ { onContext:["person"], type:"addTag", tags:["unfriendly"] } ],
                        [ { onContext:["person"], type:"addTag", tags:["unsure"] } ],
                        [ { onContext:["person"], type:"addTag", tags:["talkative"] } ],
                        [ { onContext:["person"], type:"addTag", tags:["helpful"] } ]
                    ]
                }
            },
            oracles:{

                // Events

                whatsNextTopic:{
                    tags:["topic","fact","happening"].concat(EVENT_TAGS),
                    label:"Tell me a fact",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"miscTopics" },
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Topic" }
                            ]
                        }
                    ]
                },
                whatsNextPerson:{
                    tags:["now"].concat(PERSON_TAGS,EVENT_TAGS),
                    label:"Tell me what happens now",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"masterMoves" },
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Event" }
                            ]
                        }
                    ]
                },
                whatsNextPlace:{
                    tags:["here"].concat(PERSON_TAGS,PLACE_TAGS,EVENT_TAGS),
                    label:"Tell me what happens here",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"placeMoves" },
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Event" }
                            ]
                        }
                    ]
                },
                whatsNextRoom:{
                    tags:["dungeon","labyrinth","maze","map","room","next","building","temple","church","school","armory"].concat(PERSON_TAGS,PLACE_TAGS,EVENT_TAGS),
                    label:"Tell me what the next room here",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"dungeonRoom" },
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Room" }
                            ]
                        }
                    ]
                },

                // Dangers

                trapType:{
                    tags:[ "trap" ].concat(DANGER_TAGS,PLACE_TAGS),
                    label:"Tell me a trap type",
                    answers:[
                        { entry:[
                            { type:"rollTable", table:"trapType" },
                            { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Trap" }
                        ] }
                    ]
                },
                ambitiousOrganizations:{
                    tags:[ "ambitious", "organization", "group", "rebel", "religion", "politics", "spy" ].concat(DANGER_TAGS),
                    label:"Tell me about an ambitious organization",
                    answers:[
                        { entry:[
                            { type:"text", text:"There are the " },
                            { type:"rollTable", table:"ambitiousOrganizations" },
                            { type:"text", text:". " },
                            { type:"rollTable", table:"organizationAgenda" },
                            { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Organization" }
                        ] }
                    ]
                },
                planarPowers:{
                    tags:[ "planar", "power", "god", "arcane", "magic", "monk" ].concat(DANGER_TAGS),
                    label:"Tell me about a planar power",
                    answers:[
                        { entry:[
                            { type:"text", text:"There is " },
                            { type:"rollTable", table:"planarPowers" },
                            { type:"text", text:". " },
                            { type:"rollTable", table:"powerAgenda" },
                            { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Planar power" }
                        ] }
                    ]
                },
                arcaneEnemy:{
                    tags:[ "arcane", "enemy", "lord", "dark", "mystical", "mystery" ].concat(DANGER_TAGS),
                    label:"Tell me about an arcane enemy",
                    answers:[
                        { entry:[
                            { type:"text", text:"There is " },
                            { type:"rollTable", table:"arcaneEnemy" },
                            { type:"text", text:". " },
                            { type:"rollTable", table:"arcaneAgenda" },
                            { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Arcane enemy" }
                        ] }
                    ]
                },
                horde:{
                    tags:[ "horde", "group", "invasion" ].concat(DANGER_TAGS),
                    label:"Tell me about a horde",
                    answers:[
                        { entry:[
                            { type:"text", text:"There are the " },
                            { type:"rollTable", table:"hordes" },
                            { type:"text", text:". " },
                            { type:"rollTable", table:"hordeAgenda" },
                            { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Horde" }
                        ] }
                    ]
                },
                cursedPlace:{
                    tags:[ "curse", "place" ].concat(DANGER_TAGS),
                    label:"Tell me about a cursed place",
                    answers:[
                        { entry:[
                            { type:"text", text:"The " },
                            { type:"rollTable", table:"cursedPlaces" },
                            { type:"text", text:". " },
                            { type:"rollTable", table:"placesAgenda" },
                            { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Cursed place" }
                        ] }
                    ]
                },
                dangerousEvent:{
                    tags:[ "event" ].concat(DANGER_TAGS),
                    label:"Tell me about a danger",
                    answers:[
                        { entry:[ { type:"text", text:"There is an ambitious organization..." }, { type:"oracle", id:"ambitiousOrganizations" } ] },
                        { entry:[ { type:"text", text:"There is an arcane power..." }, { type:"oracle", id:"planarPowers" } ] },
                        { entry:[ { type:"text", text:"There is an arcane enemy..." }, { type:"oracle", id:"arcaneEnemy" } ] },
                        { entry:[ { type:"text", text:"There is a dangerous horde..." }, { type:"oracle", id:"horde" } ] },
                        { entry:[ { type:"text", text:"There is a cursed place..." }, { type:"oracle", id:"cursedPlace" } ] },
                    ]
                },
                
                // Treasures

                treasureChest:{
                    tags:[ "treasure", "chest", "loot", "reward" ],
                    label:"Tell me a reward",
                    answers:[
                        { entry:[ { type:"text", text:"It's a weapon!" }, { type:"oracle", id:"weaponName" } ] },
                        { entry:[ { type:"text", text:"It's a special weapon!" }, { type:"oracle", id:"specialWeaponName" } ] },
                        { entry:[ { type:"text", text:"It's an accessory!" }, { type:"oracle", id:"accessoryName" } ] },
                        { entry:[ { type:"text", text:"It's a special accessory!" }, { type:"oracle", id:"specialAccessoryName" } ] },
                        { entry:[ { type:"text", text:"It's a consumable item!" }, { type:"oracle", id:"consumableName" } ] },
                        { entry:[ { type:"text", text:"It's a special consumable item!" }, { type:"oracle", id:"specialConsumableName" } ] },
                        { entry:[ { type:"text", text:"It's a spell book!" }, { type:"oracle", id:"spellBookItem" } ] },
                        { entry:[ { type:"text", text:"It's a magic scroll!" }, { type:"oracle", id:"magicScrollItem" } ] },
                        { entry:[ { type:"text", text:"It's something worthless..." } ] },
                        { entry:[ { type:"text", text:"It's what you was looking for!" } ] },
                    ],
                },

                // Persons

                personType:{
                    tags:PERSONIDENTITY_TAGS,
                    label:"Tell me a character class",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"classes" }
                            ]
                        }
                    ]
                },
                personClass:{
                    tags:PERSONIDENTITY_TAGS,
                    label:"Tell me a character identity",
                    answers:[
                        { entry:[
                            { type:"text", text:"What class is the character?" }
                        ] }
                    ]
                },
                personName:{
                    tags:[ ].concat(NEWPERSON_TAGS),
                    label:"Tell me a person name",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"syllabe1" },
                                { type:"rollTable", table:"syllabe2" },
                                { type:"rollTable", table:"syllabe3" },
                                { type:"capitalizeText" },
                                { onContext:["person"], type:"setText", to:[ "name" ] },
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Person name" }
                            ]
                        },{
                            entry:[
                                { type:"rollTable", table:"syllabe1" },
                                { type:"rollTable", table:"syllabe2" },
                                { type:"capitalizeText" },
                                { onContext:["person"], type:"setText", to:[ "name" ] },
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Person name" }
                            ]
                        }
                    ]
                },
                scaryPersonName:{
                    tags:[ "evil", "bad", "scary" ].concat(NEWPERSON_TAGS),
                    label:"Tell me a scary name",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"syllabe1" },
                                { type:"rollTable", table:"syllabe2" },
                                { type:"text", text:"-" },
                                { type:"rollTable", table:"syllabe4" },
                                { type:"capitalizeText" },
                                { onContext:["person"], type:"setText", to:[ "name" ] },
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Person name" }
                            ]
                        },{
                            entry:[
                                { type:"rollTable", table:"syllabe1" },
                                { type:"text", text:"' " },
                                { type:"rollTable", table:"syllabe2" },
                                { type:"rollTable", table:"syllabe4" },
                                
                                { type:"capitalizeText" },
                                { onContext:["person"], type:"setText", to:[ "name" ] },
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Person name" }
                            ]
                        },{
                            entry:[
                                { type:"rollTable", table:"syllabe1" },
                                { type:"rollTable", table:"syllabe2" },
                                { type:"text", text:" " },
                                { type:"rollTable", table:"syllabe4" },
                                { type:"capitalizeText" },
                                { onContext:["person"], type:"setText", to:[ "name" ] },
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Person name" }
                            ]
                        }
                    ]
                },

                // Places

                placeName:{
                    tags:[].concat(NEWPLACE_TAGS),
                    label:"Tell me a place name",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"place1" },
                                { type:"rollTable", table:"place2" },
                                { type:"capitalizeText" },
                                { onContext:["place"], type:"setText", to:[ "name" ] },
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Place name" }
                            ]
                        }
                    ]
                },
                nextPlace:{
                    tags:[ "walk", "leave", "compass", "map" ].concat(NEWPLACE_TAGS),
                    label:"Tell me a place",
                    answers:[
                        { entry:[ { type:"text", text:"It's a large place." }, { type:"oracle", id:"largePlaceName" } ] },
                        { entry:[ { type:"text", text:"It's a small place." }, { type:"oracle", id:"smallPlaceName" } ] },
                        { entry:[ { type:"text", text:"It's a route." }, { type:"oracle", id:"routeName" } ] },
                    ]
                },
                largePlaceName:{
                    tags:[ "large", "huge", "city" ].concat(NEWPLACE_TAGS),
                    label:"Tell me a large place name",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"place1" },
                                { type:"rollTable", table:"place2" },
                                { type:"text", text:" " },
                                { type:"rollTable", table:"largePlaceTypes" },
                                { type:"capitalizeText" },
                                { onContext:["place"], type:"setText", to:[ "name" ] },
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Place name" }
                            ]
                        }
                    ]
                },
                smallPlaceName:{
                    tags:[ "small", "tiny", "town" ].concat(NEWPLACE_TAGS),
                    label:"Tell me a small place name",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"place1" },
                                { type:"rollTable", table:"place2" },
                                { type:"text", text:" " },
                                { type:"rollTable", table:"smallPlaceTypes" },
                                { type:"capitalizeText" },
                                { onContext:["place"], type:"setText", to:[ "name" ] },
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Place name" }
                            ]
                        }
                    ]
                },
                routeName:{
                    tags:[ "road", "way" ].concat(NEWPLACE_TAGS),
                    label:"Tell me a road name",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"place1" },
                                { type:"rollTable", table:"place2" },
                                { type:"text", text:" " },
                                { type:"rollTable", table:"routeTypes" },
                                { type:"capitalizeText" },
                                { onContext:["place"], type:"setText", to:[ "name" ] },
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Place name" }
                            ]
                        }
                    ]
                },

                // Items

                spellBookItem:{
                    tags:[ "spell", "magic", "book" ].concat(ITEMNAME_TAGS,SHOPITEMNAME_TAGS),
                    label:"Tell me a spell book",
                    answers:[ { entry:[ { type:"rollTable", table:"spellBook" } ] } ],
                },
                magicScrollItem:{
                    tags:[ "spell", "magic", "scroll" ].concat(ITEMNAME_TAGS,SHOPITEMNAME_TAGS),
                    label:"Tell me a magic scroll",
                    answers:[ { entry:[ { type:"rollTable", table:"magicScroll" } ] } ],
                },
                weaponName:{
                    tags:[ "weapon", "fight" ].concat(ITEMNAME_TAGS),SHOPITEMNAME_TAGS,
                    label:"Tell me a weapon name",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"weaponType" },
                                { type:"capitalizeText" },
                                { onContext:["item"], type:"addValueText", to:[ "tags" ], label:"Add item name"},
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Weapon" }
                            ]
                        }
                    ]
                },
                specialWeaponName:{
                    tags:[ "weapon", "fight" ].concat(ITEMNAME_TAGS,SPECIALITEM_TAGS,SHOPITEMNAME_TAGS),
                    label:"Tell me a special weapon name",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"itemAttribute" },
                                { type:"text", text:" " },
                                { type:"rollTable", table:"weaponType" },
                                { type:"capitalizeText" },
                                { onContext:["item"], type:"addValueText", to:[ "tags" ], label:"Add item name"},
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Weapon" }
                            ]
                        }
                    ]
                },
                accessoryName:{
                    tags:[ "accessory" ].concat(ITEMNAME_TAGS,SHOPITEMNAME_TAGS),
                    label:"Tell me an accessory name",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"accessoryType" },
                                { type:"capitalizeText" },
                                { onContext:["item"], type:"addValueText", to:[ "tags" ], label:"Add item name"},
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Accessory" }
                            ]
                        }
                    ]
                },
                specialAccessoryName:{
                    tags:[ "accessory" ].concat(ITEMNAME_TAGS,SPECIALITEM_TAGS,SHOPITEMNAME_TAGS),
                    label:"Tell me a special accessory name",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"itemAttribute" },
                                { type:"text", text:" " },
                                { type:"rollTable", table:"accessoryType" },
                                { type:"capitalizeText" },
                                { onContext:["item"], type:"addValueText", to:[ "tags" ], label:"Add item name"},
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Accessory" }
                            ]
                        }
                    ]
                },
                consumableName:{
                    tags:[ "consume", "eat", "drink", "collect" ].concat(ITEMNAME_TAGS,SHOPITEMNAME_TAGS),
                    label:"Tell me a consumable item name",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"consumableType" },
                                { type:"capitalizeText" },
                                { onContext:["item"], type:"addValueText", to:[ "tags" ], label:"Add item name"},
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Item" }
                            ]
                        }
                    ]
                },
                specialConsumableName:{
                    tags:[ "consume", "eat", "drink", "collect" ].concat(ITEMNAME_TAGS,SPECIALITEM_TAGS,SHOPITEMNAME_TAGS),
                    label:"Tell me a special consumable item name",
                    answers:[
                        {
                            entry:[
                                { type:"rollTable", table:"itemAttribute" },
                                { type:"text", text:" " },
                                { type:"rollTable", table:"consumableType" },
                                { type:"capitalizeText" },
                                { onContext:["item"], type:"addValueText", to:[ "tags" ], label:"Add item name"},
                                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Item" }
                            ]
                        }
                    ]
                }

            },
            moves:{
                pray:{
                    type:"roll",
                    tags:["monk","priest","god","pray","gods","cleric","sacred","church"].concat(ITEM_TAGS,PLACE_TAGS),
                    label:"Pray",
                    bonus:[
                        { section:"attributes", stat:"int" }
                    ],
                    results:{
                        fail:[ { type:"text", text:"The Gods are not listening." } ].concat(FAIL_ACTIONS),
                        failSuccess:[ { type:"text", text:"The Gods will listen to you but you will have to sacrifice something to prove your faith." } ],
                        success:[ { type:"text", text:"You have attracted the attention of the gods, be they benevolent or ruthless." } ]
                    }
                },
                meleeAttack:{
                    type:"roll",
                    tags:["melee","fight","near","blade","sword","longsword","broadsword","stiletto","shortsword","machete","club","rapier","scimitar","star","hammer","mace","glove","fist"].concat(ITEM_TAGS),
                    label:"Perform a melee attack",
                    bonus:[
                        { section:"attributes", stat:"str" }
                    ],
                    results:{
                        fail:[ { type:"text", text:"Enemy missed." } ].concat(FAIL_ACTIONS),
                        failSuccess:[
                            { type:"text", text:"Inflict damage to the enemy but the enemy attacks back." },
                            { onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage", value:[
                                { type:"rollStat", section:"attributes", stat:"dmg", ratio:1 },
                                { type:"sumStat", section:"max", stat:"dmg", ratio:1 }
                            ]}
                        ],
                        success:[
                            { type:"text", text:"Inflict damage to the enemy. You may decide to inflict +1d6 and expose to it." },
                            { groups:["roll"], removeGroups:["roll"], onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage", value:[
                                { type:"rollStat", section:"attributes", stat:"dmg", ratio:1 },
                                { type:"sumStat", section:"max", stat:"dmg", ratio:1 }
                            ]},
                            { groups:["roll"], removeGroups:["roll"], onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage &amp; expose", value:[
                                { type:"rollStat", section:"attributes", stat:"dmg", ratio:1 },
                                { type:"sumStat", section:"max", stat:"dmg", ratio:1 },
                                { type:"rollDice", dice:6, ratio:1 }
                            ]}
                        ]
                    }
                },
                rangedAttack:{
                    type:"roll",
                    tags:["range","fight","ranged","bow","longbow","javelin","chain","staff","sphere","cube","rod","blowgun","dart","sling","throwing","wand","lance","whip","spear","crossbow"].concat(ITEM_TAGS),
                    label:"Perform a ranged attack",
                    bonus:[
                        { section:"attributes", stat:"dex" }
                    ],
                    results:{
                        fail:[{ type:"text", text:"Enemy missed." }].concat(FAIL_ACTIONS),
                        failSuccess:[
                            { type:"text", text:"Inflict damage to the enemy but you may expose yourself to danger, do a weaker damage (-1d6), or spend 1 ammunition." },
                            { groups:["roll"], removeGroups:["roll"], onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage &amp; expose", value:[
                                { type:"rollStat", section:"attributes", stat:"dmg", ratio:1 },
                                { type:"sumStat", section:"max", stat:"dmg", ratio:1 }
                            ]},
                            { groups:["roll"], removeGroups:["roll"], onContext:["person"], type:"addRoll", unit:"dmg", label:"Weak damage", value:[
                                { type:"rollStat", section:"attributes", stat:"dmg", ratio:1 },
                                { type:"sumStat", section:"max", stat:"dmg", ratio:1 },
                                { type:"rollDice", dice:6, ratio:-1 },
                            ]},
                            { groups:["roll","ammo"], removeGroups:["roll"], keepGroups:["ammo"], onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage &amp; spend 1 ammunition", value:[
                                { type:"rollStat", section:"attributes", stat:"dmg", ratio:1 },
                                { type:"sumStat", section:"max", stat:"dmg", ratio:1 }
                            ]},
                            { groups:["roll","ammo"], removeGroups:["roll"], keepGroups:["ammo"], onContext:["item"], type:"changeValue", to:[ "quantity" ], value:[ { type:"sumValue", value:-1 }], label:"Spend 1 ammunition"}
                        ],
                        success:[
                            { type:"text", text:"Inflict damage to the enemy." },
                            { onContext:["person"], type:"addRoll", unit:"dmg", label:"Damage", value:[
                                { type:"rollStat", section:"attributes", stat:"dmg", ratio:1 },
                                { type:"sumStat", section:"max", stat:"dmg", ratio:1 }
                            ]}
                        ]
                    }
                },
                challengeStr:{
                    type:"roll",
                    tags:["strength","challenge","danger","break","force","block"].concat(PERSON_TAGS),
                    label:"Use brute force to face a challenge",
                    bonus:[
                        { section:"attributes", stat:"str" }
                    ],
                    results:CHALLENGE_RESULTS
                },
                challengeDex:{
                    type:"roll",
                    tags:["dexterity","challenge","danger","agility","move","jump","dodge","escape","run","away","stealth","hide","throw","spy"].concat(PERSON_TAGS),
                    label:"Use agility to face a challenge",
                    bonus:[
                        { section:"attributes", stat:"dex" }
                    ],
                    results:CHALLENGE_RESULTS
                },
                challengeCon:{
                    type:"roll",
                    tags:["constitution","challenge","danger","physical","resistance","poison","press","squash"].concat(PERSON_TAGS),
                    label:"Face a physical resistance challenge",
                    bonus:[
                        { section:"attributes", stat:"con" }
                    ],
                    results:CHALLENGE_RESULTS
                },
                challengeInt:{
                    type:"roll",
                    tags:["intelligence","challenge","danger","debate","inform","teach","question","ask","plan","trick"].concat(PERSON_TAGS),
                    label:"Use intelligence to face a challenge",
                    bonus:[
                        { section:"attributes", stat:"int" }
                    ],
                    results:CHALLENGE_RESULTS
                },
                challengeIntSpell:{
                    type:"roll",
                    tags:["intelligence","challenge","danger","resist","magic","spell"].concat(PERSON_TAGS),
                    label:"Use intelligence to resist magic",
                    bonus:[
                        { section:"attributes", stat:"int" }
                    ],
                    results:CHALLENGE_RESULTS
                },
                challengeCha:{
                    type:"roll",
                    tags:["charisma","challenge","danger","seduce","convince","love","sing","instrument"].concat(PERSON_TAGS),
                    label:"Use charm to face a challenge",
                    bonus:[
                        { section:"attributes", stat:"cha" }
                    ],
                    results:CHALLENGE_RESULTS
                },
                defend:{
                    type:"roll",
                    tags:["items","fight","defend","protect","shield"].concat(PERSON_TAGS,ITEM_TAGS),
                    label:"Defend someone else",
                    bonus:[
                        { section:"attributes", stat:"con" }
                    ],
                    results:{
                        fail:[ { type:"text", text:"You failed on defending it." } ].concat(FAIL_ACTIONS),
                        failSuccess:[ { type:"text", text:"Choose 1 option:" } ].concat(DEFENSE_OPTIONS),
                        success:[ { type:"text", text:"Choose 3 options:" } ].concat(DEFENSE_OPTIONS)
                    }
                },
                knowledge:{
                    type:"roll",
                    tags:["orientation","mystery","look","insight","smart","wisdom","map","compass","lens","doubt","information","knowledge","mind","discover","think"].concat(PERSON_TAGS,PLACE_TAGS,ITEM_TAGS),
                    label:"Check your knowledge",
                    bonus:[
                        { section:"attributes", stat:"int" }
                    ],
                    results:{
                        fail:[ { type:"text", text:"You discovered nothing." } ].concat(FAIL_ACTIONS),
                        failSuccess:[ { type:"text", text:"You discovered something related the current situation. Tell the truth about why you know it." } ],
                        success:[ { type:"text", text:"You discovered something interesting and helpful about the current situation." } ]
                    }
                },
                perception:{
                    type:"roll",
                    tags:["orientation","mystery","look","insight","smart","wisdom","map","compass","lens","telescope","mirror","lamp","happen","perception","reality","doubt","information","knowledge","mind","discover","observe","look","view"].concat(PERSON_TAGS,PLACE_TAGS,ITEM_TAGS),
                    label:"Percept what's happening",
                    bonus:[
                        { section:"attributes", stat:"int" }
                    ],
                    results:{
                        fail:[ { type:"text", text:"Nothing came to mind." } ].concat(FAIL_ACTIONS),
                        failSuccess:[ { type:"text", text:"Answer to 1 of these question:" } ].concat(PERCEPTION_OPTIONS),
                        success:[ { type:"text", text:"Answer to 3 of these questions:" } ].concat(PERCEPTION_OPTIONS)
                    }
                },
                convince:{
                    type:"roll",
                    tags:["convince","agree","compromise","appeal","hypnotize","seduce"].concat(PERSON_TAGS),
                    label:"Convince someone else",
                    bonus:[
                        { section:"attributes", stat:"cha" }
                    ],
                    results:{
                        fail:[ { type:"text", text:"You failed." } ].concat(FAIL_ACTIONS),
                        failSuccess:[ { type:"text", text:"It will do what you say, but you have to give him a concrete guarantee of your promise, right now." } ],
                        success:[ { type:"text", text:"It will do what you say if you promise to give him what he asks for." } ]
                    }
                },
                die:{
                    type:"roll",
                    tags:["die","death"].concat(PERSON_TAGS),
                    label:"Die",
                    results:{
                        fail:[ { type:"text", text:"You failed to escape from the grip of Death. Goodbye." } ],
                        failSuccess:[ { type:"text", text:"If you want to come back to life you've have to make a deal with Death. Good luck." } ],
                        success:[ { type:"text", text:"You tricked the Death itself. Your escape can't be stopped but the Death will remember your snub." } ]
                    }
                },
                guard:{
                    type:"roll",
                    tags:["guard","keep","watch"].concat(PERSON_TAGS,PLACE_TAGS),
                    label:"Keep watch",
                    bonus:[
                        { section:"attributes", stat:"con" }
                    ],
                    results:{
                        fail:[ { type:"text", text:"Your guard was in vain." } ].concat(FAIL_ACTIONS),
                        failSuccess:[ { type:"text", text:"You can barely warn everyone of what's happening." } ],
                        success:[ { type:"text", text:"You managed to keep everyone safe." } ]
                    }
                },
                travel:{
                    type:"roll",
                    tags:["travel","map","compass","direction"].concat(PERSON_TAGS,PLACE_TAGS),
                    label:"Travel to a far place",
                    bonus:[
                        { section:"attributes", stat:"dex" }
                    ],
                    results:{
                        fail:[ { type:"text", text:"Something went wrong along the way..." } ].concat(FAIL_ACTIONS),
                        failSuccess:[ { type:"text", text:"The trip went as planned." } ],
                        success:[ { type:"text", text:"You arrived at your destination early and safe." } ]
                    }
                },
                party:{
                    type:"roll",
                    tags:["party","fun"].concat(PERSON_TAGS,PLACE_TAGS),
                    label:"Have a party",
                    results:{
                        fail:[ { type:"text", text:"Choose 1 option but the situation gets out of hand:" } ].concat(PARTY_OPTIONS),
                        failSuccess:[ { type:"text", text:"Choose 1 option:" } ].concat(PARTY_OPTIONS),
                        success:[ { type:"text", text:"Choose 3 options:" } ].concat(PARTY_OPTIONS),
                    }
                },
                shop:{
                    type:"roll",
                    tags:["shop","buy","purchase","armory"].concat(PLACE_TAGS),
                    label:"Buy something",
                    bonus:[
                        { section:"attributes", stat:"cha" }
                    ],
                    results:{
                        fail:[ { type:"text", text:"You couldn't find what you were looking for." } ].concat(FAIL_ACTIONS),
                        failSuccess:[ { type:"text", text:"You found what you were looking for but it's pricey or not exactly what you needed." } ],
                        success:[ { type:"text", text:"You found what you were looking for and for a honest price." } ]
                    }
                },
                wanted:{
                    type:"roll",
                    tags:["wanted","bandit","robber","thief","murderer"].concat(PLACE_TAGS),
                    label:"I'm wanted in this place",
                    bonus:[
                        { section:"attributes", stat:"cha" }
                    ],
                    results:{
                        fail:[ { type:"text", text:"They didn't recognize you... yet." } ],
                        failSuccess:[
                            { type:"text", text:"Everyone recognizes you and choose 1 option:" },
                            { type:"roleAction", label:"Local police recognized you"},
                            { type:"roleAction", label:"Someone has put a price on your head"},
                            { type:"roleAction", label:"Someone important to you is in trouble because of your actions" }
                        ],
                        success:[ { type:"text", text:"Your fame precedes you and everyone recognizes you." } ]
                    }
                },
                camp:{
                    type:"check",
                    condition:[],
                    tags:["camp","relax","recover","safe","sleep","valley"].concat(PERSON_TAGS,PLACE_TAGS,ITEM_TAGS),
                    label:"Camp",
                    results:{
                        ok:[
                            { type:"text", text:"You gained half of your maximum health resting. You may level up now." },
                            { onContext:["person"], type:"changeStat", to:[ { section:"attributes", stat:"hp" } ], value:[
                                { type:"sumStat", section:"max", stat:"hp", ratio:1 },
                                { type:"divideValue", value:2, round:"floor" },
                                { type:"sumStat", section:"attributes", stat:"hp", ratio:1 },
                                { type:"capStat", section:"max", stat:"hp" },
                                { type:"sumStat", section:"attributes", stat:"hp", ratio:-1 },
                                { type:"lowcapValue", value:0 },
                            ], label:"Rest"},
                            { type:"move", id:"levelUp" }
                        ]
                    }
                },
                rest:{
                    type:"check",
                    condition:[],
                    tags:["camp","relax","recover","safe","sleep","rest","hospital","inn"].concat(PLACE_TAGS,ITEM_TAGS),
                    label:"Rest in a safe place for long",
                    results:{
                        ok:[
                            { type:"text", text:"You recovered all your Health. You may recover from illness if you rested to a healer." },
                            { onContext:["person"], type:"changeStat", to:[ { section:"attributes", stat:"hp" } ], value:[
                                { type:"sumStat", section:"max", stat:"hp", ratio:1 },
                                { type:"sumStat", section:"attributes", stat:"hp", ratio:-1 },
                                { type:"lowcapValue", value:0 },
                            ], label:"Recover Health"}
                        ]
                    }
                },
                levelUp:{
                    type:"check",
                    condition:[
                        { type:"sumStat", section:"attributes", stat:"xp", ratio:1 },
                        { type:"sumStat", section:"max", stat:"xp", ratio:-1 },
                        { type:"sumValue", value:-7 },
                        { type:"ifGreaterEqualThanValue", value:0 },
                    ],
                    tags:["grow","stronger","improve","level"].concat(PERSON_TAGS),
                    label:"Level up",
                    results:{
                        ko:[
                            { type:"text", text:"You can't level up now. You need your level +7 Experience Points." },
                        ],
                        ok:[
                            { type:"text", text:"You gained a level! Consume the required XPs, increase your level, select 1 improvement, and think about your next life goal." },
                            { onContext:["person"], type:"changeStat", to:[ { section:"attributes", stat:"xp" } ], value:[
                                { type:"sumStat", section:"max", stat:"xp", ratio:-1 },
                                { type:"sumValue", value:-7 },
                            ], label:"Consume XP"},
                            { onContext:["person"], type:"changeStat", to:[ { section:"max", stat:"xp" } ], value:[ { type:"sumValue", value:1 }], label:"Increase level"},
                            { groups:["stat"], removeGroups:["stat"], onContext:["person"], type:"changeStat", to:[ { section:"attributes", stat:"str" } ], value:[ { type:"sumValue", value:1 }], label:"Be stronger"},
                            { groups:["stat"], removeGroups:["stat"], onContext:["person"], type:"changeStat", to:[ { section:"attributes", stat:"dex" } ], value:[ { type:"sumValue", value:1 }], label:"Be more agile"},
                            { groups:["stat","con"], removeGroups:["stat"], keepGroups:["con"], onContext:["person"], type:"changeStat", to:[ { section:"attributes", stat:"con" } ], value:[ { type:"sumValue", value:1 }], label:"Be more resistant (1/2)"},
                            { groups:["stat","con"], removeGroups:["stat"], keepGroups:["con"], onContext:["person"], type:"changeStat", to:[ { section:"max", stat:"hp" } ], value:[ { type:"sumValue", value:1 }], label:"Be more resistant (2/2)"},
                            { groups:["stat"], removeGroups:["stat"], onContext:["person"], type:"changeStat", to:[ { section:"attributes", stat:"int" } ], value:[ { type:"sumValue", value:1 }], label:"Be smarter"},
                            { groups:["stat"], removeGroups:["stat"], onContext:["person"], type:"changeStat", to:[ { section:"attributes", stat:"cha" } ], value:[ { type:"sumValue", value:1 }], label:"Be more appealing"},
                            { type:"roleAction", label:"Think about your next life goals"},
                        ]
                    }
                },
                eat:{
                    type:"check",
                    condition:[],
                    tags:["food","fruit","meat","vegetable","cake","cookie","egg","fish","eat","drink"].concat(ITEM_TAGS),
                    label:"Eat a common food item",
                    results:{
                        ok:[
                            { type:"text", text:"You feel a little fuller." },
                            { onContext:["person"], type:"changeStat", to:[ { section:"attributes", stat:"hp" } ], value:[
                                { type:"sumStat", section:"attributes", stat:"hp", ratio:1 },
                                { type:"sumLimitValue", value:2, higherLimit:[ { type:"sumStat", section:"max", stat:"hp", ratio:1 } ], lowerLimit:[ ] },
                                { type:"sumStat", section:"attributes", stat:"hp", ratio:-1 },
                            ], label:"Eat"},
                            { onContext:["item"], type:"changeValue", to:[ "quantity" ], value:[ { type:"sumValue", value:-1 }], label:"Consume"}
                        ]
                    }
                },
                bandage:{
                    type:"check",
                    condition:[],
                    tags:["bandage","medicine","heal"].concat(ITEM_TAGS),
                    label:"Use a common item for healing",
                    results:{
                        ok:[
                            { type:"text", text:"You took some time to prepare but you feel a little better now." },
                            { onContext:["person"], type:"changeStat", to:[ { section:"attributes", stat:"hp" } ], value:[
                                { type:"sumStat", section:"attributes", stat:"hp", ratio:1 },
                                { type:"sumLimitValue", value:4, higherLimit:[ { type:"sumStat", section:"max", stat:"hp", ratio:1 } ], lowerLimit:[ ] },
                                { type:"sumStat", section:"attributes", stat:"hp", ratio:-1 },
                            ], label:"Eat"},
                            { onContext:["item"], type:"changeValue", to:[ "quantity" ], value:[ { type:"sumValue", value:-1 }], label:"Consume"}
                        ]
                    }
                },
                magicBandage:{
                    type:"check",
                    condition:[],
                    tags:["potion","stimpack","magic","heal"].concat(ITEM_TAGS),
                    label:"Use a magic item for healing",
                    results:{
                        ok:[
                            { type:"text", text:"You feel way better! Choose to heal or cure an affliction:" },
                            { onContext:["person"], type:"changeStat", to:[ { section:"attributes", stat:"hp" } ], value:[
                                { type:"sumStat", section:"attributes", stat:"hp", ratio:1 },
                                { type:"sumLimitValue", value:10, higherLimit:[ { type:"sumStat", section:"max", stat:"hp", ratio:1 } ], lowerLimit:[ ] },
                                { type:"sumStat", section:"attributes", stat:"hp", ratio:-1 },
                            ], label:"Eat"},
                            { onContext:["item"], type:"changeValue", to:[ "quantity" ], value:[ { type:"sumValue", value:-1 }], label:"Consume"},
                            { type:"roleAction", label:"Cure an affliction"},
                        ]
                    }
                },
                medicine:{
                    type:"check",
                    condition:[],
                    tags:["poison","paralysis","affliction","plague","ill","pill","medicine","vial","essence","infuse"].concat(ITEM_TAGS),
                    label:"Use a medicine-like item",
                    results:{
                        ok:[
                            { type:"text", text:"One of your afflictions have been cured." },
                            { onContext:["item"], type:"changeValue", to:[ "quantity" ], value:[ { type:"sumValue", value:-1 }], label:"Consume"}
                        ]
                    }
                },
                genericConsume:{
                    type:"roll",
                    tags:["_any"].concat(ITEM_TAGS),
                    label:"Consume a special item",
                    results:{
                        fail:[
                            { type:"text", text:"It worked but with an unexpected side effect..." },
                            { onContext:["item"], type:"changeValue", to:[ "quantity" ], value:[ { type:"sumValue", value:-1 }], label:"Consume"}
                        ].concat(FAIL_ACTIONS),
                        failSuccess:[
                            { type:"text", text:"It worked!" },
                            { onContext:["item"], type:"changeValue", to:[ "quantity" ], value:[ { type:"sumValue", value:-1 }], label:"Consume"}
                        ],
                        success:[
                            { type:"text", text:"It worked and it's super effective!" },
                            { onContext:["item"], type:"changeValue", to:[ "quantity" ], value:[ { type:"sumValue", value:-1 }], label:"Consume"}
                        ]
                    }
                },
            }
        };

        // Data generators

        CLASSES.forEach(char=>{
            let
                classOracle=char.id,
                health=char.hpBonus+char.stats.con;

            rpgData.tables.classes.entries.push([ { type:"text", text:char.oracleClassLabel }, { type:"oracle", id:classOracle } ] );
            rpgData.oracles.personClass.answers[0].entry.push( { type:"oracle", id:classOracle, label:char.label } );

            rpgData.oracles[classOracle]={
                hidden:true,
                tags:[].concat(PERSONIDENTITY_TAGS,char.tags,char.classTags),
                label:char.oracleLabel,
                answers:[
                    {
                        entry:[
                            { type:"rollTable", table:"syllabe1" },
                            { type:"rollTable", table:"syllabe2" },
                            { type:"capitalizeText" },
                            { type:"text", text:" the "+char.label },
                            { onContext:["person"], type:"setStat", to:[ { section:"attributes", stat:"str" } ], value:[ { type:"sumValue", value:char.stats.str } ], label:"Set Strength" },
                            { onContext:["person"], type:"setStat", to:[ { section:"attributes", stat:"dex" } ], value:[ { type:"sumValue", value:char.stats.dex } ], label:"Set Dexterity" },
                            { onContext:["person"], type:"setStat", to:[ { section:"attributes", stat:"con" } ], value:[ { type:"sumValue", value:char.stats.con } ], label:"Set Constitution" },
                            { onContext:["person"], type:"setStat", to:[ { section:"attributes", stat:"int" } ], value:[ { type:"sumValue", value:char.stats.int } ], label:"Set Intelligence" },
                            { onContext:["person"], type:"setStat", to:[ { section:"attributes", stat:"cha" } ], value:[ { type:"sumValue", value:char.stats.cha } ], label:"Set Charisma" },
                            { onContext:["person"], type:"setStat", to:[ { section:"attributes", stat:"dmg" } ], value:[ { type:"sumValue", value:char.stats.dmg } ], label:"Set Damage" },
                            { onContext:["person"], type:"setStat", to:[ { section:"attributes", stat:"hp" } ], value:[ { type:"sumValue", value:health } ], label:"Set Health" },
                            { onContext:["person"], type:"setStat", to:[ { section:"max", stat:"hp" } ], value:[ { type:"sumValue", value:health } ], label:"Set Max Health" },
                            { onContext:["person"], type:"addTag", tags:char.tags },
                            { removeGroups:["alignment"], groups:["alignment"], onContext:["person"], type:"addTag", tags:char.alignment },
                            { onContext:["person"], type:"setText", to:[ "name" ] },
                            { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Person name" },
                        ]
                    }
                ]
            };
        })

        TABLES_SIMPLE.forEach(table=>{
            let entry={
                label:table.label,
                entries:[ ]
            };
            table.values.forEach(value=>{
                let action=[ { type:"text", text:value } ];
                if (table.addTag)
                    action.push({ onContext:table.addTag, type:"addTag", tags:[ value.toLowerCase() ] });
                entry.entries.push(action);
            });
            rpgData.tables[table.id]=entry;
        });

        BASICATTACK_OPTIONS.forEach(attack=>{
            let extraTags;
            switch (attack.type) {
                case "ranged":{
                    extraTags=["person","fight","creature","basic","range","ranged"];
                    break;
                }
                case "melee":{
                    extraTags=["person","fight","creature","basic","melee","near"];
                    break;
                }
            }
            if (extraTags) {
                rpgData.moves[attack.id]={
                    type:"roll",
                    tags:extraTags.concat(attack.tags),
                    label:attack.label,
                    bonus:attack.bonus,
                    metadata:{
                        isBasic:true
                    },
                    results:{
                        fail:[ { type:"text", text:"Enemy missed." } ].concat(FAIL_ACTIONS),
                        failSuccess:[ { type:"text", text:"Inflict damage to the enemy but the enemy attacks back." } ].concat(attack.action),
                        success:[ { type:"text", text:"Inflict damage to the enemy." } ].concat(attack.action)
                    }
                };
            }
        });

        SPECIALROLE_ACTIONS.forEach(action=>{
            rpgData.moves[action.id]={
                type:"check",
                condition:[],
                tags:action.tags,
                label:action.label,
                results:{
                    ok:action.action
                }
            };
        });

        let allCreatures=[];

        ENVIRONMENTS.forEach(environment=>{

            let
                tableId=environment.id+"Creatures",
                creaturesTable={
                    label:"Creature",
                    entries:[ ]
                };

            environment.creatures.forEach(creature=>{
                let creatureData=[
                    { type:"text", text:creature.label },
                    { onContext:["person"], type:"setStat", to:[ { section:"max", stat:"hp" } ], value:[ { type:"sumValue", value:creature.stats.hp } ], label:"Set Max Health" },
                    { onContext:["person"], type:"setStat", to:[ { section:"attributes", stat:"hp" } ], value:[ { type:"sumValue", value:creature.stats.hp } ], label:"Set Health" },
                    { onContext:["person"], type:"addTag", tags:creature.type },
                    { onContext:["person"], type:"addTag", tags:creature.appearance },
                    { onContext:["person"], type:"addTag", tags:creature.weapon },
                    { onContext:["person"], type:"addTag", tags:creature.habit },
                    { onContext:["person"], type:"addTag", tags:creature.group },
                    { onContext:["person"], type:"setText", to:[ "name" ] }
                ];
                if (creature.isSentient)
                    creatureData.push({ type:"rollTable", table:"personAttitude" });
                creaturesTable.entries.push(creatureData)
            });

            rpgData.tables[tableId]=creaturesTable;

            rpgData.oracles[tableId]={
                tags:environment.tags.concat(PLACECREATURES_TAGS),
                label:environment.oracleLabel,
                answers:[ { entry:[ { type:"rollTable", table:tableId } ] } ]
            };

            allCreatures.push({ entry:[ { type:"text", text:environment.anyCreatureLabel }, { type:"oracle", id:tableId } ] } )

        });

        rpgData.oracles.anyCreature={
            tags:[ "people", "creature", "enemy" ],
            label:"Tell me a creature",
            answers:allCreatures
        };

        let allOutcomes=[
            { type:"text", text:"How likely is it going to be a yes?" }
        ];

        YESNO_MODELS.bases.forEach(base=>{
            let
                tableId=base.id+"Table",
                oracleId=base.id+"Oracle",
                table={
                    label:"Outcome",
                    entries:[]
                };
            for (let i=YESNO_MODELS.range[0];i<=YESNO_MODELS.range[1];i++) {
                let
                    matchingOutcome,
                    value=i-base.value;
                YESNO_MODELS.outcomes.forEach(outcome=>{
                    if ((value>=outcome.from)&&(value<=outcome.to))
                        matchingOutcome=outcome;
                })
                table.entries.push(matchingOutcome.action);
            }
            rpgData.tables[tableId]=table;
            rpgData.oracles[oracleId]={
                hidden:true,
                tags:[],
                label:base.oracleLabel,
                answers:[{entry:[ { type:"rollTable", table:tableId } ] } ]
            };
            allOutcomes.push({ type:"oracle", id:oracleId, label:base.label })
        });

        rpgData.oracles.yesNoQuestion={
            tags:["yes","no","outcome","event","decision","_any"],
            label:"Tell me yes or no",
            answers:[ { entry:allOutcomes } ]
        };


        let
            magicscrolls=[],
            spellbooks=[];
        SPELL_LIST.forEach(spell=>{
            let tags=spell.name.toLowerCase().replace(/'s/g,"").replace(/'/g,"");
            magicscrolls.push([
                { type:"newText", text:"magic scroll "+tags+"" }, { onContext:["item"], type:"addValueText", to:[ "tags" ], label:"Add magic scroll"},
                { type:"newText", text:spell.name+": "+spell.description },
                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Spell" }
            ]);
            spellbooks.push([
                { type:"newText", text:"spell book "+tags+"" }, { onContext:["item"], type:"addValueText", to:[ "tags" ], label:"Add spell book"},
                { type:"newText", text:spell.name+": "+spell.description },
                { onContext:["person","place"], type:"addText", to:[ "notes" ], prefix:"Spell" }
            ]);

        });

        rpgData.tables.spellBook={
            label:"Spell book",
            entries:spellbooks
        };
        rpgData.tables.magicScroll={
            label:"Magic scroll",
            entries:magicscrolls
        };

        for (let k in rpgData.moves)
            if (rpgData.moves[k].bonus)
                rpgData.moves[k].bonus.forEach(bonus=>{
                    if (BONUS_TAGS[bonus.stat])
                        rpgData.moves[k].tags=rpgData.moves[k].tags.concat(BONUS_TAGS[bonus.stat]);
                    else
                        console.warn("Can't index bonus",bonus);
                })

        return rpgData;

    }

};