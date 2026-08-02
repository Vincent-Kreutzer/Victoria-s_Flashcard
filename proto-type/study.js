

//ナビゲーションバー内コマンド等

//デッキ名表示欄
const deckNameArea = document.getElementById("deck-name")


//カードのインデックス表示
const cardCounter = document.getElementById("card-counter");

//トップに戻るボタン
const backBtn = document.getElementById("back-btn");

backBtn.addEventListener("click", backToTop);

function backToTop() {
  location.href = "index.html";
}

//localStorageからデータを取得する変数。
let decks = [];
let cards = [];

let deckCards = [];//選択デッキに内包するカード
let currentCardIndex = 0;//現在表示しているカードのindex
let currentCard = null;//現在表示ているカード情報（object)
let isFront = true;//カードの表裏の状態

//参照するデッキ情報を取得する
const params = new URLSearchParams(location.search);
const deckId = Number(params.get("deck"))
let deckName = "";

function displayDeckName() {
  deckName = decks.find(deck => deck.id === deckId).name;
  deckNameArea.textContent = deckName;
}



  


//カードを表示するエリア（ボタン:クリックで表示切り替え ）
const cardDisplay = document.getElementById("card-display");



//表示カード切り替えボタン
const firstCardBtn = document.getElementById("first-card-btn");
const prevCardBtn = document.getElementById("prev-card-btn");
const nextCardBtn = document.getElementById("next-card-btn");
const lastCardBtn = document.getElementById("last-card-btn");

cardDisplay.addEventListener("click", flipCard);
firstCardBtn.addEventListener("click", moveFirstCard);
prevCardBtn.addEventListener("click", movePrevCard);
nextCardBtn.addEventListener("click", moveNextCard);
lastCardBtn.addEventListener("click", moveLastCard);


//画面上に現在の一枚のカードのみを表示する
function renderCards() {    
  //表示用関数にカードを指定して入れる
  currentCard = deckCards[currentCardIndex];
  //indexを元にカードを表示する
  cardDisplay.textContent = currentCard.word;
  cardCounter.textContent = `${currentCardIndex+1} / ${deckCards.length}`;
}

//カードの裏表の表示を切り替える
function flipCard() {  
  isFront = !isFront;
  cardDisplay.textContent = isFront ? currentCard.word : currentCard.meaning;  
  cardDisplay.classList.toggle("back", !isFront);
}

//deckCardsにデッキ内のカード情報を入れる
function makeDeckCards() {
  if (cards) {    
    deckCards = cards.filter(card => card.deckId === deckId)
  } else {
    alert("deckCars have none of cards");
    return;
  }
}

//最初のカードに戻る
function moveFirstCard() {
  currentCardIndex = 0;
  renderCards();
}

//前のカードに戻る
function movePrevCard() {
  if (currentCardIndex === 0) return;
  currentCardIndex --;
  renderCards();
}

//次のカードに移る
function moveNextCard() {
  if (currentCardIndex === deckCards.length -1) return;
  currentCardIndex ++;
  renderCards();
}

//最後のカードに移る
function moveLastCard() {
 currentCardIndex = deckCards.length -1;
 renderCards();
}



document.addEventListener("DOMContentLoaded", () => {
  loadData();
  console.log(cards)
})

// =================
// STORAGE
// =================

//カード全体の情報をlocalStorageから取得してcardsに入れる
function loadData() {
  
  if (localStorage.flashcard_decks) {
    decks = JSON.parse(localStorage.getItem("flashcard_decks"))
  }

  if (localStorage.flashcard_cards) {
    cards = JSON.parse(localStorage.getItem("flashcard_cards"));

  }
  
}
console.log(deckName);
//DOM読み込み時の処理
document.addEventListener("DOMContentLoaded", () => {
  loadData();//ローカルストレージからカード情報取得  
  makeDeckCards();//全カードから選択中のデッキのカードのみ抽出
  displayDeckName();
  renderCards();


})