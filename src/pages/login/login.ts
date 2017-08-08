import { Component } from '@angular/core';
import { NavController, ToastController } from "ionic-angular";
import { AuthService } from "../../providers/auth.service";
import { Login } from "../../models/login";
import { TabsPage } from "../tabs/tabs";

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})

export class LoginPage  {
    token: any; 
    data: Login = new Login();
    
    constructor(
        public nav: NavController,
        private authService: AuthService,
        private toast: ToastController) { 
        
}

    login() {
        
        this.authService
            .login(this.data)
            .subscribe(
                resp => {
                    this.token = resp.json();
                    this.nav.setRoot(TabsPage);
                },
                (errResp) => {
                    let err = errResp.json();
                    let toast = this.toast.create({
                        message: err.error || 'Unexpected error occured',
                        duration: 5000,
                        position: 'bottom',
                        dismissOnPageChange: true,
                        cssClass: 'toast'
                    });
                    toast.present();
                }
            );
    }
}