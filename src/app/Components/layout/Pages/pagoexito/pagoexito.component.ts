import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable, map, of, startWith } from 'rxjs';
import { Tipopago } from 'src/app/Interfaces/tipopago';
import { Pago } from 'src/app/Interfaces/pago';
import { TipoPagoService } from 'src/app/Services/tipopago.service';
import { PagoService } from 'src/app/Services/pago.service';
import { UtilidadService } from 'src/app/Reutilizable/shared/utilidad.service';
import { PersonaService } from 'src/app/Services/persona.service';
import { Persona } from 'src/app/Interfaces/persona';
import { CookieService } from 'ngx-cookie-service'; // Asegúrate de tener el servicio de cookies
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pagoexito',
  templateUrl: './pagoexito.component.html',
  styleUrls: ['./pagoexito.component.css']
})
export class PagoexitoComponent implements OnInit {
  myControl = new FormControl<Persona | null>(null); 
  options: Persona[] = [];
  filteredOptions: Observable<Persona[]> = of([]);

  formularioPago: FormGroup;
  ocultarPassword: boolean = true;
  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";
  listatipospagos: Tipopago[] = [];

  constructor(
    private fb: FormBuilder,
    private _tipoPagoServicio: TipoPagoService,
    private _pagoServicio: PagoService,
    private _utilidadServicio: UtilidadService,
    private cookie: CookieService,
    private _personaServicio: PersonaService
  ) {
    // Inicializa el formulario con todos los campos necesarios
    this.formularioPago = this.fb.group({
      idPersona: ['', Validators.required],
      fechaInicio: [''],
      fechaFin: [''],
      mes: [''],
      monto: [''],
      //checkout: [''] // Asegúrate de que el campo checkout esté definido
      checkout: ['', Validators.required]
    });

    // Obtén el valor de la cookie y actualiza el formulario
    let tokenurl: string = this.cookie.get('cookie_checkout');
    let tokenidPersona: string = this.cookie.get('cookie_idPersona');

    console.log('URL guardada en la cookie:', tokenurl);
    if (tokenurl) {
      this.formularioPago.patchValue({
        checkout: tokenurl
      });
    }
    console.log('IDPersona guardada en la cookie:', tokenidPersona);
    if (tokenidPersona) {
      this.formularioPago.patchValue({
        idPersona: tokenidPersona
      });
    }

    this._tipoPagoServicio.lista().subscribe({
      next: (data) => {
        if (data.status) this.listatipospagos = data.value;
      },
      error: (e) => {}
    });
  }

  ngOnInit(): void {
  
  }

  obtenerPersonas() {
    this._personaServicio.lista().subscribe({
      next: (data) => {
        if (data.status) {
          const clientes = data.value.filter((persona: Persona) => persona.rolDescripcion === 'Cliente');
          this.options = clientes;
          console.log('Personas cargadas:', this.options);
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron datos", "Revisar");
        }
      },
      error: (e) => {
        console.error('Error al obtener personas:', e);
      }
    });
  }


  guardarEditar_Pago() {
    if (this.formularioPago.invalid) {
      // Muestra un mensaje de error si el formulario es inválido
      Swal.fire('Error', 'Al parecer, ya se ha registrado el Pago.', 'error');
      return;
    }
      const _pago: Pago = {
        idPago: 0,  // Nuevo pago, por lo que ID es 0
        idPersona: this.formularioPago.value.idPersona,
        descripcionPersona: "",  // Asigna valores predeterminados si es necesario
        descripcionDireccion: "",
        descripcionNit: "",
        idTipoPago: this.formularioPago.value.idTipoPago || null, // Manejo de valores nulos
        descripcionTipoPago: "",
        fechaInicio: this.formularioPago.value.fechaInicio || null,
        fechaFin: this.formularioPago.value.fechaFin || null,
        mes: this.formularioPago.value.mes || "",
        monto: this.formularioPago.value.monto || 0,
        checkout: this.formularioPago.value.checkout || "",
    };
  
    console.log('Datos del pago a enviar:', _pago);
  
    this._pagoServicio.PagosenLinea(_pago).subscribe({
      next: (data) => {
        console.log('Respuesta del servidor:', data);
  
        if (data.status) {
          this._utilidadServicio.mostrarAlerta("El pago fue registrado", "Éxito");
        } else {
          // Mostrar más detalles del error
         
          console.error('Detalles del error del servidor:', data);
        }
      },
      error: (e) => {
        // Manejar errores de red o del servidor
        this._utilidadServicio.mostrarAlerta("Error de red o del servidor", "Error");
        console.error('Error en la solicitud:', e);
      }
    });
  }
  
}
