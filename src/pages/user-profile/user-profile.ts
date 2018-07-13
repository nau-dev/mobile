import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, NavController, Slides } from 'ionic-angular';
import * as _ from 'lodash';
import { Subscription } from 'rxjs/Rx';
import { Account } from '../../models/account';
import { Coords } from '../../models/coords';
import { Offer } from '../../models/offer';
import { User } from '../../models/user';
import { AdjustService } from '../../providers/adjust.service';
import { AuthService } from '../../providers/auth.service';
import { LocationService } from '../../providers/location.service';
import { OfferService } from '../../providers/offer.service';
import { ProfileService } from '../../providers/profile.service';
import { TransactionService } from '../../providers/transaction.service';
import { DistanceUtils } from '../../utils/distanse.utils';
import { CreateUserProfilePage } from '../create-user-profile/create-user-profile';
import { SettingsPage } from '../settings/settings';
import { UserAchievePage } from '../user-achieve/user-achieve';
import { UserNauPage } from '../user-nau/user-nau';
import { UserOffersPage } from '../user-offers/user-offers';
import { UserTasksPage } from '../user-tasks/user-tasks';
import { UserUsersPage } from '../user-users/user-users';

@Component({
    selector: 'page-user-profile',
    templateUrl: 'user-profile.html'
})
export class UserProfilePage {

    user: User = new User();
    balance: number;
    onRefreshAccounts: Subscription;
    onRefreshCoords: Subscription;
    onRefreshProfileCoords: Subscription;
    onRefreshUser: Subscription;
    NAU: Account;
    branchDomain = 'https://nau.app.link';
    allowPremiumOffers = [];//allowPremiumOffers: Offers[];
    premiumOffers = [];//premiumOffers: Offers[];
    coords: Coords;
    segment;
    loadingLocation;
    allowOffersPage = 1;
    offersPage = 1;
    allowOffersLastPage: number;
    offersLastPage: number;
    isLeftArrowVisible: boolean;
    isRightArrowVisible: boolean;
    isSegmented: boolean


    @ViewChild('allowOffersSlides') allowOffersSlides: Slides;
    @ViewChild('offersSlides') offersSlides: Slides;

    constructor(
        private profile: ProfileService,
        private nav: NavController,
        private auth: AuthService,
        private alert: AlertController,
        private transaction: TransactionService,
        private translate: TranslateService,
        private adjust: AdjustService,
        private location: LocationService,
        private offer: OfferService,
        private loading: LoadingController) {

        this.segment = 'allow';

        this.onRefreshAccounts = this.profile.onRefreshAccounts
            .subscribe((resp) => {
                this.user = resp;
                this.NAU = resp.accounts.NAU;
                this.balance = this.NAU.balance;
                this.user.picture_url = this.user.picture_url + '?' + new Date().valueOf();
                this.allowPremiumOffers = [];
                this.premiumOffers = [];
                this.allowOffersPage = 1;
                this.offersPage = 1;
                this.segment = null;
                this.getLists();
            });

        this.onRefreshUser = this.profile.onRefresh
            .subscribe(user => {
                this.user = _.extend(this.user, user);
                this.allowOffersPage = 1;
                this.offersPage = 1;
                this.getLists();
            });

        if (!this.balance) {
            this.loadingLocation = this.loading.create({ content: '' }); 
            this.loadingLocation.present();
            this.profile.getWithAccounts(false)
                .subscribe(resp => {
                    this.user = resp;
                    this.NAU = resp.accounts.NAU;
                    this.balance = this.NAU ? this.NAU.balance : 0;
                    this.getLists();
                },
                    err => this.dismissLoading());
        }

        this.onRefreshCoords = this.location.onRefreshCoords
            .subscribe(coords => this.coords = coords);

        this.onRefreshProfileCoords = this.location.onProfileCoordsChanged
            .subscribe(coords => this.coords = coords);
    }

    ionSelected() {
        this.profile.refreshAccounts(false);
        this.transaction.refresh();
    }

