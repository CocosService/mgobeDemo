const gameId = ''; // 请替换为控制台上的“游戏ID”
const secretKey = ''; // 请替换为控制台上的“游戏Key”
const url = ''; // 请替换为控制台上的“域名”

const gameInfo: MGOBE.types.GameInfoPara = {
    gameId,
    secretKey,
    openId: `openid_${generateRandomInteger(1, 100000)}_test`,
};

const config: MGOBE.types.ConfigPara = {
    url,
    reconnectMaxTimes: 5,
    reconnectInterval: 1000,
    resendInterval: 1000,
    resendTimeout: 1000 * 10,
    cacertNativeUrl: '',
};

import {
    _decorator,
    Component,
    Prefab,
    Button,
    instantiate,
    Label,
    ScrollView,
    sys,
    loader,
    log,
    url as ccUrl,
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Controller')
export class Controller extends Component {
    @property({ type: ScrollView })
    logView: ScrollView = null!;

    @property({ type: Prefab })
    logItem: Prefab = null!;

    @property({ type: Button })
    initButton: Button = null!;
    @property({ type: Button })
    joinLeaveRoomButton: Button = null!;
    @property({ type: Button })
    sendMessageButton: Button = null!;
    @property({ type: Button })
    startStopFrameSyncButton: Button = null!;
    @property({ type: Button })
    sendToServerButton: Button = null!;

    @property({ type: Label })
    joinLeaveRoomLabel: Label = null!;
    @property({ type: Label })
    startStopFrameSyncLabel: Label = null!;

    private room: MGOBE.Room | null = null;
    private joinedRoom: boolean = false;
    private frameSyncStarted: boolean = false;

    start() {
        this.joinLeaveRoomButton.interactable = false;
        this.sendMessageButton.interactable = false;
        this.startStopFrameSyncButton.interactable = false;
        this.sendToServerButton.interactable = false;
    }

    private log(...args: any[]) {
        const msgs = args.map((arg: Object | null | undefined) => {
            if (arg === null) {
                return 'null';
            }
            if (arg === undefined) {
                return 'undefined';
            }
            if (arg.toString().startsWith('[object ')) {
                return JSON.stringify(arg);
            }
            return arg.toString();
        });

        const logItem = instantiate(this.logItem);
        const label = logItem.getComponent(Label);
        if (!label) {
            log('无法获取Label组件');
            return;
        }
        label.string = msgs.join(' ');

        if (!this.logView.content) {
            log('logView没有content成员');
            return;
        }

        this.logView.content.addChild(logItem);
        this.logView.scrollToBottom(0.5);
    }

    onInitButtonClicked() {
        this.initButton.interactable = false;

        if (sys.isNative) {
            const ccUrlAny: any = ccUrl;
            const pemUrl = ccUrlAny.raw('resources/cacert.pem');
            config.cacertNativeUrl = loader.md5Pipe
                ? loader.md5Pipe.transformURL(pemUrl)
                : pemUrl;
        }

        MGOBE.Listener.init(gameInfo, config, (event) => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                this.log('初始化成功');

                this.room = new MGOBE.Room();
                MGOBE.Listener.add(this.room);
                this.room.onJoinRoom = this.onJoinRoom.bind(this);
                this.room.onLeaveRoom = this.onLeaveRoom.bind(this);
                this.room.onRecvFromClient = this.onRecvFromClient.bind(this);
                this.room.onRecvFrame = this.onRecvFrame.bind(this);
                this.room.onStartFrameSync = this.onStartFrameSync.bind(this);
                this.room.onStopFrameSync = this.onStopFrameSync.bind(this);
                this.room.onRecvFromGameSvr = this.onRecvFromGameSvr.bind(this);

                this.joinLeaveRoomButton.interactable = true;
            } else {
                this.log('初始化失败');
                this.initButton.interactable = true;
            }
        });
    }

    onJoinLeaveRoomButtonClicked() {
        if (!this.room) {
            log('房间对象不存在');
            return;
        }

        const playerInfo: MGOBE.types.PlayerInfoPara = {
            name: 'Name' + generateRandomInteger(1, 1000),
            customPlayerStatus: generateRandomInteger(0, 9),
            customProfile: 'Profile' + generateRandomInteger(1, 1000),
        };
        const matchRoomPara: MGOBE.types.MatchRoomPara = {
            playerInfo,
            maxPlayers: 5,
            roomType: '1',
        };

        if (!this.joinedRoom) {
            this.room.matchRoom(matchRoomPara, (event) => {
                if (event.code === MGOBE.ErrCode.EC_OK) {
                    this.log('匹配成功');
                    this.joinLeaveRoomLabel.string = '离开房间';
                    this.sendMessageButton.interactable = true;
                    this.startStopFrameSyncButton.interactable = true;
                    this.sendToServerButton.interactable = true;
                    this.joinedRoom = true;
                } else {
                    this.log('匹配失败');
                }
                this.log('msg:', event.msg);
                if (event.data) {
                    this.log('data:', event.data);
                }
            });
        } else {
            this.room.leaveRoom({}, (event) => {
                if (event.code === MGOBE.ErrCode.EC_OK) {
                    this.log('退房成功');
                    if (!this.room) {
                        return;
                    }
                    this.room.initRoom();
                    this.joinLeaveRoomLabel.string = '加入房间';
                    this.sendMessageButton.interactable = false;
                    this.startStopFrameSyncButton.interactable = false;
                    this.sendToServerButton.interactable = false;
                    this.joinedRoom = false;
                } else {
                    this.log('退房失败');
                }
                this.log('msg:', event.msg);
                if (event.data) {
                    this.log('data:', event.data);
                }
            });
        }
    }

    onSendMessageButtonClicked() {
        if (!this.room) {
            log('房间对象不存在');
            return;
        }

        const sendToClientPara: MGOBE.types.SendToClientPara = {
            recvType: MGOBE.ENUM.RecvType.ROOM_ALL,
            recvPlayerList: [],
            msg: 'Hello' + generateRandomInteger(1, 1000),
        };
        this.room.sendToClient(sendToClientPara, (event) => {
            if (event.code !== MGOBE.ErrCode.EC_OK) {
                this.log('error:', event);
            }
        });
    }

    onStartStopFrameSyncButtonClicked() {
        if (!this.room) {
            log('房间对象不存在');
            return;
        }

        if (!this.frameSyncStarted) {
            this.room.startFrameSync({}, (event) => {
                if (event.code === MGOBE.ErrCode.EC_OK) {
                    this.log('开始帧同步成功，请到控制台查看具体帧同步信息');
                }
                if (event.code !== MGOBE.ErrCode.EC_OK) {
                    this.log('error:', event);
                }
            });
        } else {
            this.room.stopFrameSync({}, (event) => {
                if (event.code === MGOBE.ErrCode.EC_OK) {
                    this.log('停止帧同步成功');
                }
                if (event.code !== MGOBE.ErrCode.EC_OK) {
                    this.log('error:', event);
                }
            });
        }
        log(this.startStopFrameSyncLabel.string);
    }

    onSendToServerButtonClicked() {
        if (!this.room) {
            log('房间对象不存在');
            return;
        }

        const sendToGameSrvPara: MGOBE.types.SendToGameSvrPara = {
            data: {
                cmd: 1,
            },
        };
        this.room.sendToGameSvr(sendToGameSrvPara, (event) => this.log(event));
    }

    private onJoinRoom(
        event: MGOBE.types.BroadcastEvent<MGOBE.types.JoinRoomBst>
    ): any {
        this.log('新玩家加入', event.data.joinPlayerId);
    }

    private onLeaveRoom(
        event: MGOBE.types.BroadcastEvent<MGOBE.types.LeaveRoomBst>
    ): any {
        this.log('玩家退出', event.data.leavePlayerId);
    }

    private onRecvFromClient(
        event: MGOBE.types.BroadcastEvent<MGOBE.types.RecvFromClientBst>
    ): any {
        this.log('新消息', event.data.msg);
    }

    private onRecvFrame(
        event: MGOBE.types.BroadcastEvent<MGOBE.types.RecvFrameBst>
    ): any {
        if (!this.room) {
            log('房间对象不存在');
            return;
        }

        this.room.sendFrame(
            {
                data: {
                    cmd: 'cmd_' + generateRandomInteger(1, 1000),
                    data: 'data_' + generateRandomInteger(1, 1000),
                    id: 'id_' + generateRandomInteger(1, 1000),
                },
            },
            (_event) => {}
        );
        log('帧广播', event.data.frame);
    }

    private onStartFrameSync(
        _event: MGOBE.types.BroadcastEvent<MGOBE.types.StartFrameSyncBst>
    ): any {
        this.startStopFrameSyncLabel.string = '停止帧同步';
        this.frameSyncStarted = true;
    }

    private onStopFrameSync(
        _event: MGOBE.types.BroadcastEvent<MGOBE.types.StopFrameSyncBst>
    ): any {
        this.startStopFrameSyncLabel.string = '开始帧同步';
        this.frameSyncStarted = false;
    }

    private onRecvFromGameSvr(
        event: MGOBE.types.BroadcastEvent<MGOBE.types.RecvFromGameSvrBst>
    ): any {
        this.log('自定义服务器消息', event.data);
    }
}

function generateRandomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
