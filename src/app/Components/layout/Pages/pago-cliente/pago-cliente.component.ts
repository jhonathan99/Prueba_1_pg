import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { PagosenLineaService } from 'src/app/Services/pagosenlinea.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-pago-cliente',
  templateUrl: './pago-cliente.component.html',
  styleUrls: ['./pago-cliente.component.css']
})
export class PagoClienteComponent implements OnInit {

  constructor(
    private cookie: CookieService,
    private PagosenLineaService: PagosenLineaService
  ) { }

  ngOnInit(): void {
    // Obtener el idPersona desde la cookie
    let tokenurl: any = this.cookie.get('cookie_checkout');
    let idPersona: any = this.cookie.get('cookie_idPersona');

    console.log('URL guardada en la cookie:', tokenurl);
    console.log('ID Persona guardada en la cookie:', idPersona);
  }

  crearCheckOut() {
    const idmensualidad = "prod_fmyncnjj"; // id del producto mensualidad
    const headers = new HttpHeaders({
      'X-PUBLIC-KEY': environment.X_PUBLIC_KEY,
      'X-SECRET-KEY': environment.X_SECRET_KEY
    });

    // Obtener idPersona desde la cookie
    const idPersona = this.cookie.get('cookie_idPersona'); 

    this.PagosenLineaService.postPago(
      `https://app.recurrente.com/api/checkouts`,
      {
        items: [{ price_id: idmensualidad }],
        idPersona: idPersona // Enviar idPersona en el cuerpo del pago
      },
      {
        headers: headers,
      }
    ).subscribe({
      next: (data: any) => {
        console.log(data);
        console.log(data.checkout_url);

        // Redireccionar a la URL de checkout y guardar URL e idPersona en cookies sin expiración
        window.location.href = `${data.checkout_url}`;
        
        // Guardar la URL y el idPersona sin expiración (serán cookies de sesión)
        this.cookie.set('cookie_checkout', data.checkout_url);
        this.cookie.set('cookie_idPersona', idPersona); // Guardar idPersona también
      },
      error: (error) => {
        console.error('Error durante el pago:', error);
      },
    });
  }
}
