"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
let AuthService = class AuthService {
    constructor() {
        this.userNamePair = [
            { username: 'admin1', password: 'admin1' },
            { username: 'admin2', password: 'admin2' }
        ];
        this.userBsbAcc = [
            { username: 'admin1', bsb: '000-001', acc: '0000001' },
            { username: 'admin2', bsb: '000-001', acc: '0000002' }
        ];
        this.bsbPool = [
            '000-001',
            '000-002',
            '000-003',
            '000-004',
            '000-005',
            '111-001',
            '111-002',
            '111-003',
            '112-001',
            '112-002'
        ];
    }
    validate(username, password) {
        return this.userNamePair.some((pair) => pair.username === username && pair.password === password);
    }
    isUsernameUnique(username) {
        return !(this.userNamePair.some((pair) => pair.username === username));
    }
    register(username, password) {
        this.userNamePair.push({ username, password });
        let ramdomAccountN = Math.floor(Math.random() * 1000000).toString();
        ramdomAccountN = ramdomAccountN.padStart(7, '0');
        while (this.userBsbAcc.some((pair) => pair.acc === ramdomAccountN)) {
            ramdomAccountN = Math.floor(Math.random() * 1000000).toString();
            ramdomAccountN = ramdomAccountN.padStart(7, '0');
        }
        const bsb = this.bsbPool[Math.floor(Math.random() * 10)];
        this.userBsbAcc.push({ username, bsb, acc: ramdomAccountN });
    }
    getUsers() {
        return JSON.stringify(this.userNamePair);
    }
    getBsbAcc() {
        return JSON.stringify(this.userBsbAcc);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map