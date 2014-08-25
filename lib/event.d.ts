export interface Callback<T> {
    (arg1: T): void;
}
export interface IEvent<T> {
    emit(value: T): void;
    on(callback: Callback<T>, context?: any): void;
    off(callback: Callback<T>, context?: any): void;
}
export declare class Event<T> implements IEvent<T> {
    private _handlers;
    private _context;
    constructor(context?: any);
    public emit(value: T): void;
    public on(callback: Callback<T>, context?: any): void;
    public off(callback: Callback<T>, context?: any): void;
}
