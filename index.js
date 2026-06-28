// =================
// DATA
// =================

let decks = []
let cards = []
let currentWordData = null;//fetchで取得したデータを保存⇒各変数に割り当てる
let defaultDeck = [
  {id:0, name:"sample-deck"},  
]

let defaultCards = [
  { id: 1, deckId: 0, word: "dog", meaning: "犬" },
  { id: 2, deckId: 0, word: "cat", meaning: "猫" },
  { id: 3, deckId: 0, word: "bird", meaning: "鳥" },
]

//mapでidを抽出して入れる変数
let someIds = [];

// =================
// STATE
// =================

const SCREEN = {
 
}

const TEST = {
  
}

let state = {
  
}

// =================
// DOM取得
// =================

const pageWrapper = document.getElementById("page-wrapper");

//検索欄
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const addNewCardBtn = document.getElementById("add-new-card-btn");

//検索結果表示欄
const searchResult = document.getElementById("search-result");
const enPhonetic = document.getElementById("en-phonetic");
const enDefinition = document.getElementById("en-definition");
const jpTranslation = document.getElementById("jp-translation");


//検索した単語を表示・追加するモーダル
const modalOverlay = document.getElementById("modal-overlay");
const cardAddModal = document.getElementById("card-add-modal");
const addictionToggle = document.getElementById("addiction-toggle");

const inputWord = document.getElementById("input-word");
const inputDefinition = document.getElementById("input-definition");
const inputMeaning = document.getElementById("input-meaning");
const inputPhonetic = document.getElementById("input-phonetic")
const selectedDeck = document.getElementById("select-deck");

const submitCardBtn = document.getElementById("submit-card-btn");
const closeCardAddModalBtn = document.getElementById("close-card-add-modal-btn");


//デッキ操作
const myDecks = document.getElementById("my-decks");
const arrow = document.getElementById("arrow");

const deckPanel = document.getElementById("deck-panel");
const addNewDeckBtn = document.getElementById("add-new-deck-btn");//新規デッキ追加ボタン
const deckContainer = document.getElementById("deck-container");//デッキカード保管場所

const inputDeckName = document.getElementById("input-deckname");

const deckCreateModal = document.getElementById("deck-create-modal");
const cancelBtn = document.getElementById("cancel-btn");
const createBtn = document.getElementById("create-btn");


// =================
// EVENT
// =================


//検索欄の値を取得⇒APIで検索
searchBtn.addEventListener("click", () => searchWordData());

//カード追加モーダルを開く
addNewCardBtn.addEventListener("click", addNewCard);

//カード追加モーダルを閉じる
closeCardAddModalBtn.addEventListener("click", closeCardAddModal);

//検索データのデッキ編の追加
submitCardBtn.addEventListener("click", submitNewCard);

//デッキリストの開閉
addictionToggle.addEventListener("click", renderDeckList);


//閉じているデッキ表示欄を開く
myDecks.addEventListener("click", toggleDeckPanel);


//デッキ作成モーダルを開く
addNewDeckBtn.addEventListener("click", openDeckCreateModal);

cancelBtn.addEventListener("click", closeDeckCreateModal);

createBtn.addEventListener("click", () => createDeck(inputDeckName.value));


//カード追加モーダルを開く（まだデッキに追加しない）関数
function addNewCard() {
  modalOverlay.classList.remove("hidden");
  cardAddModal.classList.remove("hidden");
  pageWrapper.classList.add("hidden");
}


