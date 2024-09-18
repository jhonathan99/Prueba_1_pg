import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token'); // Puedes guardar un token en localStorage o usar cookies
    return !!token; // Retorna verdadero si hay un token (usuario autenticado)
  }

  logout() {
    localStorage.removeItem('token');
  }
}
