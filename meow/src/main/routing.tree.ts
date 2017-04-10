const SEP = '/';
const PLUS = '+';
const HASH = '#';

export class RoutingTree<V> {
    private readonly nodes: Map<string, RoutingTree<V>> = new Map();
    private readonly hash: V[] = [];

    constructor(private readonly name?: string) {
    }

    private _value: V;

    get value(): V {
        return this._value;
    }

    add(topic: string, val: V): void {
        // TODO validate if '#' must be last
        this._add(topic.split(SEP), 0, val);
    }

    private _add(topic: string[], idx: number, val: V): void {
        if (idx > topic.length - 1) return;
        let part = topic[idx];
        if (part === HASH) {
            this.hash.push(val);
        } else {
            let node = this.nodes.get(part);
            if (!node) {
                node = new RoutingTree<V>(part);
                this.nodes.set(part, node);
            }
            if (idx === topic.length - 1) {
                node._value = val;
            } else {
                node._add(topic, idx + 1, val);
            }
        }
    }

    remove(topic: string, val: V): void {
        this._remove(topic.split(SEP), 0, val);
    }

    private _remove(topic: string[], idx: number, val: V): void {
        if (idx > topic.length - 1) return;
        let part = topic[idx];
        if (part === HASH) {
            let idx = this.hash.indexOf(val);
            if (idx > -1) this.hash.splice(idx, 1);
        } else {
            let node = this.nodes.get(part);
            if (!node) return;
            node._remove(topic, idx + 1, val);
        }
    }

    forEach(topic: string, callback: (val: V) => void): void {
        if (!topic) throw 'Require not null';
        let parts = topic.split(SEP);
        parts.forEach((part) => { // Check argument
            if (part === PLUS) throw `Wildcard ${PLUS} not allowed`;
            if (part === HASH) throw `Wildcard ${HASH} not allowed`;
        });
        this._forEach(parts, 0, callback);
    }

    private _forEach(topic: string[], idx: number, callback: (val: V) => void): void {
        if (idx > topic.length - 1) return;
        let part = topic[idx];
        // First most specific handlers
        let node = this.nodes.get(part);
        if (node) {
            if (idx === topic.length - 1) {
                let value = node._value;
                if (value) callback(value);
            } else {
                node._forEach(topic, idx + 1, callback);
            }
        }
        // Then less specific
        let plus = this.nodes.get(PLUS);
        if (plus) {
            plus._forEach(topic, idx + 1, callback);
        }
        // Then least specific
        this.hash.forEach((val) => {
            callback(val);
        });
    }
}