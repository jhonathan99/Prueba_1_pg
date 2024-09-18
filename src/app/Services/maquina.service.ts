import { Injectable } from '@angular/core';

import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseAPI } from '../Interfaces/response-api';
import { Login } from '../Interfaces/login';
import { Maquina } from '../Interfaces/maquina';

@Injectable({
  providedIn: 'root'
})
export class MaquinaService {

  private urlApi:string = environment.endpoint + "Maquina/";

  constructor(private http:HttpClient) { }

  lista():Observable<ResponseAPI>{
    return this.http.get<ResponseAPI>(`${this.urlApi}Lista`)
  }

  guardar(request: Maquina):Observable<ResponseAPI>{
    return this.http.post<ResponseAPI>(`${this.urlApi}Guardar`,request)
  }

  editar(request: Maquina):Observable<ResponseAPI>{
    return this.http.put<ResponseAPI>(`${this.urlApi}Editar`,request)
  }

  eliminar(id: number):Observable<ResponseAPI>{
    return this.http.delete<ResponseAPI>(`${this.urlApi}Eliminar/${id}`)
  }
}
