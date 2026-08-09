

//===========================
//DOM取得ほかグローバル変数定義
//===========================


let defaultDeck = [
  { id: 0, name: "sample-deck" }
];

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

//localStorageからデータを取得する変数。
let decks = [];
let cards = [];

//ナビゲーションバー内コマンド等
//デッキ名表示欄
const deckNameArea = document.getElementById("deck-name")

//カードのインデックス表示
const cardCounter = document.getElementById("card-counter");

//トップに戻るボタン
const backBtn = document.getElementById("back-btn");



let deckCards = [];//選択デッキに内包するカード
let currentCardIndex = 0;//現在表示しているカードのindex
let currentCard = null;//現在表示ているカード情報（object)
let isFront = true;//カードの表裏の状態

//参照するデッキ情報を取得する
const params = new URLSearchParams(location.search);
const deckId = Number(params.get("deck"))
let deckName = "";


//カードを表示するエリア（ボタン:クリックで表示切り替え ）
const cardDisplay = document.getElementById("card-display");
const frontArea = document.getElementById("front-area"); 
const word = document.getElementById("word")
const phonetics = document.getElementById("phonetics");

const backArea = document.getElementById("back-area");
const meaningNavigation = document.getElementById("meaning-navigation");
let partOfSpeech = document.getElementById("part-of-speech");
const prevMeaningBtn = document.getElementById("prev-meaning-btn");
const nextMeaningBtn = document.getElementById("next-meaning-btn");
const meaningPage = document.getElementById("meaning-page");
let definitions = document.getElementById("definitions");
const wrapper = document.getElementById("definitions-wrapper");

let currentMeaningIndex = 0;//現在表示中のmeaningsのインデックス

//表示カード切り替えボタン
const firstCardBtn = document.getElementById("first-card-btn");
const prevCardBtn = document.getElementById("prev-card-btn");
const nextCardBtn = document.getElementById("next-card-btn");
const lastCardBtn = document.getElementById("last-card-btn");


//=======================
//関数定義とイベント付与
//=======================

//トップに戻る関数
function backToTop() {
  location.href = "../html/top.html";
}

