import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { User } from '../../models/user';
import { AuthService } from '../../providers/auth.service';
import { ProfileService } from '../../providers/profile.service';
import { StringValidator } from '../../validators/string.validator';

@Component({
    selector: 'page-settings-change-phone',
    templateUrl: 'settings-change-phone.html'
})
export class SettingsChangePhonePage {

    user = new User;
    visibleChangePhone: boolean = true;
    otp: string;
    phone: string

    constructor(private nav: NavController,
        private navParams: NavParams,
        private auth: AuthService,
        private profile: ProfileService) {

        this.user = this.navParams.get('user');
        // this.phone = this.user.phone;
    }

    validPhoneChange(ev) {
        this.phone = StringValidator.validPhoneChange(ev);
    }

    toggleChangePhone() {
        this.visibleChangePhone = false;
        this.otp = this.auth.getOtp(this.phone);
    }

    changePhone() {
        if (this.user.phone == this.phone) {
            this.nav.pop();
        }
        else {
            this.user.phone = this.phone;
            this.profile.put(this.user)
                .subscribe(
                    resp => this.nav.pop(),
                    errResp => this.visibleChangePhone = true);
        }

    }
}
