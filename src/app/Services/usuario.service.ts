import { Injectable } from '@angular/core';

import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseAPI } from '../Interfaces/response-api';
import { Login } from '../Interfaces/login';
import { Usuario } from '../Interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private urlApi:string = environment.endpoint + "Usuario/";

  constructor(private http:HttpClient) { }

  iniciarSesion(request: Login):Observable<ResponseAPI>{
    return this.http.post<ResponseAPI>(`${this.urlApi}IniciarSesion`,request)
  }

  lista():Observable<ResponseAPI>{
    return this.http.get<ResponseAPI>(`${this.urlApi}Lista`)
  }

  guardar(request: Usuario):Observable<ResponseAPI>{
    return this.http.post<ResponseAPI>(`${this.urlApi}Guardar`,request)
  }

  editar(request: Usuario):Observable<ResponseAPI>{
    return this.http.put<ResponseAPI>(`${this.urlApi}Editar`,request)
  }

  eliminar(id: number):Observable<ResponseAPI>{
    return this.http.delete<ResponseAPI>(`${this.urlApi}Eliminar/${id}`)
  }

  
}
