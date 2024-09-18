import { Injectable } from '@angular/core';

import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseAPI } from '../Interfaces/response-api';


@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private urlApi:string = environment.endpoint + "Menu/";

  constructor(private http:HttpClient) { }

  lista(idUsuario:number):Observable<ResponseAPI>{
    return this.http.get<ResponseAPI>(`${this.urlApi}Lista?idUsuario=${idUsuario}`)
  }

}
