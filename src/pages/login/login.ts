import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NavController } from 'ionic-angular';
import { StringValidator } from '../../app/validators/string.validator';
import { Login } from '../../models/login';
import { AppModeService } from '../../providers/appMode.service';
import { AuthService } from '../../providers/auth.service';
import { ProfileService } from '../../providers/profile.service';
import { CreateUserProfilePage } from '../create-user-profile/create-user-profile';
import { SignUpInvitePage } from '../invite/invite';
import { TabsPage } from '../tabs/tabs';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})

export class LoginPage {
    authData: Login = {
        phone: '',
        code: ''
    };
    numCodes = ['+7', '+49', '+63', '+57', '+380'];
    numCode: string = '+380';
    page;

    constructor(
        private nav: NavController,
        private auth: AuthService,
        private appMode: AppModeService,
        private profile: ProfileService,
        private builder: FormBuilder) {

    }

    login() {
        this.auth
            .login({
                phone: this.numCode + this.authData.phone,
                code: this.authData.code
                // code: this.authData.phone.slice(-6)
            })
            .subscribe(
            resp => {
                this.appMode.setHomeMode(true);
                debugger
                this.profile.get(true)
                    .subscribe(resp => {
                        if (resp.name == '' && !resp.email) {
                            this.nav.setRoot(CreateUserProfilePage)
                        }
                        else {
                            this.nav.setRoot(TabsPage, { index: 0 });
                        }
                    });
            });
    }

    signup() {
        this.nav.push(SignUpInvitePage);
    }

    limitStr(str: string, length: number) {
        if (length == 12) this.authData.phone = StringValidator.stringLimitMax(str, length);
        else this.authData.code = StringValidator.stringLimitMax(str, length);
        }
    

}