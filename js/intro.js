function Intro() {

    const
        TEXTS=[
            "Well done, adventurer!<br>You've traversed forests and swamps, faced deep dungeons and terrible monstrosities, and now you're holding the most powerful artifact in this world:<br><b>the Scroll of Many Glances</b>",
            "Once unrolled, you can use your imagination to get a glimpse into the life of any creature of this realm. You can close your eyes and materialize it in your mind or tell it aloud if you prefer!",
            "Whenever you see an interesting person, place, or item, you can note it on the Scroll. Often a few keywords will suffice, just for you to not forget them.",
            "You will have no rules or boundaries: you can create and wipe out anything as you please!<br><b>In this story you are a god!</b>",
            "I, the Black Panel, will silently read the Scroll as you move it. I know every rule of this world, so I can help you on deciding the fate of anything.<br><b>Just point it to me.</b>",
            "My job is to help you on filling your glance with fair surprises, from joyful victories to dramatic deaths. I'll be there for you from the very beginning...<br><b>...to its impending end</b>.",
            "Because, alas, there is an end.<br>According to legend you are supposed to close your glance and create a new one <b>after "+GLOBALS.duration+" minutes</b>.<br>I will take care to warn you when the time comes but I won't stop you.<br><b>You will decide what to do</b>.",
            "It may all seem strange and puzzling to you.<br>Please, take some time to just explore me and the Scroll.<br>Once you're ready, start imagining a person or a place, and let's explore them together.<br><b>I can't wait to see the stories hiding in your mind!</b>"
        ];

    let
        nextEnabled=false,
        onEnd=0,
        root=0,
        prevScene,
        listEntries,
        autoNextTimeout,
        ui=new UI(document.body),
        step=0;

    function gotoNext() {
        if (nextEnabled) {
            step++;
            runStep();
        }
    }

    function waitAnimation(node) {
        nextEnabled=false;
        node.addEventListener("animationend",()=>{
            nextEnabled=true;
        })
    }

    function autoNext() {
        if (autoNextTimeout == -1) {
            autoNextTimeout=0;
            gotoNext();
        } else {
            console.log("waiting...");
            if (autoNextTimeout)
                clearTimeout(autoNextTimeout);
            autoNextTimeout=setTimeout(()=>{
                if (nextEnabled) {
                    autoNextTimeout=-1;
                    setTimeout(autoNext,5000);
                } else autoNext();            
            },1000);
        }
    }

    function runStep() {
        let isLastStep=false;
        nextEnabled=false;
        switch (step) {
            case 0:{
                let
                    page=ui.addNode(root,"div","fullscreen" ),
                    panel=ui.addNode(page,"div","panel"),
                    text=ui.addNode(panel,"div","text",0,{ innerHTML:TEXTS[0]} ),
                    controls=ui.addNode(panel,"div","controls" );
                ui.addNode(controls,"div","button",0,{ innerHTML:"Next", onClick:gotoNext } );
                waitAnimation(controls);
                prevScene=page;
                break;
            }
            case 1:{
                if (prevScene) prevScene.className+=" leave";
                let
                    rollscreen=ui.addNode(root,"div","rollscreen" ),
                    roll=ui.addNode(rollscreen,"div","roll" ),
                    rollBar=ui.addNode(roll,"div","rollbar" ),
                    roll1=ui.addNode(rollBar,"div","roll1" ),
                    roll2=ui.addNode(rollBar,"div","roll2" ),
                    sheet=ui.addNode(roll,"div","sheet"),
                    panel=ui.addNode(sheet,"div","panel"),
                    text=ui.addNode(panel,"div","text",0,{ innerHTML:TEXTS[1]} ),
                    controls=ui.addNode(panel,"div","controls" );
                ui.addNode(controls,"div","button",0,{ innerHTML:"Next", onClick:gotoNext } );
                waitAnimation(controls);
                prevScene=rollscreen;
                break;
            }
            case 2:{
                listEntries=[];
                if (prevScene) prevScene.className+=" leave";
                let
                    delay=1,
                    editscreen=ui.addNode(root,"div","editscreen" ),
                    panel=ui.addNode(editscreen,"div","allpanels firstpanel",0,{ innerHTML:TEXTS[2]} ),
                    controls=ui.addNode(panel,"div","controls" ),
                    editor=ui.addNode(editscreen,"div","editor" ),
                    editorContent=ui.addNode(editor,"div","editorcontent" );

                [   
                    { section:"People" },
                    { icon:"<i class=\"fa-solid fa-dumbbell\"></i>", label:"Dangan The Warrior" },
                    { icon:"<i class=\"fa-solid fa-place-of-worship\"></i>", label:"Madrigal The Cleric" },
                    { icon:"<i class=\"fa-solid fa-dragon\"></i>", label:"Evil Dragon" },
                    { icon:"<i class=\"fa-solid fa-mountain\"></i>", label:"The Mountains Giant", delayed:true },
                    { section:"Places" },
                    { icon:"<i class=\"fa-solid fa-crown\"></i>", label:"The King's Castle" },
                    { icon:"<i class=\"fa-solid fa-dungeon\"></i>", label:"The Dark Dungeons" }
                ].forEach((entry,id)=>{
                    let root;
                    if (entry.label) {
                        root=ui.addNode(editorContent,"div","collapsable hidden "+(entry.delayed ? "" : "animated"));
                        let
                            label=ui.addNode(root,"div","label"),
                            labelText=ui.addNode(label,"div","labeltext", 0, { innerHTML:"+ "+entry.icon+" "+entry.label}),
                            labelWidget=ui.addNode(label,"div","labelwidget"),
                            deleteButton=ui.addNode(label,"div","delete",0, { innerHTML:"&times;" });
                    } else {
                        root=ui.addNode(editorContent,"div","animated list");
                        let
                            headerContainer=ui.addNode(root,"div","headercontainer"),
                            header=ui.addNode(headerContainer,"div","header",0, { innerHTML:entry.section }),
                            addButton=ui.addNode(headerContainer,"div","add",0, { innerHTML:"+" });
                    }
                    if (!entry.delayed) {
                        delay++;
                        root.style.animationDelay=delay+"s";
                    }
                    listEntries.push(root);
                })
                ui.addNode(controls,"div","button",0,{ innerHTML:"Next", onClick:gotoNext } );
                waitAnimation(controls);
                prevScene=editscreen;
                break;
            }
            case 3:{
                let
                    panel=ui.addNode(prevScene,"div","allpanels popuppanel secondpanel",0,{ innerHTML:TEXTS[3]} ),
                    controls=ui.addNode(panel,"div","controls" );
                if (prevScene) prevScene.className+=" leavefirst";
                listEntries[2].className+=" remove";
                listEntries[2].style.animationDelay="2s";
                listEntries[6].className+=" remove";
                listEntries[6].style.animationDelay="5s";
                listEntries[4].className+=" animated";
                listEntries[4].style.animationDelay="7s";
                listEntries[3].className+=" remove";
                listEntries[3].style.animationDelay="8s";
                ui.addNode(controls,"div","button",0,{ innerHTML:"Next", onClick:gotoNext } );
                waitAnimation(controls);
                break;
            }
            case 4:{
                if (prevScene) prevScene.className+=" leavesecond";
                let
                    arrow=ui.addNode(prevScene,"div","arrow" ),
                    panel=ui.addNode(prevScene,"div","allpanels popuppanel thirdpanel",0,{ innerHTML:TEXTS[4]} ),
                    controls=ui.addNode(panel,"div","controls" );
                ui.addNode(controls,"div","button",0,{ innerHTML:"Next", onClick:gotoNext } );
                waitAnimation(controls);
                break;
            }
            case 5:{
                if (prevScene) prevScene.className+=" leavethird";
                let
                    panel=ui.addNode(prevScene,"div","allpanels popuppanel fourthpanel",0,{ innerHTML:TEXTS[5]} ),
                    controls=ui.addNode(panel,"div","controls" ),
                    oraclebar=ui.addNode(prevScene,"div","oraclebar" );
                [
                    "Use brute force to face a challenge",
                    "Tell me what happens here",
                    "Tell me about a horde",
                    "Tell me a character identity",
                    "Level up",
                    "Perform a ranged attack",
                    "Perform a basic sword melee attack",
                    "Tell me a large place name",
                    "Tell me a cleric identity",
                    "Travel to a far place",
                    "Use intelligence to face a challenge",
                    "Tell me a place name",
                    "Convince someone else",
                    "Tell me a weapon name",
                    "Perform a basic beam ranged attack",
                    "Tell me a wizard identity",
                    "Tell me about a cursed place",
                    "Tell me a consumable item name",
                    "Tell me a thief identity",
                    "Defend someone else",
                    "Keep watch",
                    "Tell me a barbarian identity",
                    "Tell me about an arcane enemy",
                    "Tell me a traveler identity",
                    "Tell me a trap type",
                    "Rest in a safe place for long",
                    "Check your knowledge",
                    "Die",
                    "Tell me a small place name",
                    "I'm wanted in this place",
                    "Tell me an accessory name",
                    "Percept what's happening",
                    "Light up the environment",
                    "Tell me a paladin identity",
                    "Tell me about a planar power",
                    "Tell me a warrior identity",
                    "Tell me about a danger",
                    "Perform a melee attack",
                    "Camp",
                    "Perform a basic giant ranged attack",
                    "Tell me a reward",
                    "Use a magic item for healing",
                    "Tell me what the next room here",
                    "Tell me a swamp creature",
                    "Perform a basic corrosive ranged attack",
                    "Buy something",
                    "Eat a common food item",
                    "Tell me what happens now",
                    "Perform a basic giant melee attack",
                    "Use a medicine-like item",
                    "Use a common item for healing",
                    "Have a party",
                    "Face a resistance challenge",
                    "Perform a basic projectile ranged attack",
                    "Tell me a special accessory name",
                    "Tell me a special weapon name",
                    "Perform a basic shallowing melee attack",
                    "Tell me a scary name",
                    "Tell me a character class",
                    "Tell me a druid identity",
                    "Tell me a cavern creature",
                    "Pray",
                    "Tell me a forest creature",
                    "Use agility to face a challenge",
                    "Tell me a road name",
                    "Tell me a bard identity",
                    "Tell me about an ambitious organization",
                    "Tell me a creature",
                    "Tell me a person name",
                    "Tell me a fact",
                    "Use charm to face a challenge",
                    "Tell me a place",
                    "Perform a basic burning melee attack",
                    "Tell me a special consumable item name",
                    "Perform a basic lacerating melee attack",
                ].forEach((item,id)=>{
                    let node=ui.addNode(oraclebar,"div","oracleitem",0,{innerHTML:item});
                });
                ui.addNode(controls,"div","button",0,{ innerHTML:"Next", onClick:gotoNext } );
                waitAnimation(controls);
                break;
            }
            case 6:{
                if (prevScene) prevScene.className+=" leavefourth";
                let
                    clockscene=ui.addNode(root,"div","clockscene" ),
                    clockbox=ui.addNode(clockscene,"div","clockbox" ),
                    clock=ui.addNode(clockbox,"div","clock" ),
                    clockarm=ui.addNode(clock,"div","clockarm" ),
                    container=ui.addNode(clockscene,"div","container"),
                    panel=ui.addNode(container,"div","panel"),
                    text=ui.addNode(panel,"div","text",0,{ innerHTML:TEXTS[6]} ),
                    controls=ui.addNode(panel,"div","controls" );
                ui.addNode(controls,"div","button",0,{ innerHTML:"Next", onClick:gotoNext } );
                waitAnimation(controls);
                prevScene=clockscene;
                break;
            }
            case 7:{
                if (prevScene) prevScene.className+=" leave";
                let
                    endscene=ui.addNode(root,"div","endscene" ),
                    container=ui.addNode(endscene,"div","container"),
                    panel=ui.addNode(container,"div","panel"),
                    text=ui.addNode(panel,"div","text",0,{ innerHTML:TEXTS[7]} ),
                    controls=ui.addNode(panel,"div","controls" );
                ui.addNode(controls,"div","button",0,{ innerHTML:"Next", onClick:gotoNext } );
                waitAnimation(controls);
                prevScene=endscene;
                break;
            }
            case 8:{
                isLastStep=true;
                root.className+=" leave";
                setTimeout(()=>{
                    root.parentNode.removeChild(root);
                    onEnd();
                },2500);
                break;
            }
        }
        if (!isLastStep && GLOBALS.DEBUG && GLOBALS.DEBUGINTRO)
            autoNext();
    }

    this.run=(rootnode,cb)=>{
        nextEnabled=false;
        root=ui.addNode(rootnode,"div","intro");
        step=0;
        onEnd=cb;
        runStep();
    }

}