    getLists() {
        // this.loadingLocation = this.loading.create({ content: '' });
        // this.loadingLocation.present();
        this.location.getCache()
            .then(resp => {
                this.coords = {
                    lat: resp.coords.latitude,
                    lng: resp.coords.longitude
                };
                this.getAllowOffersList();
                this.getOffersList();
            });
    }

    getAllowOffersList() {// to do
        this.offer.getPremiumList(this.coords.lat, this.coords.lng, this.allowOffersPage, false)
            .subscribe(resp => {
                this.allowPremiumOffers = resp.data;
                this.allowOffersLastPage = resp.last_page;
                this.getSegment();
                this.dismissLoading();
            },
                err => this.dismissLoading()
            );
    }

    getOffersList() {// to do
        this.offer.getPremiumList(this.coords.lat, this.coords.lng, this.offersPage, false)
            .subscribe(resp => {
                this.premiumOffers = resp.data;
                this.offersLastPage = resp.last_page;
                this.getSegment();
                this.dismissLoading();
            },
                err => this.dismissLoading()
            );
    }

    getSegment() {
        let isSegmented = this.isSegmented;
        this.segment = this.allowPremiumOffers && this.allowPremiumOffers.length > 0
            ? 'allow'
            : this.premiumOffers && this.premiumOffers.length > 0
                ? 'all'
                : 'allow';
        if (isSegmented) {
            this.showArrow();
        }
        this.isSegmented = true;
    }

    getStars(star: number) {
        let showStars: boolean[] = [];
        for (var i = 0; i < 5; i++) {
            showStars.push(star > i);
        }
        return showStars;
    }

    getDistance(latitude: number, longitude: number) {//temporary to do
        if (this.coords) {
            let long = DistanceUtils.getDistanceFromLatLon(this.coords.lat, this.coords.lng, latitude, longitude);
            let distance = long >= 1000 ? long / 1000 : long;
            let key = long >= 1000 ? 'UNIT.KM' : 'UNIT.M';
            return {
                distance: distance,
                key: key
            }
        };
        return undefined;
    }

    showArrow() {
        if (this.segment === 'allow') {
            this.isLeftArrowVisible = false;
            if (this.allowPremiumOffers.length > 1) {
                this.isRightArrowVisible = true;
            }
            else {
                this.isRightArrowVisible = false;
            }
        }
        else if (this.segment === 'all') {
            this.isLeftArrowVisible = false;
            if (this.premiumOffers.length > 1) {
                this.isRightArrowVisible = true;
            }
            else {
                this.isRightArrowVisible = false;
            }
        }
    }

    slideNext() {
        let slides = this.segment === 'allow'
            ? this.allowOffersSlides
            : this.offersSlides;

        slides.slideNext();
    }

    slidePrev() {
        let slides = this.segment === 'allow'
            ? this.allowOffersSlides
            : this.offersSlides;

        slides.slidePrev();
    }

    slideChangeHandler(event: Slides) {
        //   let length = event.length();

        if (event.isBeginning()) {
            this.isLeftArrowVisible = false;
        }
        else {
            this.isLeftArrowVisible = true;
        }
        if (event.isEnd()) {
            this.isRightArrowVisible = false;
            event.lockSwipeToNext(true);
            let element = event.getNativeElement();

            if (element && element.id) {

                this.addOffers(element.id, event);
            }
        }
        else {
            this.isRightArrowVisible = true;
            event.lockSwipeToNext(false);
        }
    }


