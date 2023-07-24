let GLOBALS={
    DEBUG:false,
    DEBUGSET:"moves", // Show the related set in DEBUGSCREEN. "moves", "oracles"
    DEBUGSCREEN:0, // Show a debug screen instead of starting the current glance. 1:Icons 2:Items 3:Creatures 4:Places
    DEBUGINTRO:false, // Automatically hits "Next" on intro
    duration:20,
    maxWidth:600,
    storageLabel:"_TSOMG",
    settingsStorageLabel:"_TSOMGS",
    name:"The Scroll of Many Glances",
    version:"0.1b",
    year:2023,
    extraCredits:"<p>This project uses MB-14's <a target=_blank href='https://github.com/mb-14/embeddings.js'>embeddings.js</a> library, <a target=_blank href='https://fontawesome.com/'>Font Awesome</a> free icons, and adapted <a target=_blank href='https://cairnrpg.com/resources/more-spellbooks/'>Cairn</a>'s <a target=_blank href='https://creativecommons.org/licenses/by-sa/4.0/'>CC-BY-SA 4.0</a> spellbook.</p>",
    by:{
        label:"KesieV",
        url:"https://www.kesiev.com"
    },
    sources:{
        label:"github.com/kesiev/tsomg",
        url:"https://github.com/kesiev/tsomg"
    },
    thanks:[
        {
            label:"Bianca",
            url:"http://www.linearkey.net/"
        }
    ]
};

let SEARCHENGINES={
    embeddingsjs:{
        load:(cb)=>{
            _tfengine.ready().then(()=>{
                embeddings.loadModel("js/embeddings.js/assets/word-embeddings.json").then((wordEmbeddings)=>{
                    wordEmbeddings._tf.then(()=>{
                        cb({ wordEmbeddings:wordEmbeddings });
                    });
                })
            });
        },
        preprocessWord:(resources,word)=>{
            if (resources.wordEmbeddings.vocabulary.indexOf(word) == -1)
                return 0;
            else {
                let vector=resources.wordEmbeddings._getVector(word);
                return {
                    vector:vector,
                    norm:vector.norm(2)
                };
            }
        },
        getWordsScore:(resources,word1,word1preproc,word2,word2preproc)=>{
            let
                a=word1preproc.vector.dot(word2preproc.vector).asScalar(),
                distance=a.div(word1preproc.norm).div(word2preproc.norm).dataSync()[0];
            if (isNaN(distance) || (distance<0.35)) return 0;
            else if (distance>1) return 1;
            else return distance;
        }
    }
};