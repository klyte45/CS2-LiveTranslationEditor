import engine from "cohtml/cohtml";

export class MultiUIValueBinding<T> {

    public get value(): T {
        return this.internalValue as T;
    }
    private internalValue?: T;
    private subscriptions: ((x: T) => Promise<any>)[] = []
    private onUpdate = (x: T) => this.setInternalValue(x);

    setInternalValue(x: any) {
        this.internalValue = x;
        Promise.all(this.subscriptions.map(y => y(x)));
    }

    constructor(private propertyPrefix: string) {
        engine.off(this.propertyPrefix + "->");
        this.reactivate();
    }

    async set(newValue: T) {
        engine.call(this.propertyPrefix + "!", newValue);
    }

    dispose() {
        engine.off(this.propertyPrefix + "->", this.onUpdate);
        this.subscriptions = []
    }
    reactivate() {
        this.subscriptions = []
        engine.call(this.propertyPrefix + "?").then((x) => this.setInternalValue(x));
        engine.off(this.propertyPrefix + "->", this.onUpdate);
        engine.on(this.propertyPrefix + "->", this.onUpdate, this);
    }

    subscribe(fn: (x: T) => Promise<any>) {
        this.subscriptions.push(fn);
    }

}
