import dotenv from "dotenv";
import mpdApi, { MPDApi } from "mpd-api";
import express, { Express } from 'express';

dotenv.config();

class MPD {
    private static readonly HOST: string = process.env['MPD_HOST'] || 'localhost';
    private static readonly PORT: number = parseInt(process.env['MPD_PORT']) || 6600;
    private static readonly MUSIC_DIR: string = process.env['MPD_MUSIC_DIR'] || '~/Music';

    private client: MPDApi.ClientAPI;

    public Ready: Promise<any>;

    constructor() {
        // TODO: later, we'll also start the MPD instance from here
        const config = {
            host: MPD.HOST,
            port: MPD.PORT
        }

        this.Ready = new Promise((resolve, reject) => {
            mpdApi.connect(config)
                .then(client => {
                    this.client = client;
                    resolve(undefined);
                })
                .catch(reject)
        })
    }

    pause(): Promise<string> {
        return this.client.sendCommand('pause');
    }

    play(): Promise<string> {
        return this.client.sendCommand('play');
    }
}
const port = process.env['SERVER_PORT'] || 3000;
const app = express();
const mpdClient = new MPD();

app.get('/', (req, res) => {
    res.send('try /play or /pause to control mpd')
});

app.get('/play', (req, res) => {
    mpdClient.Ready.then(() => {
        mpdClient.play()
            .then(() => res.send("mpd should have played"))
            .catch(err => res.send(`mpd failed playing for some reason:\n${err}`));
    })
    .catch(() => res.send("a connection to mpd hasn't be made"))
});

app.get('/pause', (req, res) => {
    mpdClient.Ready.then(() => {
        mpdClient.pause()
            .then(() => res.send("mpd should have paused"))
            .catch(err => res.send(`mpd failed pausing for some reason:\n${err}`));
    })
    .catch(() => res.send("a connection to mpd hasn't be made"))
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
