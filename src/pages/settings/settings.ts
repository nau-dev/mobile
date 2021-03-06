import { Component } from '@angular/core';
import { Clipboard } from '@ionic-native/clipboard';
import { TranslateService } from '@ngx-translate/core';
import { App, NavController, NavParams, Platform, PopoverController } from 'ionic-angular';
import { latLng, tileLayer } from 'leaflet';
import { Subscription } from 'rxjs';
import { AVAILABLE_LANGUAGES, DEFAULT_LANG_CODE, SYS_OPTIONS } from '../../const/i18n.const';
import { Coords } from '../../models/coords';
import { User } from '../../models/user';
import { AppModeService } from '../../providers/appMode.service';
import { PlaceService } from '../../providers/place.service';
import { ProfileService } from '../../providers/profile.service';
import { StorageService } from '../../providers/storage.service';
import { ToastService } from '../../providers/toast.service';
import { AdvTabsPage } from '../adv-tabs/adv-tabs';
import { CreateAdvUserProfilePage } from '../create-advUser-profile/create-advUser-profile';
import { OnBoardingPage } from '../onboarding/onboarding';
import { SettingsChangePhonePage } from '../settings-change-phone/settings-change-phone';
import { TabsPage } from '../tabs/tabs';
import { SettingsPopover } from './settings.popover';

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
export class SettingsPage {
    
    user: User = new User;
    message: string;
    coords: Coords = new Coords();
    // radiuses = [100, 150, 200, 250, 500, 1000];
    isAccountsChoiceVisible: boolean = false;
    isSelectRadiusVisible: boolean = false;
    isAdvMode = false;
    isModeChanged = false;
    showData: boolean = false;
    showPhone: boolean = false;
    showEmail: boolean = false;
    nextPage: any;
    advPicture_url: string;
    time = new Date().valueOf();
    tileLayer;
    options;
    lang;
    langs = AVAILABLE_LANGUAGES;
    isLangChanged = false;
    referralLink: string;
    branchDomain = 'https://nau.app.link';
    envName;//temporary
    onRefreshProfile: Subscription;

    constructor(platform: Platform,
        private nav: NavController,
        private profile: ProfileService,
        private appMode: AppModeService,
        private app: App,
        private popoverCtrl: PopoverController,
        private navParams: NavParams,
        private place: PlaceService,
        private clipboard: Clipboard,
        private translate: TranslateService,
        private storage: StorageService,
        private toast: ToastService) {

        this.envName = this.appMode.getEnvironmentMode();//temporary

        // if (this.envName === 'dev' || this.envName === 'test') {
        let availableLang = AVAILABLE_LANGUAGES.find(i => i.code == SYS_OPTIONS.LANG_CODE);
        this.lang = availableLang;
        // }

        this.isAdvMode = this.navParams.get('isAdvMode');
        this.user = this.navParams.get('user');
        this.coords.lat = this.user.latitude;
        this.coords.lng = this.user.longitude;
        // this.addMap();//hided map
        this.createBranchLink(this.user.invite_code);

        if (!this.user.id) {
            this.profile.get(true)
                .subscribe(user => {
                    this.user = user;
                    this.coords.lat = this.user.latitude;
                    this.coords.lng = this.user.longitude;
                    // this.addMap();//hided map
                    this.createBranchLink(this.user.invite_code);
                });
        }

        if (this.envName !== 'prod') {
            this.place.get(true)
                .subscribe(
                    resp => {
                        this.nextPage = AdvTabsPage;
                        this.advPicture_url = resp.picture_url;
                    },
                    errResp => this.nextPage = undefined);
        }

        this.onRefreshProfile = this.profile.onRefreshAccounts
            .subscribe((resp) => {
                this.user = resp;
                this.coords.lat = this.user.latitude;
                this.coords.lng = this.user.longitude;
            })
    }

    createBranchLink(invCode) {
        this.referralLink = `${this.branchDomain}?invite_code=${invCode}`;
    }

    copyInvCode() {
        this.clipboard.copy(this.user.invite_code);
        this.showCopyNotification();
    }

    copyReferralLink() {
        this.clipboard.copy(this.referralLink);
        this.showCopyNotification();
    }

    addMap() {
        this.tileLayer = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            maxNativeZoom: 18,
            minZoom: 1,
            attribution: '...',
            tileSize: 512,
            zoomOffset: -1,
            detectRetina: true,
            tap: true,
        });
        this.options = {
            layers: [this.tileLayer],
            zoom: 13,
            center: latLng(this.coords)
        };
    }

    toggleAdvMode() {
        this.isModeChanged = !this.isModeChanged;
        if (this.isAdvMode && !this.nextPage) {
            let popover = this.popoverCtrl.create(SettingsPopover, { page: CreateAdvUserProfilePage, latitude: this.coords.lat, longitude: this.coords.lng });
            popover.present();
        }
        return this.isAdvMode;
    }

    changeLang() {
        this.isLangChanged = true;
        let isLang = AVAILABLE_LANGUAGES.map(p => p.code).find(i => i === this.lang.code);
        let langCode = isLang ? this.lang.code : DEFAULT_LANG_CODE;
        this.translate.use(langCode);
        SYS_OPTIONS.LANG_CODE = langCode;
        this.storage.set('lang', langCode);
    }

    saveProfile() {
        // if (this.isLangChanged) {
        //     let isLang = AVAILABLE_LANGUAGES.map(p => p.code).find(i => i === this.lang.code);
        //     let langCode = isLang ? this.lang.code : DEFAULT_LANG_CODE;
        //     this.translate.use(langCode);
        //     SYS_OPTIONS.LANG_CODE = langCode;
        //     this.storage.set('lang', langCode);
        // }
        this.appMode.setAdvMode(this.isAdvMode);
        // let isShownOnboard = this.appMode.getOnboardingVisible();
        // if (this.isLangChanged) {
        //     let availableLang = AVAILABLE_LANGUAGES.find(i => i.name == this.lang);
        //     this.translate.use(availableLang.code);
        //     SYS_OPTIONS.LANG_CODE = availableLang.code;
        // }
        // this.user.latitude = this.coords.lat;
        // this.user.longitude = this.coords.lng;
        // this.profile.put(this.user)
        // .subscribe(resp => {to do
        if (!this.isModeChanged) {
            this.nav.pop();
        } else {
            if (this.isAdvMode && !this.nextPage) {
                this.app.getRootNav().setRoot(OnBoardingPage, { isAdvMode: true, page: CreateAdvUserProfilePage, isAdvOnBoarding: true, latitude: this.coords.lat, longitude: this.coords.lng });
            } else

                if (this.isAdvMode) {
                    // if (!isShownOnboard) {
                    //     this.app.getRootNav().setRoot(OnBoardingPage, { isAdvMode: true, page: this.nextPage, isAdvOnBoarding: true });
                    // }
                    // else {
                    this.app.getRootNav().setRoot(AdvTabsPage, { isAdvMode: true, isAdvOnBoarding: true });
                    // }
                } else {
                    this.app.getRootNav().setRoot(TabsPage);
                }

        }
        // });
    }

    toggleAccountsChoiceVisible() {
        this.isAccountsChoiceVisible = !this.isAccountsChoiceVisible;
    }

    toggleSelectRadiusVisible() {
        this.isSelectRadiusVisible = !this.isSelectRadiusVisible;
    }

    openChangePhone(user: User) {
        this.nav.push(SettingsChangePhonePage, { user: this.user });
    }

    showCopyNotification() {
        this.toast.showNotification('TOAST.COPY_NOTIFICATION');
    }
}
