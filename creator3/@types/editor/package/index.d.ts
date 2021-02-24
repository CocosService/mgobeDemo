import { GetPackageOptions, PathType } from './public/interface';
export declare const Package: {
    /**
     * 查询插件列表
     * @param options
     */
    getPackages(options?: GetPackageOptions): Editor.Interface.PackageInfo[];
    /**
     * 注册一个插件
     * @param path
     */
    register(path: string): any;
    /**
     * 反注册一个插件
     * @param path
     */
    unregister(path: string): any;
    /**
     * 启动一个插件
     * @param path
     */
    enable(path: string): any;
    /**
     * 关闭一个插件
     * @param path
     */
    disable(path: string): any;
    /**
     * 获取一个插件的几个预制目录地址
     * @param extensionName 扩展的名字
     * @param type 地址类型（temp 临时目录，data 需要同步的数据目录）
     */
    getPath(extensionName: string, type: PathType): any;
    /**
     * 监听插件事件
     * @param action
     * @param handle
     */
    on(action: string, handle: Function): any;
    /**
     * 监听一次插件事件
     * @param action
     * @param handle
     */
    once(action: string, handle: Function): any;
    /**
     * 移除监听插件的事件
     * @param action
     * @param handle
     */
    removeListener(action: string, handle: Function): any;
};
