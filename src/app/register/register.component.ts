import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private notifier: NotifierService;
  constructor(private spinner: NgxSpinnerService,notifierService: NotifierService) {
    this.notifier = notifierService;
   }
  isRecordingOne = false;
  isRecordingTwo = false;
  isRecordingThree = false;
  step1 = true;
  step2 = false;
  step3 = false;
  step4 = false;
  ngOnInit() {
  }
  finalSubmit(){
    this.notifier.notify( 'success', 'Registered Successfully' );
    this.spinner.show();
    setTimeout(()=>{
      this.spinner.hide();
      this.notifier.notify( 'success', 'Registered Successfully' );
    }, 3000);
  }
}
