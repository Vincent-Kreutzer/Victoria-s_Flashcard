
//=================
//DOM取得
//=================


let decks = [];//ローカルストレージとデッキ情報のやり取りをする配列
let latestSearchData = null;//最新の検索データを保持する変数
//ローカルストレージからカード情報を受け取って入れる。最初は仮の初期データを格納
let cards = [
  { id: 1, deckId: 0, word: "temporal", meaning: "仮" },
  { id: 2, deckId: 0, word: "cat", meaning: "猫" },
  { id: 3, deckId: 0, word: "bird", meaning: "鳥" },
];

let editingCardId = null; //編集カードのidを入れる
let sortMode = null;//カード一覧の並び替えの切り替えに使う

//カード一覧に表示するカードのデッキ情報
let currentDeck = { id: 0, name: "sample-deck" };

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


//テーブル関係DOM
const cardContainer = document.getElementById("card-container");

//【新規カード追加関係DOM】
const addCardBtn = document.getElementById("add-card-btn");
const cardEditModal = document.getElementById("card-edit-modal");
const cardEditArea = document.getElementById("card-edit-area");
const searchWordBtn = document.getElementById("search-word-btn");//検索ボタン

const wordInput = document.getElementById("word-input");
const phoneticArea = document.getElementById("phonetic-area");
const modalDefinitionArea = document.getElementById("modal-definition-area");

const submitCardBtn = document.getElementById("submit-card-btn");//新規カード追加確定
const updateCardBtn = document.getElementById("update-card-btn");//カード編集確定
const cancelAddBtn = document.getElementById("cancel-add-btn");


//並び替えボタンDOM
const sortByAz = document.getElementById("sort-by-az");



//============
//イベント定義
//============

//トップへ戻るボタンイベント追加
backBtn.addEventListener("click", backToTop);

//デッキリネームエリアの開閉を行うイベント
renameDeckBtn.addEventListener("click", toggleRenameDeckArea);

//デッキ名変更を確定するイベント
confirmDeckRenameBtn.addEventListener("click", confirmDeckRename);

//検索した単語の情報を取得するイベント
searchWordBtn.addEventListener("click", searchWordData);

//デッキを削除するイベント
deleteDeckBtn.addEventListener("click", () => {
  const result = confirm("Are you sure you want to delete this deck? This will also delete all cards in this deck.");
  if (result) {
    deleteDeck();
    backToTop();
  }
})

//デッキ名変更イベント付与
renameDeckBtn.addEventListener("click", renameDeck);

addCardBtn.addEventListener("click", toggleAddCardForm);
cancelAddBtn.addEventListener("click", toggleAddCardForm);
submitCardBtn.addEventListener("click", addNewCard);
updateCardBtn.addEventListener("click", updateCard);


//並べ替えイベント：親要素にイベント付与
sortByAz.addEventListener("click", sortCards);


//============
//関数定義
//============


//================
//画面上部メニュー
//================

//トップへ戻る関数
function backToTop() {
  location.href = "index.html";
}

//デッキ名表示欄に編集中のデッキ名を表示する
function showEditingDeck() {
  //ローカルストレージから取得したデッキ情報を元に、渡されたデッキ情報に合致するデッキを表示する
  currentDeck = decks.find(deck => deck.id === currentDeckId);

  console.log(`currentDeckId is ${currentDeckId}`);
  console.log(typeof currentDeckId)
  console.log(`decks is ${decks}`);
  deckName.textContent = currentDeck.name;
}

//デッキリネームエリアの開閉を行う関数
function toggleRenameDeckArea() {
  deckName.classList.toggle("hidden");
  renameDeckBtn.classList.toggle("hidden");
  inputDeckname.value = currentDeck.name;//入力欄に現在の名前を入れておく
  renameDeckArea.classList.toggle("hidden");
}

//デッキ名変更を確定する関数
function confirmDeckRename() {
  if (inputDeckname.value === "") {
    alert("Please enter a deck name.");
    return
  }

  //デッキの入力値を取得
  const renameValue = inputDeckname.value;
  //編集中のデッキ名を書き換える
  currentDeck.name = renameValue;
  //ローカルストレージに保存
  saveData("flashcard_decks", decks);
  showEditingDeck();
  toggleRenameDeckArea();
}


//デッキを削除する関数
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


function renameDeck() {
  //デッキ名表示欄の名前を取得
  //名前表示欄を隠して、代わりに入力欄を設け、そこに現在のデッキ名を入れる。
  //別の名前を入力し、決定ボタンを押すことで改名が完了する。
  //確定したら、名前表示欄をon,入力欄と決定ボタン、キャンセルボタンを隠す。
}




