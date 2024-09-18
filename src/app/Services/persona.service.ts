import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseAPI } from '../Interfaces/response-api';
import { Persona } from '../Interfaces/persona';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  private urlApi: string = environment.endpoint + 'Persona/';
  private urlApi2: string = environment.endpoint + 'Email/';

  constructor(private http: HttpClient) { }

  lista(): Observable<ResponseAPI> {
    return this.http.get<ResponseAPI>(`${this.urlApi}Lista`);
  }

  guardar(request: Persona): Observable<ResponseAPI> {
    return this.http.post<ResponseAPI>(`${this.urlApi}Guardar`, request);
  }

  editar(request: Persona): Observable<ResponseAPI> {
    return this.http.put<ResponseAPI>(`${this.urlApi}Editar`, request);
  }

  eliminar(id: number): Observable<ResponseAPI> {
    return this.http.delete<ResponseAPI>(`${this.urlApi}Eliminar/${id}`);
  }

  //buscarPersonaPorNombre(nombre: string): Observable<Persona[]> {
  //  return this.http.get<Persona[]>(`${this.urlApi}buscar?nombre=${nombre}`);
  //}

  restablecerContraseña(correo: string): Observable<ResponseAPI> {
    const body = JSON.stringify(correo); // Convertir el correo a una cadena JSON
    return this.http.post<ResponseAPI>(`${this.urlApi2}restablecer`, body, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  
}
