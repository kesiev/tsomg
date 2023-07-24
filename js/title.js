function Title() {

    const
        MINUTE=60000;

    let
        settings,
        screencontainer,
        screen,
        title,
        buttons,
        ui=new UI(document.body);
    
        
    function MessageBox(text) {
        let
            box=ui.addNode(screen,"div","messagebox"),
            messageBox=ui.addNode(box,"div","box"),
            content=ui.addNode(messageBox,"div","box"),
            contentText=ui.addNode(messageBox,"div","text",0, { innerHTML:text }),
            contentExtras=ui.addNode(messageBox,"div","extras"),
            buttons=ui.addNode(messageBox,"div","buttons");

        this.extras=contentExtras;

        this.addButton=(label,cb)=>{
            let button=ui.addNode(buttons,"div","button",0,{innerHTML:label});
            button.onclick=cb;
        }

        this.close=()=>{
            screen.removeChild(box);
        }
    }

    function renderMenu(options) {
        buttons.innerHTML="";
        options.forEach(option=>{
            if (option.text) {
                ui.addNode(buttons,"div","text",0,{ innerHTML:option.text})
            } else {
                let button=ui.addNode(buttons,"div","button",0,{ innerHTML:option.label})
                button.onclick=option.onClick;
            }
        })
    }

    function loadSettings() {
        let json=localStorage[GLOBALS.settingsStorageLabel];
        if (json)
            settings=JSON.parse(json);
        else {
            settings={
                isStarted:false
            };
        }
    }

    function saveSettings() {
        localStorage[GLOBALS.settingsStorageLabel]=JSON.stringify(settings);
    }

    function getSaveMetadata() {
        let json=localStorage[GLOBALS.storageLabel];

        if (json) {
            let data=JSON.parse(json);
            if (data) {
                let
                    metadata={
                        timePassed:0,
                        timeLeft:0,
                        labelParts:[]
                    };
                if (data.timePassed !== undefined) {
                    metadata.timePassed=(data.timePassed*1)||0;
                    metadata.timeLeft=(GLOBALS.duration*MINUTE)-metadata.timePassed;
                    if (metadata.timeLeft<0) metadata.timeLeft=0;
                    metadata.timePassedMinutes=Math.floor(metadata.timePassed/MINUTE);
                    metadata.timeLeftMinutes=GLOBALS.duration-metadata.timePassedMinutes;
                    metadata.labelParts.push(metadata.timeLeftMinutes+" minute"+(metadata.timeLeftMinutes==1?"":"s")+" left.");
                }
                if (data.world) {
                    if (data.world.people && data.world.people[0] && (data.world.people[0].name !== undefined)) {
                        metadata.person=data.world.people[0].name;
                        metadata.labelParts.push("<i class=\"fa-solid fa-user\"></i> "+(metadata.person || "<span class='placeholder'>Someone</span>"));
                    }
                    if (data.world.place && data.world.place[0] && (data.world.place[0].name !== undefined)) {
                        metadata.place=data.world.place[0].name;
                        metadata.labelParts.push("<i class=\"fa-solid fa-map-location\"></i> "+(metadata.place || "<span class='placeholder'>Somewhere</span>"));
                    }
                }
                metadata.label=metadata.labelParts.join("<br>");
                return metadata;
            } else return 0;
        } else return 0;
    }

    function delayedClassName(node,classname,cb) {
        setTimeout(()=>{
            node.className+=" "+classname;
            if (cb)
                setTimeout(cb,1000);
        },100);
    }

    function enterMenu() {
        exitMenu();
        title=ui.addNode(screen,"div","title" );
        ui.addNode(title,"div","logo" );
        ui.addNode(title,"div","circle" );
        buttons=ui.addNode(title,"div","buttons" );
        ui.addNode(title,"div","footer",0,{ innerHTML:
            "v"+GLOBALS.version+" &dash; &copy; "+GLOBALS.year+
            " by <a target=_blank href='"+GLOBALS.by.url+"'>"+GLOBALS.by.label+
            "</a><br>Sources at <a target=_blank href='"+GLOBALS.sources.url+"'>"+GLOBALS.sources.label+"</a>"
        });
        delayedClassName(title,"appear");
    }

    function exitMenu() {
        screen.innerHTML="";   
    }

    function fullScreenOption() {
        if (screen.requestFullscreen)
            screen.requestFullscreen();
        else if (screen.webkitRequestFullscreen)
            screen.webkitRequestFullscreen();
        else if (screen.msRequestFullscreen)
            screen.msRequestFullscreen();
    }

    function continueGlanceOption() {
        delayedClassName(title,"disappear",()=>{
            let
                rpgData=RPGDATABASES.default.load(),
                interface=new RpgInterface(rpgData);
            exitMenu();
            interface.run(screen,()=>{
                enterMenu();
                mainMenu();
            });
        })        
    }

    function newGlanceOption() {
        let metadata=getSaveMetadata();
        if (metadata) {
            let messageBox=new MessageBox("Are you sure you want to start a new glance?<br>This saved glance <b>will be lost</b>:<div class=notes>"+metadata.label+"</div>");
            messageBox.addButton("Yes",()=>{
                delete localStorage[GLOBALS.storageLabel];
                messageBox.close();
                continueGlanceOption();
            })
            messageBox.addButton("No",()=>{
                messageBox.close();
            })
        } else {
            delete localStorage[GLOBALS.storageLabel];
            continueGlanceOption();
        }
    }

    function manualOption() {
        delayedClassName(title,"disappear",()=>{
            let manual=new Manual();
            exitMenu();
            manual.run(screen,()=>{
                enterMenu();
                mainMenu();
            });
        })
    }
       

    function introOption() {
        delayedClassName(title,"disappear",()=>{
            let intro=new Intro();
            exitMenu();
            intro.run(screen,()=>{
                enterMenu();
                mainMenu();
            });
        })
    
    }

    function helpMenu() {
        renderMenu([
            { label:"Play intro", onClick:introOption },
            { label:"Manual", onClick:manualOption },
            { label:"Back", onClick:mainMenu }
        ]);
    }

    function creditsMenu() {
        let
            thanks=[];
            credits=
                "<h1>"+GLOBALS.name+"</h1>"+
                "<p>v"+GLOBALS.version+" &dash; &copy; "+GLOBALS.year+" by <a target=_blank href='"+GLOBALS.by.url+"'>"+GLOBALS.by.label+"</a><p>"+
                "<div class='separator'></div>"+
                GLOBALS.extraCredits+
                "<div class='separator'></div>"+
                "<p>Sources at <a target=_blank href='"+GLOBALS.sources.url+"'>"+GLOBALS.sources.label+"</a></p>"+
                "<div class='separator'></div>"+
                "<p>Thanks to: ";
        GLOBALS.thanks.forEach(thank=>{
            if (thank.url)
                thanks.push("<a target=_blank href='"+thank.url+"'>"+thank.label+"</a>");
            else
                thanks.push(thank.label);
        });
        credits+=thanks.join(", ")+".</p>";
        renderMenu([
            { text: credits },
            { label:"Back", onClick:mainMenu }
        ]);
    }

    function playMenu() {
        let 
            metadata=getSaveMetadata(),
            options=[
                { label:"New glance", onClick:newGlanceOption },
                { label:"Back", onClick:mainMenu }
            ];
        if (metadata) {
           options.unshift({
                label:"Continue glance<br><div class=notes>"+metadata.label+"</div>",
                onClick:continueGlanceOption,
            })
        }
        renderMenu(options);
    }

    function mainMenu() {
        settings.isStarted=true;
        saveSettings();
        renderMenu([
            { label:"Play", onClick:playMenu },
            { label:"Help", onClick:helpMenu },
            { label:"Credits", onClick:creditsMenu },
            { label:"Fullscreen", onClick:fullScreenOption },
        ]);
    }

    function enterCover() {
        title=ui.addNode(screen,"div","cover" );
        buttons=ui.addNode(title,"div","buttons" );
        renderMenu([
            {
                text:"Hello, stranger.<br><br>Do you know what <b>"+GLOBALS.name+"</b> is?"
            },
            { label:"Yes", onClick:()=>{
                enterMenu();
                mainMenu();
            } },
            { label:"No", onClick:()=>{
                if (document.body.clientWidth<=GLOBALS.maxWidth)
                    fullScreenOption();
                introOption();
            } }
        ]);
        delayedClassName(title,"appear");
        ui.addNode(title,"div","footer",0,{ innerHTML:"This game is designed for palm-sized mobile devices."});
    }

    

    this.run=()=>{
        loadSettings();
        screencontainer=ui.addNode(document.body,"div","screencontainer" );
        screen=ui.addNode(screencontainer,"div","screen" );
        screen.style.maxWidth=GLOBALS.maxWidth+"px";
        if (GLOBALS.DEBUG && GLOBALS.DEBUGSCREEN) {
            let
                rpgData=RPGDATABASES.default.load(),
                interface=new RpgInterface(rpgData);
            interface.run(screen);
        } else if (settings.isStarted) {
            enterMenu();
            mainMenu();
        } else {
            enterCover();
        }
    }

}