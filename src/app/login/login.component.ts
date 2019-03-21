import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotifierService } from 'angular-notifier';
import { AudioRecordingService } from '../services/audio-recording.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ServerService } from '../services/server.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
   recordedTime;
   blobUrl;
   blob;
   emailForm: FormGroup;
  private notifier: NotifierService;
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
  isRecordingOne = false;
  step1 = true;
  ngOnInit() {
    this.emailForm = new FormGroup({
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
  verify() {
    this.spinner.show();
    this.serverService.verify(this.blob).subscribe(
      (data) => {console.log(data)},
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
