import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotifierService } from 'angular-notifier';
import { AudioRecordingService } from '../services/audio-recording.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ServerService } from '../services/server.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment.prod';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
   recordedTime;
   blobUrl;
   blob;
   voiceitId;
   emailForm: FormGroup;
  private notifier: NotifierService;
  constructor(private serverService: ServerService,
    private router: Router,
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
      'email' : new FormControl(null, [Validators.required, Validators.email])
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
    this.serverService.verify(this.blob, this.voiceitId).subscribe(
      (data: any) => {
        this.spinner.show();
        console.log(data);
        if (data.responseCode === 'FAIL') {
          this.clearRecordedData();
          this.spinner.hide();
          this.notifier.notify( 'error', data.message );
        } else {
          const loginData = {
            'username' : this.emailForm.value.email,
            'password' : environment.password
          };
          this.serverService.login(loginData).subscribe(
            (backendData) => {console.log(backendData); this.spinner.hide(); this.router.navigate(['/dashboard']); },
            (backendError) => {console.log(backendError); this.spinner.hide(); }
          );
        }
      },
      (error) => {
        this.clearRecordedData();
        this.spinner.hide();
        this.notifier.notify( 'error', error.error.message );
        console.log(error);
      });
  }

  login() {
    this.spinner.show();
        const loginData = {
          'username' : this.emailForm.value.email,
          'password' : 'saurabh123'
        };
        this.serverService.login(loginData).subscribe(
          (backendData) => {console.log(backendData); this.spinner.hide(); },
          (backendError) => {console.log(backendError); this.spinner.hide(); }
        );
     }

  ngOnDestroy(): void {
    this.abortRecording();
  }
  getUser() {
    console.log(this.emailForm.value.email);
    this.serverService.getUser(this.emailForm.value.email).subscribe(
      (data: any) => {
        console.log(data);
        this.voiceitId = data.voiceit_id;
        console.log(this.voiceitId);
        this.step1 = !this.step1;
      },
      (error) => {
        console.log(error);
      });
  }
}