    addOffers(elementId: string, event: Slides) {
        let page = elementId === 'allowOffersSlides'
            ? this.allowOffersPage
            : this.offersPage;

        let lastPage = elementId === 'allowOffersSlides'
            ? this.allowOffersLastPage
            : this.offersLastPage;

        if (page < lastPage) {

            let loading = this.loading.create({ content: '' });//temporary
            loading.present();//temporary
            if (elementId === 'allowOffersSlides') {
                this.offer.getPremiumList(this.coords.lat, this.coords.lng, ++this.allowOffersPage, true)//to do
                    .subscribe(resp => {
                        this.allowPremiumOffers = [...this.allowPremiumOffers, ...resp.data];
                        this.allowOffersLastPage = resp.last_page;
                        event.lockSwipeToNext(false);
                        this.isRightArrowVisible = true;
                        loading.dismiss();//temporary
                    });
            }
            else if (elementId === 'offersSlides') {
                this.offer.getPremiumList(this.coords.lat, this.coords.lng, ++this.offersPage, true)//to do
                    .subscribe(resp => {
                        this.premiumOffers = [...this.premiumOffers, ...resp.data];
                        this.offersLastPage = resp.last_page;
                        event.lockSwipeToNext(false);
                        this.isRightArrowVisible = true;
                        loading.dismiss();//temporary
                    });
            }
        }
        else {
            event.loop = true;
            event.lockSwipeToNext(false);
            this.isRightArrowVisible = true;
        }
    }

    slideToFirst(event: Slides) {
        event.slideTo(0);
    }

    openPlace(event, place, isShare?: boolean, offer?: Offer) {

    }

    openSettings() {
        this.nav.push(SettingsPage, { isAdvMode: false, user: this.user });
    }

    openRewards(user: User) {
        this.nav.push(UserTasksPage, { user: this.user });
    }

    openAchieve(user: User) {
        this.nav.push(UserAchievePage, { user: this.user });
    }

    openUserOffers() {
        this.nav.push(UserOffersPage);
    }

    openUserNau() {
        // if (!this.platform.is('ios')) {
        this.nav.push(UserNauPage, { NAU: this.NAU });
        // }
    }

    openUserUsers() {
        this.nav.push(UserUsersPage);
    }

    openCreateUserProfilePage() {
        this.nav.push(CreateUserProfilePage, { user: this.user });
    }

    dismissLoading() {
        if (this.loadingLocation) {
            this.loadingLocation.dismiss();
            this.loadingLocation = undefined;
        }
    }

    inviteFriend() {
        if (this.user && this.user.invite_code) {
            this.translate.get('SHARING.INVITE')
                .subscribe(translation => {
                    const Branch = window['Branch'];
                    let properties = {
                        canonicalIdentifier: `?invite_code=${this.user.invite_code}`,
                        canonicalUrl: `${this.branchDomain}?invite_code=${this.user.invite_code}`,
                        title: this.user.name,
                        contentImageUrl: this.user.picture_url,
                        // contentDescription: '',
                        // price: 12.12,
                        // currency: 'GBD',
                        contentIndexingMode: 'private',
                        contentMetadata: {
                            invite_code: this.user.invite_code,
                        }
                    };
                    var branchUniversalObj = null;
                    Branch.createBranchUniversalObject(properties)
                        .then(res => {
                            branchUniversalObj = res;
                            let analytics = {};
                            let message = translation;
                            branchUniversalObj.showShareSheet(analytics, properties, message);

                            branchUniversalObj.onLinkShareResponse(res => {
                                this.adjust.setEvent('IN_FR_BUTTON_CLICK_PROFILE_PAGE');
                            });
                            // console.log('Branch create obj error: ' + JSON.stringify(err))
                        })
                })
        }
        else return;
    }

    logout() {
        this.translate.get(['CONFIRM', 'UNIT'])
            .subscribe(resp => {
                let content = resp['CONFIRM'];
                let unit = resp['UNIT'];
                let confirm = this.alert.create({
                    title: content['LOGOUT'],
                    message: content['ARE_YOU_SHURE'],
                    buttons: [
                        {
                            text: unit['CANCEL'],
                            handler: () => {
                            }
                        },
                        {
                            text: unit['OK'],
                            handler: () => {
                                this.auth.logout();
                            }
                        }
                    ]
                });
                confirm.present();
            })
    }

    ngOnDestroy() {
        this.onRefreshAccounts.unsubscribe();
        this.onRefreshCoords.unsubscribe();
        this.onRefreshUser.unsubscribe();
        this.onRefreshProfileCoords.unsubscribe();
    }

}
