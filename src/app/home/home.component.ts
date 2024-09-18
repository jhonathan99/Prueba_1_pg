import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private router: Router) { }

  goToLogin(event: Event): void {
    event.preventDefault();  // Prevenir el comportamiento predeterminado del enlace
    this.router.navigate(['/login']);
  }
  goToAcerca(event: Event): void {
    event.preventDefault();  // Prevenir el comportamiento predeterminado del enlace
    this.router.navigate(['/acerca']);
  }

}