//デッキ内カードを一覧表示する関数(各カードは['単語名', [phonetics], [meanings]]をもつ)
function renderCard() {
console.log("render実行");
  cardContainer.innerHTML = "";//表示データの重複を防ぐために冒頭で毎回白紙化する

  //cardsから当該デッキに属するカードのみを抽出し、ここを表示対象とする
  let deckCards = cards.filter(card => card.deckId === currentDeckId);

  if (sortMode === "az") {
    deckCards.sort((a, b) => a.word.localeCompare(b.word))
  }


  //抽出したカードを一覧表示する、cardは複数のデータを有するオブジェクト
  deckCards.forEach((card, index) => {

    const wordCard = document.createElement("div");//各カードの一番外側のdiv
    wordCard.classList.add("word-card");//クラスを付与

    //=====表示番号=====
    const cardNum = document.createElement("p")
    cardNum.textContent = "No. " + (index + 1);
    wordCard.appendChild(cardNum);


    //=====単語=====
    const divWord = document.createElement("div");
    divWord.classList.add("div-word");
    divWord.classList.add("info-group");

    const wordValue = document.createElement("p");
    wordValue.textContent = card.word;
    wordValue.classList.add("word-title");
    divWord.appendChild(wordValue);
    wordCard.appendChild(divWord);


    //=====発音記号・発声ボタン=====
    const divPhonetics = document.createElement("div");
    divPhonetics.classList.add("info-group");


    //音声ボタン
    const phoneticArea = document.createElement("div");
    phoneticArea.classList.add("info-label");
    divPhonetics.appendChild(phoneticArea);
    
    card.phonetics.forEach((phonetic, index) => {
      if (!card.phonetics[index].text) return;//発音記号が無ければreturn
      const audioBtn = document.createElement("button");
      audioBtn.classList.add("audio-btn");
      audioBtn.textContent = card.phonetics[index].text;
      phoneticArea.appendChild(audioBtn);

      //ボタン上にオーディオイラストを併記
      if (card.phonetics[index].audio === "") {
        audioBtn.textContent += "🔇";
      } else {
        audioBtn.textContent += "🔊";
      }      
      
      //音声ボタンの発声関数
      audioBtn.addEventListener("click", () => {
        const audio = new Audio(phonetic.audio);
        if (!card.phonetics[index].audio) return;
        audio.play();
      })
    })
    wordCard.appendChild(divPhonetics);


    //=====英英訳=====

    let  currentMeaningIndex = 0;//表示する品詞・definitionのindex番号

    //外側のdiv
    const divMeanings = document.createElement("div");
    divMeanings.classList.add("info-group");
    wordCard.appendChild(divMeanings);

    //品詞表示欄
    const partOfSpeechZone = document.createElement("div");
    partOfSpeechZone.classList.add("part-of-speech-zone");
    let partOfSpeech = document.createElement("span");
    partOfSpeech.classList.add("part-of-speech");
    partOfSpeech.textContent = card.meanings[currentMeaningIndex].partOfSpeech;
    partOfSpeechZone.appendChild(partOfSpeech);
    divMeanings.appendChild(partOfSpeechZone);
           
    //definition表示欄
    const definitionArea = document.createElement("p");
    definitionArea.classList.add("definition-area");
    divMeanings.appendChild(definitionArea);

    ////品詞ごとのdefinition全表示
    card.meanings[currentMeaningIndex].definitions.forEach((definition,index) => {      
      definitionArea.textContent += `${definition.definition} \n`;
    })  

    //definition-areaの開閉を行う
    const toggleBtn = document.createElement("button");
    toggleBtn.classList.add("toggle-btn");
    let isExpanded = false;//definition-areaの開閉
    toggleBtn.classList.add("toggle-btn");
    toggleBtn.textContent = "More";
    //必要用事領域>見えている領域の場合に、ボタンを追加する
    if (definitionArea.scrollHeight > 300) {
      definitionArea.style.height = "300px";      
      divMeanings.appendChild(toggleBtn);
    }
    


    const navigationDiv = document.createElement("div");
    navigationDiv.classList.add("navigation-div");
    divMeanings.appendChild(navigationDiv);


    //definition表示戻りボタン
    const prevMeaningBtn = document.createElement("button");
    prevMeaningBtn.classList.add("change-meaning-btn");
    prevMeaningBtn.textContent = "◀";    
    navigationDiv.appendChild(prevMeaningBtn);


    //目次：1/3みたいに今何ページ目かを表示する
    const tableOfContents = document.createElement("div");
    tableOfContents.classList.add("table-of-contents");
    
    const totalPages = card.meanings.length;
    tableOfContents.textContent = `${currentMeaningIndex+1} / ${totalPages}`;
    navigationDiv.appendChild(tableOfContents);

    
    //definition表示送りボタン
    const nextMeaningBtn = document.createElement("button");
    nextMeaningBtn.classList.add("change-meaning-btn");
    nextMeaningBtn.textContent = "▶";    
    navigationDiv.appendChild(nextMeaningBtn);
    
    
    const cardActions = document.createElement("div");
    cardActions.classList.add("card-actions");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.dataset.action = "edit";
    editBtn.dataset.cardId = card.id;
    cardActions.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.dataset.action = "delete";
    deleteBtn.dataset.cardId = card.id;
    cardActions.appendChild(deleteBtn);

    wordCard.appendChild(cardActions);
    cardContainer.appendChild(wordCard);


    //renderCards内イベント・関数定義
    
    //toggleBtnイベント
    toggleBtn.addEventListener("click", () => {
        definitionArea.classList.toggle("expanded");
      
        if (definitionArea.classList.contains("expanded")) {
          toggleBtn.textContent = "Close";
        } else {
          toggleBtn.textContent = "More";
        }
    })

    //definition戻りボタンイベント
    prevMeaningBtn.addEventListener("click", () => {
      currentMeaningIndex --;

      //現在のindexが0未満なら、
      if (currentMeaningIndex < 0) {
        //現在のindexを最終indexにする
        currentMeaningIndex = card.meanings.length -1;        
      }                
      updateMeaningDisplay();     
      console.log("click prevMeaningBtn, currentMeaningIndex is " + currentMeaningIndex);      
    });
        

    //definition進むイベント
    nextMeaningBtn.addEventListener("click", () => {      
      console.log("pushed nextMeaningBtn " + " currentMeaningIndex is " + currentMeaningIndex);
      currentMeaningIndex ++;
      //indexがカードの枚数より大きい場合、
      if (currentMeaningIndex > card.meanings.length -1) {
        currentMeaningIndex = 0;      
        
      }   
      updateMeaningDisplay();
    });
      
        
    //目次更新イベント・関数
    function updateMeaningDisplay() {

      //partOfSpeechを再描画
      partOfSpeech.textContent = card.meanings[currentMeaningIndex].partOfSpeech;

      //definitionを再描画
      definitionArea.textContent = "";
      card.meanings[currentMeaningIndex].definitions.forEach((definition,index) => {
      definitionArea.textContent += `${definition.definition} \n`;
      });

      //目次を描画
      
      tableOfContents.textContent = `${currentMeaningIndex+1} / ${totalPages}`;
    }


  })

}


