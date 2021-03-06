import { EventEmitter, Injectable } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';
import { User } from '../models/user';
import { ApiService } from './api.service';
import { AppModeService } from './appMode.service';
import { OfferService } from './offer.service';
import { TokenService } from './token.service';
import { GoogleAnalyticsService } from './googleAnalytics.service';

@Injectable()
export class ProfileService {
    user: User;
    onRefreshAccounts: EventEmitter<User> = new EventEmitter<User>();
    onRefresh: EventEmitter<User> = new EventEmitter<User>();

    constructor(
        private api: ApiService,
        private token: TokenService,
        private oneSignal: OneSignal,
        private platform: Platform,
        private appMode: AppModeService,
        private offer: OfferService,
        private gAnalytics: GoogleAnalyticsService) {

        this.token.onRemove.subscribe(() => this.user = undefined);
        this.offer.onRefreshRedeemedOffers.subscribe(user => {
            this.user = user;
            this.onRefresh.emit(user);
        });
    }

    get(forceReload: boolean, showLoading?: boolean) {
        if (forceReload || !this.user) {
            let obs = this.api.get('profile', { showLoading: showLoading });
            obs.subscribe(user => {
                if (this.platform.is('cordova')
                    && (!this.user || this.user.name !== user.name || this.user.phone !== user.phone || this.user.email !== user.email)) {
                    this.sendTags(user);
                    this.gAnalytics.setUserId(user.invite_code);
                }
                this.user = user;
                this.onRefresh.emit(user);
            },
                err => { });
            return obs;
        }
        return Observable.of(this.user);
    }

    getReferrals(page) {
        return this.api.get(`profile/referrals?page=${page}`, {
            showLoading: page == 1
        });
    }

    getWithAccounts(showLoading?: boolean) {
        let obs = this.api.get('profile?with=accounts', { showLoading: showLoading });
        obs.subscribe(user => this.user = user),
            err => { };
        return obs;
    }

    put(data) {
        return this.api.put('profile', data);
    }

    patch(data, isNoShowLoading?: boolean, gender?: string) {//temporary parametr "gender"
        let obs = this.api.patch('profile', data, {
            showLoading: !isNoShowLoading,
            ignoreHttpUnprocessableEntity: this.appMode.getEnvironmentMode() === 'prod'
        });
        obs.subscribe(resp => {
            this.onRefresh.emit(resp);
            if (this.platform.is('cordova')
                && (!this.user || this.user.name !== resp.name || this.user.phone !== resp.phone || this.user.email !== resp.email)) {
                this.sendTags(resp, gender);
            }
            this.user = resp;
        })
        return obs;
    }

    refreshAccounts(isLoading?: boolean) {
        this.getWithAccounts(isLoading).subscribe(user => {
            this.onRefreshAccounts.emit(user);
            this.user = user;
        });
    }

    sendTags(user: User, gender?: string) {//temporary parametr "gender"
        let osName = this.platform.is('ios')
            ? 'ios'
            : this.platform.is('android')
                ? 'android' : '';

        let tagObj: any = {
            userName: user.name,
            userPhone: user.phone.split('+')[1],
            userEmail: user.email,
            os: osName + ' ' + this.platform.version().str
        };
        if (gender && gender !== '') {
            tagObj.gender = gender;
        }
        // this.oneSignal.syncHashedEmail(user.email);
        if (this.platform.is('cordova')) {
            this.oneSignal.sendTags(tagObj);
            window['plugins'].OneSignal.setEmail(user.email);
        }
    }

}