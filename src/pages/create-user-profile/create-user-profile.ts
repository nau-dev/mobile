import { Component } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker';
import { AlertController, LoadingController, NavController, Platform } from 'ionic-angular';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { latLng, LeafletEvent, tileLayer } from 'leaflet';
import { Map } from 'leaflet';
import { Coords } from '../../models/coords';
import { Register } from '../../models/register';
import { User } from '../../models/user';
import { ApiService } from '../../providers/api.service';
import { LocationService } from '../../providers/location.service';
import { ProfileService } from '../../providers/profile.service';
import { ToastService } from '../../providers/toast.service';
import { TabsPage } from '../tabs/tabs';
import * as _ from 'lodash';
import { DataUtils } from '../../utils/data.utils';
import { MapUtils } from '../../utils/map';
import { AndroidPermissions } from '@ionic-native/android-permissions';

@Component({
    selector: 'page-create-user-profile',
    templateUrl: 'create-user-profile.html'
})

export class CreateUserProfilePage {
    data: Register = new Register();
    coords: Coords = new Coords();
    user: User = new User();
    message: string;
    isSelectVisible: boolean = false;
    visibleInfo: boolean = false;
    facebookName: string;
    twitterName: string;
    instagramName: string;
    gender: string;
    age: number;
    income;
    picture_url: string;
    isEdit = false;
    changedPicture = false;
    tileLayer;
    _map: Map;
    options;
    baseData = new User();

    constructor(
        platform: Platform,
        private nav: NavController,
        private location: LocationService,
        private profile: ProfileService,
        private toast: ToastService,
        private imagePicker: ImagePicker,
        private api: ApiService,
        private navParams: NavParams,
        private loading: LoadingController,
        private alertCtrl: AlertController,
        private alert: AlertController,
        private androidPermissions: AndroidPermissions) {


        if (this.navParams.get('user')) {
            this.isEdit = true;
            this.user = this.navParams.get('user');
            this.baseData = _.clone(this.user);
            this.picture_url = this.user.picture_url;
            this.coords.lat = this.baseData.latitude;
            this.coords.lng = this.baseData.longitude;
            if (this.coords.lat) {
                this.addMap();
            }
            else {
                this.getLocationStatus(platform);
            }
        }
        else {
            this.profile.get(true)
                .subscribe(resp => {
                    this.user = resp;
                    this.baseData = _.clone(this.user);
                    this.picture_url = this.user.picture_url;
                });
            this.getLocationStatus(platform);
        }
    }

