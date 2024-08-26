import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    private userNamePair=[
        {username: 'admin1', password: 'admin1'},
        {username: 'admin2', password: 'admin2'}
    ]

    private userBsbAcc = [
        {username: 'admin1', bsb: '000-001', acc: '0000001'},
        {username: 'admin2', bsb: '000-001', acc: '0000002'}
    ];
    
    private bsbPool = [
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
    ]

    public validate(username: string, password: string): boolean {
        return this.userNamePair.some((pair) => pair.username === username && pair.password === password);
    }

    public isUsernameUnique(username: string): boolean {
        return !(this.userNamePair.some((pair) => pair.username === username));
    }

    public register(username: string, password: string): void {
        this.userNamePair.push({username, password});
        let ramdomAccountN = Math.floor(Math.random() * 1000000).toString();
        ramdomAccountN = ramdomAccountN.padStart(7, '0');
        while(this.userBsbAcc.some((pair) => pair.acc === ramdomAccountN)){
            ramdomAccountN = Math.floor(Math.random() * 1000000).toString();
            ramdomAccountN = ramdomAccountN.padStart(7, '0');
        }
        const bsb = this.bsbPool[Math.floor(Math.random() * 10)]
        this.userBsbAcc.push({username, bsb, acc: ramdomAccountN});
    }

    public getUsers(): string {
        return JSON.stringify(this.userNamePair);
    }

    public getBsbAcc(): string {
        return JSON.stringify(this.userBsbAcc);
    }
}
