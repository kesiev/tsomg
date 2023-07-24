RPGDATABASES={};

function Rpg(config) {

    const
        USEFORMATTERS=false, // Table formatters forces 2d6 for oracles. Disabled for now.
        MINTAGSLENGTH=2,
        TABLEFORMATTER={
            2:{
                rows:[ "1-3", "4-6" ]
            },
            3:{
                rows:[ "1-2", "3-4", "5-6" ],
            },
            6:{
                rows:[ "1", "2", "3", "4", "5", "6" ],
            }
        },
        SINGLEDICE=[
            TABLEFORMATTER["2"],
            TABLEFORMATTER["3"],
            TABLEFORMATTER["6"]
        ];

    let
        rnd=new Randomizer(-1),
        searchResources=0,
        searchPreprocess={},
        data={
            tables:{},
            oracles:{},
            moves:{},
            symbols:{}
        };

    // Prepare dice combinations

    SINGLEDICE.forEach(dice1=>{
        SINGLEDICE.forEach(dice2=>{
            let count=dice1.rows.length*dice2.rows.length;
            if (!TABLEFORMATTER[count]) {
                TABLEFORMATTER[count]={
                    rows:[]
                };
                dice1.rows.forEach(row1=>{
                    dice2.rows.forEach(row2=>{
                        let
                            single=row1+row2,
                            combo=row1+", "+row2;
                        TABLEFORMATTER[count].rows.push(single.length==2 ? single : combo);
                    });
                })
            }
        });
    });

    
    function checkActions(label,set,list) {
        list.forEach(item=>{
            if (item.type == "addTag")
                item.tags.forEach(tag=>{
                    let score=config.search.preprocessWord(searchResources,tag);
                    if (!score && GLOBALS.DEBUG) console.warn(label,set,"tag",tag,"has no score.");
                })
        })
    }

    function addTable(id,table) {
        let
            count=table.entries.length,
            formatter=TABLEFORMATTER[count];
        if (USEFORMATTERS && !formatter && GLOBALS.DEBUG)
            console.warn("Missing formatter for table "+id+" ("+count+" entries)",TABLEFORMATTER);
        if (data.tables[id]) {
            if (GLOBALS.DEBUG)
                console.warn("Table "+id+" already loaded");
        } else {
            table.entries.forEach(entry=>{
                checkActions("Table",table,entry);
            })
            data.tables[id]=table;
        }
    }

    function addSymbol(id,symbol) {
        if (data.symbols[id]) {
            if (GLOBALS.DEBUG) console.warn("Symbol "+id+" already loaded");
        } else {
            addToIndex(symbol);
            data.symbols[id]=symbol;
        }
    }

    function addToIndex(item) {
        item._tagsindex=[];
        item._tagsscore={};
        item.tags.forEach(tag=>{
            if (tag.length>=MINTAGSLENGTH) {
                if (searchPreprocess[tag] === undefined) {
                    let score=config.search.preprocessWord(searchResources,tag);
                    searchPreprocess[tag]=score;
                    if (!score && GLOBALS.DEBUG) console.warn("Tag",tag,"has no score.");
                }
                if (!item._tagsscore[tag]) {
                    item._tagsindex.push(tag);
                    item._tagsscore[tag]=1;
                }
            }
        });
        if (item.answers)
            item.answers.forEach(answer=>{
                checkActions("Item",item,answer.entry);
            })
        if (item.results)
            for (let k in item.results)
                checkActions("Result "+k,item,item.results[k]);
    }

    function addOracle(id,oracle) {
        if (data.oracles[id]) {
            if (GLOBALS.DEBUG) console.warn("Oracle "+id+" already loaded");
        } else {
            addToIndex(oracle);
            data.oracles[id]=oracle;
        }
    }

    function addMove(id,move) {
        if (data.moves[id]) {
            if (GLOBALS.DEBUG) console.warn("Move "+id+" already loaded");
        } else {
            addToIndex(move);
            data.moves[id]=move;
        }
    }

    function isConsistent(actions,tables) {
        let consistent=true;
        actions.forEach(action=>{
            switch (action.type) {
                case "rollTable":{
                    if (data.tables[action.table])
                        tables[action.table]=true;
                    else {
                        consistent=false;
                        console.warn("Action",action,"uses missing table",action.table);
                    }
                    break;
                }
            }
        })
        return consistent;
    }

    function consistencyCheck() {
        let
            tables={},
            consistent=true;
        for (let k in data.moves)
            for (let m in data.moves[k].results)
                consistent|=isConsistent(data.moves[k].results[m],tables);
        for (let k in data.oracles)
            data.oracles[k].answers.forEach(answer=>{
                consistent|=isConsistent(answer.entry,tables);
            });
        for (let k in data.tables)
            if (!tables[k])
                console.warn("Unused table",k);
        return consistent;
    }

    function tagsItemScore(searchCache,tags,item) {
        let score=0;
        tags.forEach((tag,tagid)=>{
            let
                word=tag.tag,
                tagScore=item._tagsscore[word];
            if (tagScore === undefined) {
                let
                    matchingTag,
                    max=0,
                    tagPreprocess;
                if (searchCache[tagid] === undefined)
                    searchCache[tagid]=config.search.preprocessWord(searchResources,word);
                tagPreprocess=searchCache[tagid];
                if (tagPreprocess) {
                    item._tagsindex.forEach(subtag=>{
                        let subtagPreprocess=searchPreprocess[subtag];
                        if (subtagPreprocess) {
                            let matchScore=config.search.getWordsScore(searchResources,word,tagPreprocess,subtag,subtagPreprocess);
                            if (matchScore) {
                                matchingTag=subtag;
                                max=Math.max(max,matchScore*item._tagsscore[subtag]);
                            }
                        }
                    })
                    if (GLOBALS.DEBUG)
                        console.log(item.label||item.code,word,matchingTag,max," : ",tag.weight);
                    score+=max * tag.weight;
                }
            } else {
                if (GLOBALS.DEBUG)
                    console.log(item.label||item.code,word,word,"FULL"," : ",tag.weight);
                score+=tagScore * tag.weight;
            }
        });
        return score;
    }

    let onEngineLoaded=(cb,resources)=>{
        searchResources=resources;
        for (let k in config.tables)
            addTable(k,config.tables[k]);
        for (let k in config.oracles)
            addOracle(k,config.oracles[k]);
        for (let k in config.moves)
            addMove(k,config.moves[k]);
        for (let k in config.symbols)
            addSymbol(k,config.symbols[k]);
        if (GLOBALS.DEBUG) consistencyCheck();
        cb(this);
    }

    this.load=(cb)=>{
        if (config.search._resources)
            onEngineLoaded(cb,config.search._resources);
        else
            config.search.load((resources)=>{
                config.search._resources=resources;
                onEngineLoaded(cb,resources);
            });
    }

    this.addWordsToQuery=(query,words,weight)=>{
        let parts=words.toLowerCase().replace(/[^a-z]/g," ").split(/ /g).filter(a=>a.length>=MINTAGSLENGTH);
        parts.forEach(part=>{
            query.push({ tag:part, weight:weight })
        });
        return query;
    }

    this.query=(type,tags)=>{
        if (GLOBALS.DEBUG)
            console.warn(type,tags.map(a=>a.tag+"("+a.weight+")").join(" "));
        let
            results=[],
            source=data[type],
            searchCache={};
        for (let id in source) {
            let item=source[id];
            if (!item.hidden) {
                let score=tagsItemScore(searchCache,tags,item);
                results.push({type:type,id:id,item:item,label:item.label||"",score:score});
            }
        }
        results.sort((a,b)=>{
            if (a.score > b.score) return -1;
            else if (a.score < b.score) return 1;
            else if (a.label > b.label) return 1;
            else if (a.label < b.label) return -1;
            else return 0;
        })
        return results;
    }

    this.queryFirst=(type,tags)=>{
        let
            result,
            maxScore=0,
            source=data[type],
            searchCache={};
        for (let id in source) {
            let item=source[id];
            if (!item.hidden) {
                let score=tagsItemScore(searchCache,tags,item);
                if (score > maxScore) {
                    result={type:type,id:id,item:item,score:score};
                    maxScore=score;
                }
            }
        }
        return result;
    }

    function calculator(sequence,stats) {
        let
            result=0,
            process=[];
        sequence.forEach(value=>{
            switch (value.type) {
                case "sumValue":{
                    result+=value.value;
                    process.push({ type:"sumValue", value:value.value });
                    break;
                }
                case "ifGreaterEqualThanValue":{
                    result=result >= value.value ? 1 : 0;
                    break;
                }
                case "sumStat":{
                    if (stats && stats[value.section] && stats[value.section][value.stat]) {
                        let amount=stats[value.section][value.stat] * value.ratio;
                        result+=amount;
                        process.push({ type:"applyBonus", section:value.section, stat:value.stat, value:amount });
                    }
                    break;
                }
                case "divideValue":{
                    result/=value.value;
                    if (value.round == "floor")
                        result=Math.floor(result);
                    else
                        result=Math.ceil(result);
                    break;
                }
                case "capStat":{
                    if (stats && stats[value.section] && stats[value.section][value.stat]) {
                        let statValue=stats[value.section][value.stat];
                        if (result>statValue) result=statValue;
                    }
                    break;
                }
                case "lowcapValue":{
                    if (result<value.value) result=value.value;
                    break;
                }
                case "rollStat":{
                    if (stats && stats[value.section]) {
                        let
                            roll=0,
                            stat=(stats[value.section][value.stat]*1)||0;
                        if (stat)
                            roll=(rnd.integer(stat)+1)*value.ratio;
                        process.push({ type:"rollStat", section:value.section, stat:value.stat, value:roll });
                        result+=roll;
                        break;
                    }
                    break;
                }
                case "rollDice":{
                    let roll=(rnd.integer(value.dice)+1)*value.ratio;
                    process.push({ type:"rollDice", value:roll });
                    result+=roll;
                    break;
                }
                case "sumLimitValue":{
                    let
                        lowerLimit=calculator(value.lowerLimit,stats),
                        higherLimit=calculator(value.higherLimit,stats);
                    result+=value.value;
                    if (result<lowerLimit.value) result=lowerLimit.value;
                    else if (result>higherLimit.value) result=higherLimit.value;
                    break;
                }
            }
        });
        return {
            value:result,
            process:process
        }
    }

    function runScript(context,script,stats) {
        let
            text="",
            actions=[],
            localScript=[];
        if (!context || !context.length) context=["none"];
        script.forEach(row=>localScript.push(row));
        while (localScript.length) {
            let
                action=localScript.shift(),
                localContext=[];
            if (action.onContext)
                action.onContext.forEach(ctx=>{
                    if (context.indexOf(ctx)!=-1)
                        localContext.push(ctx);
                });
            else
                localContext=context;
            if (localContext.length) {
                switch (action.type) {
                    case "rollTable":{
                        let
                            table=data.tables[action.table],
                            entry=rnd.element(table.entries);
                        for (let i=entry.length-1;i>=0;i--)
                            localScript.unshift(entry[i]);
                        break;
                    }
                    case "text":{
                        text+=action.text;
                        break;
                    }
                    case "newText":{
                        text=action.text;
                        break;
                    }
                    case "addTag":{
                        localContext.forEach(ctx=>{
                            action.tags.forEach(tag=>{
                                actions.push({ priority:110, groups:action.groups, removeGroups:action.removeGroups, keepGroups:action.keepGroups, type:"addTag", tag:tag, context:ctx })
                            });    
                        })
                        break;
                    }
                    case "capitalizeText":{
                        if (text && text.length)
                            text = text.toLowerCase().replace(/\b\w/g, (word)=>word.charAt(0).toUpperCase()+word.slice(1) );
                        break;
                    }
                    case "addValueText":
                    case "setText":{
                        localContext.forEach(ctx=>{
                            action.to.forEach(to=>{
                                actions.push({ priority:105, groups:action.groups, removeGroups:action.removeGroups, keepGroups:action.keepGroups, type:action.type, label:action.label, text:(action.prefix ? action.prefix+": " : "")+text, to:to, context:ctx })
                            });
                        });
                        break;
                    }
                    case "addText":{
                        localContext.forEach(ctx=>{
                            action.to.forEach(to=>{
                                actions.push({ priority:100, groups:action.groups, removeGroups:action.removeGroups, keepGroups:action.keepGroups, type:action.type, text:(action.prefix ? action.prefix+": " : "")+text, to:to, context:ctx })
                            });
                        });
                        break;
                    }
                    case "setStat":
                    case "changeStat":
                    case "changeValue":{
                        localContext.forEach(ctx=>{
                            action.to.forEach(to=>{
                                let result=calculator(action.value,stats);
                                actions.push({ priority:100, groups:action.groups, removeGroups:action.removeGroups, keepGroups:action.keepGroups, type:action.type, value:result.value, text:action.label, to:to, context:ctx })
                            });
                        });
                        break;
                    }
                    case "roleAction":{
                        actions.push({ priority:100, groups:action.groups, removeGroups:action.removeGroups, keepGroups:action.keepGroups, type:action.type, text:action.label })
                        break;
                    }
                    case "move":{
                        actions.push({ priority:0, groups:action.groups, removeGroups:action.removeGroups, keepGroups:action.keepGroups, type:action.type, move:data.moves[action.id] })
                        break;
                    }
                    case "oracle":{
                        actions.push({ priority:0, groups:action.groups, removeGroups:action.removeGroups, keepGroups:action.keepGroups, type:action.type, oracle:data.oracles[action.id], label:action.label })
                        break;
                    }
                    case "addRoll":{
                        localContext.forEach(ctx=>{
                            let result=calculator(action.value,stats);
                            actions.push({ priority:115, groups:action.groups, removeGroups:action.removeGroups, keepGroups:action.keepGroups, type:"roll", text:action.label, unit:action.unit, context:ctx, value:result.value, process:result.process });
                        });
                        break;
                    }
                }
            }
        }
        

        actions.sort((a,b)=>{
            if (a.priority>b.priority) return -1;
            else if (a.priority<b.priority) return 1;
            else if (!a.groups && b.groups) return 1;
            else if (a.groups && !b.groups) return -1;
            else if (!a.groups && !b.groups) return 0;
            else if (a.groups[0]>b.groups[0]) return -1;
            else if (a.groups[0]<b.groups[0]) return 1;
            else return 0;
        })

        return {
            text:text,
            actions:actions
        };

    }

    function rollDice() {
        return rnd.integer(6)+1;
    }

    function statToBonus(stat) {
        if (stat<4) return -3;
        else if (stat<6) return -2;
        else if (stat<9) return -1;
        else if (stat<13) return 0;
        else if (stat<16) return 1;
        else if (stat<18) return 2;
        else return 3;
    }

    this.askOracle=(oracle,context)=>{
        let
            answer=rnd.element(oracle.answers),
            result=runScript(context,answer.entry);
        
        result.oracle=oracle;

        return result;

    }

    this.performMove=(move,context,stats)=>{

        let result;

        switch (move.type) {
            case "roll":{
                let
                    dice1=rollDice(),
                    dice2=rollDice(),
                    process=[{ type:"rollDice", value:dice1 },{ type:"rollDice", value:dice2 }],
                    value=dice1+dice2,
                    resultType;
                
                if (move.bonus)
                    move.bonus.forEach(bonus=>{
                        if (stats && stats[bonus.section] && stats[bonus.section][bonus.stat]) {
                            let bonusValue=statToBonus(stats[bonus.section][bonus.stat]);
                            value+=bonusValue;
                            process.push({ type:"applyBonus", section:bonus.section, stat:bonus.stat, value:bonusValue });
                        }
                    })
        
                if (value<7)
                    resultType="fail";
                else if (value>9)
                    resultType="success";
                else
                    resultType="failSuccess";
                
                result=runScript(context,move.results[resultType],stats);

                result.type=resultType;
                result.process=process;
                result.value=value;
                break;
            }
            case "check":{

                let
                    script,
                    run=true;

                if (move.condition.length > 0)
                    run=calculator(move.condition,stats).value > 0;

                if (run)
                    script=move.results.ok;
                else
                    script=move.results.ko;

                result=runScript(context,script,stats);
                break;
            }
        }

        result.move=move;

        return result;

    }

}