//デッキ名を取得して表示する
function displayDeckName() {
  deckName = decks.find(deck => deck.id === deckId).name;
  deckNameArea.textContent = deckName;
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

//各タグにデータをいれ、表示する
function renderCards() {    
  
  //表示用関数にカードを指定して入れる
  currentCard = deckCards[currentCardIndex];
  console.log("currentCard contains " + currentCard);


  //各表示欄を初期化
  word.textContent = "";
  
  partOfSpeech.textContent = "";
  definitions.textContent = "";


  //単語データを入れる
  word.textContent = currentCard.word;

  //発音記号・オーディオボタンを表示（表面）する繰返し処理 

  phonetics.innerHTML = "";//繰り返す前に要素を更新しておく
  currentCard.phonetics.forEach((phonetic,index) => {
    
    //音声ボタンを作成する
    let audioBtn = document.createElement("button");
    audioBtn.classList.add("audio-btn");//クラス付与
    audioBtn.dataset.index = index;//データセット付与
    audioBtn.textContent = phonetic.text;
    phonetics.appendChild(audioBtn);//親要素に追加
    
    if (phonetic.audio === "") {
      audioBtn.textContent += "🔇";
    } else {
      audioBtn.textContent += "🔊";
    }
        
    audioBtn.addEventListener("click", (e) => {
      e.stopPropagation();//イベントの伝播阻止
      let idx = e.target.dataset.index;//押されたボタンのindex番号を取得
      let target = currentCard.phonetics[Number(idx)].audio;//音声URLを取得
      if (target === "") return;
      playAudio(target);//URLを関数に渡して実行
    })
  });

  
  //品詞・definitionを表示（裏面）する、初期設定ではindex[0]の内容を表示、ボタンで項目を切り替え
  console.log("partofspeechの値" + currentCard.meanings[currentMeaningIndex].partOfSpeech)
  partOfSpeech.textContent = currentCard.meanings[currentMeaningIndex].partOfSpeech;
    
  currentCard.meanings[currentMeaningIndex].definitions.forEach((definition, index) => {
    definitions.textContent += definition.definition;
  })
  
  //現在の品詞・意味のページ番号と総ページ数を表示
  meaningPage.textContent = `${currentMeaningIndex+1} / ${currentCard.meanings.length}`

  //現在表示中のカードのNo. / カード総数を表示する
  cardCounter.textContent = `${currentCardIndex+1} / ${deckCards.length}`;

  //矢印ボタンのアクティブ化・非アクティブ化
  updateArrowState();
  updateDefinitionFade();

}//renderCards()ここまで

definitions.addEventListener("scroll", updateDefinitionFade);

function updateDefinitionFade() {
  const needScroll = definitions.scrollHeight > definitions.clientHeight; 

  const isBottom = 
  definitions.scrollTop + definitions.clientHeight >= 
  definitions.scrollHeight - 1;

  if (!needScroll || isBottom) {    
    wrapper.classList.add("hide-fade");
  } else {
    wrapper.classList.remove("hide-fade");
  }
};

//スピーカーマークの発声関数
async function playAudio(url) {
  const audio = new Audio(url);

  try {
    await audio.play();
  } catch (error) {
    console.error("Audio playback failed:", error);
    alert("Audio is temporarily unavailable.");
  }  
}

//カードの裏表の表示を切り替える
function flipCard() {  
  console.log("clicked");
  isFront = !isFront;//カードの反転を行う
  console.log(isFront);
  //初期値としてmeanings[0]の品詞とdefinitionを表示する
  if (isFront) {
    cardDisplay.classList.remove("flipped");
  } else {
    cardDisplay.classList.add("flipped");
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
  currentMeaningIndex = 0;
  currentCardIndex --;
  renderCards();
}

//次のカードに移る
function moveNextCard() {  
  if (currentCardIndex === deckCards.length -1) return;
  currentMeaningIndex = 0;
  currentCardIndex ++;
  renderCards();
}

//最後のカードに移る
function moveLastCard() {
  currentCardIndex = deckCards.length -1;
  renderCards();
}

//prev/nextボタン非アクティブ化の状態表示関数
function updateArrowState() {
  //indexが0の場合にprevボタンを非アクティブ化、そうでなくなった場合にアクティブ化する
  if (currentMeaningIndex === 0) {
    prevMeaningBtn.classList.add("disabled-arrow");
  } else {
    prevMeaningBtn.classList.remove("disabled-arrow");
  }
  //indexが対象総数-1の場合にnextボタンを非アクティブ化、そうでなくなった場合にアクティブ化する
  if (currentMeaningIndex === currentCard.meanings.length -1) {
    nextMeaningBtn.classList.add("disabled-arrow");
  } else {
    nextMeaningBtn.classList.remove("disabled-arrow");
  }

  //indexが0の場合にprevボタンを非アクティブ化、そうでなくなった場合にアクティブ化する
   if (currentCardIndex === 0) {
    prevCardBtn.classList.add("disabled-arrow");
    firstCardBtn.classList.add("disabled-arrow");
  } else {
    prevCardBtn.classList.remove("disabled-arrow");
    firstCardBtn.classList.remove("disabled-arrow");
  }

  //indexが対象総数-1の場合にnextボタンを非アクティブ化、そうでなくなった場合にアクティブ化する
  if (currentCardIndex === deckCards.length -1) {
    nextCardBtn.classList.add("disabled-arrow");
    lastCardBtn.classList.add("disabled-arrow");
  } else {
    nextCardBtn.classList.remove("disabled-arrow");
    lastCardBtn.classList.remove("disabled-arrow");
  }
}


backBtn.addEventListener("click", backToTop);

//カード内戻るボタンのイベント付与と関数
prevMeaningBtn.addEventListener("click", (e) => {
  e.stopPropagation();//イベントの伝播を防ぐ！
  if (currentMeaningIndex === 0) return;//現在のindexが0ならreturn  
      
  currentMeaningIndex --;
  renderCards();
  console.log("currentMeaningIndex is " + currentMeaningIndex);
});


//カード内進むボタンのイベント付与と関数
nextMeaningBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  //現在のインデックスが最終ならreturn
  if (currentMeaningIndex === currentCard.meanings.length-1) return;    
  currentMeaningIndex ++;
  renderCards();
  console.log("currentMeaningIndex is " + currentMeaningIndex);
});

cardDisplay.addEventListener("click", flipCard);
firstCardBtn.addEventListener("click", moveFirstCard);
prevCardBtn.addEventListener("click", movePrevCard);
nextCardBtn.addEventListener("click",moveNextCard);
lastCardBtn.addEventListener("click", moveLastCard);


// =================
// STORAGE
// =================

//カード全体の情報をlocalStorageから取得してcardsに入れる
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

console.log(deckName);
//DOM読み込み時の処理
document.addEventListener("DOMContentLoaded", () => {
  loadData();//ローカルストレージからカード情報取得  
  makeDeckCards();//全カードから選択中のデッキのカードのみ抽出
  displayDeckName();
  if (deckCards.length === 0) {
    alert("This deck has no cards yet.");
    location.href = "../html/top.html";
    return;
  }
  
  renderCards();


})