const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8000;
const STREAMS_DIR = path.join(__dirname, 'streams');

// Ensure the streams directory exists
if (!fs.existsSync(STREAMS_DIR)){
    fs.mkdirSync(STREAMS_DIR);
}

// Serve static files from the streams directory
app.use('/streams', express.static(STREAMS_DIR));

// Route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to start the HLS stream conversion
app.get('/start-stream', (req, res) => {
    const rtspUrl = 'rtsp://project:bitsathy%4012@10.10.132.214:554'
;
    const output = path.join(STREAMS_DIR, 'output.m3u8');
    
    const ffmpegCommand = `ffmpeg -i ${rtspUrl} -c:v libx264 -hls_time 2 -hls_list_size 3 -f hls ${output}`;
    
    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing ffmpeg: ${error.message}`);
            return res.status(500).send('Error starting stream');
        }
        console.log(`FFmpeg output: ${stdout}`);
        console.error(`FFmpeg errors: ${stderr}`);
    });

    res.send('Stream started');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
