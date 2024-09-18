import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseAPI } from '../Interfaces/response-api';
import { Pago } from '../Interfaces/pago';

@Injectable({
  providedIn: 'root'
})
export class PagosenLineaService {

   constructor(private http:HttpClient) { }

    public postPago(url: string, body: any, headers:any= HttpHeaders) {
        return this.http.post(url, body, headers); //Post
    }

    public getPago(url: string, headers:any= HttpHeaders) {
      return this.http.get(url, headers); //Post
      
  }
  // private apiUrl = 'https://app.recurrente.com/api/checkouts';
  // constructor(private http: HttpClient) { }

  // postPago(items: any): Observable<any> {
  //   debugger
  //   const headers = new HttpHeaders({
  //     'X-PUBLIC-KEY': environment.X_PUBLIC_KEY,
  //     'X-SECRET-KEY': environment.X_SECRET_KEY
  //   });

  //   return this.http.post(this.apiUrl, { items }, { headers });
  // }



}