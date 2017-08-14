import { Component } from '@angular/core';
import { App } from 'ionic-angular';
import { AuthService } from "../../providers/auth.service";
import { StartPage } from "../start/start";
import { ProfileService } from "../../providers/profile.service";
import { User } from "../../models/user";

@Component({
  selector: 'page-user',
  templateUrl: 'user.html'
})
export class UserPage {
    data: User = new User();

  constructor(
    private app: App,
    private profile: ProfileService,
    private auth: AuthService,) {

  }

  ionViewDidEnter() {
      this.profile.get()
        .subscribe(profile => {
            this.data = profile;
            console.log(this.data);
        })
  }

  logout() {
    this.auth.logout();
    this.app.getRootNav().setRoot(StartPage);
  }
}