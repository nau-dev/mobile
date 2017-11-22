import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { User } from '../models/user';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable()
export class ProfileService {
    user: User;

    constructor(private api: ApiService, private auth: AuthService) {
        auth.onLogout.subscribe(() => this.user = undefined);
    }

    get(forceReload: boolean) {
        if (forceReload || !this.user) {
            let obs = this.api.get('profile');
            obs.subscribe(user => this.user = user);
            return obs;
        }
        else {
            return Observable.of(this.user);
        }        
    }

    getReferrals() {
        return this.api.get('profile/referrals');
    }

    getTransactions(page) {
        return this.api.get(`transactions?orderBy=created_at&sortedBy=desc&page=${page}`, page == 1);
    }

    getWithAccounts() {
        return this.api.get('profile?with=accounts');
    }

    put(user: User) {
        let obs = this.api.put('profile', user);
        obs.subscribe(user => this.user = user);
        return obs;
    }
}