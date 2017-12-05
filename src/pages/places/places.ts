import { MapsAPILoader } from '@agm/core';
import { google } from '@agm/core/services/google-maps-types';
import { Component } from '@angular/core';
import { NavController, PopoverController } from 'ionic-angular';
import { ChildCategory } from '../../models/childCategory';
import { Company } from '../../models/company';
import { Coords } from '../../models/coords';
import { OfferCategory } from '../../models/offerCategory';
import { SelectedCategory } from '../../models/selectedCategory';
import { AppModeService } from '../../providers/appMode.service';
import { LocationService } from '../../providers/location.service';
import { OfferService } from '../../providers/offer.service';
import { ProfileService } from '../../providers/profile.service';
import { DistanceUtils } from '../../utils/distanse';
import { PlacePage } from '../place/place';
import { PlacesPopover } from './places.popover';

@Component({
    selector: 'page-places',
    templateUrl: 'places.html'
})
export class PlacesPage {

    companies: Company[];
    categories: OfferCategory[] = OfferCategory.StaticList;
    childCategories: ChildCategory[];
    selectedChildCategories: SelectedCategory[];
    selectedCategory = new OfferCategory;
    isMapVisible: boolean = false;
    coords: Coords;
    mapBounds;
    mapCenter: Coords;
    message: string;
    radius = 1000000;
    segment: string;
    distanceString: string;
    search: string;
    categoryFilter: string[];
    page = 1;
    lastPage: number;

    constructor(
        private nav: NavController,
        private location: LocationService,
        private appMode: AppModeService,
        private offers: OfferService,
        private popoverCtrl: PopoverController,
        private mapsAPILoader: MapsAPILoader,
        private profile: ProfileService) {

        this.selectedCategory = this.categories[0];
        this.segment = "alloffers";

        this.profile.get(false).subscribe(user => {
            this.coords = {
                lat: user.latitude,
                lng: user.longitude
            };
             if (!this.mapCenter) {
                        this.mapCenter = {
                            lat: this.coords.lat,
                            lng: this.coords.lng
                        };
                    }
            this.location.get()
                .then((resp) => {
                    this.coords = {
                        lat: resp.coords.latitude,
                        lng: resp.coords.longitude
                    };
                        this.mapCenter = {
                            lat: resp.coords.latitude,
                            lng: resp.coords.longitude
                        };
                        this.loadCompanies([this.selectedCategory.id], this.search, this.page);
                        this.categoryFilter = [this.selectedCategory.id];
                })
                .catch((error) => {
                    this.message = error.message;
                });


        })
    }

    ionSelected() {
        this.appMode.setHomeMode(false);
    }

    isSelectedCategory(category: OfferCategory) {
        return this.selectedCategory && this.selectedCategory.id == category.id;
    }

    selectCategory(category: OfferCategory) {
        this.search = ""
        this.selectedCategory = category;
        this.loadCompanies([this.selectedCategory.id], this.search, this.page = 1);
        this.categoryFilter = [this.selectedCategory.id];
    }

    generateBounds(markers): any {
        let marker = {
            latitude: this.coords.lat,
            longitude: this.coords.lng
        };

        if (markers && markers.length > 0) {
            let google = window['google'];
            let bounds = new google.maps.LatLngBounds();
                markers.forEach((marker: any) => {
                    bounds.extend(new google.maps.LatLng({ lat: marker.latitude, lng: marker.longitude }));
                    bounds.extend(new google.maps.LatLng({ lat: this.coords.lat, lng: this.coords.lng }));
                });
                //check if there is only one marker
                if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
                    bounds.extend(new google.maps.LatLng({ lat: this.coords.lat, lng: this.coords.lng }));
                    return bounds;
                }
                return bounds;
        }
        return undefined;
    }

    loadCompanies(categoryId, search, page) {
        this.offers.getPlaces(categoryId, this.coords.lat, this.coords.lng, this.radius, search, page)
            .subscribe(companies => {
                // this.companies = companies.data.filter(p => p.active_offers_count > 0);//temporaty companies filter
                this.companies = companies.data;
                this.mapsAPILoader.load()
                    .then(() => {
                        if (this.companies.length == 0 && this.coords) {
                            this.mapCenter = this.coords;
                        }
                        else if (this.companies.length == 1) {
                            this.mapCenter = {
                                lat: this.companies[0].latitude,
                                lng: this.companies[0].longitude,
                            };
                        };
                        this.mapBounds = this.generateBounds(this.companies);
                    })
            });
    }

    toggleMap() {
        this.isMapVisible = !this.isMapVisible;
    }

    openPlace(company, distance) {
        this.nav.push(PlacePage, { company: company, distance: this.getDistance(company.latitude, company.longitude) });
    }

    getStars(star: number) {
        let showStars: boolean[] = [];
        for (var i = 0; i < 5; i++) {
            showStars.push(star > i);
        }
        return showStars;
    }

    getDistance(latitude: number, longitude: number) {
        if (this.coords) {
            let distance = DistanceUtils.getDistanceFromLatLon(this.coords.lat, this.coords.lng, latitude, longitude);
            this.distanceString = distance >= 1000 ? distance / 1000 + " km" : distance + " m";
            return this.distanceString;
        };
        return undefined;
    }

    openPopover() {
        this.offers.getSubCategories(this.selectedCategory.id)
            .subscribe(category => {
                this.search = "";
                this.childCategories = category.children;
                let popover = this.popoverCtrl.create(PlacesPopover, {
                    childCategories: this.childCategories.map(p => {
                        return {
                            id: p.id,
                            name: p.name,
                            isSelected: this.selectedChildCategories ? !!this.selectedChildCategories.find(k => k.id == p.id) : false
                        }
                    })
                });
                popover.present();
                popover.onDidDismiss((categories) => {
                    if (!categories) {
                        return;
                    }

                    let selectedCategories: SelectedCategory[] = categories.filter(p => p.isSelected);
                    if (selectedCategories.length > 0) {
                        this.selectedChildCategories = selectedCategories;
                        this.categoryFilter = this.selectedChildCategories.map(p => p.id);
                    }
                    else {
                        this.selectedChildCategories = undefined;
                        // this.categoryFilter = this.childCategories.map(p => p.id);to do
                        this.categoryFilter = [this.selectedCategory.id];
                    }
                    this.loadCompanies(this.categoryFilter, this.search, this.page = 1);
                })
            });
    }

    searchCompanies($event) {
        this.loadCompanies(this.categoryFilter, this.search, this.page = 1);
    }

    infiniteScroll(infiniteScroll) {
        this.page = this.page + 1;
        if (this.page <= this.lastPage) {
            setTimeout(() => {
                this.offers.getPlaces(this.categoryFilter, this.coords.lat, this.coords.lng, this.radius, this.search, this.page)
                    .subscribe(companies => {
                        this.companies = [...this.companies, ...companies.data];
                        this.lastPage = companies.last_page;
                        this.mapsAPILoader.load()
                            .then(() => {
                                if (this.companies.length == 0 && this.coords) {
                                    this.mapCenter = this.coords;
                                }
                                else if (this.companies.length == 1) {
                                    this.mapCenter = {
                                        lat: this.companies[0].latitude,
                                        lng: this.companies[0].longitude,
                                    };
                                };
                                    this.mapBounds = this.generateBounds(this.companies);
                            })
                        infiniteScroll.complete();
                    });
            });
        }
        else {
            infiniteScroll.complete();
        }
    }
}
