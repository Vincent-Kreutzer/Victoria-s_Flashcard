// =================
// DATA
// =================

let decks = []
let cards = []
let latestSearchWord = null;//fetchで取得したデータを保存⇒各変数に割り当てる
let defaultDeck = [
  {id:0, name:"sample-deck"},  
]

let defaultCards = [
  {
    id: 1,
    deckId: 0,
    word: "temporal",
    phonetics: [
      {
        text: "/ˈtem.pər.əl/",
        audio: ""
      }
    ],
    meanings: [
      {
        partOfSpeech: "adjective",
        definitions: [
          {
            definition: "relating to time rather than space"
          }
        ]
      }
    ]
  },

  {
    id: 2,
    deckId: 0,
    word: "cat",
    phonetics: [
      {
        text: "/kæt/",
        audio: ""
      }
    ],
    meanings: [
      {
        partOfSpeech: "noun",
        definitions: [
          {
            definition: "a small domesticated animal with soft fur, whiskers, and a long tail"
          }
        ]
      }
    ]
  },

  {
    id: 3,
    deckId: 0,
    word: "bird",
    phonetics: [
      {
        text: "/bɜːrd/",
        audio: ""
      }
    ],
    meanings: [
      {
        partOfSpeech: "noun",
        definitions: [
          {
            definition: "an animal with feathers, wings, and a beak, most kinds of which can fly"
          }
        ]
      }
    ]
  }
];

//mapでidを抽出して入れる変数
let someIds = [];

// =================
// DOM取得
// =================

const pageWrapper = document.getElementById("page-wrapper");

//検索欄
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");//検索欄横の検索を実行するボタン

//検索結果を表示するモーダル
const modalOverlay = document.getElementById("modal-overlay");
const cardAddModal = document.getElementById("card-add-modal");
const addictionToggle = document.getElementById("addiction-toggle");

const searchResult = document.getElementById("search-result");
const searchedWord = document.getElementById("searched-word")
const phonetic = document.getElementById("phonetic-area");
const audioBtns = document.getElementById("audio-btns");

const prevMeaningBtn = document.getElementById("prev-meaning-btn")
const partOfSpeech = document.getElementById("part-of-speech");
const nextMeaningBtn = document.getElementById("next-meaning-btn")
const tableOfContents = document.getElementById("table-of-contents")

const modalDefinition = document.getElementById("modal-definition");
  
const selectedDeck = document.getElementById("select-deck");
const submitCardBtn = document.getElementById("submit-card-btn");/*入力した単語情報をデッキに追加するボタン*/
const closeCardAddBtn = document.getElementById("close-search-card-btn");


//デッキ操作
const myDecks = document.getElementById("my-decks");
const arrow = document.getElementById("arrow");

const deckPanel = document.getElementById("deck-panel");
const addNewDeckBtn = document.getElementById("add-new-deck-btn");//新規デッキ追加ボタン
const deckContainer = document.getElementById("deck-container");//デッキカード保管場所

const inputDeckName = document.getElementById("input-deckname");//デッキ名入力箇所

const deckCreateModal = document.getElementById("deck-create-modal");
const cancelBtn = document.getElementById("cancel-btn");//デッキ作成モーダルを閉じるボタン
const createBtn = document.getElementById("create-btn");//新しくデッキを追加するボタン


// =================
// EVENT
// =================


//検索欄の値を取得⇒APIで検索
searchBtn.addEventListener("click", () => searchWordData());

//カード追加モーダルを閉じる
closeCardAddBtn.addEventListener("click", closeCardAddModal);

//検索データのデッキ編の追加
submitCardBtn.addEventListener("click", submitNewCard);

//デッキリストの開閉
addictionToggle.addEventListener("click", renderDeckList);


//閉じているデッキ表示欄を開く
myDecks.addEventListener("click", toggleDeckPanel);


//デッキ作成モーダルを開く
addNewDeckBtn.addEventListener("click", openDeckCreateModal);

//デッキ作成モーダルを閉じる
cancelBtn.addEventListener("click", closeDeckCreateModal);

createBtn.addEventListener("click", () => createDeck(inputDeckName.value));


// =================
// 検索関係
// =================


