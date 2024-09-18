import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseAPI } from '../Interfaces/response-api';
import { Pago } from '../Interfaces/pago';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private urlApi: string = `${environment.endpoint}Pago/`;

  constructor(private http: HttpClient) { }

  lista(): Observable<ResponseAPI> {
    return this.http.get<ResponseAPI>(`${this.urlApi}Lista`);
  }

  PagosenLinea(request: Pago): Observable<ResponseAPI> {
    return this.http.post<ResponseAPI>(`${this.urlApi}PagosenLinea`, request);
  }

  PagosenEfectivo(request: Pago): Observable<ResponseAPI> {
    return this.http.post<ResponseAPI>(`${this.urlApi}PagosenEfectivo`, request);
  }

  buscar(idPersona: number): Observable<ResponseAPI> {
    return this.http.get<ResponseAPI>(`${this.urlApi}GetPagoPersonaId/${idPersona}`);
  }

  
  editar(request: Pago):Observable<ResponseAPI>{
    return this.http.put<ResponseAPI>(`${this.urlApi}Editar`,request)
  }

  eliminar(id: number):Observable<ResponseAPI>{
    return this.http.delete<ResponseAPI>(`${this.urlApi}Eliminar/${id}`)
  }

}
