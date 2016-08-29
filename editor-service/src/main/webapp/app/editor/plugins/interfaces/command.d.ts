declare interface Command {
    execute(): void;
    revert(): void;
    isRevertible(): boolean;
}
