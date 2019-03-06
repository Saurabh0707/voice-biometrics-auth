
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable()
export class ServerService {
  // private headers = new HttpHeaders().set('Content-Type', 'application/json');
  private headers = new HttpHeaders(
    {
      'Access-Control-Allow-Origin': 'https://localhost:4200',
      'Access-Control-Allow-Methods': 'POST',
      'Authorization': environment.voiceItId,
      'Accept': '*/*',
    });

  constructor(private http: HttpClient) { }
  getProducts() {
    return this.http.get(environment.apiUrl + 'users/', { headers: this.headers });
  }
  createUser(){

  }
  verify(blob:any) {
    let formData = new FormData();
    console.log(blob);
    formData.append('recording', blob);
    formData.append('userId', 'usr_2c09f6e959924adcbcd599ca600ec5bd');
    formData.append('contentLanguage', 'en-US');
    formData.append('phrase', 'Never forget tomorrow is a new day');
    return this.http.post(environment.voiceItUrl + '/verification/voice', formData, { headers: this.headers });
  }
  getPhrase(){
    let headers = new HttpHeaders();
    // headers = headers.append('Content-Type', 'application/json');
    return this.http.get(environment.voiceItUrl + 'phrases/en-GB',
    { headers: this.headers, });
  }
  getUser(email){
    return this.http.get(environment.apiUrl + email, { headers: this.headers });
  }
}
