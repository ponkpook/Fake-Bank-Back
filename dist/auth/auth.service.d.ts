export declare class AuthService {
    private userNamePair;
    private userBsbAcc;
    private bsbPool;
    validate(username: string, password: string): boolean;
    isUsernameUnique(username: string): boolean;
    register(username: string, password: string): void;
    getUsers(): string;
    getBsbAcc(): string;
}
