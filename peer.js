const express = require('express')
const app = express()

const path = require('path')
app.use('/static', express.static(path.join(__dirname, 'static')))

app.get('/sender', (req, res) => {
    res.sendFile(process.cwd() + '/sender.html')
})



app.get('/receiver', (req, res) => {
    res.sendFile(process.cwd() + '/receiver.html')
})

app.listen(5000, () => {
    console.log('Listening on port 5000...')
})