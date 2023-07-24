function Manual() {

    let
        ui=new UI(document.body),
        screen,
        onExit,
        root,
        content;

    function markdownToHtml(text) {
        text="\n"+text+"\n";
        text=text.replace(/\r/g,"");
        text=text.replace(/\n\n  - ([^\n]+)\n/g,"\n<ul><li>$1</li>\n");
        text=text.replace(/\n  - ([^\n]+)/g,"\n<li>$1</li>");
        text=text.replace(/<\/li>\n\n/g,"</li>\n</ul>\n");
        text=text.replace(/\n# ([^\n]+)\n/g,"\n<div class='banner'></div>\n");
        text=text.replace(/\n## ([^\n]+)\n/g,"\n<h2>$1</h2>\n");
        text=text.replace(/\n### ([^\n]+)\n/g,"\n<h3>$1</h3>\n");
        text=text.replace(/\*\*([^\*]+)\*\*/g,"<b>$1</b>");
        text=text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g,(m,m1,m2)=>{
            return "<a target=~~qu~~blank href='"+m2.replace(/_/g,"~~qu~~")+"'>"+m1+"</a>"
        });
        text=text.replace(/_([^_]+)_/g,"<i>$1</i>");
        text=text.replace(/([^>])\n\n([^<h])/g,"$1<br><br>\n$2");
        text=text.replace(/~~qu~~/g,"_");
        return text.trim();
    }

    function loadManual() {
        if (Manual._text)
            openManual();
        else {
            let xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4)
                    if ((xmlhttp.status == 200)||(xmlhttp.status==0)) {
                        Manual._text=xmlhttp.responseText;
                        openManual();
                    }
            };
            xmlhttp.open("GET", "manual/default.md?"+Math.random());
            xmlhttp.send();
        }
    }

    function openManual() {
        let exit=ui.addNode(screen,"div","exit",0,{innerHTML:"&times;"});
        content.innerHTML=markdownToHtml(Manual._text);
        ui.addDragToScroll(root);
        exit.onclick=()=>{
            screen.removeChild(exit);
            onExit();
        }
    }

    this.run=(rootnode,cb)=>{
        screen=rootnode;
        onExit=cb;
        root=ui.addNode(screen,"div","manual");
        content=ui.addNode(root,"div","content");
        loadManual();
    }

}