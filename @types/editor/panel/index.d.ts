export declare const Panel: {
    _kitControl: any;
    /**
     * 打开一个面板
     * @param name
     * @param args
     */
    open(name: string, ...args: any[]): any;
    /**
     * 关闭一个面板
     * @param name
     */
    close(name: string): any;
    /**
     * 将焦点传递给一个面板
     * @param name
     */
    focus(name: string): any;
    /**
     * 检查面板是否已经打开
     * @param name
     */
    has(name: string): Promise<any>;
};
