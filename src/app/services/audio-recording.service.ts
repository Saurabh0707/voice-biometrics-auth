import { Injectable, NgZone } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { isNullOrUndefined } from 'util';

// declare var NanoTimer: any;

interface RecordedAudioOutput {
  blob: Blob;
  title: string;
}
// declare var NanoTimer: any;
@Injectable()
export class AudioRecordingService {


  private stream;
  private expected;
  private recorder;
  private interval;
  private startTime;
  private _recorded = new Subject<RecordedAudioOutput>();
  private _recordingTime = new Subject<string>();
  private _recordingFailed = new Subject<string>();
  private _isRecording = new Subject<boolean>();


  getRecordedBlob(): Observable<RecordedAudioOutput> {
    return this._recorded.asObservable();
  }

  getRecordedTime(): Observable<string> {
    return this._recordingTime.asObservable();
  }

  recordingFailed(): Observable<string> {
    return this._recordingFailed.asObservable();
  }
  isRecording(): Observable<boolean> {
    return this._isRecording.asObservable();
  }


  startRecording() {
    if (this.recorder) {
      // It means recording is already started or it is already recording something
      return;
    }
    this._recordingTime.next('00:00');
    navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
      this.stream = s;
      this.record();
    }).catch(error => {
      this._recordingFailed.next();
    });

  }

  abortRecording() {
    this._isRecording.next(false);
    this.stopMedia();
  }

  private record() {
    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
      type: 'audio',
      mimeType: 'audio/webm'
    });
    this._isRecording.next(true);
    this.recorder.record();
    this.expected = Date.now() + 5000;
    // custom set time out
    setTimeout(this.step.bind(this), 5000);
    //
    this.startTime = moment();
    this.interval = setInterval(
      () => {
        const currentTime = moment();
        const diffTime = moment.duration(currentTime.diff(this.startTime));
        const time = this.toString(diffTime.minutes()) + ':' + this.toString(diffTime.seconds());
        this._recordingTime.next(time);
      },
      1000
    );
  }
  private step()
  {
      let dt = Date.now() - this.expected; // the drift (positive for overshooting)
      if (dt > 5000) {
          console.log('something really bad happened. Maybe the browser (tab) was inactive');
          // possibly special handling to avoid futile "catch up" run
      }
      // do what is to be done
      this.stopRecording();
      this.expected += 5000;
      setTimeout(this.step, Math.max(0, 5000 - dt)); // take into account drift
  }
  stopRecording() {
    if (this.recorder) {
      this._isRecording.next(false);
      this.recorder.stop((blob) => {
        if (this.startTime) {
          const mp3Name = encodeURIComponent('audio_' + new Date().getTime() + '.mp3');
          this.stopMedia();
          this._recorded.next({ blob: blob, title: mp3Name });
        }
      }, () => {
        this.stopMedia();
        this._recordingFailed.next();
      });
    }
  }
  private toString(value) {
    let val = value;
    if (!value) {
      val = '00';
    }
    if (value < 10) {
      val = '0' + value;
    }
    return val;
  }
  private stopMedia() {
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach(track => track.stop());
        this.stream = null;
      }
    }
  }

}
