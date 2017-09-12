import { Component, ViewChild } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
import { AuthService } from "../../providers/auth.service";
import { StartPage } from "../start/start";
import { ProfileService } from "../../providers/profile.service";
import { User } from "../../models/user";
import { SettingsPage } from "../settings/settings";
import { UserRewardsPage } from "../user-rewards/user-rewards";
import { UserAchievePage } from "../user-achieve/user-achieve";
import { UserOffersPage } from "../user-offers/user-offers";
import { UserNauPage } from "../user-nau/user-nau";
import { UserUsersPage } from "../user-users/user-users";

@Component({
    selector: 'page-user-profile',
    templateUrl: 'user-profile.html'
})
export class UserProfilePage {
    user: User = new User();
    
    @ViewChild(Slides) slides: Slides;

    constructor(
        private profile: ProfileService,
        private auth: AuthService,
        private nav: NavController) {

    }

    ionViewDidEnter() {
        this.profile.get()
            .subscribe(user => this.user = user);
    }

    openSettings() {
        //this.app.getRootNav().setRoot(SettingsPage);
        this.nav.push(SettingsPage);
    }

    openRewards() {
        this.nav.push(UserRewardsPage);
    }

    openAchieve() {
        this.nav.push(UserAchievePage);
    }

    openUserOffers() {
        this.nav.push(UserOffersPage)
    }

    openUserNau() {
        this.nav.push(UserNauPage)
    }

    openUserUsers() {
        this.nav.push(UserUsersPage)
    }
    
    logout() {
        this.auth.logout();
    }

    slideNext() {
        this.slides.slideNext();
    }

    slidePrev() {
        this.slides.slidePrev();
    }
}