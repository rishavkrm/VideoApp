const socket = io('/')
const videoGrid = document.getElementById('video-grid')

// Toggling video
const toggleVideoButton = document.getElementById('stopVideoButton')
toggleVideoButton.addEventListener("click",toggleVideo)

// Toggling audio
const toggleAudioButton = document.getElementById('stopAudioButton')
toggleAudioButton.addEventListener("click",toggleAudio)

// Exiting
const exitButton = document.getElementById('exitButton')
exitButton.addEventListener("click",exitMeeting)

let userStream;

// webRTC
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
});
// let person = prompt("Please enter your name");

// if (person != null) {
//   document.getElementsByClassName('.name').innerHTML = person
// }

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}


// initialising
async function init(){
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    addVideoStream(myVideo, stream)
      // when we call the pe
    myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
        })
      })
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)})
    userStream = stream
  } catch (error) {
    console.log(error)
  }}
init()

// toggle video
function toggleVideo(){
  console.log("I got clicked")
  const videoTrack = userStream.getTracks().find(track => track.kind === 'video');
  if (videoTrack.enabled) {
    videoTrack.enabled = false;
    toggleVideoButton.style.color = 'blue'

    
} else {
    videoTrack.enabled = true;
    toggleVideoButton.style.color = 'white'
    
}}

// toggle audio
function toggleAudio(){
  console.log("I got clicked")
  const audioTrack = userStream.getTracks().find(track => track.kind === 'audio');
  if (audioTrack.enabled) {
    audioTrack.enabled = false;
    toggleAudioButton.style.color = 'blue'

} else {
    audioTrack.enabled = true;
    toggleAudioButton.style.color = 'white'
}}

function exitMeeting(){
  console.log("I got clicked")
  userStream.getTracks().forEach(function(track) { track.stop(); })
  window.location.href = "disconnect.html";
  
}


// handling disconnection
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)

}
