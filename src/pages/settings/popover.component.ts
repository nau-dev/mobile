import { Component } from '@angular/core';
import { ViewController, App } from 'ionic-angular';
import { CreateUserProfilePage } from '../create-user-profile/create-user-profile';
import { CreateAdvUserProfilePage } from '../create-advUser-profile/create-advUser-profile';

@Component({
    selector: 'popover-component',
    templateUrl: 'popover.component.html'
})

export class PopoverComponent {
    constructor(
        private viewCtrl: ViewController,
        private app: App) { }

    close() {
        this.viewCtrl.dismiss();
        this.app.getRootNav().setRoot(CreateAdvUserProfilePage);
    }
}