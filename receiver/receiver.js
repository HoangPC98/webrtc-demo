const webSocket = new WebSocket('ws://localhost:3000')

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}

const handleSignallingData = (data) => {
    switch (data.type) {
        case 'offer':
            peerConn.setRemoteDescription(data.offer)
            createAndSendAnswer()
            break
        case 'candidate':
            peerConn.addIceCandidate(data.candidate)
    }
}

const createAndSendAnswer = () => {
    peerConn.createAnswer((answer) => {
        peerConn.setLocalDescription(answer)
        sendData({
            type: 'send_answer',
            answer: answer
        })
    }, error => {
        console.log(error)
    })
}

const sendData = (data) => {
    data.username = username
    webSocket.send(JSON.stringify(data))
}


let localStream
let peerConn
let username

const joinCall = () => {

    username = document.getElementById('username-input').value

    document.getElementById('video-call-div').style.display = 'inline'

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
    }, (stream) => {
        localStream = stream
        document.getElementById('local-video').srcObject = localStream

        let configuration = {
            iceServers: [{
                'urls': ['stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302'
                ]
            }]
        }

        peerConn = new RTCPeerConnection(configuration)
        peerConn.addStream(localStream)

        peerConn.onaddstream = (e) => {
            document.getElementById('remote-video').srcObject = e.stream
        }

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null)
                return sendData({
                    type: 'send_candidate',
                    candidate: e.candidate
                })
        })

        sendData({
            type: 'join_call'
        })

    }, (error) => {
        console.log(error)
    })
}

let isAudio = true
const muteAudio = () => {
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true
const muteVideo = () => {
    isVideo = !enableVideo
    localStream.getVideoTracks()[0].enabled = isVideo
}