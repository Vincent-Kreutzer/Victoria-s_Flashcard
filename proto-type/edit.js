
//ローカルストレージとデッキ情報のやり取りをする
let decks = [];

//ローカルストレージからカード情報を受け取って入れる。最初は仮の初期データを格納
let cards = [
  { id: 1, deckId: 0, word: "temporal", meaning: "仮" },
  { id: 2, deckId: 0, word: "cat", meaning: "猫" },
  { id: 3, deckId: 0, word: "bird", meaning: "鳥" },
];

let editingCardId = null; //編集カードのidを入れる
let sortMode = null;//カード一覧の並び替えの切り替えに使う

//カード一覧に表示するカードのデッキ情報
let currentDeck = {id:0, name:"sample-deck"};

//ページ遷移時に渡されたデータを受け取る
const params = new URLSearchParams(location.search);
const currentDeckId = Number(params.get("deck"));//渡されたデッキidを取得


//デッキ削除ボタンDOM
const deleteDeckBtn = document.getElementById("delete-deck");

//バックボタンDOM
const backBtn = document.getElementById("back-btn");

//デッキ関係DOM
const deckName = document.getElementById("deck-name");
const renameDeckBtn = document.getElementById("rename-deck-btn");
const renameDeckArea = document.getElementById("rename-deck-area");
const inputDeckname = document.getElementById("input-deckname");
const confirmDeckRenameBtn = document.getElementById("confirm-deckrename-btn");
const cancelDeckRenameBtn = document.getElementById("cancel-deckrename-btn");


//トップへ戻るボタンイベント追加
backBtn.addEventListener("click", backToTop);

//トップへ戻る関数
function backToTop() {
  location.href = "index.html";
}

//デッキ名表示欄に編集中のデッキ名を表示する
function showEditingDeck() {
  //ローカルストレージから取得したデッキ情報を元に、渡されたデッキ情報に合致するデッキを表示する
    currentDeck = decks.find(deck => deck.id === currentDeckId);
  deckName.textContent = currentDeck.name;
}

//デッキリネームエリアの開閉を行うイベント
renameDeckBtn.addEventListener("click", toggleRenameDeckArea);

//デッキリネームエリアの開閉を行う関数
function toggleRenameDeckArea() {
  deckName.classList.toggle("hidden");
  renameDeckBtn.classList.toggle("hidden");
  inputDeckname.value = currentDeck.name;//入力欄に現在の名前を入れておく
  renameDeckArea.classList.toggle("hidden");
}

//デッキ名変更を確定するイベント
confirmDeckRenameBtn.addEventListener("click", confirmDeckRename);

//デッキ名変更を確定する関数
function confirmDeckRename() {
  if (inputDeckname.value === "") {
    alert("Please enter a deck name.");
    return
  }
  
  //デッキの入力値を取得
  const renameValue = inputDeckname. value;
  //編集中のデッキ名を書き換える
  currentDeck.name = renameValue;
  //ローカルストレージに保存
  saveData("flashcard_decks", decks);
  showEditingDeck();
  toggleRenameDeckArea();
}


//テーブル関係DOM
const cardTable = document.getElementById("card-table");
const tableBody = document.getElementById("table-body");

//【新規カード追加関係DOM】
const addCardBtn = document.getElementById("add-card-btn");
const addCardArea = document.getElementById("add-card-area");
const wordInput = document.getElementById("word-input");
const meaningInput = document.getElementById("meaning-input")
const submitCardBtn = document.getElementById("submit-card-btn");//新規カード追加確定
const updateCardBtn = document.getElementById("update-card-btn");//カード編集確定
const cancelAddBtn = document.getElementById("cancel-add-btn");


//デッキを削除するイベント
deleteDeckBtn.addEventListener("click", () => {
  const result = confirm("Are you sure you want to delete this deck? This will also delete all cards in this deck.");
  if (result) {
    deleteDeck();
    backToTop();
  }
})

//【デッキを削除する関数】
function deleteDeck() {

  //decksに対し削除対象以外を抜き出して新たな配列を作り、それを元の変数に代入することで参照先を変更する
  const newDecks = decks.filter(deck => deck.id !== currentDeck.id);
  decks = newDecks;
  saveData("flashcard_decks", decks);  

  //削除デッキのdeckIdを持つカードを検索して、それ以外のカードを抽出、cardsに上書きする
  const newCards = cards.filter(card => card.deckId !== currentDeck.id);
  cards = newCards;
  saveData("flashcard_cards", cards);

}

//デッキ名変更イベント付与
renameDeckBtn.addEventListener("click", renameDeck);

function renameDeck() {
  //デッキ名表示欄の名前を取得
  //名前表示欄を隠して、代わりに入力欄を設け、そこに現在のデッキ名を入れる。
  //別の名前を入力し、決定ボタンを押すことで改名が完了する。
  //確定したら、名前表示欄をon,入力欄と決定ボタン、キャンセルボタンを隠す。
}


//デッキ内カードを一覧表示する
function renderCards() {
  console.log("render using", cards);
  tableBody.innerHTML = "";
 
  //cardsから対象カードのみを抽出する
  let deckCards = cards.filter(card => card.deckId === currentDeckId);

  if (sortMode === "az") {
    deckCards.sort((a,b) => a.word.localeCompare(b.word))
  }

  //抽出したカードを一覧表示する
  deckCards.forEach((card,index) => {
    const cardTr = document.createElement("tr");

    
    const numTd = document.createElement("td");
    numTd.textContent = index +1;
    cardTr.appendChild(numTd);

    const wordTd = document.createElement("td");
    wordTd.textContent = card.word;
    cardTr.appendChild(wordTd);

    const meaningTd = document.createElement("td");
    meaningTd.textContent = card.meaning;
    cardTr.appendChild(meaningTd);

    const editTd = document.createElement("button");
    editTd.textContent = "Edit";
    editTd.dataset.action = "edit";
    editTd.dataset.cardId = card.id;
    cardTr.appendChild(editTd);

    const deleteTd = document.createElement("button");
    deleteTd.textContent = "Delete";
    deleteTd.dataset.action = "delete";
    deleteTd.dataset.cardId = card.id;
    cardTr.appendChild(deleteTd);

    tableBody.appendChild(cardTr);
  })
  
}

