function RpgInterface(rpgData) {

this.run=(root,exitcb)=>{

    let rpgEngine=new Rpg(rpgData);

    rpgEngine.load(()=>{

        let
            lists=[],
            ui=new UI(root),
            group=ui.newCollapsableAreaGroup();

        function getPlacesList() {
            let
                placesElement=set.getObject(["place"]),
                places=placesElement.getValue(),
                out=[{value:-1,label:"(Somewhere...)"}];
            places.forEach((place,id)=>{
                out.push({value:id,label:place.name})
            });
            return out;
        }

        function updatePlaces(deleted) {
            let
                placesElement=set.getObject(["place"]),
                placesList=getPlacesList(),
                personList=set.getObject(["people"]),
                persons=personList.getValue(),
                places=placesElement.getValue(),
                placesMap={};
            persons.forEach((person,id)=>{
                let
                    value,
                    places=personList.getObject([id,"place"]),
                    name=personList.getObject([id,"name"]);
                places.setOptions(placesList);
                value=places.getValue();
                if (deleted !== undefined) {
                    if (value==deleted) {
                        value=-1;
                        places.setValue(value);
                    } else if (value>deleted) {
                        value--;
                        places.setValue(value);
                    }
                }
                if (value>-1) {
                    if (!placesMap[value]) placesMap[value]=[];
                    placesMap[value].push({ id:id, label:name.getValue() })
                }
            });
            places.forEach((place,id)=>{
                let
                    people=placesElement.getObject([id,"visiting"]);
                if (placesMap[id])
                    people.setValue(placesMap[id]);
                else
                    people.setValue([]);
            })

        }

        function removePlaceOfPerson(id) {
            let place=set.getObject(["people",id,"place"]);
            place.setValue(-1);
        }

        function searchIcon(query) {
            let icon=rpgEngine.queryFirst("symbols",rpgEngine.addWordsToQuery([],query,1));
            if (icon)
                return icon.item.label;
            else
                return "";
        }

        function debugIcons(add,set) {
            let
                out="",
                tabled=false;
            set.answers.forEach(answer=>{
                let tags=[];
                answer.entry.forEach(line=>{
                    if (line.type == "rollTable") {
                        rpgData.tables[line.table].entries.forEach(entry=>{
                            let
                                label="";
                                subtags=[];
                            entry.forEach(line=>{
                                if (line.type == "text")
                                    label=line.text;
                                else if (line.type == "addTag")
                                    line.tags.forEach(tag=>{
                                        subtags.push(tag);
                                    })        
                            })
                            if (subtags.length) {
                                let query=add+" "+subtags.join(" ");
                                out+="<div>"+searchIcon(query)+" <b>"+label+"</b>: "+query+"</div>";
                            }
                        });
                    } else if (line.type == "addTag")
                        line.tags.forEach(tag=>{
                            tags.push(tag);
                        })
                })
                if (tags.length) {
                    let query=add+" "+tags.join(" ");
                    out+="<div>"+searchIcon(query)+" <b>"+set.label+"</b>: "+query+"</div>";
                }
            });
            return out;
        }

        function debugQuery(type,starttags,mode,weapon,colorcb) {
            let
                logs=[],
                out="";
            weapon.entries.forEach(answer=>{
                let
                    tags=[],
                    name="",
                    label="";
                answer.forEach(action=>{
                    switch (mode) {
                        case "text":{
                            if (action.type == "text") {
                                action.text.split(" ").forEach(word=>{
                                    tags.push({tag:word,weight:2});
                                    name+=word+" ";
                                })
                            }
                            break;
                        }
                        case "tag":{
                            if (action.type == "text")
                                name+=action.text;
                            else if (action.type == "addTag") {
                                action.tags.forEach(word=>{
                                    tags.push({tag:word,weight:2});
                                    label+=word+" ";
                                })
                            }
                            break;
                        }
                    }
                    
                });
                tags=tags.concat(starttags);
                let
                    results=rpgEngine.query(type,tags),
                    result1=results[0].label,
                    result2=results[1].label,
                    color1=colorcb(result1),
                    color2=colorcb(result2);
                logs.push({colors:[color1,color2],name:name.trim(),label:label.trim(),result:result1+" / "+result2});
            });
            logs.sort((a,b)=>{
                if (a.colors[0]<b.colors[0]) return -1;
                else if (a.colors[0]>b.colors[0]) return 1;
                else if (a.colors[1]<b.colors[1]) return -1;
                else if (a.colors[1]>b.colors[1]) return 1;
                else return 0;
            });
            logs.forEach(line=>{
                out+="<div style='border:1px solid #000;display:inline-block;width:10;height:10;background-color:"+line.colors[0]+"'></div>"+
                    "<div style='border:1px solid #000;display:inline-block;width:10;height:10;background-color:"+line.colors[1]+"'></div>"+
                    "<b style='color:"+line.colors[0]+"'>"+line.name+"</b>"+(line.label?" ("+line.label+")":"")+": "+line.result+"<br>";
            })
            return out;
        }

        function debugScreen() {
            let out="";
            switch (GLOBALS.DEBUGSCREEN) {
                case 1:{ // Debug icons
                    out="<h1>Icons</h1>";
                    for (let k in rpgData.oracles) {
                        let line;
                        if (k.endsWith("Creatures"))
                            line=debugIcons("people ",rpgData.oracles[k]);
                        else if (k.startsWith("class"))
                            line=debugIcons("people ",rpgData.oracles[k]);
                        else if (k.endsWith("Name"))
                            line=debugIcons("place ",rpgData.oracles[k]);
                        if (line)
                            out+="<h2>"+k+"</h2>"+line;
                    }
                    break;
                }
                case 2:{ // Debug items
                    let
                        oracleTagger=(result)=>{
                            if (result.match(/weapon name$/i))
                                return "#900";
                            else if (result.match(/magic/i) || result.match(/spell/i) )
                                return "#009";
                            else if (result.match(/consumable item name$/i))
                                return "#090";
                        }
                        starttags=[{tag:"_any",weight:4*rpgData.anyWeight},{tag:"items",weight:1}],
                        mode="text";
                    out="<h1>Items Moves</h1>";
                    out+="<h2>Weapons</h2>"+debugQuery(GLOBALS.DEBUGSET,starttags,mode,rpgData.tables.weaponType,(result)=>{
                        let ot=oracleTagger(result);
                        if (ot)
                            return ot;
                        else if (result.match(/ranged/i))
                            return "#090";
                        else if (result.match(/melee/i))
                            return "#009";
                        else
                            return "#f00";
                    });
                    out+="<h2>Accessory</h2>"+debugQuery(GLOBALS.DEBUGSET,starttags,mode,rpgData.tables.accessoryType,(result)=>{
                        let ot=oracleTagger(result);
                        if (ot)
                            return ot;
                        else if (result.match(/^eat/i))
                            return "#009";
                        else if (result.match(/knowledge/i))
                            return "#099";
                        else if (result.match(/medicine/i))
                            return "#0f0";
                        else if (result.match(/healing/i))
                            return "#090";
                        else if (result.match(/percept/i))
                            return "#909";
                        else if (result.match(/attack/i))
                            return "#990";
                        else if (result.match(/consume/i))
                            return "#ccc";
                        else return "#f00";
                    });
                    out+="<h2>Consumable</h2>"+debugQuery(GLOBALS.DEBUGSET,starttags,mode,rpgData.tables.consumableType,(result)=>{
                        let ot=oracleTagger(result);
                        if (ot)
                            return ot;
                        else if (result.match(/^eat/i))
                            return "#009";
                        else if (result.match(/knowledge/i))
                            return "#099";
                        else if (result.match(/medicine/i))
                            return "#0f0";
                        else if (result.match(/healing/i))
                            return "#090";
                        else if (result.match(/percept/i))
                            return "#909";
                        else if (result.match(/attack/i))
                            return "#990";
                        else if (result.match(/consume/i))
                            return "#ccc";
                        else return "#f00";
                    });
                    break;
                }
                case 3:{ // Debug creature moves
                    let
                        starttags=[{tag:"_any",weight:4*rpgData.anyWeight},{tag:"person",weight:1}],
                        mode="tag";
                    out="<h1>Creatures Moves</h1>";
                    for (let k in rpgData.tables)
                        if (k.endsWith("Creatures"))
                            out+="<h2>"+k+"</h2>"+debugQuery(GLOBALS.DEBUGSET,starttags,mode,rpgData.tables[k],(result)=>{
                                if (result.match(/human creature$/i))
                                    return "#fff";
                                else if (result.match(/scary name$/i))
                                    return "#000";
                                else if (result.match(/a creature/i) || result.match(/consumable item/i))
                                    return "#333";
                                else if (result.match(/ranged/i)|| result.match(/a horde$/i))
                                    return "#090";
                                else if (result.match(/melee/i)|| result.match(/ organization$/i))
                                    return "#009";
                                else if (result.match(/arcane/i)||result.match(/magic/i))
                                    return "#0ee";
                                else if (result.match(/planar/i))
                                    return "#077";
                                else return "#900"
                            });
                    break;
                }
                case 4:{ // Debug place moves
                    let
                        starttags=[{tag:"_any",weight:4*rpgData.anyWeight},{tag:"place",weight:1}],
                        mode="tag";
                    out="<h1>Places Moves</h1>";
                    for (let k in rpgData.tables)
                        if (k.endsWith("PlaceTypes"))
                            out+="<h2>"+k+"</h2>"+debugQuery(GLOBALS.DEBUGSET,starttags,mode,rpgData.tables[k],(result)=>{
                                if (result.match(/buy some/i) || result.match(/human creature/i))
                                    return "#099";
                                else if (result.match(/pray/i) || result.match(/next room/i))
                                    return "#009";
                                else if (result.match(/rest/i) || result.match(/creature$/i))
                                    return "#090";
                                else if (result.match(/camp/i))
                                    return "#0f0";
                                else return "#f00"
                            });
                    break;
                }
            }
            
                    
            document.body.style.backgroundColor="#eeeeee";
            document.body.style.overflow="scroll";
            document.body.innerHTML=out;
        }

        [
            { id:"people", label:"People", placeholder:rpgData.rpgLabels.noPersonPlaceholder,
                deleteMessage:rpgData.rpgLabels.personDeleteMessage,
                widgetFormFields:["stats"],
                widgetRenderer:(collapsable,form)=>{
                    let
                        widget=collapsable.getWidgetArea(),
                        value=form.getValue();
                    widget.innerHTML="";
                    ui.addNode(widget,"div","counter",0, { innerHTML:value.stats && value.stats.attributes && value.stats.attributes.hp ? value.stats.attributes.hp : 0 });
                    ui.addNode(widget,"div","counterlabel",0, { innerHTML:"HP" });
                },
                onWidgetClick:(collapsable,form)=>{
                    let stat=form.getObject(["stats"]);
                    stat.openStat(7);
                },
                onNewValue:rpgData.onNewPerson,
                structure:[
                    {
                        id:"stats", label:"Stats", type:"stats",
                        stats:rpgData.statsModel
                    },
                    { id:"name", label:"Name", type:"input", placeholder:rpgData.rpgLabels.noPersonPlaceholder },
                    { id:"place", label:"Place", type:"select", options:getPlacesList, placeholder:rpgData.rpgLabels.noPlacePlaceholder },
                    { id:"tags", label:"Tags", type:"textarea" },
                    { id:"notes", label:"Notes", type:"textarea" },
                    { id:"items", label:"Inventory", type:"itemslist" },
                ]
            },
            { id:"place", label:"Places", placeholder:rpgData.rpgLabels.noPlacePlaceholder,
                deleteMessage:rpgData.rpgLabels.placeDeleteMessage,
                onNewValue:rpgData.onNewPlace,
                structure:[
                    { id:"name", label:"Name", type:"input", placeholder:rpgData.rpgLabels.noPlacePlaceholder },
                    { id:"tags", label:"Tags", type:"textarea" },
                    { id:"notes", label:"Notes", type:"textarea" },
                    { id:"visiting", label:"Visitors", type:"staticlist", placeholder:rpgData.rpgLabels.noPersonPlaceholder },
                ]
            }
        ].forEach(section=>{
            let list=ui.newList({
                title:section.label,
                addElements:true,
                removeElements:true,
                onDeleteElement:(item)=>{
                    return section.deleteMessage.replace(/\{([^}]+)\}/g,(m,m1)=>{
                        let subElement=item.getObject([m1]);
                        return subElement.getValue();
                    })
                },
                onNewValue:section.onNewValue,
                onNewElement:(v,manual)=>{
                    let form=ui.newCollapsableForm({
                        headerFormField:"name",
                        placeholderHeaderFormField:section.placeholder,
                        widgetFormFields:section.widgetFormFields,
                        widgetRenderer:section.widgetRenderer,
                        onWidgetClick:section.onWidgetClick,
                        collapsableGroup:group,
                        structure:section.structure
                    })
                    form.setValue(v);
                    if (manual) form.setIcon(searchIcon(section.id));
                    return form;
                }
            });
            lists.push({
                id:section.id,
                element:list
            });
        })

        function renderProcess(parent,process,value,unit) {
            process.forEach(step=>{
                switch (step.type) {
                    case "rollDice":{
                        ui.addNode(parent,"div","rolldice",0, { innerHTML:step.value });
                        break;
                    }
                    case "rollStat":{
                        ui.addNode(parent,"div","rollstatdice",0, { innerHTML:step.value });
                        ui.addNode(parent,"div","rollstat",0, { innerHTML:rpgData.rpgLabels["short_"+step.section+"_"+step.stat] });
                        break;
                    }
                    case "applyBonus":{
                        ui.addNode(parent,"div","applybonus",0, { innerHTML:(step.value > -1 ? "+" : "")+step.value+" "+rpgData.rpgLabels["short_"+step.section+"_"+step.stat] });
                        break;
                    }
                    case "sumValue":{
                        ui.addNode(parent,"div","sumvalue",0, { innerHTML:(step.value > -1 ? "+" : "")+step.value });
                        break;
                    }
                }
            })
            ui.addNode(parent,"div","result",0, { innerHTML:"= "+value+(unit ? " "+unit : "") });
        }

        function closeActionGroup(self,action,actiongroups) {
            if (action.removeGroups) {
                action.removeGroups.forEach(group=>{
                    if (actiongroups[group]) {
                        actiongroups[group].forEach(node=>{
                            if (node !== self) {
                                let keep=false;
                                if (action.keepGroups) {
                                    action.keepGroups.forEach(keepgroup=>{
                                        if (actiongroups[keepgroup] && (actiongroups[keepgroup].indexOf(node)!=-1))
                                            keep=true;
                                    })
                                }
                                if (!keep && node.parentNode)
                                    node.parentNode.removeChild(node);
                            }
                        });
                        if (actiongroups[group].length == 0)
                            delete actiongroups[group];
                    }
                });
            }
        }

        function addTagToText(text,tag) {
            text=text.trimEnd();
            if (text) {
                let separatedText=" "+text+" ";
                if (separatedText.indexOf(" "+tag+" ")==-1)
                    return text+" "+tag;
                else
                    return text;
            } else
                return tag;
        }

        function renderResult(node,resultType,resultItem,context) {
            let actionsList;
            node.innerHTML="";
            switch (resultType) {
                case "oracles":{
                    let sentence=rpgEngine.askOracle(resultItem,context.elements);
                    ui.addNode(node,"div","label",0,{ innerHTML: sentence.oracle.label});
                    ui.addNode(node,"div","answer",0,{ innerHTML: sentence.text});
                    actionsList=sentence.actions;
                    break;
                }
                case "moves":{
                    let stats=0;
                    if (context.coords.person) {
                        let path=context.coords.person.slice();
                        path.push("stats");
                        obj=set.getObject(path);
                        stats=obj.getValue();
                    }
                    let
                        outcome=rpgEngine.performMove(resultItem,context.elements,stats),
                        labelNode=ui.addNode(node,"div","label",0,{ innerHTML: outcome.move.label});
                    if (outcome.process) {
                        let processNode=ui.addNode(node,"div","process");
                        renderProcess(processNode,outcome.process,outcome.value);
                        ui.addNode(processNode,"div","outcome "+outcome.type,0,{ innerHTML:"&nbsp;"});
                    }
                    ui.addNode(node,"div","answer",0,{ innerHTML: outcome.text});
                    actionsList=outcome.actions;
                    break;
                }
                default:{
                    break;
                }
            }
            if (actionsList) {
                let
                    actions=ui.addNode(node,"div","actions"),
                    actionsListNode=ui.addNode(actions,"div","actionslist"),
                    actionGroups={};
                ui.addDragToScroll(actions);
                actionsList.forEach(action=>{
                    let
                        actionNode=ui.addNode(actionsListNode,"div","action"),
                        actionType=ui.addNode(actionNode,"div","type");    
                    if (action.groups) {
                        action.groups.forEach(group=>{
                            if (!actionGroups[group]) actionGroups[group]=[];
                            actionGroups[group].push(actionNode);
                        })
                    }
                    switch (action.type) {
                        case "roll":{
                            ui.addNode(actionType,"div","tofield",0,{ innerHTML:action.text });
                            let result=ui.addNode(actionNode,"div","text",0,{ innerHTML:"Roll" });
                            actionNode.onclick=()=>{
                                result.innerHTML="";
                                let processNode=ui.addNode(result,"div","process");
                                renderProcess(processNode,action.process,action.value,action.unit);
                                closeActionGroup(actionNode,action,actionGroups);
                            }
                            break;
                        }
                        case "changeValue":{
                            ui.addNode(actionType,"div","tofield",0,{ innerHTML:action.text });
                            ui.addNode(actionNode,"div","text",0,{ innerHTML:(action.value > -1 ? "+" : "")+action.value+" "+rpgData.rpgLabels[action.context]+" "+rpgData.rpgLabels[action.to] });
                            actionNode.onclick=()=>{
                                let obj, value;
                                obj=set.getObject(context.coords[action.context]);
                                value=obj.getValue();
                                value[action.to]=Math.max(0, ((value[action.to] * 1) || 0)+action.value);
                                obj.changeValue(value);
                                actionsListNode.removeChild(actionNode);
                                closeActionGroup(actionNode,action,actionGroups);
                            }
                            break;
                        }
                        case "addValueText":{
                            ui.addNode(actionType,"div","tofield",0,{ innerHTML:action.label });
                            ui.addNode(actionNode,"div","text",0,{ innerHTML:action.text });
                            actionNode.onclick=()=>{
                                let obj, value;
                                obj=set.getObject(context.coords[action.context]);
                                value=obj.getValue();
                                value[action.to]=addTagToText(value[action.to],action.text);
                                obj.changeValue(value);
                                actionsListNode.removeChild(actionNode);
                                closeActionGroup(actionNode,action,actionGroups);
                            }
                            break;
                        }
                        case "move":{
                            ui.addNode(actionType,"div","tofield",0,{ innerHTML:"Perform move" });
                            ui.addNode(actionNode,"div","text",0,{ innerHTML:action.move.label });
                            actionNode.onclick=()=>{
                                renderResult(node,"moves",action.move,context);
                                closeActionGroup(actionNode,action,actionGroups);
                            }
                            break;
                        }
                        case "oracle":{
                            let label=action.label || action.oracle.label;
                            ui.addNode(actionType,"div","tofield",0,{ innerHTML:"Ask oracle" });
                            ui.addNode(actionNode,"div","text",0,{ innerHTML:label });
                            actionNode.onclick=()=>{
                                renderResult(node,"oracles",action.oracle,context);
                                closeActionGroup(actionNode,action,actionGroups);
                            }
                            break;
                        }
                        case "changeStat":{
                            ui.addNode(actionType,"div","tofield",0,{ innerHTML:action.text });
                            ui.addNode(actionNode,"div","text",0,{ innerHTML:(action.value > -1 ? "+" : "")+action.value+" "+rpgData.rpgLabels[action.to.section+"_"+action.to.stat] });
                            actionNode.onclick=()=>{
                                let
                                    obj, value, statValue,
                                    path=context.coords[action.context].slice();
                                path.push("stats");
                                obj=set.getObject(path);
                                value=obj.getValue();
                                statValue=(value[action.to.section][action.to.stat] * 1)||0;
                                statValue+=action.value;
                                if (statValue<0) statValue=0;
                                if (statValue>99) statValue=99;
                                value[action.to.section][action.to.stat]=statValue;
                                obj.changeValue(value);
                                actionsListNode.removeChild(actionNode);
                                closeActionGroup(actionNode,action,actionGroups);
                            }
                            break;
                        }
                        case "setStat":{
                            ui.addNode(actionType,"div","tofield",0,{ innerHTML:action.text });
                            ui.addNode(actionNode,"div","text",0,{ innerHTML:"Set "+action.value+" "+rpgData.rpgLabels[action.to.section+"_"+action.to.stat] });
                            actionNode.onclick=()=>{
                                let
                                    obj, value,
                                    path=context.coords[action.context].slice();
                                path.push("stats");
                                obj=set.getObject(path);
                                value=obj.getValue();
                                value[action.to.section][action.to.stat]=action.value;
                                obj.changeValue(value);
                                actionsListNode.removeChild(actionNode);
                                closeActionGroup(actionNode,action,actionGroups);
                            }
                            break;
                        }
                        case "roleAction":{
                            actionNode.className="simple action unselected";
                            ui.addNode(actionNode,"div","text",0,{ innerHTML:action.text });
                            actionNode.onclick=()=>{
                                actionNode._selected=!actionNode._selected;
                                if (actionNode._selected)
                                    actionNode.className="simple action";
                                else
                                    actionNode.className="simple action unselected";
                            }
                            break;
                        }
                        case "addText":{
                            ui.addNode(actionType,"div","addtext",0,{ innerHTML:"&hellip;"});
                            ui.addNode(actionType,"div","tofield",0,{ innerHTML:rpgData.rpgLabels[action.context]+" "+rpgData.rpgLabels[action.to] });
                            ui.addNode(actionNode,"div","text",0,{ innerHTML:action.text });
                            actionNode.onclick=()=>{
                                let
                                    obj, value,
                                    path=context.coords[action.context].slice();
                                path.push(action.to);
                                obj=set.getObject(path);
                                value=obj.getValue();
                                value=(value.length ? value+"\n" : value)+action.text;
                                obj.changeValue(value);
                                actionsListNode.removeChild(actionNode);
                                closeActionGroup(actionNode,action,actionGroups);
                            }
                            break;
                        }
                        case "setText":{
                            ui.addNode(actionType,"div","addtext",0,{ innerHTML:"="});
                            ui.addNode(actionType,"div","tofield",0,{ innerHTML:rpgData.rpgLabels[action.context]+" "+rpgData.rpgLabels[action.to] });
                            ui.addNode(actionNode,"div","text",0,{ innerHTML:action.text });
                            actionNode.onclick=()=>{
                                let
                                    obj, value,
                                    path=context.coords[action.context].slice();
                                path.push(action.to);
                                obj=set.getObject(path);
                                obj.changeValue(action.text);
                                actionsListNode.removeChild(actionNode);
                                closeActionGroup(actionNode,action,actionGroups);
                            }
                            break;
                        }
                        case "addTag":{
                            ui.addNode(actionType,"div","addtext",0,{ innerHTML:"&hellip;"});
                            ui.addNode(actionType,"div","tofield",0,{ innerHTML:rpgData.rpgLabels[action.context]+" Tag" });
                            ui.addNode(actionNode,"div","text",0,{ innerHTML:action.tag });
                            actionNode.onclick=()=>{
                                let
                                    obj, value,
                                    path=context.coords[action.context].slice();
                                path.push("tags");
                                obj=set.getObject(path);
                                value=obj.getValue();
                                if (value.tags)
                                    value.tags=addTagToText(value.tags,action.tag);
                                else
                                    value=addTagToText(value,action.tag);
                                obj.changeValue(value);
                                actionsListNode.removeChild(actionNode);
                                closeActionGroup(actionNode,action,actionGroups);
                            }
                            break;
                        }
                    }
                })
            }

        }

        let
            set=ui.newListSet({
                lists:lists
            }),
            search=ui.newSearch({
                searchDelay:0, // TODO: increase for delayed searches.
                modes:[
                    { label:"Oracles", id:"oracles" },
                    { label:"Moves", id:"moves" },
                ],
                engine:{
                    search:(mode,context,query)=>{
                        let fullQuery=context.query.concat(rpgEngine.addWordsToQuery([],query,100));
                        let results=rpgEngine.query(mode.id,fullQuery);
                        return results.map(result=>{
                            return { context:context, result:result, value:GLOBALS.DEBUG ? result.item.label+" ("+result.score+")" : result.item.label };
                        });
                    },
                    renderResultRow:(row)=>{
                        let
                            prefix="",
                            isBasic=row.result.item.metadata && row.result.item.metadata.isBasic;
                        if (row.result.item.bonus) {
                            row.result.item.bonus.forEach(bonus=>{
                                prefix+="<div class='stat "+(isBasic ? "basic" : "")+"'>"+rpgData.rpgLabels["short_"+bonus.section+"_"+bonus.stat]+"</div>"
                            })
                        }
                        return prefix+row.value;
                    },
                    renderResult:(row,node)=>{
                        renderResult(node,row.result.type,row.result.item,row.context);
                    }
                }
            }),
            rpg=ui.newRpg({
                world:set,
                assistant:search,
                timeLimit:GLOBALS.duration,
                onExit:()=>{
                    root.innerHTML="";
                    exitcb();
                }
            }),
            saver=ui.newEventDelayer({
                elements:[rpg],
                events:["change"],
                delay:1000
            });

        saver.registerEvent("change",(e)=>{
            if (localStorage)
                localStorage[GLOBALS.storageLabel]=JSON.stringify(e.eventData.worldValue);
            if (GLOBALS.DEBUG) console.warn("saver",e);
        });

        if (localStorage && localStorage[GLOBALS.storageLabel]) {
            try {
                let data=JSON.parse(localStorage[GLOBALS.storageLabel]);
                if (data) {
                    rpg.setValue(data);
                    for (let k in data.world) {
                        data.world[k].forEach((element,id)=>{
                            let icon=searchIcon(k+" "+(element.tags ? element.tags : ""));
                            if (icon)
                                set.getObject([k,id]).setIcon(icon);
                        })
                    }
                    updatePlaces();
                }
            } catch (e) {}
        }

        ui.show(rpg);

        rpg.registerEvent("change",(e)=>{
            if (e.worldEvent) {
                if (e.worldEvent.elementPosition == "place") {
                    if (e.worldEvent.elementEvent && e.worldEvent.elementEvent.elementEvent)
                        if (e.worldEvent.elementEvent.elementEvent.delete)
                            updatePlaces(e.worldEvent.elementEvent.elementPosition);
                        else if (e.worldEvent.elementEvent.elementEvent.element && (e.worldEvent.elementEvent.elementEvent.element.id == "visiting"))
                            removePlaceOfPerson(e.worldEvent.elementEvent.elementEvent.elementEvent.elementValue.id);
                        else
                            updatePlaces();
                    else
                        updatePlaces();
                }
                if (e.worldEvent.elementPosition == "people") {
                    if (e.worldEvent.elementEvent && e.worldEvent.elementEvent.elementEvent)
                        if (e.worldEvent.elementEvent.elementEvent.delete)
                            updatePlaces();
                        else if (e.worldEvent.elementEvent.elementEvent.element)
                            switch (e.worldEvent.elementEvent.elementEvent.element.id) {
                                case "items":{
                                    rpg.forceUpdateRuler();
                                    break;
                                }
                                case "place":{
                                    rpg.forceUpdateRuler();
                                    updatePlaces();
                                    break;
                                }
                                case "name":{
                                    updatePlaces();
                                    break;
                                }
                            }                
                }
                if (e.worldEvent.elementEvent.elementEvent && e.worldEvent.elementEvent.elementEvent.element)
                    if (e.worldEvent.elementEvent.elementEvent.element.id == "tags") {
                        let
                            form=set.getObject([e.worldEvent.elementPosition,e.worldEvent.elementEvent.elementPosition]),
                            tagsElement=form.getObject(["tags"]),
                            icon=searchIcon(e.worldEvent.elementPosition+" "+tagsElement.getValue());
                        if (icon)
                            form.setIcon(icon);
                        else
                            form.setIcon("");
                        rpg.forceUpdateRuler();
                    }
            }
        });

        rpg.registerEvent("ruler",(e)=>{
            let
                value=set.getValue(),
                id,contextId,
                contextElements=[],
                contextElementCoords={},
                contextCoords=[],
                contextText="",
                contextQuery=[],
                weightRatio=2,
                weight=1;
            if (e) {
                id=e.elementPosition.id;
                value=value[id];
                contextCoords.push(id);
                contextText+=rpgData.rpgLabels[id]+" ";
                rpgEngine.addWordsToQuery(contextQuery,id,weight);
                weight*=weightRatio;
                if (e.elementEvent) {
                    id=e.elementEvent.elementPosition;
                    value=value[id];
                    contextCoords.push(id);
                    if (value) {
                        if (value.name)
                            contextText+="\""+value.name+"\" ";
                        if (value.tags)
                            rpgEngine.addWordsToQuery(contextQuery,value.tags,weight);
                        contextId=rpgData.rpgContexts[e.elementPosition.id];
                        contextElements.push(contextId);
                        contextElementCoords[contextId]=contextCoords.slice();
                        weight*=weightRatio;
                        if (e.elementEvent.elementEvent) {
                            id=e.elementEvent.elementEvent.element.id;
                            if ((id == "visiting")&&e.elementEvent.elementEvent.elementEvent) {
                                let
                                    personId=e.elementEvent.elementEvent.elementEvent.value[e.elementEvent.elementEvent.elementEvent.elementPosition].id,
                                    personCoord=["people",personId],
                                    personElement=set.getObject(personCoord),
                                    personName=personElement.getObject(["name"]).getValue();
                                contextText+=" Visitor \""+personName+"\" ";
                                contextElements.push("person");
                                contextElementCoords.person=personCoord;
                                rpgEngine.addWordsToQuery(contextQuery,personElement.getObject(["tags"]).getValue(),weight);
                                weight*=weightRatio;
                            } else {
                                contextCoords.push(id);
                                value=value[id];
                                rpgEngine.addWordsToQuery(contextQuery,id,weight);
                                if ((id == "place") && (value>-1)) {
                                    let
                                        placeTags,
                                        places=getPlacesList(),
                                        place=places[value+1];
                                    contextText+=" at \""+place.label+"\" ";
                                    contextElements.push("place");
                                    contextElementCoords.place=["place",value];
                                    placeTags=set.getObject(contextElementCoords.place.concat("tags"));
                                    rpgEngine.addWordsToQuery(contextQuery,placeTags.getValue(),weight);
                                    weight*=weightRatio;
                                } else {
                                    contextText+=rpgData.rpgLabels[id]+" ";
                                    if (value) {
                                        if (value.tags)
                                            rpgEngine.addWordsToQuery(contextQuery,value.tags,weight);
                                        weight*=weightRatio;
                                        if (e.elementEvent.elementEvent.elementEvent) {
                                            contextId=rpgData.rpgContexts[e.elementEvent.elementEvent.element.id];
                                            if (contextId) {
                                                id=e.elementEvent.elementEvent.elementEvent.elementPosition;
                                                contextCoords.push(id);
                                                value=value[id];
                                                contextElements.push(contextId);
                                                contextElementCoords[contextId]=contextCoords.slice();
                                                if (value.tags) {
                                                    rpgEngine.addWordsToQuery(contextQuery,value.tags,weight);
                                                    contextText+="\""+value.tags+"\" ";
                                                }
                                                weight*=weightRatio;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                contextQuery.push({tag: '_any', weight: weight*rpgData.anyWeight});
                search.setContext({
                    query:contextQuery,
                    elements:contextElements,
                    coords:contextElementCoords,
                    html:contextText.trim()
                })
            }
        });

        if (GLOBALS.DEBUG && GLOBALS.DEBUGSCREEN)
            debugScreen();

    });  

}

}
 