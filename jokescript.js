// AUTH
let currentUser = null;

function register(){
 let u = username.value, p = password.value;
 let users = JSON.parse(localStorage.getItem("users")) || {};
 if(users[u]) return authMsg.innerText = "User exists!";
 users[u] = {password:p, scores:[]};
 localStorage.setItem("users", JSON.stringify(users));
 authMsg.innerText = "Registered!";
}

function login(){
 let u = username.value, p = password.value;
 let users = JSON.parse(localStorage.getItem("users")) || {};
 if(users[u] && users[u].password === p){
   currentUser = u;
   auth.classList.add("hidden");
   app.classList.remove("hidden");
   userDisplay.innerText = u;
   loadScores();
 } else authMsg.innerText = "Invalid!";
}

function logout(){ location.reload(); }

// GAME STATE
let setup="", punchline="";
let score=0, timer=10, interval;
let lives=3, currentPlayer=1;
let scores={1:0,2:0};

// TRANSLATE
async function translate(text,target){
 if(target==="en") return text;
 try{
  let r = await fetch(`https://api.mymemory.translated.net/get?q=${text}&langpair=en|${target}`);
  let d = await r.json();
  return d.responseData.translatedText;
 }catch{return text;}
}

// GET JOKE
async function getJoke(){
 let cat = category.value, lang = language.value;
 joke.innerText = "Loading...";

 let url="https://official-joke-api.appspot.com/random_joke";
 if(cat!=="random") url=`https://official-joke-api.appspot.com/jokes/${cat}/random`;

 let r = await fetch(url);
 let d = await r.json();
 let j = cat==="random"?d:d[0];

 setup = j.setup;
 punchline = j.punchline;

 let translated = await translate(setup,lang);
 joke.innerText = translated + "\n\n(Guess 👇)";

 startTimer();
}

// SPEAK
function speakJoke(){
 if(!setup) return;
 speechSynthesis.cancel();
 speechSynthesis.speak(new SpeechSynthesisUtterance(setup));
}

// TIMER
function startTimer(){
 let diff = difficulty.value;
 timer = diff==="easy"?15:diff==="hard"?5:10;

 timerEl.innerText = timer;
 clearInterval(interval);

 interval = setInterval(()=>{
  timer--;
  timerEl.innerText = timer;

  if(timer<=0){
    clearInterval(interval);
    speechSynthesis.cancel();
    loseLife("⏰ Time up! " + punchline);
  }
 },1000);
}

// CHECK
function checkGuess(){
 speechSynthesis.cancel();
 let g = guess.value.toLowerCase();
 let diff = difficulty.value;

 let correct = diff==="hard"
   ? g===punchline.toLowerCase()
   : punchline.toLowerCase().includes(g);

 if(correct){
  result.innerText="✅ Correct!";
  if(mode.value==="multi") scores[currentPlayer]++;
  else score++;
 } else {
  loseLife("❌ " + punchline);
  return;
 }

 updateScore();
 switchPlayer();
}

// LIVES
function loseLife(msg){
 lives--;
 livesEl.innerText = lives;
 result.innerText = msg;

 if(lives<=0){
  result.innerText="💀 Game Over!";
  saveScore();
  return;
 }

 switchPlayer();
}

// MULTI
function switchPlayer(){
 if(mode.value==="multi"){
  currentPlayer = currentPlayer===1?2:1;
  player.innerText = "Player " + currentPlayer;
 }
}

// SCORE
function updateScore(){
 if(mode.value==="multi"){
  score.innerText = `P1:${scores[1]} | P2:${scores[2]}`;
 } else score.innerText = score;
}

// STORAGE
function saveScore(){
 let users = JSON.parse(localStorage.getItem("users"));
 users[currentUser].scores.push(score);
 localStorage.setItem("users", JSON.stringify(users));
 loadScores();
}

function loadScores(){
 let users = JSON.parse(localStorage.getItem("users"));
 let s = users[currentUser].scores || [];
 leaderboard.innerHTML = s.map(x=>`⭐ ${x}`).join("");
}

// DARK MODE
function toggleDark(){
 document.body.classList.toggle("dark");
}

// refs
const timerEl = document.getElementById("timer");
const livesEl = document.getElementById("lives");