import { CreateOfferInformationPopover } from './information.popover';
import { ProfileService } from '../../providers/profile.service';
import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController } from 'ionic-angular';
import { Observable, Subscription } from 'rxjs/Rx';
import { Offer } from '../../models/offer';
import { PlaceService } from '../../providers/place.service';
import { TimezoneService } from '../../providers/timezone.service';
import { DateTimeUtils } from '../../utils/date-time.utils';
import { CreateOfferPage } from '../create-offer/create-offer';

@Component({
    selector: 'page-adv-user-offers',
    templateUrl: 'adv-user-offers.html'
})
export class AdvUserOffersPage {
    itemCompleted(item) {
        return item.completed;
      }

    segment: string;
    offers: Offer[];
    total: number;
    date: string;
    page = 1;
    lastPage: number;
    isFilterByDate = false;
    dates;
    balance: number;
    onRefreshBalance: Subscription;

    constructor(private nav: NavController,
        private place: PlaceService,
        private navParams: NavParams,
        private profile: ProfileService,
        private popoverCtrl: PopoverController) {

        this.onRefreshBalance = this.profile.onRefreshAccounts
            .subscribe((resp) => {
                this.balance = resp.accounts.NAU.balance;
            })

        if (this.navParams.get('balance')) {
            this.balance = this.navParams.get('balance');
        }
        else {
            if (!this.balance) {
                    this.profile.getWithAccounts()
                        .subscribe(resp => {
                            this.balance = resp.accounts.NAU.balance;
                        })
                }

            }
            this.processOffers(this.place.getOffers(this.page));

            this.segment = 'all';
        }

        processOffers(obs: Observable<any>) {
            obs.subscribe(resp => {
                this.offers = resp.data;
                this.total = resp.total;
                this.lastPage = resp.last_page;
            })
        }

    filterOffers() {
                this.page = 1;
                this.isFilterByDate = false;

                if(this.segment == 'featured') {
                    this.offers = [];//to do
                    this.total = 0;//to do
                }
        else {
                    let obs = this.segment == 'all'
                        ? this.place.getOffers(this.page)
                        : this.segment == 'active'
                            ? this.place.getActiveOffers(this.page)
                            : this.place.getDeActiveOffers(this.page);
                    this.processOffers(obs);
                }
            }

    filterOffersByDate() {
                this.segment = 'active';
                this.page = 1;
                this.isFilterByDate = true;
                this.dates = DateTimeUtils.getFilterDates(this.date);
                this.processOffers(this.place.getFilteredOffersByDate(this.dates.startDate, this.dates.finishDate, this.page));
            }

    openCreateOffer() {
                this.nav.push(CreateOfferPage);
            }

    openEditOffer(offer) {
                this.place.getOfferWithTimeframes(offer.id)
                    .subscribe(resp => {
                        this.nav.push(CreateOfferPage, { offer: resp });
                    })
            }

    enableActivation(offer) {
        if (offer.status = 'deactive' && offer.reserved > this.balance) {
            let popover = this.popoverCtrl.create(CreateOfferInformationPopover, { balance: this.balance, reserved: offer.reserved });
            popover.present();
            return false;
        }
        else {
            return true;
        }
     }

     modalInfromation(offer){
         let popover = this.popoverCtrl.create(CreateOfferInformationPopover, { balance: this.balance, reserved: offer.reserved });
         popover.present();
     }


    editStatus(offer) {
        if (this.enableActivation(offer)) {
                let statusInfo = {
                    status: (offer.status == 'active')
                        ? 'deactive'
                        : 'active'
                };
                console.log(offer.status);
                this.place.changeOfferStatus(statusInfo, offer.id)
                    .subscribe(resp => {
                        // if(this.isFilterByDate) {
                        //     this.filterOffersByDate();
                        // }
                        // else {
                        //     this.filterOffers();
                        // }
                    })
            }
        }

    doInfinite(infiniteScroll) {
                this.page = this.page + 1;
                if(this.page <= this.lastPage) {
                    setTimeout(() => {
                        let obs;
                        if (this.isFilterByDate) {
                            obs = this.place.getFilteredOffersByDate(
                                this.dates.startDate, this.dates.finishDate, this.page);
                        }
                        else {
                            switch (this.segment) {
                                case 'all':
                                    obs = this.place.getOffers(this.page);
                                    break;
                                case 'active':
                                    obs = this.place.getActiveOffers(this.page);
                                    break;
                                case 'deactive':
                                    obs = this.place.getDeActiveOffers(this.page);
                                    break;
                            }
                        }
                        obs.subscribe(resp => {
                            for (let i = 0; i < resp.data.length; i++) {
                                this.offers.push(resp.data[i]);
                            }
                            infiniteScroll.complete();
                        });
                    });
                }
        else {
                    infiniteScroll.complete();
                }
            }

    ionViewWillUnload() {
                this.onRefreshBalance.unsubscribe();
            }
}
