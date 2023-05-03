import { config } from './config';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import WebSocket from 'ws';
import * as osc from "node-osc"

async function getStartData() {
    const htmlPage = await axios.get(config.hyperateWidgetUrl);
    const dom = new JSDOM(htmlPage.data);

    const csrfToken = dom.window.document.querySelector('meta[name="csrf-token"]').content;
    if (!csrfToken) {
        throw new Error("no csrf token")
    }

    const phxDiv = dom.window.document.querySelectorAll('[data-phx-main]');
    if (phxDiv.length < 1) {
        throw new Error("no phx div")
    }

    const phxSession = phxDiv[0].getAttribute("data-phx-session")
    const phxStatic = phxDiv[0].getAttribute("data-phx-static")
    const phxId = phxDiv[0].getAttribute("id")

    const setCookie = htmlPage.headers['set-cookie']![0].split(";")
    return {
        csrfToken,
        phxSession,
        phxStatic,
        phxId,
        hyperrateKey: setCookie[0]
    }
}

(async () => {
    console.log(">>> Starting hyperate monitor")
    
    const oscClient = new osc.Client("localhost", 9000)

    let connectedFlag = false;
    let pingTimeout: any = null;
    let client: any = null;

    let previousBeat = 5
    const heartbeat = () => {
        console.log("sending heartbeat", previousBeat)
        client.send(JSON.stringify([null, `${previousBeat}`, "phoenix", "heartbeat", {}]))
        previousBeat += 1
    }

    // wss://app.hyperate.io/live/websocket?_csrf_token=PwgqDzh2AQYtEWNCbBsNfC98CXM6KlgDFNakL4o0uPVo5AcJbLe2wm5s&_mounts=0&vsn=2.0.0
    async function reconnect() {
        previousBeat = 5;

        const startData = await getStartData();
        client = new WebSocket(`wss://app.hyperate.io/live/websocket?_csrf_token=${startData.csrfToken}&_mounts=0&vsn=2.0.0`, {
            headers: {
                'Cookie': startData.hyperrateKey
            }
        });

        client.on('open', () => {
            connectedFlag = true;
            client.send(JSON.stringify(["4", "4", `lv:${startData.phxId}`, "phx_join", {
                params: {
                    _csrf_token: startData.csrfToken,
                    _mounts: 0
                },
                session: startData.phxSession,
                static: startData.phxStatic,
                url: config.hyperateWidgetUrl
            }]))

            console.log(">>> hyperate connected")
            setTimeout(heartbeat, 30 * 1000)
        });
        client.on('error', (error) => {
            console.error(error)
            connectedFlag = false;
        });
        client.on('close', () => {
            connectedFlag = false
        });
        client.on('message', (data) => {
            const jsonData = JSON.parse(data);
            if (jsonData[3] === 'phx_reply') {
                clearTimeout(pingTimeout)
                setTimeout(heartbeat, 30 * 1000)
            }
            if (jsonData[3] === "diff" && jsonData[4].e[0][0] === "new-heartbeat") {
                console.log("New heartbeat:", jsonData[4].e[0][1].heartbeat)
                oscClient.send({
                    address: "/chatbox/input",
                    args: [
                      { type: "string", value: config.hyperateText.replace("{}", `${jsonData[4].e[0][1].heartbeat}`) },
                      { type: "boolean", value: true },
                    ]
                })
            }
        })
    }

    setInterval(() => {
        if (!connectedFlag) {
            reconnect()
        }
    }, 60 * 1000) // 1 minute

    reconnect()
})()