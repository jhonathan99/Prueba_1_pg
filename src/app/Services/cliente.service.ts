import { Injectable } from '@angular/core';

import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseAPI } from '../Interfaces/response-api';
import { Cliente } from '../Interfaces/cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private urlApi:string = environment.endpoint + "Cliente/";

  constructor(private http:HttpClient) { }

  lista():Observable<ResponseAPI>{
    return this.http.get<ResponseAPI>(`${this.urlApi}Lista`)
  }

  guardar(request: Cliente):Observable<ResponseAPI>{
    return this.http.post<ResponseAPI>(`${this.urlApi}Guardar`,request)
  }

  editar(request: Cliente):Observable<ResponseAPI>{
    return this.http.put<ResponseAPI>(`${this.urlApi}Editar`,request)
  }

  eliminar(id: number):Observable<ResponseAPI>{
    return this.http.delete<ResponseAPI>(`${this.urlApi}Eliminar/${id}`)
  }

  buscar(idPersona: number): Observable<ResponseAPI> {
    return this.http.get<ResponseAPI>(`${this.urlApi}GetByPersonaId/${idPersona}`);
  }

}
