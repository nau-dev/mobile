import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Http, Response } from '@angular/http';
import { Observable } from "rxjs";
import { ToastService } from './toast.service';


@Injectable()
export class LocationService {
    geoposition: Geoposition;
    url = 'https://freegeoip.net/json/';

    constructor(private geolocation: Geolocation,
                private http: Http,
                private toast: ToastService) { }

    get(isHighAccuracy: boolean) {
        // if (this.geoposition)
        //     return Promise.resolve(this.geoposition);
        // else
        let promise = this.geolocation.getCurrentPosition({
            enableHighAccuracy: isHighAccuracy,
            timeout: 80000,
            maximumAge: 10000})
        promise.then(geo => this.geoposition = geo);
        return promise;
    }

    getByIp() {
        return this.wrapObservable(this.http.get(this.url));
    }

    wrapObservable(obs: Observable<Response>) {
        let sharableObs = obs.share();
        sharableObs.subscribe(
            resp => { },
            errResp => {
                let messages = [];
                let err = errResp.json();
                messages.push(err.errorMessage);
                this.toast.show(messages.join('\n'));
            })
        return sharableObs.map(resp => resp.json());
    }

    reset() {
        this.geoposition = undefined;
    }

}