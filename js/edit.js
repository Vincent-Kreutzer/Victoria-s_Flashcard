
//=================
//DOM取得
//=================


let decks = [];//ローカルストレージとデッキ情報のやり取りをする配列
let latestSearchData = null;//最新の検索データを保持する変数

//ローカルストレージからカード情報を受け取って入れる。最初は仮の初期データを格納
let cards = [
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
            definition: "時間に関する、一時的な"
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
            definition: "猫"
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
            definition: "鳥"
          }
        ]
      }
    ]
  }
];


let editingCardId = null; //編集カードのidを入れる
let sortMode = null;//カード一覧の並び替えの切り替えに使う
let modalMode = null;//モーダルを追加・編集のどちらで開いたかを判定する
//カード一覧に表示するカードのデッキ情報
let currentDeck = { id: 0, name: "sample-deck" };

//ページ遷移時に渡されたデータを受け取る
const params = new URLSearchParams(location.search);
const currentDeckId = Number(params.get("deck"));//渡されたデッキidを取得


//トップページ関係DOM
const pageContent = document.getElementById("page-content");//モーダル以外を包括するdiv要素のDOM
const deleteDeckBtn = document.getElementById("delete-deck");//デッキ削除ボタンDOM
const backBtn = document.getElementById("back-btn");//バックボタンDOM

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
const modalOverlay = document.getElementById("modal-overlay");
const cardEditModal = document.getElementById("card-edit-modal");
const cardEditArea = document.getElementById("card-edit-area");
const searchWordBtn = document.getElementById("search-word-btn");//検索ボタン

const wordInput = document.getElementById("word-input");
const modalPhoneticArea = document.getElementById("modal-phonetic-area");

const prevMeaningBtn = document.getElementById("prev-meaning-btn");
const nextMeaningBtn = document.getElementById("next-meaning-btn");
const partOfSpeech = document.getElementById("part-of-speech");
let tableOfContents = document.getElementById("table-of-contents");
 

const modalDefinitionArea = document.getElementById("modal-definition-area");

const submitCardBtn = document.getElementById("submit-card-btn");//新規カード追加確定
const updateCardBtn = document.getElementById("update-card-btn");//カード編集確定
const cancelAddBtn = document.getElementById("cancel-add-btn");

const scrollTopBtn = document.getElementById("scroll-top-btn");
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



//デッキ名変更イベント
renameDeckBtn.addEventListener("click", renameDeck);

//カード追加ボタンイベント
addCardBtn.addEventListener("click", () => {
  modalMode = "add";

  console.log("クリック時 =", modalMode);
  openCardModal();
});

//キャンセルボタンイベント
cancelAddBtn.addEventListener("click", () => {
  modalMode = null;
  closeCardModal();
});
  
//デッキ名変更キャンセルイベントと関数
cancelDeckRenameBtn.addEventListener("click", () => {
  toggleRenameDeckArea();
});


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
  location.href = "../html/top.html";
}

