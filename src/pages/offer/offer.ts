import { Component } from '@angular/core';
import { App, NavController, NavParams, PopoverController } from 'ionic-angular';
import { Company } from '../../models/company';
import { Offer } from '../../models/offer';
import { OfferActivationCode } from '../../models/offerActivationCode';
import { OfferRedemtionStatus } from '../../models/offerRedemtionStatus';
import { OfferService } from '../../providers/offer.service';
import { CongratulationPopover } from './congratulation.popover';
import { OfferRedeemPopover } from './offerRedeem.popover';

@Component({
    selector: 'page-offer',
    templateUrl: 'offer.html'
})
export class OfferPage {

    offer: Offer;
    company = new Company;
    offerActivationCode: OfferActivationCode;
    timer;
    distanceString: string

    constructor(
        private nav: NavController,
        private popoverCtrl: PopoverController,
        private navParams: NavParams,
        private offers: OfferService,
        private app: App) {

        this.company = this.navParams.get('company');
        this.offer = this.navParams.get('offer');
        this.distanceString = this.navParams.get('distance');
    }

    //ionViewDidLoad() {
    //this.nav.pop();
    //  let popover = this.popoverCtrl.create(CongratulationPopover);
    //  popover.present();
    //}

    getStars(star: number) {
        let showStars: boolean[] = [];
        for (var i = 0; i < 5; i++) {
            showStars.push(star > i);
        }
        return showStars;
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    ionViewDidLeave() {
        this.stopTimer();
        this.app.navPop();
    }

    openRedeemPopover() {
        if (this.timer)
            return;
        
        this.offers.getActivationCode(this.offer.id)
            .subscribe((offerActivationCode: OfferActivationCode) => {
                if (this.timer)
                    return;

                let offerRedeemPopover = this.popoverCtrl.create(OfferRedeemPopover, { offerActivationCode: offerActivationCode });
                offerRedeemPopover.present();
                offerRedeemPopover.onDidDismiss(() => this.stopTimer());

                this.timer = setInterval(() => {
                    this.offers.getRedemtionStatus(offerActivationCode.code)
                        .subscribe((offerRedemtionStatus: OfferRedemtionStatus) => {
                            if (offerRedemtionStatus.redemption_id) {
                                this.stopTimer();

                                offerRedeemPopover.dismiss();

                                let offerRedeemedPopover = this.popoverCtrl.create(CongratulationPopover);
                                offerRedeemedPopover.present();
                                offerRedeemedPopover.onDidDismiss(() => this.nav.popToRoot());
                            }
                        });
                }, 3000)
            })       
    }
}
