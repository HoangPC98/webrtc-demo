const webSocket = new WebSocket('ws://127.0.0.1:3000')

webSocket.onmessage = (event) => {
    //handle when receiver accepted connect
    handleSignallingData(JSON.parse(event.data))
}

const handleSignallingData = (data) => {
    switch (data.type) {
        case 'answer':
            peerConn.setRemoteDescription(data.answer)
            break
        case 'candidate':
            peerConn.addIceCandidate(data.candidate)
    }
}

let username

// document.getElementById('send-username-btn').onclick = () => {
//     console.log('ok')
//     username = document.getElementById('username-input').value
//     sendData({
//         type: 'store_user'
//     })
// }

// document.getElementById('start-call-btn').onclick = startCall();


const sendUsername = () => {
    console.log('ok')
    username = document.getElementById('username-input').value
    sendData({
        type: 'store_user'
    })
}

const sendData = (data) => {
    data.username = username
    webSocket.send(JSON.stringify(data))
}


let localStream
let peerConn

const startCall = () => {
    document.getElementById('video-call-div')
        .style.display = 'inline'

    navigator.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480,
                ideal: 720,
                max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }, (input_stream) => {
        localStream = input_stream
        document.getElementById('local-video').srcObject = localStream

        // config for stun-server 
        let stun_configuration = {
            //list multiple stun-server gather many ice-candidate
            iceServers: [{
                'urls': ['stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302'
                ]
            }]
        }

        peerConn = new RTCPeerConnection(stun_configuration)
        peerConn.addStream(localStream)
            // peerConn.

        peerConn.onaddstream = (e) => {
            document.getElementById('remote-video').srcObject = e.stream
        }

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null)
                return sendData({
                    type: 'store_candidate',
                    candidate: e.candidate
                })
        })

        createAndSendOffer()
    }, (error) => {
        console.log(error)
    })
}

const createAndSendOffer = () => {
    let peer =
        peerConn.createOffer((offer) => {
            sendData({
                type: 'store_offer',
                offer: offer
            })

            peerConn.setLocalDescription(offer)
        }, (error) => {
            console.log(error)
        })
}

let enableAudio = true

const muteAudio = () => {
    enableAudio = !enableAudio
    localStream.getAudioTracks()[0].enabled = enableAudio
}

let enableVideo = true

const muteVideo = () => {
    enableVideo = !enableVideo
    localStream.getVideoTracks()[0].enabled = enableVideo
}