addCardBtn.addEventListener("click", toggleAddCardForm);
cancelAddBtn.addEventListener("click", toggleAddCardForm);
submitCardBtn.addEventListener("click", addNewCard);
updateCardBtn.addEventListener("click", updateCard);


//新規入力フォームの開閉を行う
function toggleAddCardForm() {
  addCardArea.classList.toggle("hidden"); 
}

//入力欄を空にする関数
function clearCardForm() {
  wordInput.value = "";
  meaningInput.value = "";
  wordInput.focus();
}

//フォームに入力された新規カード情報を登録する
function addNewCard() {
  //既存カードのidを取得して配列を作る
  const idsInDeck = cards.map(card => card.id)
  //新規カードに付けるidをあらかじめ作成
  const newId = Math.max(...idsInDeck) +1;
  //新規カード情報をオブジェクトとして取得
  const newCard = {id: newId, deckId: currentDeckId, word: wordInput.value, meaning: meaningInput.value};
  cards.push(newCard);
  saveData("flashcard_cards", cards);
  renderCards();
  clearCardForm();
}


//カード削除・編集イベント:親要素にイベント付与
cardTable.addEventListener("click", (e) => {
  //イベントが起こった子要素取得
  const eventTarget = e.target.closest("[data-card-id]");  
  
  if (!eventTarget) return;//変数に値が無ければその先に進んでエラーになるのを防ぐ
    

  //削除イベント：ターゲットにあるデータセットアクションの値がdeleteだった場合に以下の処理を行う
  if (eventTarget.dataset.action === "delete") {         
    deleteCard(eventTarget);    
    saveData("flash_cards", cards);
    renderCards();
  }
  
  //編集イベント：ターゲットにあるデータセットアクションの値がeditだった場合に以下の処理を行う
  if (eventTarget.dataset.action === "edit") {
    startEdit(eventTarget);

  }
});


//カード一枚を削除する関数
function deleteCard(eventTarget) {  
  const result = confirm("Are you sure you want to delete this card?");  
  if (result) {
    //filterで抽出する
    const newCards = cards.filter(card => card.id !== Number(eventTarget.dataset.cardId));
    
    //元の配列に再代入する
    cards = newCards; 
    console.log("delete using", cards)
    saveData("flashcard_cards", cards)    
  }
}


//カード編集を開始する関数
function startEdit(eventTarget) {
  //編集ボタン押す⇒ボタンのカスタムデータと対応するidのカードを取得
  const targetData =  cards.find(card => card.id === Number(eventTarget.dataset.cardId));
  
  //⇒入力欄を表示して入力欄に既存のカードデータを入れる。
  addCardArea.classList.remove("hidden");  
  wordInput.value = targetData.word;
  meaningInput.value = targetData.meaning;
  editingCardId = targetData.id;

  //新規追加系ボタンを隠してupdateボタンを表示する
  addCardBtn.classList.add("hidden");
  submitCardBtn.classList.add("hidden");
  updateCardBtn.classList.remove("hidden");
  
  //入力欄にカーソル合わせる
  wordInput.focus();
}


//カード編集を完了する関数：updateボタンを押した挙動
function updateCard() {
  if (editingCardId !== null) {

    //editingCardIdの値を元に、該当データを取得
    const targetData = cards.find(card => card.id === Number(editingCardId));

    //入力欄の値を取得
    const name = wordInput.value;
    const meaning = meaningInput.value;

    //ローカルストレージに上書きする
    targetData.word = name;
    targetData.meaning = meaning;
  

    //配列再読み込みと表示
    saveData("flashcard_cards", cards);
    renderCards();
    

    //入力欄をクリア/editingCardIdをnullに戻す
    clearCardForm();
    editingCardId = null;
    
    //ボタンをupdateからaddに戻す
    updateCardBtn.classList.add("hidden");
    submitCardBtn.classList.remove("hidden");
    
    //入力欄を隠す
    addCardArea.classList.add("hidden");
  }    
}
  
    


//並び替えボタンDOM
const sortByAz = document.getElementById("sort-by-az");

//並べ替えイベント：親要素にイベント付与
sortByAz.addEventListener("click", sortCards);

//並べ替え関数:状態を変えるだけ
function sortCards() {
  if (sortMode === null) {
    sortMode = "az";
  } else {
    sortMode = null;
  }
  renderCards();
}


// =================
// STORAGE
// =================

//ローカルストレージからデータを取り出す
function loadData() {
  if (localStorage.flashcard_decks) 
    decks = JSON.parse(localStorage.getItem("flashcard_decks"));

  if (localStorage.flashcard_cards) {
    cards = JSON.parse(localStorage.getItem("flashcard_cards"));

  } else {

    cards = [
      { id: 1, deckId: 0, word: "dog", meaning: "犬" },
      { id: 2, deckId: 0, word: "cat", meaning: "猫" },
      { id: 3, deckId: 0, word: "bird", meaning: "鳥" }
    ];
  }
}

//ローカルストレージにデータを保存する
function saveData(key, value) {  
  localStorage.setItem(key, JSON.stringify(value));    
}


document.addEventListener("DOMContentLoaded", ()=> {
  
  loadData(),
  showEditingDeck();
  renderCards();
  console.log("cards contains", cards)
})


