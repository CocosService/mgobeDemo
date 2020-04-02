const gameId = ""; //替换为控制台上的 游戏 ID
const secretKey = ""; //替换为控制台上的 游戏 Key
const serverUrl = ""; //替换为控制台上的 域名
if (CC_EDITOR) {
  if (!Editor.CocosService_gmeDemo) {
    Editor.CocosService_gmeDemo = true;
    Editor.log(
      Editor.lang === "zh"
        ? "欢迎使用腾讯云 MGOBE 小游戏联机对战引擎服务！"
        : "Welcome to Tencent Cloud MGOBE online game engine service!"
    );
    Editor.log(
      Editor.lang === "zh"
        ? "这是一个简单的 MGOBE 示例 Demo，通过本示例您可以快速了解如何使用 MGOBE 来实现小游戏联机对战！"
        : "This is a simple MGOBE sample demo. Through this example, you can quickly learn how to use MGOBE to achieve online mini-games!"
    );
  }
  if (gameId === "" || secretKey === "" || serverUrl === "") {
    Editor.log(
      Editor.lang === "zh"
        ? "您需要首先从右侧的服务面板开启 腾讯云MGOBE 服务，然后从 腾讯云MGOBE 服务面板前往腾讯云控制台获取 SDK 初始化参数并填写到示例代码中的相关位置，以使 Demo 能够运行。"
        : "You need to start the Tencent Cloud MGOBE service from the service panel on the right, then go to the Tencent Cloud console from the Tencent Cloud MGOBE service panel to get the SDK initialization parameters and fill in the relevant locations in the sample code to enable the Demo to run."
    );
    Editor.log(
      Editor.lang === "zh"
        ? "初始化参数所在位置：assets/Script/index.js 文件最顶部"
        : "Location of initialization parameters: the top of the assets/Script/index.js file"
    );
  }
}

const gameInfo = {
  gameId: gameId,
  openId: "openid_test" + Math.random(), //自定义的用户唯一ID
  secretKey: secretKey
};
const config = {
  url: serverUrl,
  reconnectMaxTimes: 5,
  reconnectInterval: 1000,
  resendInterval: 1000,
  resendTimeout: 10000,
  cacertNativeUrl: ""
};

const playerInfo = {
  name: "Tom" + Math.random()
};

const matchRoomPara = {
  playerInfo,
  maxPlayers: 5,
  roomType: "1"
};