    getLocationStatus(platform: Platform) {
        if (platform.is('android')) {
            this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
                result => {
                    if (result.hasPermission === false) {
                        this.requestPerm();
                    }
                    else {
                        this.getLocation(false);
                    }
                    console.log(result)
                },
                err => {
                    this.requestPerm();
                    console.log(err)
                }
            )
        }
        if (platform.is('ios') || !platform.is('android')) {
            this.getLocation(false);
        }
    }

    requestPerm() {
        this.androidPermissions.requestPermissions([
            this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
            this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
            this.androidPermissions.PERMISSION.ACCESS_LOCATION_EXTRA_COMMANDS
        ])
            .then(
            result => {
                if (result.hasPermission === false) {
                    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
                        result => {
                            if (result.hasPermission === false) {
                                this.presentAndroidConfirm()
                            }
                            else {
                                this.getLocation(false);
                            }
                        });
                }
                else {
                    this.getLocation(false);
                }
                console.log(result)
            },
            err => {
                this.requestPerm();
            }
            )
    }


    getLocation(isDenied: boolean) {
        if (!isDenied) { 
            let loadingLocation = this.loading.create({ content: 'Location detection', spinner: 'bubbles' });
            loadingLocation.present();
            this.location.get()
                .then((resp) => {
                    this.coords = {
                        lat: resp.coords.latitude,
                        lng: resp.coords.longitude
                    };
                    loadingLocation.dismissAll();
                    this.addMap();
                })
                .catch((error) => {
                    loadingLocation.dismissAll();
                    this.presentConfirm();
                })
        }
        else {
            this.location.getByIp()
                .subscribe(resp => {
                    this.coords = {
                        lat: resp.latitude,
                        lng: resp.longitude
                    };
                    this.addMap();
                })
        }

    }

    onMapReady(map: Map) {
        this._map = map;
        this._map.on({
            moveend: (event: LeafletEvent) => {
                this.coords = this._map.getCenter();
                if (this.coords.lng > 180 || this.coords.lng < -180) {
                    this.coords.lng = MapUtils.correctLng(this.coords.lng);
                    this._map.setView(this.coords, this._map.getZoom());
                }
            }
        })
    }

    addMap() {
        this.tileLayer = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            maxNativeZoom: 18,
            minZoom: 1,
            attribution: '© OpenStreetMap',
            tileSize: 512,
            zoomOffset: -1,
            detectRetina: true,
            tap: true,
        });
        this.options = {
            layers: [this.tileLayer],
            zoom: 15,
            center: latLng(this.coords),
            // zoomSnap: 0.5,
            // zoomDelta: 0.5
        };
    }

    point() {
        let points = (this.user.name ? +8 : +0) + (this.facebookName ? +3 : +0) +
            (this.twitterName ? +3 : +0) + (this.instagramName ? +3 : +0) +
            (this.gender ? +5 : +0) + (this.age ? +9 : +0) + (this.income ? +9 : +0);
        return points;
    }

    toggleSelect() {
        this.isSelectVisible = !this.isSelectVisible;
    }

    toggleVisibleInfo() {
        this.visibleInfo = true;
    }

    addLogo() {
        let options = { maximumImagesCount: 1, width: 600, height: 600, quality: 75 };
        this.imagePicker.getPictures(options)
            .then(results => {
                if (results[0] && results[0] != 'O') {
                    this.picture_url = results[0];
                    this.changedPicture = true;
                }
            })
            .catch(err => {
                this.toast.show(JSON.stringify(err));
            });
    }

    validateName(name) {
        if (name.length < 3 || name.replace(/\s/g, "") == "") {
            this.toast.show('User name must be atleast 3 charactrs long');
            return false;
        }
        else {
            return true;
        }

    }

    validateEmail(email) {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let isValid = re.test(email);
        if (!isValid) {
            this.toast.show('Incorrect email, please, correct it');
            return false;
        }
        else {
            return true;
        }
    }

    navTo() {
        if (this.isEdit) {
            this.profile.refreshAccounts();
            this.nav.pop();
        }
        else {
            // this.nav.setRoot(TabsPage, { selectedTabIndex: 1 });
            //temporary
            this.profile.getWithAccounts()
                .subscribe(resp => {
                    this.nav.setRoot(TabsPage, { NAU: resp.accounts.NAU });
                });
            //temporary
        }
    }

    createAccount() {
        if (this.validateName(this.baseData.name) && this.validateEmail(this.baseData.email)) {
            this.baseData.latitude = this.coords.lat;
            this.baseData.longitude = this.coords.lng;
            //this.account.points = this.point(); to do
            let differenceData = DataUtils.difference(this.baseData, this.user);
            let isEmpty = _.isEmpty(differenceData);
            let promise = this.picture_url && this.changedPicture
                ? this.api.uploadImage(this.picture_url, 'profile/picture', true)
                : Promise.resolve();
            if (!isEmpty) {
                this.profile.patch(differenceData)
                    .subscribe(() => {
                        promise.then(() => {
                            this.navTo();
                        })
                    })
            }
            else {
                promise.then(() => {
                    this.navTo();
                })
            }
        }
    }
    presentAndroidConfirm() {
        const alert = this.alert.create({
            title: 'Location denied',
            message: 'You have denied access to geolocation. Set your coordinates in manual mode.',
            buttons: [{
                text: 'Ok',
                handler: () => {
                    // console.log('Application exit prevented!');
                    this.getLocation(true);
                }
            }]
        });
        alert.present();
    }

    presentConfirm() {
        let confirm = this.alertCtrl.create({
            title: 'To create account your location needed',
            message: 'Enable location services, please, check conection. Then click "Retry". Otherwise, you have the option to set the coordinates manually.',
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {
                        this.getLocation(true);
                        this.isSelectVisible;
                    }
                },
                {
                    text: 'Retry',
                    handler: () => {
                        this.getLocation(false);
                    }
                }
            ],
            enableBackdropDismiss: false
        },
        );
        confirm.present();
    }

}
