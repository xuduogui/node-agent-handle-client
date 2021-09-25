/*
 * @Author: xuziyong
 * @Date: 2021-09-25 11:19:47
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-09-25 22:48:33
 * @Description: TODO
 */
const WebSocket = require('ws')
const axios = require('axios')
const {
  ToCenter,
  FromCenter,
  HANDLE_TYPE
} = require('./dataModel');
const { CLIENT_NAME, SERVER_CENTER } = require('./config');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const SER_STATUS = {
  RUN: 1,
  ERROR: -1,
  WAIT: 2,
  STOP: -2,
  RERUN: 3
}

let SER_CUR = SER_STATUS.STOP

let CLIENT_WS = null

function createClient(URL) {
  try {
    CLIENT_WS = new WebSocket(URL);
    CLIENT_WS.on('open', clientOpen);
    CLIENT_WS.on('ping', clientPing);
    CLIENT_WS.on('close', clientClose);
    CLIENT_WS.on('message', clientMessage);
    CLIENT_WS.on('error', clientError)
  } catch (error) {
    SER_CUR = SER_STATUS.STOP
  }
}

function clientOpen() {
  SER_CUR = SER_STATUS.RUN
  console.log('first send')
  CLIENT_WS.send(new ToCenter(-1, CLIENT_NAME, null, HANDLE_TYPE.http, true).msg())
}

function clientPing() {}

function clientClose() {
  SER_CUR = SER_STATUS.STOP
}

function clientError(error) {
  SER_CUR = SER_STATUS.ERROR
}

async function clientMessage(serverMsg) {
  const dataJson = new FromCenter(serverMsg)
  const msg = await httpTo(dataJson)
  try {

    switch (msg.status) {
      case 200:
        const {
          data, headers
        } = msg
        CLIENT_WS.send(new ToCenter(dataJson.id, CLIENT_NAME, {
          data,
          headers,
          status: msg.status
        }, HANDLE_TYPE.http).msg())
        break;

      default:
        const res = msg.response
        CLIENT_WS.send(new ToCenter(dataJson.id, CLIENT_NAME, {
          data: res ? res.data : 'unknow msg',
          headers: res ? res.headers : {},
          status: res ? res.status : 404
        }, HANDLE_TYPE.http).msg())
        break;
    }
  } catch (error) {
    CLIENT_WS.send(new ToCenter(dataJson.id, CLIENT_NAME, error, HANDLE_TYPE.http).msg())
  }
}

async function httpTo(dataJson) {
  try {
    const config = Object.assign({}, dataJson.data, {
      url: dataJson.data.headers.target_url + dataJson.data.url
    })
    return await axios(config)
  } catch (error) {
    return error
  }
}

function serverRun() {
  switch (SER_CUR) {
    // 停止需要重启
    case SER_STATUS.STOP:
      SER_CUR = SER_STATUS.RERUN;
      break;
      // 运行中保持
      // 异常需要重连
    case SER_STATUS.ERROR:
      SER_CUR = SER_STATUS.RERUN;
      break;

    default:
      SER_CUR = SER_STATUS.RUN
      break;
  }

  if (SER_CUR === SER_STATUS.RERUN) {
    createClient(SERVER_CENTER)
  }
}

setInterval(async () => {
  serverRun()
}, 3000);