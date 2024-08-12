import { JSDOM } from "jsdom";
import WebSocket from "ws";
import * as osc from "node-osc";
import { TypedEventEmitter } from "./typedEventEmitter";
import { StartHyperateMonitorParams } from "src/types";
import { format } from "date-fns/format";
import { debouncedSkip } from "../utils";

interface HyperateMonitorEventsMap {
  "monitor-connected": {};
  "monitor-stopped": {};
  "monitor-error": string;

  "heartbeat-sent": {};
  "heartrate-update": number;
}

export class HyperateMonitor {
  code: string = "";
  isConnected: boolean = false;
  isGlobalStop: boolean = false;

  options = {
    isUpDownIconEnabled: false,
    is24HoursFormatEnabled: true,
    textFormat: "❤❤❤ {heartRate} {hours}",
    vrcOscCompatibility: true
  };

  websocket: WebSocket;
  oscClient: osc.Client;
  eventEmitter: TypedEventEmitter<HyperateMonitorEventsMap>;

  reconnectIntervalId: NodeJS.Timeout = null;

  /* CONSTANT! */
  previousBeat: number = 5;
  previousHeartRate: number = 0;

  constructor() {
    this.oscClient = new osc.Client("localhost", 9000);
    this.eventEmitter = new TypedEventEmitter<HyperateMonitorEventsMap>();

    this.reconnectInterval = this.reconnectInterval.bind(this);
    this.heartbeat = this.heartbeat.bind(this);
    this.sendChatboxMessage = debouncedSkip(this.sendChatboxMessage.bind(this), 3000) // 3 sec before next call
  }

  get hyperateUrl() {
    return `https://app.hyperate.io/${this.code}`;
  }

  start() {
    this.isGlobalStop = false;
    this.openConnection();
    this.reconnectIntervalId = setInterval(this.reconnectInterval, 60 * 1000);
  }

  stop() {
    this.isGlobalStop = true;
    if (this.isConnected) {
      this.websocket.close();
    }
    clearInterval(this.reconnectIntervalId);
  }

  setCode(newCode: string) {
    this.code = newCode;
  }

  heartbeat() {
    if (!this.isConnected) {
      console.log(
        ">>> heartbeat error: can't invoke heartbeat without socket that are open!"
      );
      this.eventEmitter.emit(
        "monitor-error",
        "can't invoke heartbeat without socket that are open!"
      );
      return;
    }

    this.websocket.send(
      JSON.stringify([null, `${this.previousBeat}`, "phoenix", "heartbeat", {}])
    );
    this.previousBeat += 1;
    this.heartbeatSent();
  }

  async getStartData() {
    // @ts-ignore
    const htmlPageRaw = await fetch(this.hyperateUrl);
    const htmlPageSummary = await htmlPageRaw.text();
    const dom = new JSDOM(htmlPageSummary);

    const csrfToken = dom.window.document.querySelector(
      'meta[name="csrf-token"]'
      // @ts-ignore
    ).content;
    if (!csrfToken) {
      throw new Error("no csrf token");
    }

    const phxDiv = dom.window.document.querySelectorAll("[data-phx-main]");
    if (phxDiv.length < 1) {
      throw new Error("no phx div");
    }

    const phxSession = phxDiv[0].getAttribute("data-phx-session");
    const phxStatic = phxDiv[0].getAttribute("data-phx-static");
    const phxId = phxDiv[0].getAttribute("id");

    const setCookie = htmlPageRaw.headers.get("set-cookie")!.split(";");
    return {
      csrfToken,
      phxSession,
      phxStatic,
      phxId,
      hyperrateKey: setCookie[0],
    };
  }

