export interface TemporalValue<T> {
    readonly created: number;
    readonly modified: number;
    value: T;
}

export class DefaultTemporalValue<T> implements TemporalValue<T> {
    constructor(value?: T) {
        this._created = Date.now();
        this._modified = this._created;
        this._value = value;
    }

    private _created: number;

    get created(): number {
        return this._created;
    }

    private _modified: number;

    get modified(): number {
        return this._modified;
    }

    private _value: T;

    get value(): T {
        return this._value;
    }

    set value(val: T) {
        this._modified = Date.now();
        this._value = val;
    }
}