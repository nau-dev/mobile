import { Component } from '@angular/core';
import { App, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Offer } from '../../models/offer';
import { ApiService } from '../../providers/api.service';
import { PlaceService } from '../../providers/place.service';
import { ProfileService } from '../../providers/profile.service';
import { AdvTabsPage } from '../adv-tabs/adv-tabs';

@Component({
    selector: 'page-create-offer-5',
    templateUrl: 'create-offer-5.html'
})
export class CreateOffer5Page {

    offer: Offer;
    balance = 0;
    reward = '1';
    reserved = '10';
    picture_url: string;
    timer;

    constructor(private nav: NavController,
        private navParams: NavParams,
        private place: PlaceService,
        private profile: ProfileService,
        private api: ApiService,
        private loading: LoadingController,
        private app: App) {

        this.offer = this.navParams.get('offer');
        this.picture_url = this.navParams.get('picture');
        if (this.offer.id) {
            this.reward = this.offer.reward.toString();
            this.reserved = this.offer.reserved.toString();
        }

        this.profile.getWithAccounts()
            .subscribe(user => {
                this.balance = user.accounts.NAU.balance;
            });
    }

    createOffer() {
        this.offer.reward = parseInt(this.reward);
        this.offer.reserved = parseInt(this.reserved);

        this.place.setOffer(this.offer)
            .subscribe(resp => {
                //console.log(resp.http_headers.get('location'));
                if (resp.http_headers.get('location') !== null) {
                    let location = resp.http_headers.get('location');
                    let offer_id = location.slice(- location.lastIndexOf('/') + 2);
                    console.log("locaction: " + location);
                    console.log("parsing: " + offer_id);

                    if (this.picture_url) {
                        this.timer = setInterval(() => {
                            let loading = this.loading.create({ content: 'Creating your offer...' });
                            loading.present();
                            this.place.getOffer(offer_id, false)
                                .subscribe(offer => {
                                    if (offer) {
                                        this.stopTimer();
                                        loading.dismiss();
                                        this.api.uploadImage(this.picture_url, `offers/${offer_id}/picture`)
                                            .then(resut => this.nav.setRoot(AdvTabsPage));
                                    }
                                });
                        }, 2000)
                    }
                    else {
                        this.nav.setRoot(AdvTabsPage);
                    }

                }
                else {
                    this.nav.popToRoot();
                }
            })
    }

    editOffer() {
        this.offer.reward = parseInt(this.reward);
        this.offer.reserved = parseInt(this.reserved);
        this.place.putOffer(this.offer, this.offer.id)
            .subscribe(resp => {
                if (this.picture_url) {
                    this.api.uploadImage(this.picture_url, `offers/${this.offer.id}/picture`)
                        .then(resut => this.nav.setRoot(this.nav.getByIndex(this.nav.length() - 7)));
                }
                this.nav.setRoot(this.nav.getByIndex(this.nav.length() - 7));
                // this.app.getRootNav().setRoot(this.nav.getByIndex(this.nav.length() - 7));
            });
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }

}