//デッキ名表示欄に編集中のデッキ名を表示する
function showEditingDeck() {
  //ローカルストレージから取得したデッキ情報を元に、渡されたデッキ情報に合致するデッキを表示する
  currentDeck = decks.find(deck => deck.id === currentDeckId);

  console.log(`currentDeckId is ${currentDeckId}`);
  console.log(decks.map(deck => deck.id));
  console.log(decks.map(deck => typeof deck.id));
  
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



//==============
//レンダー関数整理
//==============

//ローカルストレージのカード情報を取得して表示する
function renderCards() {
  cardContainer.innerHTML = "";

  //当該デッキのカードのみを抽出
  let deckCards = cards.filter(card => card.deckId === currentDeckId);
  if (sortMode === "az") {
    deckCards.sort((a, b) => a.word.localeCompare(b.word))
  }
  
  //抽出したカードを一覧表示する、cardは複数のデータを有するオブジェクト
  deckCards.forEach((card, index) => {
    const flashCard = createCardElement(card,index);
    cardContainer.appendChild(flashCard.cardElement);    
  })

  //updateMeaningArrowState();
}


//デッキ情報を受け取り一枚のカードを作る。
function createCardElement(card,index) {
  let currentMeaningIndex = 0;

  //各データ入れる一番外側のdiv
  const cardElement = document.createElement("div");
  cardElement.classList.add("word-card");

  //各カードの表示番号を担当するdiv
  const cardNum = document.createElement("span");
  cardNum.textContent = "No. " + (index + 1);//表示するナンバー
  cardNum.classList.add("card-num");//クラスリスト
  cardElement.appendChild(cardNum);//親要素へ追加

  //表示する単語名
  const title = createTitleArea(card);
  cardElement.appendChild(title);//親要素へ追加
  
  //発音記号
  console.log("表示中のcard =", card);
console.log("card.phonetics =", card.phonetics);

  const phonetic = createPhoneticArea(card);
  cardElement.appendChild(phonetic);//親要素へ追加
  
  const navigation = createNavigationArea(card,currentMeaningIndex);
  cardElement.appendChild(navigation.navigationArea);

  const definition = createDefinitionArea(card,currentMeaningIndex);
  cardElement.appendChild(definition.definitionArea);

  const cardActions = createCardActionsArea(card);
  cardElement.appendChild(cardActions.cardActionsArea);


   //currentMeaningIndexの値を増減する関数
  function changeCurrentMeaningIndex(direction) {

    currentMeaningIndex = currentMeaningIndex + direction;//ボタンに応じてindexを増減
    console.log("changed currentMeaningIndex " + currentMeaningIndex);
    //const definition = createDefinitionArea.update(card, currentMeaningIndex);
    //indexが0より小さい場合、現在のindexを最終indexにする。
    if (currentMeaningIndex < 0) {
      currentMeaningIndex = card.meanings.length -1; 
    }       
    //indexがカードの枚数より大きい場合、現在のindexを0にする。
    if (currentMeaningIndex > card.meanings.length -1) {
      currentMeaningIndex = 0;   
    }      
    
    updateCardElements();
  } 

  function updateCardElements() {
    navigation.update(currentMeaningIndex);
    definition.update(currentMeaningIndex);
  }

  //◀▶ボタンにイベント付与  
  navigation.prevMeaningBtn.addEventListener("click", () => changeCurrentMeaningIndex(-1));
  navigation.nextMeaningBtn.addEventListener("click", () => changeCurrentMeaningIndex(+1));
  
  updateCardElements()

  return {cardElement, navigation, definition};
  
}

//各カードの単語名を表示⇒domだけreturn
function createTitleArea(card) {
    
  //親div:単語名
  const titleArea = document.createElement("div");
  titleArea.classList.add("info-group", "title-area");
  
  const wordTitle = document.createElement("p");
  wordTitle.textContent = card.word;
  wordTitle.classList.add("word-title");
  titleArea.appendChild(wordTitle);
    
  return titleArea;
}

//発音記号と発声マークを表示⇒domだけreturn
function createPhoneticArea(card) {
  
  //=====発音記号・発声ボタンを定義====
  const phoneticArea = document.createElement("div");
  phoneticArea.classList.add("info-group", "phonetic-area");

  //音声ボタン        
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
  return phoneticArea;
}

//品詞と◀▶ボタン、目次を作る⇒domと関数をreturn
function createNavigationArea(card,currentMeaningIndex) {  

  //親：品詞と◀▶ボタン、目次を包括するdiv
  const navigationArea = document.createElement("div");
  navigationArea.classList.add("info-group");

  //品詞と◀▶ボタンを包括するdiv（目次は入れない）
  const meaningNavigation = document.createElement("div");
  meaningNavigation.classList.add("meaning-navigation");
  navigationArea.appendChild(meaningNavigation);   

  //◀：definition表示戻りボタン
  const prevMeaningBtn = document.createElement("span");
  prevMeaningBtn.classList.add("change-meaning-btn");
  prevMeaningBtn.textContent = "◀";    
  meaningNavigation.appendChild(prevMeaningBtn);

  //品詞表示欄
  let partOfSpeech = document.createElement("span");
  partOfSpeech.classList.add("part-of-speech");
  partOfSpeech.textContent = card.meanings[currentMeaningIndex].partOfSpeech;
  meaningNavigation.appendChild(partOfSpeech);
                  
  //▶：definition表示送りボタン
  const nextMeaningBtn = document.createElement("span");
  nextMeaningBtn.classList.add("change-meaning-btn");
  nextMeaningBtn.textContent = "▶";    
  meaningNavigation.appendChild(nextMeaningBtn);


  //品詞・意味表示の目次
  const tableOfContents = document.createElement("div");
  tableOfContents.classList.add("table-of-contents");
  const totalPages = card.meanings.length;//総ページ数  
  navigationArea.appendChild(tableOfContents);    

     

  //状態変化を画面に反映する
  function update(currentMeaningIndex) {

    //品詞の表示をindexに従って更新
    partOfSpeech.textContent = card.meanings[currentMeaningIndex].partOfSpeech;
    //目次をindexに従って更新
    tableOfContents.textContent = `${currentMeaningIndex +1} / ${totalPages}`;
  
    //indexが0の場合にprevボタンを非アクティブ化、そうでなくなった場合にアクティブ化する
    if (currentMeaningIndex === 0) {
      prevMeaningBtn.classList.add("disabled-arrow");
      
    } else {
      prevMeaningBtn.classList.remove("disabled-arrow");
    }
    //indexが対象総数-1の場合にnextボタンを非アクティブ化、そうでなくなった場合にアクティブ化する
    if (currentMeaningIndex === card.meanings.length -1) {
      nextMeaningBtn.classList.add("disabled-arrow");
      
    } else {
      nextMeaningBtn.classList.remove("disabled-arrow");
    }
  }
  update(currentMeaningIndex);
  
  return {navigationArea, prevMeaningBtn, nextMeaningBtn, update};     
}


//definitionAreaのDOM作成と関連する関数の定義
function createDefinitionArea(card,currentMeaningIndex) {
  
  //definition表示欄  
  const definitionArea = document.createElement("div");
  definitionArea.classList.add("info-group");
  definitionArea.classList.add("definition-area");
  //definitionを更新:指定indexのデータを表示する
  function update(currentMeaningIndex) {
    definitionArea.textContent = "";
   
    //definitionAreaの表示を更新する
    card.meanings[currentMeaningIndex]
      .definitions
      .forEach((definition,index) => {  
        const paragraph = document.createElement("p");
        paragraph.classList.add("definition-paragraphs");
        paragraph.textContent = definition.definition;
        definitionArea.appendChild(paragraph);
      })   
  } 

  update(currentMeaningIndex);

  return {definitionArea, update};
}

//編集・削除ボタンを作成する
function createCardActionsArea(card) {

  const cardActionsArea = document.createElement("div");//一番外側のdiv
  cardActionsArea.classList.add("info-group", "card-actions");//クラス付与
 
  //editボタン作成
  const editBtn = document.createElement("button");
  editBtn.textContent = "🖋";//表示
  editBtn.dataset.action = "edit";//動作についてのデータ型  
  editBtn.dataset.cardId = card.id;//カードのidについてのデータ型  
  cardActionsArea.appendChild(editBtn);//親要素に追加
  
  //deleteボタン作成
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑";//表示
  deleteBtn.dataset.action = "delete";//動作についてのデータ型
  deleteBtn.dataset.cardId = card.id;//カードのidについてのデータ型
  cardActionsArea.appendChild(deleteBtn);//親要素に追加
  
  return {cardActionsArea, editBtn, deleteBtn};
}




//========================
//カード追加・編集モーダル用関数
//========================




//単語検索実行(新関数):APIで単語情報を取得
async function searchWordData() {
  const searchWord = wordInput.value.trim();

  if (!searchWord) {
    alert("The word bar is empty.");
    return;
  }

  try {
    const definitionData = await fetchDefinition(searchWord);

    //検索結果を保存
    latestSearchData = definitionData;
    
    //検索成功後、結果を描画
    renderWordData(definitionData);
    
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


//英英翻訳・発音取得⇒これらを配列にして返す（新関数）
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
          data[0].word,
          data[0].phonetics ?? [],
          data[0].meanings ?? []
        ];

        latestSearchData = definitionData;

        return definitionData;
      } catch (error) {
        lastError = error;

        //404は再試行しても意味が薄い⇒再試行なし
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


//検索結果から取得した単語情報を新規追加モーダルに表示する
function renderWordData(definitionData) {
  modalPhoneticArea.innerHTML = "";
  modalDefinitionArea.innerHTML = "";

  let [word, phonetics, meanings] = definitionData;

  //各発音記号・音声の親div
  const phoneticItems = document.createElement("div");
  phoneticItems.classList.add("phonetic-item");
  modalPhoneticArea.appendChild(phoneticItems);

  //繰返し処理で発音記号と音声を取得する
  phonetics.forEach((phonetic, index) => {

    //発音記号付きオーディオボタン
    if (!phonetic.text) return;//発音記号が無ければreturn
   
    //ボタンDOM作成
    const audioBtn = document.createElement("button");
    audioBtn.classList.add("audio-btn");//ボタン作成
    audioBtn.textContent = phonetic.text;//ボタン上に発音記号を表示
    modalPhoneticArea.appendChild(audioBtn);
    
    //オーディオボタンの表示
    if (!phonetic.audio) {
      audioBtn.textContent = "🔇";
    } else {
      audioBtn.textContent = "🔊";
    }

    //オーディオボタンの音声イベント定義
    audioBtn.addEventListener("click", async () => {
      if (!phonetic.audio) return;

      const audio = new Audio(phonetic.audio);
      
      try {
        await audio.play();
      } catch (error) {
        console.error("Audio playback failed:", error);
        alert("Audio is temporarily unavailable.");
      }      
    });

   

  })//phonetics.forEach   

  //品詞・definitionの表示
  let currentMeaningIndex = 0;//表示する意味の所属番号
  const totalPages = meanings.length;//意味の総ページ数
  
  //品詞の初期表示
  partOfSpeech.textContent = meanings[currentMeaningIndex].partOfSpeech;

  //definitionの初期表示
  meanings[currentMeaningIndex].definitions.forEach((def) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = def.definition;
    modalDefinitionArea.appendChild(paragraph); 
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
    modalDefinitionArea.innerHTML = "";
    console.log(`update()push ${meanings[currentMeaningIndex].definitions}`);
    
    
    //品詞の表示をindexに従って更新
    partOfSpeech.textContent = meanings[currentMeaningIndex].partOfSpeech;
    
    //目次をindexに従って更新
    tableOfContents.textContent = `${currentMeaningIndex +1} / ${totalPages}`;
  
    //definitionをindexに従って更新
    meanings[currentMeaningIndex].definitions.forEach((def) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = def.definition;
    modalDefinitionArea.appendChild(paragraph); 
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
function openCardModal(targetCard) {
  
//新規追加、編集で共通の窓口を設ける
  //新規追加なら入力欄は空、編集なら編集単語を入力欄に入れてモーダル表示
  if (modalMode === "add") {
    wordInput.value = "";
    submitCardBtn.classList.remove("hidden");
    updateCardBtn.classList.add("hidden");
    console.log(updateCardBtn.classList.contains("hidden"));
  } 

  if (modalMode === "edit") {    
    wordInput.value = targetCard.word;
    submitCardBtn.classList.add("hidden");
    updateCardBtn.classList.remove("hidden");
    searchWordData();
  }

  modalOverlay.classList.remove("hidden");
  cardEditModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

//モーダルを閉じる関数
function closeCardModal() {
  modalMode = "";
  clearCardForm();

  modalOverlay.classList.add("hidden");
  cardEditModal.classList.add("hidden");
  pageContent.classList.remove("hidden");
  document.body.style.overflow = "auto";
}

//入力欄を空にする関数
function clearCardForm() {
  wordInput.value = "";
  modalPhoneticArea.innerHTML = "";
  partOfSpeech.innerHTML = "";
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
console.log("latest search data is", latestSearchData);

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
  renderCards();
  clearCardForm();

  addCardBtn.classList.remove("hidden");
  submitCardBtn.classList.remove("hidden");
  updateCardBtn.classList.add("hidden");
}




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
  //新規追加系ボタンを隠してupdateボタンを表示する
  addCardBtn.classList.add("hidden");
  submitCardBtn.classList.add("hidden");

  updateCardBtn.classList.remove("hidden");

  const targetData = cards.find(card => card.id === Number(eventTarget.dataset.cardId));

  //⇒入力欄を表示して既存のカードデータを入れる。
  cardEditModal.classList.remove("hidden");
  wordInput.value = targetData.word;

  modalDefinitionArea.value = targetData.definition;
  modalMeaning.value = targetData.meaning;
  editingCardId = targetData.id;
  
  //入力欄にカーソル合わせる
  wordInput.focus();
}


//モーダル画面でカード更新を完了する関数：updateボタンを押した挙動
function updateCard() {
  
  console.log(editingCardId);
  console.log("updateCard開始");
  
  //操作中のカードがある場合にのみ処理を続行
  if (editingCardId !== null) {

    //editingCardIdの値を元に、編集対象データ（古いデータ）を取得
    const targetData = cards.find(card => card.id === Number(editingCardId));

    //更新用カード情報をオブジェクトとして取得。データはAPIから取得したもの。
    const newCard = {
      id: editingCardId,
      deckId: currentDeckId,
      word: latestSearchData[0],
      phonetics: latestSearchData[1],
      meanings: latestSearchData[2]
    };

    //情報の更新処理をする
    targetData.word = latestSearchData[0];
    targetData.phonetics = latestSearchData[1];
    targetData.meanings = latestSearchData[2];


    //ローカルストレージに変更を保存
    saveData("flashcard_cards", cards);

    //更新完了のメッセージ表示
    alert("Card updated successfully");

    //配列再読み込みと表示    
    renderCards();

    //入力欄をクリア/editingCardIdをnullに戻す
    clearCardForm();
    editingCardId = null;
    
    
    //ボタンをupdateからaddに戻す
    updateCardBtn.classList.add("hidden");//更新確定ボタンhidden付与

    submitCardBtn.classList.remove("hidden");//追加確定ボタンhidden除去

    //入力欄を隠す
    modalOverlay.classList.add("hidden");
    cardEditModal.classList.add("hidden");
    pageContent.classList.remove("hidden");
  }
}

//下がったスクロールを初期位置に戻す
function scrollTop() {
  const scrollPosition = window.pageYOffset;  
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

//並べ替え関数:状態を変えるだけ
function sortCards() {
  if (sortMode === null) {
    sortMode = "az";
  } else {
    sortMode = null;
  }
  renderCards();
}



//edit.htmlトップにカード一覧を表示するイベント
cardContainer.addEventListener("click", (e) => {
 
  const eventTarget = e.target.closest("[data-card-id]");//イベントが起こった子要素取得
  if (!eventTarget) return;//変数に値が無ければその先に進んでエラーになるのを防ぐ

  //削除イベント：ターゲットにあるデータセットアクションの値がdeleteだった場合に以下の処理を行う
  if (eventTarget.dataset.action === "delete") {
    deleteCard(eventTarget);
    saveData("flash_cards", cards);//ローカルストレージに保存
    renderCards();//変更後のデータを再表示
  }

  //編集イベント：ターゲットにあるデータセットアクションの値がeditだった場合に以下の処理を行う
  if (eventTarget.dataset.action === "edit") {    
    
    const targetCard = cards.find((card) => {
      return card.id === Number(eventTarget.dataset.cardId);      
    });
      
    editingCardId = targetCard.id;
    modalMode = "edit";
    openCardModal(targetCard);    

  }
})

scrollTopBtn.addEventListener("click", scrollTop);

window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    scrollTopBtn.classList.remove("hidden");
  } else {
    scrollTopBtn.classList.add("hidden");
  }
});

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
  renderCards();
})


