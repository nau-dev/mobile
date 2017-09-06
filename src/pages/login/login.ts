import { Component } from '@angular/core';
import { NavController } from "ionic-angular";
import { AuthService } from "../../providers/auth.service";
import { Login } from "../../models/login";
import { TabsPage } from "../tabs/tabs";
import { OnBoardingPage } from "../onboarding/onboarding";

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})

export class LoginPage  {
    data: Login = new Login();
    
    constructor(
        private nav: NavController,
        private auth: AuthService) { 
        
    }

    login() {
        this.auth
            .login(this.data)
            .subscribe(
                resp => {             
                    this.nav.setRoot(/*this.auth.isOnboardingShown() ? TabsPage :*/ OnBoardingPage);
                }
            );
    }
}