  // wss://app.hyperate.io/live/websocket?_csrf_token=<csrf-token>&_mounts=0&vsn=2.0.0
  async openConnection() {
    console.log(">>> Starting hyperate monitor");
    this.previousBeat = 5;

    const startData = await this.getStartData();
    this.websocket = new WebSocket(
      `wss://app.hyperate.io/live/websocket?_csrf_token=${startData.csrfToken}&_mounts=0&vsn=2.0.0`,
      {
        headers: {
          Cookie: startData.hyperrateKey,
        },
      }
    );

    this.websocket.on("open", () => {
      this.websocket.send(
        JSON.stringify([
          "4",
          "4",
          `lv:${startData.phxId}`,
          "phx_join",
          {
            params: {
              _csrf_token: startData.csrfToken,
              _mounts: 0,
            },
            session: startData.phxSession,
            static: startData.phxStatic,
            url: this.hyperateUrl,
          },
        ])
      );
      this.isConnected = true;

      console.log(">>> hyperate connected");
      this.monitorConnected();
      setTimeout(this.heartbeat, 30 * 1000);
    });

    this.websocket.on("error", (error) => {
      console.error(error);
      this.eventEmitter.emit("monitor-error", error.message);
      this.monitorStopped();
      this.isConnected = false;
    });

    this.websocket.on("close", () => {
      this.isConnected = false;
      this.monitorStopped();
    });

    this.websocket.on("message", (data: any) => {
      const jsonData = JSON.parse(data);
      if (jsonData[3] === "phx_reply") {
        setTimeout(this.heartbeat, 30 * 1000);
      }
      if (jsonData[3] === "diff" && jsonData[4].e[0][0] === "new-heartbeat") {
        const newHeartRate = jsonData[4].e[0][1].heartbeat;
        
        if (newHeartRate === 0) {
          return;
        }

        let heartRateString = `${newHeartRate}`;
        
        if (this.options.isUpDownIconEnabled) {
          // replace with enable up/down icons
          if (newHeartRate > this.previousHeartRate) {
            heartRateString += "⬆️";
          } else if (newHeartRate < this.previousHeartRate) {
            heartRateString += "⬇️";
          }
        }
        
        this.heartbeatUpdated(newHeartRate);
        this.previousHeartRate = newHeartRate;

        this.sendChatboxMessage(
            this.options.textFormat
              .replace("{heartRate}", heartRateString)
              .replace(
                "{clock}",
                format(
                  new Date(),
                  this.options.is24HoursFormatEnabled ? "HH:mm" : "p"
                )
              )
        )
  
        if (this.options.vrcOscCompatibility) {
          this.sendVRCOscHeart(newHeartRate)
        }

        console.log("New heartbeat:", newHeartRate);
      }
    });
  }

  reconnectInterval() {
    if (!this.isConnected && !this.isGlobalStop) {
      this.openConnection();
    }
  }

  setOptions(
    newOptions: StartHyperateMonitorParams['options'],
    formattedString?: string
  ) {
    if (formattedString) {
      this.options.textFormat = formattedString;
    }
    console.log(newOptions);

    this.options.isUpDownIconEnabled = newOptions.includeUpDownIcon;
    this.options.is24HoursFormatEnabled =
      newOptions.include24HourFormat;
  }

  monitorConnected() {
    this.eventEmitter.emit("monitor-connected", {});
  }

  monitorStopped() {
    this.eventEmitter.emit("monitor-stopped", {});
  }

  heartbeatSent() {
    this.eventEmitter.emit("heartbeat-sent", {});
  }

  heartbeatUpdated(newHeartRate: number) {
    this.eventEmitter.emit("heartrate-update", newHeartRate);
  }

  sendChatboxMessage(message: string) {
    this.oscClient.send({
      address: "/chatbox/input",
      args: [
        {
          type: "string",
          value: message,
        },
        { type: "boolean", value: true },
      ],
    });
  }

  sendVRCOscHeart(newHeartRate: number) {
    this.oscClient.send({
      address: "/avatar/parameters/VRCOSC/Heartrate/Enabled",
      args: [
        {
          type: "boolean",
          value: true
        }
      ]
    })
    this.oscClient.send({
      address: "/avatar/parameters/VRCOSC/Heartrate/Units",
      args: [
        {
          type: "float",
          value:  newHeartRate % 10 / 10
        }
      ]
    })
    this.oscClient.send({
      address: "/avatar/parameters/VRCOSC/Heartrate/Tens",
      args: [
        {
          type: "float",
          value:  Math.floor((newHeartRate % 100) / 10) / 10
        }
      ]
    })
    this.oscClient.send({
      address: "/avatar/parameters/VRCOSC/Heartrate/Hundreds",
      args: [
        {
          type: "float",
          value:  Math.floor((newHeartRate % 1000) / 100) / 10
        }
      ]
    })
  }
}
