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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    login() {
        return 'login!';
    }
    validate(username, password) {
        if (this.authService.validate(username, password)) {
            return 'login success!';
        }
        else {
            return "invalid username or password!";
        }
    }
    register(username, password, confirmPassword) {
        if (username === undefined || password === undefined || confirmPassword === undefined ||
            username === '' || password === '' || confirmPassword === '') {
            return 'username or password cannot be empty!';
        }
        if (this.authService.isUsernameUnique(username)) {
            if (password === confirmPassword) {
                this.authService.register(username, password);
                return 'register success!';
            }
            else {
                return 'passwords do not match!';
            }
        }
        else {
            return 'username already exists!';
        }
    }
    getUsers() {
        return this.authService.getUsers() + '\n' + this.authService.getBsbAcc();
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Query)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", String)
], AuthController.prototype, "validate", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Query)('password')),
    __param(2, (0, common_1.Query)('confirmPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", String)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('getUsers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AuthController.prototype, "getUsers", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map