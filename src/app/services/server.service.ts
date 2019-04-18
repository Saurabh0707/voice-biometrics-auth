
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable()
export class ServerService {
  // private headers = new HttpHeaders().set('Content-Type', 'application/json');
  private headers = new HttpHeaders(
    {
      'Access-Control-Allow-Origin': 'https://localhost:4200',
      'Access-Control-Allow-Methods': '*',
      'Authorization': environment.voiceItId,
      'Accept': '*/*',
    });
    private voiceitId = null;
  constructor(private http: HttpClient) { }
  register(form){
    const details = {
      "user": {
        "username": form.value.username,
        "email": form.value.email
      },
      "voiceitId": this.voiceitId
    };
    console.log(environment.apiUrl+'api/client/');
    return this.http.post(environment.apiUrl + 'api/client/', {details}, { headers: this.headers });
  }
  verify(blob:any, voiceitId: any) {
    this.voiceitId = voiceitId;
    const formData = new FormData();
    console.log(blob);
    formData.append('recording', blob);
    formData.append('userId', this.voiceitId);
    formData.append('contentLanguage', 'en-US');
    formData.append('phrase', 'Never forget tomorrow is a new day');
    console.log(formData);
    return this.http.post( environment.reverse_proxy + environment.voiceItUrl + 'verification/voice',
    formData, { headers : {'Authorization': environment.voiceItId}});
  }
  login(loginData){
    console.log(loginData);
    const formData = new FormData();
    formData.append('username', loginData.username);
    formData.append('password', loginData.password);
    return this.http.post(environment.apiUrl + 'login/', formData);
  }
  enroll(blob:any) {
    let formData = new FormData();
    console.log(blob);
    formData.append('recording', blob);
    formData.append('userId', 'usr_2c09f6e959924adcbcd599ca600ec5bd');
    formData.append('contentLanguage', 'en-US');
    formData.append('phrase', 'Never forget tomorrow is a new day');
    return this.http.post(environment.voiceItUrl + 'enrollments/voice', formData, { headers: this.headers });
  }
  getPhrase(){
    let headers = new HttpHeaders();
    // headers = headers.append('Content-Type', 'application/json');
    return this.http.get(environment.voiceItUrl + 'phrases/en-GB',
    { headers: this.headers, });
  }
  getUser(email){
    return this.http.get(environment.apiUrl + 'profile/email/' + email + '/');
  }
}
