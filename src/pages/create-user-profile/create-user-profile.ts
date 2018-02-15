import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
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
import { Diagnostic } from '@ionic-native/diagnostic';
import { Subscription } from 'rxjs';
import { ImageCropperComponent, CropperSettings, Bounds } from 'ng2-img-cropper';


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
    onResumeSubscription: Subscription;
    isConfirm = false;
    dataImg: any;
    cropperSettings: CropperSettings;
    canSaveImg = false;
    isCrop = false;

    @ViewChild('cropper', undefined)
    cropper: ImageCropperComponent;
    croppedHeight;
    croppedWidth;

    constructor(
        private platform: Platform,
        private nav: NavController,
        private location: LocationService,
        private profile: ProfileService,
        private toast: ToastService,
        private imagePicker: ImagePicker,
        private api: ApiService,
        private navParams: NavParams,
        private loading: LoadingController,
        private alert: AlertController,
        private androidPermissions: AndroidPermissions,
        private diagnostic: Diagnostic,
        private changeDetectorRef: ChangeDetectorRef) {

        this.cropperSettings = new CropperSettings();
        this.cropperSettings.noFileInput = true;
        this.cropperSettings.cropOnResize = true;
        this.cropperSettings.fileType = 'image/jpeg';
        this.cropperSettings.width = 192;
        this.cropperSettings.height = 192;
        this.cropperSettings.croppedWidth = 192;
        this.cropperSettings.croppedHeight = 192;
        // this.cropperSettings.canvasWidth = 400;
        this.cropperSettings.canvasWidth = this.platform.width();
        this.cropperSettings.canvasHeight = 300;
        // this.cropperSettings.preserveSize = true;
        this.dataImg = {};

        if (this.platform.is('cordova')) {
            this.onResumeSubscription = this.platform.resume.subscribe(() => {
                if (this.isConfirm) {
                    this.diagnostic.isLocationAvailable().then(result => {
                        if (!result) {
                            this.isConfirm = false;
                            this.presentConfirm();
                        }
                        else {
                            this.isConfirm = false;
                            this.getCoords();
                        }
                    });
                }
                else return;
            });
        }

        if (this.navParams.get('user')) {
            this.isEdit = true;
            this.user = this.navParams.get('user');
            this.baseData = _.clone(this.user);
            this.picture_url = this.baseData.picture_url;
            this.coords.lat = this.baseData.latitude;
            this.coords.lng = this.baseData.longitude;
            if (this.coords.lat) {
                this.addMap();
            }
            else {
                this.getLocationStatus();
            }
        }
        else {
            this.profile.get(true)
                .subscribe(resp => {
                    this.user = resp;
                    this.baseData = _.clone(this.user);
                    this.picture_url = this.user.picture_url;
                });
            this.getLocationStatus();
        }
    }

    getLocationStatus() {
        if (this.platform.is('android') && this.platform.is('cordova')) {
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
        else if (this.platform.is('ios') && this.platform.is('cordova')) {
            this.diagnostic.getLocationAuthorizationStatus()
                .then(resp => {
                    if (resp === 'NOT_REQUESTED' || resp === 'NOT_DETERMINED' || resp === 'not_requested' || resp === 'not_determined') {
                        this.diagnostic.requestLocationAuthorization()
                            .then(res => {
                                this.getLocation(false);
                            })
                    }
                    else {
                        this.getLocation(false);
                    }
                })
        }
        else {
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
                                this.presentAndroidConfirm();
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
            if (!this.platform.is('cordova')) {
                this.getCoords();
            }
            else {
                this.diagnostic.isLocationAvailable().then(result => {
                    if (!result) {
                        this.presentConfirm();
                    }
                    else {
                        this.getCoords();
                    }
                });
            }
        }
        else {
            this.location.getByIp()
                .subscribe(resp => {
                    this.coords = {
                        lat: resp.latitude,
                        lng: resp.longitude
                    };
                    this.changeDetectorRef.detectChanges();
                    this.addMap();
                })
        }
    }

    getNativeCoords(isHighAccuracy: boolean, loadingLocation) {
        this.location.get(isHighAccuracy)
            .then((resp) => {
                this.coords = {
                    lat: resp.coords.latitude,
                    lng: resp.coords.longitude
                };
                loadingLocation.dismissAll();
                this.addMap();
                setTimeout(() => {
                    this.changeDetectorRef.detectChanges();
                    this._map.setView(this.coords, 15);
                }, 600);
                // this._map.setView(this.coords, 15);
            })
            .catch((error) => {
                loadingLocation.dismissAll();
                this.presentConfirm();
            })
    }

    getCoords() {
        let loadingLocation = this.loading.create({ content: 'Location detection', spinner: 'bubbles' });
        loadingLocation.present();
        if (this.platform.is('android')) {
            this.diagnostic.getLocationMode()
                .then(res => {
                    this.getNativeCoords(res === 'high_accuracy', loadingLocation);
                });
        }
        else {
            this.getNativeCoords(false, loadingLocation);
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
        this.canSaveImg = false; 
        let image = new Image();  
        let options = { maximumImagesCount: 1, width: 600, height: 600 };
        this.imagePicker.getPictures(options)
            .then(results => {
                if (results[0] && results[0] != 'O') {
                    // this.picture_url = results[0]; 
                    image.src = results[0]; 
                    this.isCrop = true;  
                    setTimeout(() => { 
                        this.cropper.setImage(image)
                    this.changeDetectorRef.detectChanges();  
                }, 500);
                }
            })
            .catch(err => {
                this.toast.show(JSON.stringify(err));
                console.log(err);
            });
    }

    saveImage() {
        this.changedPicture = true;
        this.picture_url = this.dataImg.image;
        this.isCrop = false;
    }

    handleCropping(bounds: Bounds) {
        this.croppedHeight = bounds.bottom - bounds.top;
        this.croppedWidth = bounds.right - bounds.left;
        this.canSaveImg = true;
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
            this.nav.pop();
            this.profile.refreshAccounts();
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
        let confirm = this.alert.create({
            title: 'To create account your location needed',
            message: 'To turn on location, please, click "Settings". Otherwise, you have the option to set the coordinates manually.',
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {
                        this.getLocation(true);
                        this.isSelectVisible = true;
                    }
                },
                {
                    text: 'Settings',
                    handler: () => {
                        this.isConfirm = true;
                        if (this.platform.is('ios')) {
                            this.diagnostic.switchToSettings();
                        }
                        else {
                            this.diagnostic.switchToLocationSettings();
                        }
                    }
                }
            ],
            enableBackdropDismiss: false
        });
        confirm.present();
    }

    ionViewDidLeave() {
        if (this.platform.is('cordova')) {
            this.onResumeSubscription.unsubscribe();
        }
    }

}
