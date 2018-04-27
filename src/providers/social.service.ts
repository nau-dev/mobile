import { Injectable } from '@angular/core';
import { Facebook } from '@ionic-native/facebook';
import { TwitterConnect } from '@ionic-native/twitter-connect';

@Injectable()
export class SocialService {

    token;
    secret;

    constructor(
        private twitter: TwitterConnect,
        // private twitter: TwitterService,
        private fb: Facebook) {

    }

    // setTokens(token, secret) {
    //     this.token = token;
    //     this.secret = secret;
    // }

    twLogin() {
        let promise = this.twitter.login();
        // promise.then(resp => this.setTokens(resp.token, resp.secret));
        return promise;
    }

    getTwProfile() {
        return this.twitter.showUser();
        // return this.twitterService.get(
        //     'https://api.twitter.com/1.1/account/verify_credentials.json',
        //     {
        //         count: 1
        //     },
        //     {
        //         consumerKey: '1t57CCFvafiX2oaEJuREbE0sz',
        //         consumerSecret: 'O5pryneH5CALpAcZBbiCrmie62VjvPwmJy0EZQYkRFKbcTbBPa'
        //     },
        //     {
        //         token: '909746010884370432-7eWkN323lWr6eZQ8UbYLOkHednWoFTY',
        //         tokenSecret: 'lKqCslBNEPHYBecgsruwr7eIZxIUdqv2ZDdhSZ9YWjRkv'
        //         // token: this.token,
        //         // tokenSecret: this.secret
        //     }
        // )
        //     .map(res => res.json());
    }

    twLogout() {
        return this.twitter.logout();
    }

    getFbLoginStatus() {
        return this.fb.getLoginStatus();
    }

    fbLogin() {
        return this.fb.login(['public_profile', 'email']);
    }

    fbLogout() {
        return this.fb.logout();
    }

    getFbProfile() {
        return this.fb.api('me?fields=name,email,picture.width(720).height(720).as(picture_large)', ['public_profile', 'email']);
    }
}