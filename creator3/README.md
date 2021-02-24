# MGOBE Demo

小游戏联机对战引擎（Mini Game Online Battle Engine，MGOBE）为游戏提供房间管理、在线匹配、帧同步、状态同步等网络通信服务，帮助开发者快速搭建多人交互游戏。开发者无需关注底层网络架构、网络通信、服务器扩缩容、运维等，即可获得就近接入、低延迟、实时扩容的高性能联机对战服务，让玩家在网络上互通、对战、自由畅玩。MGOBE 适用于回合制、策略类、实时会话（休闲对战、MOBA、FPS）等游戏。

文档：https://service.cocos.com/document/zh/mgobe.html

# 使用说明

这是一个简单的 MGOBE 示例 Demo，通过本示例您可以快速了解如何使用 MGOBE 来实现小游戏联机对战！

您需要首先在Cocos Creator的服务面板（通过菜单 面板->服务 进入）开启 腾讯云 MGOBE 服务，然后从 腾讯云 MGOBE 服务面板前往腾讯云控制台获取 SDK 初始化参数并填写到示例代码中的相关位置，以使 Demo 能够运行。

初始化所需参数在 assets/scripts/controller.ts 文件最顶部。