//入力欄の単語を検索する関数
async function searchWordData() {
  const searchWord = searchInput.value.trim();
  console.log(modalOverlay.classList);
console.log(deckCreateModal.classList);
console.log(cardAddModal.classList);
  if (!searchWord) {
    alert("The search bar is empty.");
    return;
  }

  try {
    const definitionData = await fetchDefinition(searchWord);

    //
    latestSearchWord = definitionData;
    //検索成功後の処理
    renderWordData(definitionData);

    //検索結果を描画
    renderWordData(definitionData);

    //カード追加モーダルを開く
    openCardAddModal();

  } catch(error) {
    console.error("Word search failed:", error);

    if (error.message === "WORD_NOT_FOUND") {
    alert("The word was not found in the dictionary.");
    return;
    }

    if (error.message.startsWith("API_ERROR_")) {
      alert("The dictionary service returned an error.");
      return;
    }

    alert("Could not connect to the dictionary service.");
  } 
}
  
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
 
//APIからデータ取得
async function fetchDefinition(word) {
  const url =
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(url);

      if (response.status === 404) {
        throw new Error("WORD_NOT_FOUND");
      }

      if (!response.ok) {
        throw new Error(`API_ERROR_${response.status}`);
      }

      const data = await response.json();

      const definitionData = [
        data[0].word,//検索した単語
        data[0].phonetics,//発音記号と音声データ(あれば）
        data[0].meanings //意味、同意語、反意語
      ];

      latestSearchWord = definitionData;
      return definitionData;
    } catch (error) {
      lastError = error;

      //404は再試行しても意味が薄い⇒再試行無し
      if (error.message === "WORD_NOT_FOUND") {
        throw error;
      }

      //1回目だけ少し待って再試行
      if (attempt === 1) {
        console.warn("Retrying dictionary request...");
        await wait(700);
      }
    }
  }

  throw lastError;
}


function renderWordData(apiData) {
  audioBtns.innerHTML = ""
  partOfSpeech.innerHTML = "";
  modalDefinition.innerHTML = "";
  let [word, phonetics, meanings] = apiData;

  searchedWord.textContent = word;

  //繰返し処理で発音記号と音声を取得する
  phonetics.forEach((phonetic, index) => {

    //発音記号付きオーディオボタン
    if (!phonetic.text) return;//発音記号が無ければreturn

    const audioBtn = document.createElement("button");
    audioBtn.classList.add("audio-btn");//ボタン作成
    audioBtn.textContent = phonetic.text;//ボタン上に発音記号を表示
    audioBtns.appendChild(audioBtn);

    
    //ボタン上にオーディオボタンを併記
    if (!phonetic.audio) {
      audioBtn.textContent += "🔇";
    } else {
      audioBtn.textContent += "🔊";
    }

    //音声イベント
    audioBtn.addEventListener("click", async () => {
      if (!phonetic.audio) return;

      const audio = new Audio(phonetic.audio);
      
      try {
        await audio.play();
      } catch(error) {
        console.error("Audio playback failed:", error);
        alert("Audio is temporarily unavailable.");        
        audioBtn.textContent = "🔇";
      }      
    });
    
  })//phonetics.forEach{}


  //品詞と表示変更ボタン
  //品詞・definitionの表示
  let currentMeaningIndex = 0;//表示する意味の所属番号
  const totalPages = meanings.length;//意味の総ページ数
  
  //品詞の初期表示
  partOfSpeech.textContent = meanings[currentMeaningIndex].partOfSpeech;

  //definitionの初期表示
  meanings[currentMeaningIndex].definitions.forEach((def) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = def.definition;
    modalDefinition.appendChild(paragraph); 
  })
  
  //目次の初期表示
    tableOfContents.textContent = `${currentMeaningIndex +1} / ${totalPages}`;
  
  
  //currentMeaningIndexの値を変更する（バリデーションを含む）
  function changeCurrentMeaningIndex(direction) {

    currentMeaningIndex = currentMeaningIndex + direction;//ボタンに応じてindexを増減
    //const definition = createDefinitionArea.update(card, currentMeaningIndex);
    //indexが0より小さい場合、現在のindexを最終indexにする。
    if (currentMeaningIndex < 0) {
      currentMeaningIndex = meanings.length -1; 
    }       
    //indexがカードの枚数より大きい場合、現在のindexを0にする。
    if (currentMeaningIndex > meanings.length -1) {
      currentMeaningIndex = 0;   
    }      

    update(currentMeaningIndex);
  }//changeCurrentMeaningIndex()

  //ボタン操作による品詞・definitionの表示変更
  function update(currentMeaningIndex) {
    modalDefinition.innerHTML = "";
    console.log(`update()push ${meanings[currentMeaningIndex].definitions}`);
    
    
    //品詞の表示をindexに従って更新
    partOfSpeech.textContent = meanings[currentMeaningIndex].partOfSpeech;
    
    //目次をindexに従って更新
    tableOfContents.textContent = `${currentMeaningIndex +1} / ${totalPages}`;
  
    //definitionをindexに従って更新
    meanings[currentMeaningIndex].definitions.forEach((def) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = def.definition;
    modalDefinition.appendChild(paragraph); 
    })

    //indexが0の場合にprevボタンを非アクティブ化、そうでなくなった場合にアクティブ化する
    if (currentMeaningIndex === 0) {
      prevMeaningBtn.classList.add("disabled-arrow");
      
    } else {
      prevMeaningBtn.classList.remove("disabled-arrow");
    }

    //indexが対象総数-1の場合にnextボタンを非アクティブ化、そうでなくなった場合にアクティブ化する
    if (currentMeaningIndex === meanings.length -1) {
      nextMeaningBtn.classList.add("disabled-arrow");
      
    } else {
      nextMeaningBtn.classList.remove("disabled-arrow");
    }
  }//update()


  prevMeaningBtn.addEventListener("click", () => changeCurrentMeaningIndex(-1));
  nextMeaningBtn.addEventListener("click", () => changeCurrentMeaningIndex(+1));
    

  //meanings(品詞と意味)の表示
  meanings.forEach((meaning) => {
    partOfSpeech.textContent = meaning.partOfSpeech;
    
    meaning.definitions.forEach(def => {
      const pDefinition = document.createElement("p");
      pDefinition.textContent = def.definition;
      modalDefinition.appendChild(pDefinition);
    })    
  })
}//renderWordData()