cc.Class({
  extends: cc.Component,

  properties: {
    btnInit: {
      default: null,
      type: cc.Button
    },
    btnJoin: {
      default: null,
      type: cc.Button
    },
    labelJoin: {
      default: null,
      type: cc.Label
    },
    btnSendMessage: {
      default: null,
      type: cc.Button
    },
    btnFrameSync: {
      default: null,
      type: cc.Button
    },
    btnSendToServer: {
      default: null,
      type: cc.Button
    },
    labelFrameSync: {
      default: null,
      type: cc.Label
    },
    logListView: {
      default: null,
      type: cc.ScrollView
    },
    itemTemplate: {
      default: null,
      type: cc.Node
    },
    cacertFile: {
      default: null,
      type: cc.Asset
    },
    joined: false,
    synced: false,
    lang: "zh",
    room: null,
    logs: []
  },

  onLoad: function() {
    this.btnInit.interactable = true;
    this.btnJoin.interactable = false;
    this.btnSendMessage.interactable = false;
    this.btnFrameSync.interactable = false;
    this.btnSendToServer.interactable = false;
    this.lang = cc.sys.language;
    this.labelJoin.string = "加入房间";
    this.labelFrameSync.string = "开始帧同步";
    this.tempText = "";
    this.tempSize = 0;
    this.tempTop = 0;
    cc.debug.setDisplayStats(false);
  },

  onDestroy: function() {},

  initMultiLang: function() {
    if (this.lang === cc.sys.LANGUAGE_CHINESE) {
    } else if (this.lang === cc.sys.LANGUAGE_ENGLISH) {
    }
  },

  init: function() {
    const _self = this;
    // MGOBE.DebuggerLog.enable = true;
    // 如果是原生平台，则加载 Cert 证书，否则会提示 WSS 错误
    if (cc.sys.isNative)
      config.cacertNativeUrl = cc.loader.md5Pipe
        ? cc.loader.md5Pipe.transformURL(this.cacertFile.nativeUrl)
        : this.cacertFile.nativeUrl;
    MGOBE.Listener.init(gameInfo, config, event => {
      console.log(event);
      if (event.code === 0) {
        _self.printLog("初始化成功");
        _self.room = new MGOBE.Room();
        MGOBE.Listener.add(_self.room);
        _self.room.onJoinRoom = _self.onJoinRoom.bind(_self);
        _self.room.onLeaveRoom = _self.onLeaveRoom.bind(_self);
        _self.room.onRecvFromClient = _self.onRecvFromClient.bind(_self);
        _self.room.onRecvFrame = _self.onRecvFrame.bind(_self);
        _self.room.onStartFrameSync = _self.onStartFrameSync.bind(_self);
        _self.room.onStopFrameSync = _self.onStopFrameSync.bind(_self);
        _self.room.onRecvFromGameSvr = _self.onRecvFromGameSvr.bind(_self);
        _self.btnJoin.interactable = true;
      } else {
        _self.printLog("初始化失败");
      }
    });
  },

  joinRoom: function() {
    const _self = this;
    if (this.joined) {
      this.room.leaveRoom({}, event => {
        console.log(event);
        if (event.code === 0) {
          _self.printLog("退房成功", _self.room.roomInfo.id);
          _self.room.initRoom();
          _self.labelJoin.string = "加入房间";
          _self.btnSendMessage.interactable = false;
          _self.btnFrameSync.interactable = false;
          _self.btnSendToServer.interactable = false;
          _self.joined = false;
        }
      });
    } else {
      this.room.matchRoom(matchRoomPara, event => {
        console.log(event);
        if (event.code === 0) {
          _self.printLog("匹配成功");
          _self.labelJoin.string = "离开房间";
          _self.btnSendMessage.interactable = true;
          _self.btnFrameSync.interactable = true;
          _self.btnSendToServer.interactable = true;
          _self.joined = true;
        } else {
          _self.printLog("匹配失败");
        }
      });
    }
  },

  sendMessage: function() {
    const sendToClientPara = {
      recvType: MGOBE.ENUM.RecvType.ROOM_ALL,
      recvPlayerList: [],
      msg: "hello" + Math.random()
    };
    this.room.sendToClient(sendToClientPara, event => console.log(event));
  },

  frameSync: function() {
    const _self = this;
    if (this.synced) {
      this.room.stopFrameSync({}, event => {
        console.log(event);
        if (event.code === 0) {
          _self.printLog("停止帧同步成功");
          _self.labelFrameSync.string = "开始帧同步";
          _self.synced = false;
        }
      });
    } else {
      this.room.startFrameSync({}, event => {
        console.log(event);
        if (event.code === 0) {
          _self.printLog("开始帧同步成功");
          _self.labelFrameSync.string = "停止帧同步";
          _self.synced = true;
        }
      });
    }
  },

  sendToServer: function() {
    const sendToGameServerPara = {
      data: {
        cmd: 1
      }
    };
    this.room.sendToGameSvr(sendToGameServerPara, event => console.log(event));
  },

  sendFrame: function() {
    this.room.sendFrame(
      {
        data: {
          cmd: "xxxxxxxx" + Math.random(),
          data: "asdgjasdhgkasdf",
          id: "xxxxxxxx" + Math.random()
        }
      },
      err => {
        //console.log("err", err);
      }
    );
  },

  onJoinRoom: function(event) {
    this.printLog("新玩家加入" + event.data.joinPlayerId);
    console.log("新玩家加入", event.data.joinPlayerId);
  },

  onLeaveRoom: function(event) {
    this.printLog("玩家退出" + event.data.leavePlayerId);
    console.log("玩家退出", event.data.leavePlayerId);
  },

  onRecvFromClient: function(event) {
    this.printLog("新消息" + event.data.msg);
    console.log("新消息", event.data.msg);
  },

  onRecvFrame: function(event) {
    this.sendFrame();
    console.log("帧广播", event.data.frame);
    if (event.data.frame.items && event.data.frame.items.length > 0) {
      //this.printLog("帧广播" + JSON.stringify(event.data.frame.items));
      console.log("帧广播", event.data.frame);
    }
  },

  onStartFrameSync: function(event) {
    this.synced = true;
    this.labelFrameSync.string = "停止帧同步";
    //this.printLog("开始帧同步\n");
  },

  onStopFrameSync: function(event) {
    this.synced = false;
    this.labelFrameSync.string = "开始帧同步";
    //this.printLog("停止帧同步\n");
  },

  onRecvFromGameSvr: function(event) {
    console.log("新自定义服务消息", event);
    //this.printLog("新自定义服务消息" + JSON.stringify(event));
  },

  printCode: function(code) {
    this.printLog("   ");
    this.printLog("---------- Sample code start ----------");
    this.printLog(code);
    this.printLog("---------- Sample code end   ----------");
    this.printLog("   ");
  },

  printLog: function(info) {
    if (this.tempSize > 100) {
      this.tempSize = 0;
      this.logListView.content.removeAllChildren(true);
    }
    this.tempSize = 0;
    this.tempText = this.tempText + info;
  },

  // called every frame
  update: function(dt) {
    if (this.tempText.length <= 0) return;

    var item = cc.instantiate(this.itemTemplate);

    this.logListView.content.addChild(item);
    item.getComponent("Item").updateItem(this.tempText);

    var lab = item.getComponent(cc.Label);
    lab._forceUpdateRenderData(true);

    var layout = this.logListView.content.getComponent(cc.Layout);
    layout.updateLayout();

    this.logListView.scrollToBottom(1 / 60);
    this.tempText = "";
  }
});
