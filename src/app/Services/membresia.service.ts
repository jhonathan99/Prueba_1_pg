import { Injectable } from '@angular/core';

import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseAPI } from '../Interfaces/response-api';

@Injectable({
  providedIn: 'root'
})
export class MembresiaService {
  private urlApi:string = environment.endpoint + "Membresia/";

  constructor(private http:HttpClient) { }

  lista():Observable<ResponseAPI>{
    return this.http.get<ResponseAPI>(`${this.urlApi}Lista`)
  }

}
