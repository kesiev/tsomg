
function UI(root) {

    const EVENTDELETE={ delete:1 };

    function addNode(parent,type,classname,manager,data) {

        let node=document.createElement(type);
        if (classname)
            node.className=classname;
        if (manager)
            node._manager=manager;
        if (data) {
            if (data.type!==undefined) node.type=data.type;
            if (data.innerHTML!==undefined) node.innerHTML=data.innerHTML;
            if (data.value!==undefined) node.value=data.value
            if (data.onClick!==undefined) node.onclick=data.onClick;
            if (data.placeholder!==undefined) node.placeholder=data.placeholder;
            if (data.patchMobile) {
                node.setAttribute("enterkeyhint","done");
                node.addEventListener("keydown",e=>{
                    let code = (e.keyCode ? e.keyCode : e.which);
                    if ( (code==13) || (code==10)) node.blur();
                });
            }
            if (data.style)
                for (let k in data.style)
                    node.style[k]=data.style[k];
        }
        if (parent) parent.appendChild(node);
        return node;

    }

    function finalizeObject(o) {

        let events={};

        o.registerEvent=(event,cb,priority)=>{
            if (event instanceof Array)
                event.forEach(event=>{
                    o.registerEvent(event,cb,priority)
                });
            else {
                if (!events[event]) events[event]=[];
                if (events[event].indexOf(cb) == -1) {
                    events[event].push({ priority:priority || 0, cb:cb });
                    events[event].sort((a,b)=>{
                        if (a.priority>b.priority) return -1;
                        else if (a.priority>b.priority) return 1;
                        else return 0;
                    })
                }
            }
        }

        o.unregisterEvent=(event,cb)=>{
            if (event instanceof Array)
                event.forEach(event=>{
                    o.unregisterEvent(event,cb)
                });
            else
                if (events[event]) {
                    let pos=-1;
                    events[event].forEach((event,id)=>{
                        if (event.cb === cb)
                            pos=id;
                    });
                    if (cb != -1) events[event].splice(pos,1);
                }
        }

        o.triggerEvent=(event,data)=>{
            if (events[event])
                events[event].forEach(event=>{
                    event.cb(data);
                })
        }

        o.add=(b)=>{
            o.container.appendChild(b.box);
        }

        o.remove=(b)=>{
            o.container.removeChild(b.box);
        }

    }

    function isScreenTouch() {
        return ( 'ontouchstart' in window ) || ( navigator.maxTouchPoints > 0 ) || ( navigator.msMaxTouchPoints > 0 );
    }

    let scrollPos = 0;
    function addDragToScroll(node) {
        
        if (isScreenTouch()) return;

        let captureClick = (e)=>{
            e.stopPropagation();
            window.removeEventListener('click', captureClick, true);
            return false;
        }

        let mouseDownHandler=(e)=> {
            let targetName = e.target.nodeName.toUpperCase();
            
            if (!scrollPos && (targetName != "TEXTAREA") && (targetName != "INPUT") ) {
                scrollPos = {
                    top: node.scrollTop,
                    x: e.clientX,
                    y: e.clientY,
                    dragging:false
                };
                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
            }
        };

        let mouseMoveHandler = (e)=>{
            let
                dx = e.clientX - scrollPos.x,
                dy = e.clientY - scrollPos.y;
            if (scrollPos.dragging)
                node.scrollTop = scrollPos.top - dy;
            else {
                if ((Math.abs(dx)>5)||(Math.abs(dy)>5)) {
                    e.target.blur();
                    scrollPos.dragging=true;
                    document.body.style.cursor = 'grabbing';
                    document.body.style.userSelect = 'none';
                    window.addEventListener('click',captureClick,true); 
                }
            }
        };

        let mouseUpHandler = (e)=>{
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        
            if (scrollPos.dragging) {
                document.body.style.cursor="";
                document.body.style.userSelect="";
                e.preventDefault();
                scrollPos=0;
                return false;
            } else scrollPos=0;
            

        };

        node.addEventListener('mousedown', mouseDownHandler);

    }
    
    this.addNode=addNode;

    this.addDragToScroll=addDragToScroll;

    this.show=(node)=>{

        root.appendChild(node.box);

    }

    // Messagebox

    function MessageBox(text) {
        let
            box=addNode(root,"div","messagebox"),
            messageBox=addNode(box,"div","box"),
            content=addNode(messageBox,"div","box"),
            contentText=addNode(messageBox,"div","text",0, { innerHTML:text }),
            contentExtras=addNode(messageBox,"div","extras"),
            buttons=addNode(messageBox,"div","buttons");

        this.extras=contentExtras;

        this.addButton=(label,cb)=>{
            let button=addNode(buttons,"div","button",0,{innerHTML:label});
            button.onclick=cb;
        }

        this.close=()=>{
            root.removeChild(box);
        }
    }

    function PromptBox(text,ok) {
        let
            messageBox=new MessageBox(text);
        
        messageBox.addButton("Cancel",()=>{
            messageBox.close();
        })

        messageBox.addButton("OK",()=>{
            messageBox.close();
            ok();
        });

        this.close=()=>{
            messageBox.close();
        }

    }

    // Event Delayer

    function EventDelayer(data) {

        let
            delay,
            timers=[],
            events=[],
            elements=[];

        function generateKey(elementId,event) {
            return elementId+"-"+event;
        }

        let delayEvent=(elementId,event,eventData)=>{
            let key=generateKey(elementId,event);
            if (timers[key] !== undefined)
                clearTimeout(timers[key]);
            timers[key]=setTimeout(()=>{
                this.triggerEvent(event,{
                    eventElement:elements[elementId],
                    eventData:eventData
                });
                delete timers[key];
            },delay);
        }

        function registerEvents() {
            elements.forEach((element,elementId)=>{
                events.forEach(event=>{
                    element.registerEvent(event,(eventData)=>{
                        delayEvent(elementId,event,eventData);
                    })
                })
            })
        }

        this.set=(map)=>{
            let doRegisterEvents=false;
            for (let k in map) {
                let value=map[k];
                switch (k) {
                    case "elements":{
                        doRegisterEvents=true;
                        elements=value;
                        break;
                    }
                    case "events":{
                        doRegisterEvents=true;
                        events=value;
                        break;
                    }
                    case "delay":{
                        delay=value;
                        break;
                    }
                }
            }
            if (doRegisterEvents) registerEvents();
        }
    
        this.addCollapsable=(c)=>{
            collapsables.push(c);
            c.registerEvent("show",(state)=>{
                if (state)
                    collapsables.forEach(collapsable=>{
                        if (collapsable != c)
                            collapsable.setState(false);
                    })
            },1000);
            c.registerEvent("delete",()=>{
                let pos=collapsables.indexOf(c);
                collapsables.splice(pos,1);
            })
        }

        finalizeObject(this);

        if (data) this.set(data);
        
    }

    // Collapsables

    function CollapsableArea(data) {

        let
            placeholder,
            event={ state:true },
            removeElements=false,
            icon="",
            labelValue="",
            box=addNode(0,"div","collapsable",this),
            label=addNode(box,"div","label",this),
            labelText=addNode(label,"div","labeltext",this),
            labelWidget=addNode(label,"div","labelwidget",this),
            deleteButton=addNode(label,"div","delete",this, { innerHTML:"&times;" }),
            body=addNode(box,"div","body",this);

        this.box=box;
        this.container=body;

        let updateState=()=>{
            labelText.innerHTML = ( event.state ? "-" : "+" ) + " " + ( icon ? icon+" " : "") + (placeholder && !labelValue ? "<span class='placeholder'>"+placeholder+"</span>" : labelValue);
            label.className = event.state ? "label open" : "label";
            body.style.display=event.state ? "" : "none";
            deleteButton.style.display = removeElements ? "" : "none";
        }

        this.set=(map)=>{
            let doUpdateState=false;
            for (let k in map) {
                let value=map[k];
                switch (k) {
                    case "icon":{
                        icon=value;
                        doUpdateState=true;
                        break;
                    }
                    case "label":{
                        labelValue=value;
                        doUpdateState=true;
                        break;
                    }
                    case "state":{
                        event.state=value;
                        doUpdateState=true;
                        break;
                    }
                    case "removeElements":{
                        removeElements=value;
                        doUpdateState=true;
                        break;
                    }
                    case "placeholder":{
                        placeholder=value || "";
                        doUpdateState=true;
                        break;
                    }
                }
            }
            if (doUpdateState) updateState();
        }

        this.getWidgetArea=()=>{
            return labelWidget;
        }

        this.setIcon=(v)=>{
            icon=v;
            updateState();
        }

        this.setValue=(v)=>{
            labelValue=v;
            updateState();
        }

        this.getValue=()=>{
            return labelValue;
        }

        this.setState=(s)=>{
            event.state=s;
            updateState();
        }

        this.show=()=>{
            this.setState(true);
            this.triggerEvent("show",event);
        }

        this.addChanging=(f)=>{
            this.add(f);
            f.registerEvent("change",(data)=>{
                this.triggerEvent("change",data);
            })
            this.registerEvent("deleting",(event)=>{
                f.triggerEvent("deleting", event);
            })
        }

        this.setRemoveElements=(e)=>{
            removeElements=e;
            updateState();
        }

        labelText.onclick=()=>{
            this.setState(!event.state);
            if (event.state) this.triggerEvent("show",event);
        }

        labelWidget.onclick=()=>{
            this.triggerEvent("widgetClick",event);
        }

        deleteButton.onclick=()=>{
            this.triggerEvent("deleting", EVENTDELETE);
        }

        finalizeObject(this);

        this.setState(false);
        
        if (data) this.set(data);

    }

    function CollapsableAreaGroup(data) {
        
        let
            collapsables=[];

        this.addCollapsable=(c)=>{
            collapsables.push(c);
            c.registerEvent("show",(state)=>{
                if (state)
                    collapsables.forEach(collapsable=>{
                        if (collapsable != c)
                            collapsable.setState(false);
                    })
            },1000);
            c.registerEvent("delete",()=>{
                let pos=collapsables.indexOf(c);
                collapsables.splice(pos,1);
            })
        }

        finalizeObject(this);

    }

    // Rows

    function InputRow(data) {

        let
            event={ value:"" },
            box=addNode(0,"div","inputrow",this),
            label=addNode(box,"div","label",this),
            inputcontainer=addNode(box,"div","inputcontainer",this),
            input=addNode(inputcontainer,"input","input",this,{ type:"text", patchMobile:true });

        this.box=box;
        this.container=box;

        this.set=(map)=>{
            for (let k in map) {
                let value=map[k];
                switch (k) {
                    case "label":{
                        label.innerHTML=value;
                        break;
                    }
                    case "value":{
                        this.setValue(value);
                        break;
                    }
                    case "placeholder":{
                        input.placeholder=value || "";
                        break;
                    }
                }
            }
        }

        this.getObject=(queue,pos)=>{
            return this;
        }

        this.getValue=()=>{
            return input.value;
        }

        this.setValue=(value)=>{
            event.value = value;
            input.value=value === undefined ? "" : value;
        }

        this.changeValue=(value)=>{
            this.setValue(value);
            this.triggerEvent("change", event );
        }

        input.onkeyup=()=>{
            event.value=input.value;
            this.triggerEvent("change", event );
        }

        finalizeObject(this);

        if (data) this.set(data);
        
    }

    function ItemRow(data) {

        let
            event={ value: { quantity:0, tags:"" } },
            removeElements=false,
            box=addNode(0,"div","itemrow",this),
            quantitycontainer=addNode(box,"div","quantitycontainer",this),
            quantity=addNode(quantitycontainer,"input","quantity",this,{ type:"text", patchMobile:true }),
            tagscontainer=addNode(box,"div","tagscontainer",this),
            tags=addNode(tagscontainer,"input","tags",this,{ type:"text", patchMobile:true }),
            deleteButton=addNode(box,"div","delete",this, { innerHTML:"&times;" });

        this.box=box;
        this.container=box;

        let updateState=()=>{
            deleteButton.style.display = removeElements ? "" : "none";
        }

        this.set=(map)=>{
            for (let k in map) {
                let value=map[k];
                switch (k) {
                   case "value":{
                        this.setValue(value);
                        break;
                    }
                }
            }
        }

        this.getObject=(queue,pos)=>{
            return this;
        }

        this.getValue=()=>{
            return event.value;
        }

        this.setValue=(value)=>{
            event.value.quantity = quantity.value = value.quantity;
            event.value.tags = tags.value = value.tags;
        }

        this.changeValue=(value)=>{
            this.setValue(value);
            this.triggerEvent("change", event );
        }

        this.setRemoveElements=(e)=>{
            removeElements=e;
            updateState();
        }

        quantity.onkeyup=()=>{
            event.value.quantity = quantity.value;
            this.triggerEvent("change",event);
        }

        tags.onkeyup=()=>{
            event.value.tags = tags.value;
            this.triggerEvent("change",event);
        }

        deleteButton.onclick=()=>{
            this.triggerEvent("deleting", EVENTDELETE);
        }
        
        finalizeObject(this);
        
        this.registerEvent("added",(e)=>{
            this.triggerEvent("show",e);
        })

        if (data) this.set(data);

    }

    function StaticRow(data) {

        let
            placeholder,
            removeElements=false,
            event={ value: { id:0, label:0 } },
            box=addNode(0,"div","staticrow",this),
            label=addNode(box,"div","label",this),
            deleteButton=addNode(box,"div","delete",this, { innerHTML:"&times;" });

        this.box=box;
        this.container=box;

        let updateState=()=>{
            deleteButton.style.display = removeElements ? "" : "none";
        }

        this.set=(map)=>{
            let doUpdate=false;
            for (let k in map) {
                let value=map[k];
                switch (k) {
                    case "value":{
                        event.value=value;
                        doUpdate=true;
                        this.setValue(value);
                        break;
                    }
                    case "placeholder":{
                        placeholder=value;
                        doUpdate=true;
                        break;
                    }
                }
            }
            if (doUpdate)
                this.setValue(event.value);
        }

        this.getObject=(queue,pos)=>{
            return this;
        }

        this.getValue=()=>{
            return event.value;
        }

        this.setValue=(value)=>{
            event.value.id = value.id;
            event.value.label = value.label;
            label.innerHTML = placeholder && !value.label ? "<span class='placeholder'>"+placeholder+"</span>" : value.label;
        }

        this.changeValue=(value)=>{
            this.setValue(value);
            this.triggerEvent("change", event );
        }

        this.setRemoveElements=(e)=>{
            removeElements=e;
            updateState();
        }

        deleteButton.onclick=()=>{
            this.triggerEvent("deleting", EVENTDELETE);
        }

        finalizeObject(this);

        if (data) this.set(data);

    }

    function StatsRow(data) {

        let
            stats={},
            event={ value: { max:{}, attributes:{} } },
            nodes=[],
            box=addNode(0,"div","statsrow",this);

        this.box=box;
        this.container=box;

        function update() {
            stats.forEach(row=>{
                nodes[row.id].attribute.innerHTML=event.value.attributes[row.id]||0;
                if (event.value.max[row.id] === undefined)
                    nodes[row.id].stat.className="stat single";
                else {
                    nodes[row.id].stat.className="stat max";
                    nodes[row.id].max.innerHTML=event.value.max[row.id];
                }
            });
        }

        function changeStat(value,sum) {
            value=((value*1)||0)+sum;
            if (value<0) value=0;
            if (value>99) value=99;
            return value;
        }

        function updateValue(startvalue,input,change,minuslabel,pluslabel) {
            let
                newValue=changeStat(input.value,change),
                delta=newValue-startvalue;
            input.value=newValue;
            if (delta>0) {
                minuslabel.style.visibility="";
                pluslabel.style.visibility="visible";
                pluslabel.innerHTML="+"+delta;
            } else if (delta<0) {
                pluslabel.style.visibility="";
                minuslabel.style.visibility="visible";
                minuslabel.innerHTML=delta;
            } else {
                pluslabel.style.visibility="";
                minuslabel.style.visibility="";
            }
        }

        let openStat=(id)=>{
            let
                row=stats[id],
                startValue=event.value.attributes[row.id] || 0,
                messagebox=new MessageBox(row.editorLabel),
                valueRow=addNode(messagebox.extras,"div"),
                minusLabel=addNode(valueRow,"div","minuslabel"),
                subButton=addNode(valueRow,"div","smallbutton",0,{ innerHTML:"-" }),
                queryInput=addNode(valueRow,"input","smallinput",this,{ type:"text", value:startValue }),
                sumButton=addNode(valueRow,"div","smallbutton",0,{ innerHTML:"+" }),
                plusLabel=addNode(valueRow,"div","pluslabel"),
                maxStartValue,maxRow,maxMinusLabel,maxSubButton,maxQueryInput,maxSumButton,maxPlusLabel;
            if (event.value.max[row.id] !== undefined) {
                maxStartValue=event.value.max[row.id] || 0;
                maxRow=addNode(messagebox.extras,"div");
                maxMinusLabel=addNode(maxRow,"div","minuslabel");
                maxSubButton=addNode(maxRow,"div","smallbutton",0,{ innerHTML:"-" });
                maxQueryInput=addNode(maxRow,"input","smallinput",this,{ type:"text", value:maxStartValue });
                maxSumButton=addNode(maxRow,"div","smallbutton",0,{ innerHTML:"+" });
                maxPlusLabel=addNode(maxRow,"div","pluslabel"),
                maxQueryInput.onblur=()=>{
                    updateValue(maxStartValue,maxQueryInput,0,maxMinusLabel,maxPlusLabel);
                }
                maxSumButton.onclick=()=>{
                    updateValue(maxStartValue,maxQueryInput,1,maxMinusLabel,maxPlusLabel);
                }
                maxSubButton.onclick=()=>{
                    updateValue(maxStartValue,maxQueryInput,-1,maxMinusLabel,maxPlusLabel);
                }
            }
            queryInput.onblur=()=>{
                updateValue(startValue,queryInput,0,minusLabel,plusLabel);
            }
            sumButton.onclick=()=>{
                updateValue(startValue,queryInput,1,minusLabel,plusLabel);
            }
            subButton.onclick=()=>{
                updateValue(startValue,queryInput,-1,minusLabel,plusLabel);
            }
            messagebox.addButton("Cancel",()=>{
                messagebox.close();
            });
            messagebox.addButton("OK",()=>{
                event.value.attributes[row.id]=changeStat(queryInput.value,0);
                if (event.value.max[row.id] !== undefined)
                    event.value.max[row.id]=changeStat(maxQueryInput.value,0);
                this.triggerEvent("change", event );
                update();
                messagebox.close();
            });
        }

        this.set=(map)=>{
            let
                doUpdate=false,
                doSetValue=false;
            for (let k in map) {
                let v=map[k];
                switch (k) {
                    case "stats":{
                        let statWidth=99.9/v.length;
                        stats=v;
                        nodes={};
                        stats.forEach((row,id)=>{
                            let
                                stat=addNode(box,"div","stat",this, { style:{ width:statWidth+"%" }}),
                                statValueContainer=addNode(stat,"div","valuecontainer",this),
                                statValue=addNode(statValueContainer,"div","value",this),
                                statValueAttribute=addNode(statValue,"div","attribute",this),
                                statValueMax=addNode(statValue,"div","max",this),
                                statLabel=addNode(stat,"div","label",this, { innerHTML:row.shortGuiLabel });
                            nodes[row.id]={
                                stat:stat,
                                max:statValueMax,
                                attribute:statValueAttribute,
                                label:statLabel
                            };
                            stat.onclick=()=>{
                                openStat(id);
                            }
                        });
                        doUpdate=true;
                        break;
                    }
                    case "value":{
                        doSetValue=v;
                        break;
                    }
                }
            }
            if (doSetValue) this.setValue(doSetValue);
            else if (doUpdate) update();
        }

        this.openStat=(id)=>{
            openStat(id);
        }

        this.getObject=(queue,pos)=>{
            return this;
        }

        this.getValue=()=>{
            return event.value;
        }

        this.setValue=(value)=>{
            event.value = value;
            update();
        }

        this.changeValue=(value)=>{
            this.setValue(value);
            this.triggerEvent("change", event );
        }

        finalizeObject(this);

        if (data) this.set(data);

    }

    function TextAreaRow(data) {

        let
            event={ value:"" },
            box=addNode(0,"div","textarearow",this),
            label=addNode(box,"div","label",this),
            inputcontainer=addNode(box,"div","textareacontainer",this),
            textarea=addNode(inputcontainer,"textarea","textarea",this);

        this.box=box;
        this.container=box;

        function resize() {
            textarea.style.height = "5px";
            textarea.style.height = Math.max(textarea.scrollHeight+6,42)+"px";
        }

        this.set=(map)=>{
            for (let k in map) {
                let value=map[k];
                switch (k) {
                    case "label":{
                        label.innerHTML=value;
                        break;
                    }
                    case "value":{
                        this.setValue(value);
                        break;
                    }
                }
            }
        }

        this.getObject=(queue,pos)=>{
            return this;
        }

        this.getValue=()=>{
            return textarea.value;
        }

        this.setValue=(value)=>{
            event.value = value;
            textarea.value=value === undefined ? "" : value;
            resize();
        }

        this.changeValue=(value)=>{
            this.setValue(value);
            this.triggerEvent("change", event );
        }

        textarea.onkeyup=()=>{
            event.value = textarea.value;
            this.triggerEvent("change", event );
        }

        textarea.oninput=()=>{
            resize();
        }

        finalizeObject(this);

        if (data) this.set(data);

    }

    function SelectRow(data) {

        let
            placeholder,
            options=[],
            event={ value:0 },
            box=addNode(0,"div","selectrow",this),
            label=addNode(box,"div","label",this),
            inputcontainer=addNode(box,"div","selectcontainer",this),
            select=addNode(inputcontainer,"select","select",this);

        this.box=box;
        this.container=box;

        function redrawSelect() {
            select.innerHTML="";
            options.forEach((option,id)=>{
                let node=addNode(select,"option","option",0,{ innerHTML:option.label, value:option.value });
                if (placeholder && !option.label) {
                    node.innerHTML=placeholder;
                    node.className+=" placeholder";
                }
                if (option.value == event.value)
                    node.setAttribute("selected","selected");
            });
        }

        this.set=(map)=>{
            let
                doSetValue,
                doRedrawSelect;
            for (let k in map) {
                let value=map[k];
                switch (k) {
                    case "label":{
                        label.innerHTML=value;
                        break;
                    }
                    case "value":{
                        doSetValue=value;
                        break;
                    }
                    case "options":{
                        this.setOptions(value);
                        break;
                    }
                    case "placeholder":{
                        placeholder=value;
                        break;
                    }
                }
            }
            if (doSetValue !== undefined)
                this.setValue(value);
        }

        this.getObject=(queue,pos)=>{
            return this;
        }

        this.getValue=()=>{
            return options[select.selectedIndex].value;
        }

        this.setOptions=(o)=>{
            options=o;
            redrawSelect();
        }

        this.setValue=(value)=>{
            event.value=value;
            options.forEach((option,id)=>{
                if (option.value == value)
                    select.selectedIndex=id;
            })
        }

        this.changeValue=(value)=>{
            this.setValue(value);
            this.triggerEvent("change", event );
        }

        select.onchange=()=>{
            event.value=this.getValue();
            this.triggerEvent("change", event );
        }

        finalizeObject(this);

        if (data) this.set(data);

    }

    // Forms

    function Form(data) {

        let
            structure=[],
            values={},
            elements,
            icon="",
            box=addNode(0,"div","form",this);

        this.box=box;
        this.container=box;
    
        let redraw=()=>{
            box.innerHTML="";
            elements={};
            structure.forEach(row=>{
                let element;
                switch (row.type) {
                    case "input":{
                        element=new InputRow({
                            label:row.label,
                            placeholder:row.placeholder,
                            value:values[row.id]
                        });
                        break;
                    }
                    case "textarea":{
                        element=new TextAreaRow({
                            label:row.label,
                            value:values[row.id]
                        });
                        break;
                    }
                    case "select":{
                        element=new SelectRow({
                            label:row.label,
                            value:values[row.id],
                            placeholder:row.placeholder,
                            options:row.options()
                        });
                        break;
                    }
                    case "stats":{
                        element=new StatsRow({
                            stats:row.stats,
                            value:values[row.id]
                        });
                        break;
                    }
                    case "itemslist":{
                        element=new ItemsList({
                            title:row.label,
                            value:values[row.id]
                        });
                        break;
                    }
                    case "staticlist":{
                        element=new StaticList({
                            title:row.label,
                            placeholder:row.placeholder,
                            value:values[row.id]
                        });
                        break;
                    }
                }
                if (element) {
                    element.registerEvent("change",(event)=>{
                        values[row.id]=event.value;
                        this.triggerEvent("change",{
                            value:this.getValue(),
                            element:row,
                            elementEvent:event
                        });
                    });
                    element.registerEvent("deleting",(event)=>{
                        values[row.id]=event.value;
                        this.triggerEvent("deleting",{
                            value:this.getValue(),
                            element:row,
                            elementEvent:event
                        });
                    });
                    element.registerEvent("ruler",(event)=>{
                        this.triggerEvent("ruler",{
                            value:this.getValue(),
                            element:row,
                            elementEvent:event
                        });
                    });
                    element.registerEvent("show",(event)=>{
                        this.triggerEvent("show",{
                            value:this.getValue(),
                            element:row,
                            elementEvent:event
                        });
                    });
                    this.add(element);
                    elements[row.id]=element;
                }
            })
        }

        let update=()=>{
            this.triggerEvent("icon",icon);
        }

        this.getObject=(queue,pos)=>{
            if (!pos) pos=0;
            if (pos < queue.length)
                return elements[queue[pos]].getObject(queue,pos+1);
            else return this;
        }

        this.set=(map)=>{
            let
                doRedraw=false,
                doUpdate=false;
            for (let k in map) {
                let value=map[k];
                switch (k) {
                    case "icon":{
                        doUpdate=true;
                        icon=value;
                        break;
                    }
                    case "structure":{
                        doRedraw=true;
                        structure=value;
                        break;
                    }
                }
            }
            if (doRedraw) redraw();
            else if (doUpdate) update();
        }

        this.getValue=()=>{
            return values;
        }

        this.setIcon=(v)=>{
            icon=v;
            update();
        }

        this.setValue=(v)=>{
            values=v;
            for (let k in v)
                if (elements[k])
                    elements[k].setValue(values[k]);
        }

        finalizeObject(this);

        if (data) this.set(data);

    }

    function CollapsableForm(data) {
        
        let
            headerFormField=0,
            widgetFormFields=[],
            widgetRenderer=0,
            onWidgetClick=0,
            collapsable=new CollapsableArea(),
            form=new Form();

        collapsable.addChanging(form);

        this.box=collapsable.box;
        this.container=collapsable.container;

        function updateWidget() {
            if (widgetRenderer)
                widgetRenderer(collapsable,form);
        }

        this.set=(map)=>{
            form.set(map);
            if (map.headerFormField) {
                let value=form.getValue();
                headerFormField=map.headerFormField;
                collapsable.setValue(value[headerFormField] || "");
            }
            if (map.widgetRenderer)
                widgetRenderer=map.widgetRenderer;
            if (map.widgetFormFields) {
                widgetFormFields=map.widgetFormFields;
                updateWidget();
            }
            if (map.collapsableGroup)
                map.collapsableGroup.addCollapsable(collapsable);
            if (map.onWidgetClick)
                onWidgetClick=map.onWidgetClick;
            if (map.placeholderHeaderFormField)
                collapsable.set({
                    placeholder:map.placeholderHeaderFormField
                })
        }

        this.getValue=(v)=>form.getValue(v);
        
        this.setValue=(v)=>{
            let doUpdateWidget=false;
            form.setValue(v);
            if (v[headerFormField] !== undefined)
                collapsable.setValue(v[headerFormField]);
            widgetFormFields.forEach(sub=>{
                if (v[sub] !== undefined)
                doUpdateWidget=true;
            })
            if (doUpdateWidget)
                updateWidget();
        }

        this.setIcon=(v)=>{
            collapsable.setIcon(v);
        }

        this.getObject=(queue,pos)=>form.getObject(queue,pos);

        this.setRemoveElements=(v)=>collapsable.setRemoveElements(v);

        form.registerEvent("change",(e)=>{
            if (e.element.id == headerFormField)
                collapsable.setValue(e.elementEvent.value);
            if (widgetFormFields.indexOf(e.element.id)!==-1)
                updateWidget();
            this.triggerEvent("change",e);
        });

        form.registerEvent("ruler",(e)=>{
            this.triggerEvent("ruler",e);
        });

        form.registerEvent("show",(e)=>{
            this.triggerEvent("show",e);
        })

        form.registerEvent("icon",(e)=>{
            this.setIcon(e);
        })

        collapsable.registerEvent("deleting",(e)=>{
            this.triggerEvent("deleting",e);
        })

        collapsable.registerEvent("show",(e)=>{
            this.triggerEvent("show",e);
        })

        collapsable.registerEvent("ruler",(e)=>{
            this.triggerEvent("ruler");
        })

        collapsable.registerEvent("widgetClick",(e)=>{
            if (onWidgetClick)
                onWidgetClick(collapsable,form);
        })

        finalizeObject(this);

        this.registerEvent("added",(e)=>{
            collapsable.show();
        })

        if (data) this.set(data);

    }

    // Search

    function Search(data) {
        let
            event={ value:0 },
            searchDelay=1000,
            searchTimeout=0,
            resultMode=false,
            resultContext=0,
            engine=0,
            queryContext=0,
            results=[],
            queryModes=[],
            queryMode=0,
            queryDirty=false,
            box=addNode(0,"div","search",this),
            queryView=addNode(box,"div","queryview",this),
            resultView=addNode(box,"div","resultview",this),
            queryContextNode=addNode(queryView,"div","context",this),
            queryBox=addNode(queryView,"div","querybox",this),
            queryInput=addNode(queryBox,"input","query",this,{ type:"text", patchMobile:true, placeholder:"Search" }),
            queryModeNode=addNode(queryBox,"div","mode",this),
            searchResults=addNode(queryView,"div","results",this),
            resultContextBar=addNode(resultView,"div","bar",this),
            resultContextNode=addNode(resultContextBar,"div","context",this),
            searchBack=addNode(resultContextBar,"div","back",this, { innerHTML:"&times;" }),
            searchResult=addNode(resultView,"div","result",this);

        this.box=box;
        this.container=box;
        addDragToScroll(searchResults);

        function selectResult(id) {
            let result=results[id];
            resultContext=queryContext;
            searchResult.innerHTML="";
            if (queryInput.value) {
                queryInput.value="";
                queryDirty=true;
            }
            engine.renderResult(result,searchResult);
            resultMode=true;
            update();
        }

        function update() {
            if (resultMode) {
                queryView.style.display="none";
                resultView.style.display="";
                resultContextNode.innerHTML="<b>For:</b> "+resultContext.html;
            } else {
                if (queryDirty && !searchTimeout) {
                    queryDirty=false;
                    results=engine.search(queryModes[queryMode],queryContext,queryInput.value);
                }
                queryView.style.display="";
                resultView.style.display="none";
                searchResults.innerHTML="";
                queryModeNode.innerHTML=queryModes[queryMode].label;
                searchResults.className="results "+(searchTimeout ? "loading" : "");
                results.forEach((result,id)=>{
                    let row=addNode(searchResults,"div","result");
                    row.innerHTML=engine.renderResultRow(result);
                    row.onclick=()=>{
                        selectResult(id);
                    }
                })
                searchResults.scrollTop=0;
            }
        }

        function gotoQuery() {
            queryDirty=true;
            resultMode=false;
            if (searchTimeout)
                clearTimeout(searchTimeout);
            searchTimeout=0;
            update();
        }

        function scheduleQuery() {
            if (searchDelay) {
                if (searchTimeout)
                    clearTimeout(searchTimeout);
                searchTimeout=setTimeout(gotoQuery, searchDelay);
                if (!resultMode) update();
            } else
                gotoQuery();
        }

        this.set=(map)=>{
            let doUpdate=false;
            for (let k in map) {
                let value=map[k];
                switch (k) {
                    case "searchDelay":{
                        searchDelay=value;
                        break;
                    }
                    case "modes":{
                        doUpdate=true;
                        queryModes=value;
                        break;
                    }
                    case "engine":{
                        engine=value;
                        break;
                    }
                }
            }
            if (doUpdate) update();
        }

        this.setContext=(c)=>{
            queryContext=c;
            queryContextNode.innerHTML="<b>Search for:</b> "+c.html;
            if (!resultMode)
                scheduleQuery();
            else
                queryDirty=true;
        }

        queryInput.onkeyup=()=>{
            scheduleQuery();
        }

        searchBack.onclick=()=>{
            resultMode=false;
            update();
        }

        queryModeNode.onclick=()=>{
            queryMode=(queryMode+1)%queryModes.length;
            scheduleQuery();
        }
        
        finalizeObject(this);

        if (data) this.set(data);

        update();

    }

    // Lists

    function ListSet(data) {
        let
            lists=[],
            value={},
            box=addNode(0,"div","listset",this);

        this.box=box;
        this.container=box;

        this.set=(map)=>{
            for (let k in map) {
                let v=map[k];
                switch (k) {
                    case "lists":{
                        lists=v;
                        lists.forEach(list=>{
                            this.add(list.element);
                            list.element.registerEvent("change",(event)=>{
                                value[list.id]=event.value;
                                this.triggerEvent("change",{
                                    value:this.getValue(),
                                    elementPosition:list.id,
                                    elementEvent:event
                                });
                            })
                            list.element.registerEvent("ruler",(event)=>{
                                this.triggerEvent("ruler",{
                                    value:this.getValue(),
                                    elementPosition:list,
                                    elementEvent:event
                                });
                            })
                            list.element.registerEvent("show",(event)=>{
                                this.triggerEvent("show",{
                                    value:this.getValue(),
                                    elementPosition:list,
                                    elementEvent:event
                                });
                            });
                        });
                        break;
                    }
                }
            }
        }

        this.getObject=(queue,pos)=>{
            if (!pos) pos=0;
            if (pos < queue.length) {
                let id=queue[pos];
                for (let i=0;i<lists.length;i++)
                    if (lists[i].id == id)
                        return lists[i].element.getObject(queue,pos+1);
            } else return this;
        }

        this.setValue=(v)=>{
            value=v;
            lists.forEach(list=>{
                if (v[list.id] !== undefined)
                    list.element.setValue(v[list.id]);
            })
        }

        this.getValue=(v)=>{
            return value;
        }

        finalizeObject(this);

        if (data) this.set(data);
    }

    function List(data) {

        let
            onDeleteElement="",
            value=[],
            elements=[],
            onNewValue={},
            onNewElement=0,
            removeElements=false,
            addElements=false,
            box=addNode(0,"div","list",this),
            headerContainer=addNode(box,"div","headercontainer",this),
            header=addNode(headerContainer,"div","header",this),
            addButton=addNode(headerContainer,"div","add",this , { innerHTML:"+" }),
            body=addNode(box,"div","body",this);
        
        this.box=box;
        this.container=body;

        function update() {
            addButton.style.display = addElements ? "" : "none";
            elements.forEach(element=>{
                element.setRemoveElements(removeElements);
            })
        }

        this.set=(map)=>{
            let doUpdate=false;
            for (let k in map) {
                let value=map[k];
                switch (k) {
                    case "onDeleteElement":{
                        onDeleteElement=value;
                        break;
                    }
                    case "title":{
                        header.innerHTML=value;
                        break;
                    }
                    case "removeElements":{
                        doUpdate=true;
                        removeElements=value;
                        break;
                    }
                    case "addElements":{
                        doUpdate=true;
                        addElements=value;
                        break;
                    }
                    case "onNewElement":{
                        onNewElement=value;
                        break;
                    }
                    case "onNewValue":{
                        onNewValue=value;
                        break;
                    }
                }
            }
            if (doUpdate) update();
        }

        let deleteElementAt=(pos,event)=>{
            let oldValue=value[pos];
            value.splice(pos,1);
            this.triggerEvent("delete",{
                value:this.getValue(),
                elementValue:oldValue,
                elementPosition:pos,
                elementEvent:event
            });
            this.remove(elements[pos]);
            elements.splice(pos,1);
            this.triggerEvent("change",{
                value:this.getValue(),
                elementValue:oldValue,
                elementPosition:pos,
                elementEvent:event
            });
        }

        this.addValue=(v,manual)=>{
            let element=onNewElement(v,manual);
            element.setRemoveElements(removeElements);
            element.registerEvent("change",(event)=>{
                let pos=elements.indexOf(element);
                value[pos]=event.value;
                this.triggerEvent("change",{
                    value:this.getValue(),
                    elementPosition:pos,
                    elementEvent:event
                });
            });
            element.registerEvent("ruler",(event)=>{
                let pos=elements.indexOf(element);
                this.triggerEvent("ruler",{
                    value:this.getValue(),
                    elementPosition:pos,
                    elementEvent:event
                });
            });
            element.registerEvent("show",(event)=>{
                let pos=elements.indexOf(element);
                this.triggerEvent("show",{
                    value:this.getValue(),
                    elementEvent:event,
                    elementPosition:pos
                });
            });
            element.registerEvent("deleting",(event)=>{
                let pos=elements.indexOf(element);
                if (onDeleteElement) {
                    new PromptBox(onDeleteElement(elements[pos]),()=>{
                        deleteElementAt(pos,event); 
                    });
                } else deleteElementAt(pos,event);
            })
            this.add(element);
            elements.push(element);
            value.push(v);
            return element;
        }

        this.getObject=(queue,pos)=>{
            if (!pos) pos=0;
            if (pos < queue.length)
                return elements[queue[pos]].getObject(queue,pos+1);
            else return this;
        }
        
        this.setValue=(v)=>{
            value=[];
            v.forEach((v,id)=>{
                if (elements[id]) {
                    value[id]=v;
                    elements[id].setValue(v);
                } else
                    this.addValue(v);
            });
            while (elements.length>v.length)
                this.removeChanging(elements.length-1);
        }

        this.removeChanging=(pos)=>{
            value.splice(pos,1);
            this.remove(elements[pos]);
            elements.splice(pos,1);
        }

        this.getValue=()=>{
            return value;
        }

        this.empty=()=>{
            while (elements.length)
                this.removeChanging(0);
        }

        this.setRemoveElements=(v)=>{
            removeElements=v;
            update();
        }

        this.setAddElements=(v)=>{
            addElements=v;
            update();
        }

        addButton.onclick=()=>{
            let event={
                value:this.getValue(),
                elementPosition:elements.length-1
            };
            let element=this.addValue(onNewValue(),true);
            this.triggerEvent("change",event);
            element.triggerEvent("added",event);
        }

        finalizeObject(this);

        if (data) this.set(data);

    }

    function ItemsList(data) {

        function onNewElement(v) {
            let row=new ItemRow();
            row.setValue(v);
            return row;
        }

        let list=new List({
            title:"",
            addElements:true,
            removeElements:true,
            onNewElement:onNewElement,
            onNewValue:()=>{
                return { quantity:1, tags:"" }
            }
        });

        this.box=list.box;
        this.container=list.container;

        list.registerEvent("change",(event)=>{
            this.triggerEvent("change",event);
        });

        list.registerEvent("ruler",(event)=>{
            this.triggerEvent("ruler",event);
        });

        list.registerEvent("delete",(event)=>{
            this.triggerEvent("delete",event);
        })

        list.registerEvent("show",(event)=>{
            this.triggerEvent("show",event);
        })

        this.set=(v)=>list.set(v);

        this.getObject=(queue,pos)=>list.getObject(queue,pos);

        this.getValue=()=>list.getValue();

        this.setValue=(v)=>list.setValue(v);
        
        this.setAddElements=(v)=>{
            list.setAddElements(v);
        }

        this.setRemoveElements=(v)=>{
            list.setRemoveElements(v);
        }

        finalizeObject(this);

        if (data) this.set(data);

    }

    function StaticList(data) {

        function onNewElement(v) {
            let row=new StaticRow();
            row.set({ placeholder:data.placeholder });
            row.setValue(v);
            return row;
        }

        let list=new List({
            title:"",
            removeElements:true,
            addElements:false,
            onNewElement:onNewElement,
            onNewValue:()=>{
                return { value:"" }
            }
        });

        this.box=list.box;
        this.container=list.container;

        list.registerEvent("change",(event)=>{
            this.triggerEvent("change",event);
        });

        list.registerEvent("ruler",(event)=>{
            this.triggerEvent("ruler",event);
        });

        list.registerEvent("delete",(event)=>{
            this.triggerEvent("delete",event);
        })

        this.set=(v)=>list.set(v);

        this.getObject=(queue,pos)=>list.getObject(queue,pos);

        this.getValue=()=>list.getValue();

        this.setValue=(v)=>list.setValue(v);

        this.setAddElements=(v)=>list.setAddElements(v);

        this.setRemoveElements=(v)=>list.setRemoveElements(v);

        finalizeObject(this);

        if (data) this.set(data);

    }

    // RPG

    function Rpg(data) {
       
        const
            RULERY=0.3,
            MINUTE=60000,
            CHANGEERVERY=30000;

        let
            timeOut,
            onExit,
            timeOver=false,
            timeLastChange=0,
            minuteUpdater=0,
            world=0,
            timeLimit=0,
            timePassed=0,
            timeCheck=0,
            rulerManager=0,
            box=addNode(0,"div","rpg",this),
            exit=addNode(root,"div","exit",this, { innerHTML:"&times;"}),
            ruler=addNode(root,"div","ruler",this),
            rulerSymbol=addNode(ruler,"div","symbol",this),
            worldArea=addNode(box,"div","world",this),
            assistant=addNode(root,"div","assistant",this),
            clockBox=addNode(assistant,"div","clockbox",this),
            clock=addNode(clockBox,"div","clock",this),
            clockArm=addNode(clock,"div","clockarm",this);

        this.box=box;
        this.container=worldArea;

        function scheduleUpdateRuler() {
            timeOut=setTimeout(()=>{
                updateRuler();
                if (minuteUpdater)
                    minuteUpdater--;
                else {
                    updateTime();
                    minuteUpdater=30;
                }
                scheduleUpdateRuler();
            },1000);
        }

        function scrollTo(node) {
            let top=0;
            do {
                top+=node.offsetTop;
                node=node.parenNode;
            } while (node && (node !== box));
            box.scrollTop=top-document.body.clientHeight*RULERY+10;
        }

        function getTimeStamp() {
            return new Date().getTime();
        }

        function updateTime() {
            if (!timeOver) {
                let time=getTimeStamp();
                if (!timeCheck) timeCheck=time;
                if (!timePassed) timePassed=0;
                timePassed+=time-timeCheck;
                if (timePassed<0)
                    timePassed=0;
                if (timePassed>=timeLimit) {
                    timeOver=true;
                    timePassed=timeLimit;
                    timeLastChange=0;
                    clock.className="clock done";
                }
                clockArm.style.transform="rotate("+(180*(timePassed/timeLimit))+"deg)";
                timeCheck=time;
                if (time-timeLastChange>=CHANGEERVERY)
                    sendChange(0);
            }
        }

        let sendChange=(event)=>{
            timeLastChange=getTimeStamp();
            this.triggerEvent("change",{
                worldEvent:event,
                worldValue:{
                    timePassed:timePassed,
                    world:world.getValue()
                }
            })
        }

        let updateRuler=()=>{
            let
                screenRect=root.getBoundingClientRect(),
                x=screenRect.x+screenRect.width*0.7,
                y=document.body.clientHeight*RULERY,
                paddingTop=document.body.clientHeight*RULERY-5,
                paddingBottom=document.body.clientHeight*(1-RULERY)-5,
                node=document.elementFromPoint(x,y);
            ruler.style.top=(y-2)+"px";
            worldArea.style.paddingTop=paddingTop+"px";
            worldArea.style.paddingBottom=paddingBottom+"px";
            while (node) {
                if (node._manager) {
                    if (node._manager !== rulerManager) {
                        node._manager.triggerEvent("ruler");
                        rulerManager=node._manager;
                    }
                    break;
                } else
                    node=node.parentElement;
            }
        }

        this.set=(map)=>{
            let doRedraw=false;
            for (let k in map) {
                let v=map[k];
                switch (k) {
                    case "world":{
                        world=v;
                        this.add(world);
                        addDragToScroll(box);
                        world.registerEvent("change",(event)=>{
                            sendChange(event);
                        });
                        world.registerEvent("ruler",(event)=>{
                            this.triggerEvent("ruler",event)
                        });
                        world.registerEvent("show",(event)=>{
                            let position=[event.elementPosition.id,event.elementEvent.elementPosition];
                            if (event.elementEvent.elementEvent.elementEvent)
                                position=position.concat([event.elementEvent.elementEvent.element.id,event.elementEvent.elementEvent.elementEvent.elementPosition]);
                            let element=world.getObject(position);
                            scrollTo(element.box);
                            updateRuler();
                        });
                        break;
                    }
                    case "assistant":{
                        assistant.appendChild(v.box);
                        break;
                    }
                    case "timeLimit":{
                        timeLimit=v*MINUTE;
                        break;
                    }
                    case "onExit":{
                        onExit=v;
                        break;
                    }
                }
            }
            if (doRedraw) redraw();
        }

        this.forceUpdateRuler=()=>{
            rulerManager=0;
            updateRuler();
        }

        this.setValue=(v)=>{
            timeLastChange=getTimeStamp();
            timePassed=v.timePassed;
            world.setValue(v.world);
            updateRuler();
        }

        exit.onclick=()=>{
            if (timeOut) {
                clearTimeout(timeOut);
                timeOut=0;
            }
            sendChange();
            root.removeChild(exit);
            root.removeChild(assistant);
            root.removeChild(ruler);
            onExit();
        }
        
        finalizeObject(this);
        scheduleUpdateRuler();

        if (data) this.set(data);

        updateRuler();
    }

    // Constructors

    this.newEventDelayer=(data)=>{
        return new EventDelayer(data);
    }

    this.newList=(data)=>{
        return new List(data);
    }

    this.newListSet=(data)=>{
        return new ListSet(data);
    }

    this.newForm=(data)=>{
        return new Form(data);
    }

    this.newCollapsableForm=(data)=>{
        return new CollapsableForm(data);
    }

    this.newCollapsableAreaGroup=(data)=>{
        return new CollapsableAreaGroup(data);
    }

    this.newRpg=(data)=>{
        return new Rpg(data);
    }

    this.newSearch=(data)=>{
        return new Search(data);
    }

}
