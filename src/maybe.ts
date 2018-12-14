
/*
    I know there's libraries for this, but I'm having so much more fun implementing it myself :p
 */

interface Monad<M> {
    map<V>(func: (value: M) => V): Monad<V>;
    bind<V>(func: (value: M) => Monad<V>): Monad<V>;
}

export class Maybe<T> implements Monad<T> {
    static some<T>(value: T): Maybe<T> {
        return new Maybe(value);
    }

    static of<T>(value: T): Maybe<T> {
        return Maybe.isAValue(value) ? Maybe.some(value) : Maybe.nothing();
    }

    static nothing<T>() {
        return new Maybe<T>(null);
    }

    private static isAValue(t: any): boolean {
        return !(t === undefined || t === null);
    }

    public isPresent(): boolean {
        return Maybe.isAValue(this.value);
    }

    public getOrElse(defaultValue: T): T {
        return this.isPresent() ? this.value as T : defaultValue;
    }

    public getOrNull(): T | null {
        return this.isPresent() ? this.value as T : null;
    }

    public getOrUndefined(): T | undefined {
        return this.isPresent() ? this.value as T : undefined;
    }

    public getOrCrash(): T {
        if (!this.isPresent()) {
            throw 'Value from Maybe assumed not null, was null!';
        }
        return this.value as T;
    }

    public assert<S>(f: (t: T) => boolean): Maybe<T> {
        if (this.isPresent() && f(this.value as T)) {
            return this;
        }
        return Maybe.nothing();
    }

    public map<S>(f: (t: T) => S): Maybe<S> {
        if (this.isPresent()) {
            return Maybe.of(f(this.value as T));
        }
        return Maybe.nothing();
    }

    public filter(f: (t: T) => boolean): Maybe<T> {
        if (this.isPresent() && f(this.value as T)) {
            return this;
        }
        return Maybe.nothing();
    }

    public do(f: (t: T) => void): Maybe<T> {
        if (this.isPresent()) {
            f(this.value as T);
        }

        return this;
    }

    public bind<S>(f: (t: T) => Maybe<S>): Maybe<S> {
        if (this.isPresent()) {
            return f(this.value as T);
        }
        return Maybe.nothing();
    }

    private constructor(private value: T | null) { }
}

export const safeFind = <T>(arr: Array<T>, isTheOne: (t: T) => boolean): Maybe<T> => {
    let foundObj = arr.find(isTheOne);

    return foundObj === undefined ? Maybe.nothing() : Maybe.of(foundObj);
};