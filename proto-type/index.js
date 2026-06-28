// =================
// DATA
// =================

let decks = []

let defaultDeck = [
  {id:0, name:"sample-deck"},  
]

let cards = []

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
// UI
// =================

const tBody = document.getElementById("table-body");

const newDeckBtn = document.getElementById("newdeck-btn");
const inputDeckName = document.getElementById("input-deckname");
const addBtn = document.getElementById("add-btn");
const cancelBtn = document.getElementById("cancel-btn");

// =================
// EVENT
// =================

//【+New Deckボタンを押すことで詳細入力欄を出現させる。】
function openCreateDeck() {  
  newDeckBtn.classList.add("hidden");
  inputDeckName.classList.remove("hidden");
  addBtn.classList.remove("hidden");
  cancelBtn.classList.remove("hidden");
  inputDeckName.focus();
}

//【デッキ作成関数】
function createDeck(name) {
  //decksに値が一つでもあればsomeIdsにidを抽出して入れる。
  if (decks.length) {
    //存在するidを抜き出して配列に入れる。
    someIds = decks.map(deck => deck.id); 
  } else { 
    someIds = [-1]  
  }
    
  const newDeck = {id : Math.max(...someIds) +1, name : name, }
  newDeck.textContent = inputDeckName.value;
  decks.push(newDeck);
  console.log(newDeck);
  hideCreateDeck();
  saveData("flashcard_decks", decks);
  renderDeckList();  
}

//【デッキ作成ボタンを再度表示する関数】
function hideCreateDeck() {
  newDeckBtn.classList.remove("hidden");
  inputDeckName.classList.add("hidden");
  inputDeckName.value = "";
  addBtn.classList.add("hidden");
  cancelBtn.classList.add("hidden");
}

newDeckBtn.addEventListener("click", openCreateDeck);
addBtn.addEventListener("click", () => createDeck(inputDeckName.value));
cancelBtn.addEventListener("click", hideCreateDeck);

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
  tBody.innerHTML = "";
  //デッキにカードがあれば、それらを表示する。
  if (decks.length > 0) {
    decks.forEach(deck => {
      const tr = document.createElement("tr");
      
      tr.dataset.deckId = deck.id;//デッキIDをカスタムデータとして持たせる
      
      //デッキ名
      const deckTd = document.createElement("td");     
      deckTd.textContent = deck.name;
      tr.appendChild(deckTd);  

      //デッキ内のカード数
      const wordsTd = document.createElement("td");
      const filteredCards = cards.filter(card => card.deckId === deck.id);
      wordsTd.textContent = filteredCards.length;    
      tr.appendChild(wordsTd);

      //学習ページリンク

      const studyBtn = document.createElement("button");
      studyBtn.textContent = "Study";
      studyBtn.addEventListener("click", ()=> {
        location.href = `study.html?deck=${deck.id}`; 
      })
      tr.appendChild(studyBtn);

      //編集ページリンク
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => {
        location.href = `edit.html?deck=${deck.id}`;
      })
      tr.appendChild(editBtn);

      tBody.appendChild(tr); 

    })  
    //デッキが一つもなければ仮のデッキを表示する。
  } else {

      defaultDeck.forEach(deck => {

      const tr = document.createElement("tr");
      
      tr.dataset.deckId = deck.id;//デッキIDをカスタムデータとして持たせる
      
      //デッキ名
      const deckTd = document.createElement("td");     
      deckTd.textContent = deck.name;
      tr.appendChild(deckTd);  

      //デッキ内のカード数
      const wordsTd = document.createElement("td");
      wordsTd.textContent = defaultCards.filter(card => card.deckId === deck.id).length;    
      tr.appendChild(wordsTd);

      //学習ページリンク
      const studyBtn = document.createElement("button");
      studyBtn.textContent = "Study";
      studyBtn.addEventListener("click", ()=> {
        location.href = `study.html?deck=${deck.id}`; 
      })
      tr.appendChild(studyBtn);

      //編集ページリンク
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => {
        location.href = `edit.html?deck=${deck.id}`;
      })
      tr.appendChild(editBtn);

      tBody.appendChild(tr);    
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
}
)

