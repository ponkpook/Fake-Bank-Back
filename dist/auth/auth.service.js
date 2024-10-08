"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../User/user.service");
let AuthService = class AuthService {
    constructor(userService) {
        this.userService = userService;
    }
    async validate(username, password) {
        const user = await this.userService.getUser(username);
        if (user == null) {
            return false;
        }
        if (user.password === password) {
            return true;
        }
        return false;
    }
    async register(username, password, confirmPassword) {
        if (username == "" || password == "" || confirmPassword == ""
            || username == null || password == null || confirmPassword == null) {
            return { msg: 'Please fill out all fields', success: false };
        }
        if (password !== confirmPassword) {
            return { msg: 'Passwords do not match', success: false };
        }
        const user = await this.userService.getUser(username);
        if (user != null) {
            return { msg: 'Username already exists', success: false };
        }
        var isAdmin = false;
        if (username == "admin1" || username == "admin2" || username == "admin3") {
            isAdmin = true;
        }
        this.userService.createUser({
            username: username,
            password: password,
            isAdmin: isAdmin,
            date: new Date()
        });
        this.userService.createDefaultAcc(username);
        return { msg: 'User created', success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], AuthService);
//# sourceMappingURL=auth.service.js.map