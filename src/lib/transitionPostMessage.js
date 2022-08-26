import IdMapping from './id_mapping';

export default class TransitionPostMessage {
    constructor({ isDebugger }) {
        this.isDebugger = isDebugger;
        this.idMapping = new IdMapping();
        this.callbacks = new Map();
    }

    _request(payload) {
        this.idMapping.tryIntifyId(payload);
        this._console(`==> _request1 payload ${JSON.stringify(payload)}`);
        return new Promise((resolve, reject) => {
            if (!payload.id) {
                payload.id = this.idMapping.genId();
            }
            this.callbacks.set(payload.id, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
            this.postMessage(payload.method, payload.id, payload.data);
        });
    }

    /**
     * transfer data to native app
     * @param {*} handler method name
     * @param {*} id call method name unique id
     * @param {*} data request parameter
     */
    postMessage(handler, id, data) {
        const object = JSON.stringify({
            id,
            name: handler,
            object: data,
        });
        if (window.GSWallet.postMessage) {
            window.GSWallet.postMessage(object);
        } else {
            window.webkit.messageHandlers[handler].postMessage(object);
        }
    }

    /**
     * accept native app data and return it to dapp
     * @param {*} id  call method name unique id
     * @param {*} result  signed data
     */
    sendResponse(id, result) {
        let callback = this.callbacks.get(id);
        this._console(
            `<== sendResponse id: ${id}, result: ${JSON.stringify(
                result
            )}, data: ${JSON.stringify(result)}`
        );
        if (callback) {
            callback(null, result);
            this.callbacks.delete(id);
        } else {
            this._console(`callback id: ${id} not found`);
            // check if it's iframe callback
            for (var i = 0; i < window.frames.length; i++) {
                const frame = window.frames[i];
                try {
                    if (frame.TransitionPostMessage.callbacks.has(id)) {
                        frame.TransitionPostMessage.sendResponse(id, result);
                    }
                } catch (error) {
                    this._console(`send response to frame error: ${error}`);
                }
            }
        }
    }

    _console(message) {
        if (!this.isDebugger) return;
        console.log(message);
    }
}
