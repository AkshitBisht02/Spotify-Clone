console.log("lets write java script")

let currentSong= new Audio();
let songs;
let currFolder;

function secondstoMinsec(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(1);  // Keeps one decimal place for the seconds
    
    // Remove unnecessary decimal zeros if they exist
    const formattedSeconds = remainingSeconds.endsWith('.0') ? remainingSeconds.split('.')[0] : remainingSeconds;

    return `${minutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder=folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    
     //Show all the songs in the playlist
     let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
     songUL.innerHTML=""
     for (const song of songs) {
         songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="music.svg" alt=" ">
               <div class="info">
                 <div>${song.replaceAll("%20", " ")}</div>
                 <div>Song Artist</div>
               </div>
               <div class="playnow">
                 <span>Play now</span>
                 <img class="invert" src="play.svg" alt="">
               </div> </li>`;
     }
  
     //Attach an event listner to all songs
     Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
         e.addEventListener("click",element=>{
             playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
         })
     })
}

const playMusic=(track,pause=false)=>{
    currentSong.src=`/${currFolder}/` + track
    if(!pause){
        currentSong.play()
        play.src="pause.svg"
    }
    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00.00/00.00"

    
}

async function displayAlbums() {
    let response1 = await fetch(`http://127.0.0.1:3000/songs/`);  // Renamed 'a' to 'response1'
    let responseText = await response1.text(); // Renamed 'response' to 'responseText'
    let div = document.createElement("div");
    div.innerHTML = responseText;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    
    // Replaced forEach with for...of to handle async/await properly
    let allCardsHTML = ''; // Initialize outside the loop
    for (let e of anchors) {
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];

            // Fetch the metadata of the folder
            let folderInfoResponse = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let folderData = await folderInfoResponse.json();

            allCardsHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="none" stroke-width="1.5" />
                        <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="currentColor" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${folderData.title}</h2>
                <p>${folderData.description}</p>
            </div>`;
        }
    }
    
    // After the loop finishes, append all cards to the container
    cardContainer.innerHTML += allCardsHTML;
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click",async item=>{
            songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    });
}

async function main() {
    //get list of all songs
    await getSongs("songs/Punjabi")
    playMusic(songs[0],true)
    
    //Display all the albums on the page
    displayAlbums()

    //Attach an event listner to play,previous and next
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src="pause.svg";
        }
        else{
            currentSong.pause()
            play.src="play.svg";
        }
    })

    //Listen for time update event 
    currentSong.addEventListener("timeupdate",()=>{
        console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondstoMinsec(currentSong.currentTime)}/ ${secondstoMinsec(currentSong.duration)}`
        document.querySelector(".circle").style.left=(currentSong.currentTime/ currentSong.duration)*100+"%";
    })

    //add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width);
        document.querySelector(".circle").style.left = percent *100 + "%";
        currentSong.currentTime= ((currentSong.duration)*percent);
    })

    //add event listner for hamburger 
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0"
    })

     // Close the sidebar
    document.querySelector(".close").addEventListener("click", () => {
        console.log("close button is clicked");
        document.querySelector(".left").style.left = "-120%";
    })

    //add event listner for previous
    previous.addEventListener("click",()=>{
        let index= songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if(index > 0){
            playMusic(songs[index-1])
        }
    }) 

    //add event listner for next
    next.addEventListener("click",()=>{
        let index= songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
    }) 

    
}
main()