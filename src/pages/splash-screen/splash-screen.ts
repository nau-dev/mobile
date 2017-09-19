import { Component, ViewChild } from '@angular/core';
import { NavController, Slides, App } from 'ionic-angular';
import { SettingsPage } from "../settings/settings";
import { CreateUserProfilePage } from "../create-user-profile/create-user-profile";
import { PlacesPage } from '../places/places';
import { SplashInfoPage } from '../splash-info/splash-info';
import { SplashNewsPage } from '../splash-news/splash-news';

@Component({
    selector: 'page-splash-screen',
    templateUrl: 'splash-screen.html'
})
export class SplashScreenPage {

    @ViewChild('slides') slides: Slides;
    @ViewChild('slidesNews') slidesNews: Slides;
    
    constructor(private nav: NavController,
                private app: App) {
    }

    openSettings() {
        this.nav.push(SettingsPage);
        //this.app.getRootNav().setRoot(SettingsPage);
    }
    
    openCreateUserProfile() {
        this.nav.push(CreateUserProfilePage);
    }
    slideNext() {
        this.slides.slideNext();
    }

    slidePrev() {
        this.slides.slidePrev();
    }

    slideNewsNext() {
        this.slidesNews.slideNext();
    }

    slideNewsPrev() {
        this.slidesNews.slidePrev();
    }

    openPlaces() {
        //this.app.getRootNav().setRoot(PlacesPage);
        this.nav.setRoot(PlacesPage);
    }

    openSplashInfo() {
        this.nav.push(SplashInfoPage);
    }

    openSplashNews() {
        this.nav.push(SplashNewsPage);
    }


}