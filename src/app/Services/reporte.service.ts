import { Injectable } from '@angular/core';

import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseAPI } from '../Interfaces/response-api';


@Injectable({
    providedIn: 'root'
  })
  export class ReporteService {
  
    private urlApi:string = environment.endpoint + "DashBoard/";
  
    constructor(private http:HttpClient) { }
  
    reporte():Observable<ResponseAPI>{
      return this.http.get<ResponseAPI>(`${this.urlApi}Resumen`)
    }
}