//検索した単語データを取得してモーダルの各欄に入れる関数
function getCardData() {

  cardAddModal.classList.remove("hidden");
  pageWrapper.classList.add("hidden");
  
  const word = inputWord.value.trim();//単語データ
  const phonetic = inputPhonetic.value.trim();//発音記号
  const definition = inputDefinition.value.trim();//英英訳
  const meaning = inputMeaning.value.trim();//和訳
  
  const cardData = {"word": word, "phonetic": phonetic, "definition":definition,  "meaning": meaning,}
  return cardData;
}

  
//検索した単語をモーダルからデッキに加える
function submitNewCard(data){ 

  const cardData = getCardData();//検索した単語データを受け取る
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

//カード追加モーダル空白にする関数
function clearCardAddModal() {
  inputWord.value = "";//単語データ
  inputPhonetic.value = "";//発音記号
  inputDefinition.value = "";//英英訳
  inputMeaning.value = "";//意味
}



//単語追加モーダルを閉じる
function closeCardAddModal() {
  modalOverlay.classList.add("hidden");
  cardAddModal.classList.add("hidden");
  pageWrapper.classList.remove("hidden");
  
}


//単語検索実行関数
function searchWordData() {
    enPhonetic.textContent = "";
    jpTranslation.textContent  = "";
    enDefinition.textContent = "";
    
    //検索欄に値がある場合に、
    if (searchInput.value) {
      const searchWord = searchInput.value.trim();
      inputWord.value = searchWord;

      //APIから情報取得、結果をまとめて受け取る形
      Promise([        
        fetchDefinition(searchWord)
      ])
        .then(results => {
          renderWordData(results[0],results[1])  
        })
      

      addNewCardBtn.classList.remove("hidden");//デッキに追加ボタン表示
      searchResult.classList.remove("hidden");//検索結果表示欄表示      
    } else {
      alert("The search bar is empty.");
     return;
    }   
}

/*
英英辞典先鋭化のため、削除
//日本語訳取得
function fetchJapanese(word) {  
  return fetch(`https://api.mymemory.translated.net/get?q=${word}&langpair=en|ja`)          
  .then(response => response.json())
  .then(data => {
    console.log(data.responseData.translatedText);
    const translatedData = data.responseData.translatedText;
    return translatedData;
   })  
}
*/
 
//英英翻訳・品詞・発音取得
function fetchDefinition(word) {
  return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(response =>  response.json())
    .then(data => {  
       //APIから取得したデータのうち、使えるものをざっくり取り出す。
      const definitionData = [
        data[0].word,//検索した単語
        data[0].phonetics,//発音記号と音声データ(あれば）
        data[0].meanings //意味、同意語、反意語
      ];
      console.log("definitionData includes = ", definitionData);   
      return definitionData;
    })  
  }


//DOM更新
function renderWordData(translatedData, definitionData) {
  
    jpTranslation.textContent = translatedData;//検索結果の日本語訳表示欄に入れる
    inputMeaning.value = jpTranslation.textContent;//モーダルの日本語訳表示欄に入れる
      
    enPhonetic.textContent = definitionData[0];
    inputPhonetic.value = enPhonetic.textContent;

    enDefinition.textContent = definitionData[1];         
    inputDefinition.value = enDefinition.textContent; 
}



//モーダル欄更新

function fillCardModal(data) {}

//セレクトタグにデッキを表示する
function renderDeckOptions() {
  //ローカルストレージからデッキ情報を取得して、デッキ数だけオプションタグを増やす。
  const decks = JSON.parse(localStorage.getItem("flashcard_decks"));
  decks.forEach(deck => {
    const optionTag = document.createElement("option");
    optionTag.value = deck.id;
    optionTag.textContent = deck.name;
    selectedDeck.appendChild(optionTag);   
  })
}



function toggleDeckPanel() {
  deckPanel.classList.toggle("hidden");
  if (!deckPanel.classList.contains("hidden")) {
    arrow.textContent = "▼ ";
  } else {
    arrow.textContent = "▶ ";
  }
}

//【+New Deckボタンを押すことでデッキ名入力欄を出現させる。】
function openDeckCreateModal() {  
  pageWrapper.classList.add("hidden");
  modalOverlay.classList.remove("hidden");
  deckCreateModal.classList.remove("hidden");
  
  inputDeckName.focus();
}

//デッキ追加モーダルを閉じる
function closeDeckCreateModal() {
  modalOverlay.classList.add("hidden");
  deckCreateModal.classList.add("hidden");
  pageWrapper.classList.remove("hidden");
}

//【デッキ作成関数】
function createDeck(name) {
  console.log(name);
  console.log(typeof name);
  //decksに値が一つでもあればsomeIdsにidを抽出して入れる。
  if (decks.length) {    
    //存在するidを抜き出して配列に入れる。
    someIds = decks.map(deck => deck.id); 
  } else { 
    someIds = [-1] //既存デッキが無ければ配列に-1を入れる。
  }
  //既存デッキのidの値の最も大きい数値+1を新デッキのidとする
  const newDeck = {id : Math.max(...someIds) +1, name : name, }
  decks.push(newDeck);
  console.log(newDeck);  
  saveData("flashcard_decks", decks);
  renderDeckList();  
  closeDeckCreateModal();
}




// =================
// STORAGE
// =================

//【ローカルストレージからデータを読み込む関数】
function loadData() {
  if (localStorage.flashcard_decks) 
    decks = JSON.parse(localStorage.getItem("flashcard_decks"));
  

  if (localStorage.flashcard_cards) 
    cards = JSON.parse(localStorage.getItem("flashcard_cards"));
  
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
  if (decks.length > 0) {
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
      studyBtn.textContent = "Study";
      studyBtn.addEventListener("click", ()=> {
        location.href = `study.html?deck=${deck.id}`; 
      })
      cardBtns.appendChild(studyBtn);

      //編集ボタン
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => {
        location.href = `edit.html?deck=${deck.id}`;
      })
      cardBtns.appendChild(editBtn);
      deckCard.appendChild(cardBtns);

      deckContainer.appendChild(deckCard);
    })  
    //デッキが一つもなければ仮のデッキを表示する。
  } else {

      defaultDeck.forEach(deck => {

        console.log(deck);
        console.log(deck.name);
        //deckCard(各カードの一番外側のdiv)作成
        const deckCard = document.createElement("div");
        deckCard.dataset.deckId = deck.id;//デッキIDをカスタムデータとして持たせる
      
        //デッキ名タグ
        const deckName = document.createElement("h3");     
        deckName.classList.add("deck-name");
        deckName.textContent = deck.name;
        deckCard.appendChild(deckName);  

        //デッキ内のカード数                    
        const words = document.createElement("p");      
        words.classList.add("words")
        words.textContent = "Words: ";      

        const wordCount = document.createElement("span");
        wordCount.classList.add("word-count");
        words.appendChild(wordCount);
        
        const filteredCards = cards.filter(card => card.deckId === deck.id);
        wordCount.textContent = filteredCards.length;    
        deckCard.appendChild(words);

        //学習ページリンク
        const studyBtn = document.createElement("button");
        studyBtn.textContent = "Study";
        studyBtn.addEventListener("click", ()=> {
          location.href = `study.html?deck=${deck.id}`;            
        })
        deckCard.appendChild(studyBtn);

        //編集ページリンク
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => {
          location.href = `edit.html?deck=${deck.id}`;
        })
      deckCard.appendChild(editBtn);

      deckContainer.appendChild(deckCard);    
    })

  }
}

function renderCards() {}

// =================
// EDIT
// =================


function updateCard() {}
function deleteCard() {}

// =================
// STUDY
// =================

function nextCard() {}
function prevCard() {}
function flipCard() {}


// =================
// DOMContentLoaded
// =================

document.addEventListener("DOMContentLoaded", ()=> {
  loadData();
  renderDeckList();
  renderDeckOptions();
}
)

