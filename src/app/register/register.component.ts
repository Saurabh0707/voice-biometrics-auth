import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotifierService } from 'angular-notifier';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AudioRecordingService } from '../services/audio-recording.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  recordedTime;
  blobUrl;
  blob;
  emailForm: FormGroup;
 private notifier: NotifierService;
  isRecordingOne = false;
  // isRecordingTwo = false;
  // isRecordingThree = false;
  step1 = true;
  step2 = false;
  step3 = false;
  step4 = false;
  step1PreAllowed = true;
  step2PreAllowed = true;
  step3PreAllowed = true;
  step4PreAllowed = true;
 constructor(private serverService: ServerService,
   private spinner: NgxSpinnerService,
    notifierService: NotifierService,
    private audioRecordingService: AudioRecordingService,
    private sanitizer: DomSanitizer) {
   this.notifier = notifierService;

   this.audioRecordingService.recordingFailed().subscribe(() => {
     // this.isRecording = false;
   });

   this.audioRecordingService.getRecordedTime().subscribe((time) => {
     this.recordedTime = time;
   });
   this.audioRecordingService.isRecording().subscribe((is) => {
     this.isRecordingOne = is;
   });
   this.audioRecordingService.getRecordedBlob().subscribe((data) => {
     this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data.blob));
     this.blob = data.blob;
     console.log(data);
   });
  }
 ngOnInit() {
   this.emailForm = new FormGroup({
     'email' : new FormControl(null, [Validators.required, Validators.email]),
     'username' : new FormControl(null, [Validators.required])
   });
 }

 finalSubmit(){
   this.spinner.show();
   setTimeout(()=>{
     this.spinner.hide();
     this.notifier.notify( 'success', 'Registered Successfully' );
   },3000);
 }

 startRecording() {
   if (!this.isRecordingOne) {
     // this.isRecording = true;
   //  this.isRecordingOne = !this.isRecordingOne;
     this.audioRecordingService.startRecording();
   }
 }

 abortRecording() {
   if (this.isRecordingOne) {
     // this.isRecording = false;
     this.audioRecordingService.abortRecording();
   }
 }
 clearRecordedData() {
   this.blobUrl = null;
   this.blob = null;
 }
 enroll() {
  this.spinner.show();
    this.serverService.enroll(this.blob).subscribe(
      (data) => {
        console.log(data);
        this.step2 = !this.step2;
        this.step3 = !this.step3;
        this.step3PreAllowed = false;
        this.clearRecordedData();
      },
      (error) => {
        this.clearRecordedData();
        this.spinner.hide();
        this.notifier.notify( 'error', error.error.message );
        console.log(error);
      });
 }
 verify(){
  this.serverService.enroll(this.blob).subscribe(
    (data) => {
      console.log(data);
      this.step3 = !this.step3;
      this.step4 = !this.step4;
      this.step4PreAllowed = false;
      this.clearRecordedData();

    },
    (error) => {
      this.clearRecordedData();
      this.spinner.hide();
      this.notifier.notify( 'error', error.error.message );
      console.log(error);
    });
 }
 verifyAgain(){
  this.serverService.enroll(this.blob).subscribe(
    (data) => {
      console.log(data);
      this.clearRecordedData();

      // this.step3PreAllowed = false;
    },
    (error) => {
      this.clearRecordedData();
      this.spinner.hide();
      this.notifier.notify( 'error', error.error.message );
      console.log(error);
    });
  }
 ngOnDestroy(): void {
   this.abortRecording();
 }
 getUser(email) {
   this.serverService.getUser(email).subscribe(
     (data) => {console.log(data)},
     (error) => {
       console.log(error);
     });
 }
}