//========================
//カード追加・編集モーダル
//========================


//APIで単語情報を取得

//単語検索実行関数
function searchWordData() {

  //単語入力欄に値がある場合に、その値を渡してfetchを実行
  if (wordInput.value) {
    const searchWord = wordInput.value.trim();

    //fetch関数実行
    fetchDefinition(searchWord)//引数を使ってAPI通信実行

      //renderWordData()に、検索結果を渡して検索結果を表示
      .then(results => {
        renderWordData(results)
      })

  } else {
    alert("The word bar is empty.");
    return;
  }
}


/*
英英辞典先鋭化のため、削除
日本語訳取得
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

//英英翻訳・発音取得⇒これらを配列にして返す
function fetchDefinition(word) {
  return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(response => response.json())
    .then(data => {
      console.log("fetchDefinition = ", data)

      //APIから取得したデータのうち、使えるものをざっくり取り出す。
      const definitionData = [
        data[0].word,//検索した単語そのもの
        data[0].phonetics,//発音記号と音声データ(あれば）
        data[0].meanings //意味、同意語、反意語など
      ];
      console.log("definitionData includes = ", definitionData);
      latestSearchData = definitionData;
      return definitionData;
    })
}


//検索結果から取得した単語情報を新規追加モーダルに表示する
function renderWordData(definitionData, index) {
  phoneticArea.innerHTML = "";
  modalDefinitionArea.innerHTML = "";
  let [word, phonetics, definition] = definitionData;

  //各発音記号・音声の親div
  const phoneticItem = document.createElement("div");
  phoneticItem.classList.add("phonetic-item");
  phoneticArea.appendChild(phoneticItem);

  //繰返し処理で発音記号と音声を取得する
  phonetics.forEach((phonetic, index) => {

    //発音記号付きオーディオボタン
    if (!phonetic.text) return;//発音記号が無ければreturn
    const audioBtn = document.createElement("button");
    audioBtn.classList.add("audio-btn");//ボタン作成
    audioBtn.textContent = phonetic.text;//ボタン上に発音記号を表示

    //ボタン上にオーディオボタンを併記
    if (phonetic.audio === "") {
      audioBtn.textContent += "🔇";
    } else {
      audioBtn.textContent += "🔊";
    }

    //音声イベント
    audioBtn.addEventListener("click", () => {
      const audio = new Audio(phonetic.audio);
      if (!phonetic.audio) return;
      audio.play();
    })

    phoneticArea.appendChild(audioBtn);

  })//phonetics.forEach{}

  //definitionの表示
  let definitionArray = [];
  definition.forEach((def, index) => {
    definitionArray.push(`${index}. ${def.partOfSpeech}:\n`);
    def.definitions.forEach(d => {
      definitionArray.push(d.definition + "\n");
    })
  })
  modalDefinitionArea.textContent += definitionArray.join("");

}//renderWordData()


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

//新規入力フォームの開閉を行う
function toggleAddCardForm() {
  cardEditModal.classList.toggle("hidden");
}

//入力欄を空にする関数
function clearCardForm() {
  phoneticArea.innerHTML = "";
  modalDefinitionArea.innerHTML = "";
}

//フォームに入力された新規カード情報を登録する
function addNewCard() {
  //既存カードのidを取得して配列を作る
  const idsInDecks = cards.map(card => card.id);

  //既存カードidを元に、新規カードに付けるidを作成
  const newId = Math.max(...idsInDecks) + 1;

  //空白登録阻止のバリデーション
  if (wordInput.value.trim() === "") {
    alert("Please enter a word first");
    return;
  }

  //新規カード情報をオブジェクトとして取得。データはAPIから取得したもの。
  const newCard = {
    id: newId,
    deckId: currentDeckId,

    word: latestSearchData[0],
    phonetics: latestSearchData[1],
    meanings: latestSearchData[2]
  };

  cards.push(newCard);
  saveData("flashcard_cards", cards);
  alert("New card added successfully.");
  renderCard();
  clearCardForm();
}


//カード削除・編集イベント:親要素にイベント付与
cardContainer.addEventListener("click", (e) => {
  //イベントが起こった子要素取得
  const eventTarget = e.target.closest("[data-card-id]");

  if (!eventTarget) return;//変数に値が無ければその先に進んでエラーになるのを防ぐ

  //削除イベント：ターゲットにあるデータセットアクションの値がdeleteだった場合に以下の処理を行う
  if (eventTarget.dataset.action === "delete") {
    deleteCard(eventTarget);
    saveData("flash_cards", cards);
    renderCard();
  }

  //編集イベント：ターゲットにあるデータセットアクションの値がeditだった場合に以下の処理を行う
  if (eventTarget.dataset.action === "edit") {
    startEdit(eventTarget);
  }
});

//APIに音声ファイルが存在するかを確認する関数
function checkAudioExists(word) {

}

//オーディオを再生する関数
function playAudio(audioData) {
  const audio = new Audio(audioData);
  audio.play();
}

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

  console.log(cards);

  const targetData = cards.find(card => card.id === Number(eventTarget.dataset.cardId));

  //⇒入力欄を表示して既存のカードデータを入れる。
  cardEditModal.classList.remove("hidden");
  wordInput.value = targetData.word;

  definitionInput.value = targetData.definition;
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

    //更新完了のメッセージ表示
    alert("Card updated successfully");

    //配列再読み込みと表示
    saveData("flashcard_cards", cards);
    renderCard();


    //入力欄をクリア/editingCardIdをnullに戻す
    clearCardForm();
    editingCardId = null;

    //ボタンをupdateからaddに戻す
    updateCardBtn.classList.add("hidden");
    submitCardBtn.classList.remove("hidden");
    addCardBtn.classList.remove("hidden");
    //入力欄を隠す
    cardEditArea.classList.add("hidden");
  }
}



//並べ替え関数:状態を変えるだけ
function sortCards() {
  if (sortMode === null) {
    sortMode = "az";
  } else {
    sortMode = null;
  }
  renderCard();
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


document.addEventListener("DOMContentLoaded", () => {

  loadData(),
    showEditingDeck();
  renderCard();
  console.log("cards contains", cards)
})