// =================
// カード追加モーダル
// =================


//単語追加関係➊
//カード追加モーダルを開く（まだデッキに追加しない）関数
function openCardAddModal() {
  modalOverlay.classList.remove("hidden");
  cardAddModal.classList.remove("hidden");

  deckCreateModal.classList.add("hidden");
}


//単語追加関係➋
//検索した単語データを取得
function getCardData(definitionData) {
    
  const cardData = {
    "word": definitionData[0],
    "phonetics": definitionData[1],
    "meanings":definitionData[2]
  }
  return cardData;
}


//単語追加関係➌
//検索した単語をデッキに加える
function submitNewCard(){ 

  const cardData = getCardData(latestSearchWord);//検索した単語データを受け取る
  const targetDeck = Number(selectedDeck.value);//挿入先デッキのidを取得    
  const cardId = cards.length ? Math.max(...cards.map(card => card.id)) +1 : 0;    
  const newCard = {"id": cardId, "deckId" : targetDeck, ...cardData};

  cards.push(newCard);//カードデータをデッキに入れる
  saveData("flashcard_cards", cards);//ローカルストレージに入れて保存

  //カード追加モーダル欄を空にする
  clearCardAddModal();

  //カード追加モーダルを閉じる
  closeCardAddModal();
  renderDeckList();//表示を更新
  alert("Successfully added a new word.") 

}


//単語追加関係➍
//カード追加モーダル空白にする関数
function clearCardAddModal() {
  searchedWord.value = "";//単語データ
  phonetic.textContent = "";
  partOfSpeech.textContent = "";  
  tableOfContents.textContent = "";
  modalDefinition.textContent = "";//英英訳
}

//単語追加モーダルを閉じる
function closeCardAddModal() {
  modalOverlay.classList.add("hidden");
  cardAddModal.classList.add("hidden");

  clearCardAddModal();
}


// =================
// デッキ関係
// =================


//新規カード追加モーダル内セレクトタグにデッキを表示する（追加先デッキを選択するため）
function renderDeckOptions() {
  selectedDeck.innerHTML = "";
  
  decks.forEach(deck => {
    const optionTag = document.createElement("option");
    optionTag.value = deck.id;
    optionTag.textContent = deck.name;
    selectedDeck.appendChild(optionTag);   
  });
}


