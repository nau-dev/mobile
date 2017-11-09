import { Injectable, EventEmitter } from '@angular/core';
import { Register } from '../models/register';
import { Login } from '../models/login';
import { ApiService } from './api.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {

    inviteCode: string = '';
    registerData: Register = new Register();

    onLogout = new EventEmitter();

    constructor(
        private api: ApiService,
        private token: TokenService) {

        this.token.onRemove.subscribe(() => this.onLogout.emit());

        setInterval(() => {
            if (this.isLoggedIn()) {
                this.api.get('auth/token', false)
                    .subscribe(
                        token => this.token.set(token),
                        errResp => {
                            this.token.remove();
                        });
            }
        }, 60 * 1000);  //every 5 min
    }

    getInviteCode() {
        //this.inviteCode = to do
        return this.inviteCode;
    }

    setInviteCode(invite) {
        this.inviteCode = invite;
    }

    isLoggedIn() {
        let token = this.token.get();
        return !!token;
    }

    getReferrerId(inviteCode: string, phone: string) {
        return this.api.get(`auth/register/${inviteCode}/${phone}/code`);
    }

    register(register: Register) {
        return this.api.post('users', register);
    }

    login(login: Login) {
        this.deleteAllCookies();
        let obs = this.api.post('auth/login', login);
        obs.subscribe(token => this.token.set(token));
        return obs;
    }

    logout() {
        this.token.remove();
    }

    getOtp(phone) {
        return phone.slice(-6);//to do
    }

    deleteAllCookies() {
        let cookies = document.cookie.split(";");
    
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            let eqPos = cookie.indexOf("=");
            let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
}