//デッキ一覧の▶の表示非表示を切り替える
function toggleDeckPanel() {
  deckPanel.classList.toggle("hidden");
  if (!deckPanel.classList.contains("hidden")) {
    arrow.textContent = "▼ ";
  } else {
    arrow.textContent = "▶ ";
  }
}


//【デッキ作成モーダルを表示する。】
function openDeckCreateModal() {  
  modalOverlay.classList.remove("hidden");
  deckCreateModal.classList.remove("hidden");  

  cardAddModal.classList.add("hidden");
  inputDeckName.focus();

  console.log(cardAddModal.className)
}


//【デッキ作成関数】
function createDeck(name) {

  const ids = decks.map(deck => deck.id);
  //既存デッキのidの値の最も大きい数値+1を新デッキのidとする
  const newDeck = {id : Math.max(...ids) +1, name : name, }
  
  decks.push(newDeck);
  saveData("flashcard_decks", decks);
  renderDeckList();  
  renderDeckOptions();  
  closeDeckCreateModal();
}

//デッキ追加モーダルを閉じる
function closeDeckCreateModal() {
  inputDeckName.value = "";
  console.log("cancel btn clicked")
  modalOverlay.classList.add("hidden");
  deckCreateModal.classList.add("hidden");  
}

// =================
// STORAGE
// =================

//【ローカルストレージからデータを読み込む関数】
function loadData() {
  const savedDecks = 
    JSON.parse(localStorage.getItem("flashcard_decks")) ?? [];  

  const savedCards =
    JSON.parse(localStorage.getItem("flashcard_cards")) ?? [];

  decks = [
    ...defaultDeck,
    ...savedDecks.filter(deck => deck.id !== 0)
  ];

  cards = [
    ...defaultCards,
    ...savedCards.filter(card => card.deckId !== 0)
  ];
  
}

//【ローカルストレージにデータを保存する関数】
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  console.log("save:", key, value)
}

// =================
// RENDER
// =================

//【画面にデッキを一覧表示する関数】
function renderDeckList() {
  deckContainer.innerHTML = "";  

  //デッキにカードがあれば、それらを表示する。 
    decks.forEach(deck => {     
            
      //deckCard
      const deckCard = document.createElement("div");    
      deckCard.classList.add("deck-card");      
      deckCard.dataset.deckId = deck.id;//ローカルストレージに保存されているid
      
      //deck名
      const deckName = document.createElement("h3");   
      deckName.classList.add("deck-name"); 
      deckName.textContent = deck.name;
      deckCard.appendChild(deckName);

      //デッキ内のカード数
      const words = document.createElement("p");      
      words.classList.add("words")
      words.textContent = "Words:";      

      const wordCount = document.createElement("span");
      wordCount.classList.add("word-count");
      words.appendChild(wordCount);
      
      const filteredCards = cards.filter(card => card.deckId === deck.id);
      wordCount.textContent = filteredCards.length;    
      deckCard.appendChild(words);

      //ボタンの親div
      const cardBtns = document.createElement("div");
      cardBtns.classList.add("card-btns");

      //学習ボタン
      const studyBtn = document.createElement("button");
      studyBtn.textContent = "Open";
      studyBtn.classList.add("book-btns");

      //カードがあるか調べて、なければ学習ページを開かない          
      studyBtn.addEventListener("click", ()=> {
        
        const deckCards = cards.filter(card => card.deckId === deck.id); 
        
        if (deckCards.length === 0) {
          alert("This deck has no cards yet.");
          return;
        }      

        location.href = `study.html?deck=${deck.id}`; 
      })

      cardBtns.appendChild(studyBtn);

      //編集ボタン
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.classList.add("book-btns")
      editBtn.addEventListener("click", () => {
        location.href = `edit.html?deck=${deck.id}`;
      })
      cardBtns.appendChild(editBtn);
      deckCard.appendChild(cardBtns);

      deckContainer.appendChild(deckCard);
    })      
}


// =================
// DOMContentLoaded
// =================

document.addEventListener("DOMContentLoaded", ()=> {
  loadData();
  renderDeckList();
  renderDeckOptions();
}
)

