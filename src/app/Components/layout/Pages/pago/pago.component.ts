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

import Swal from 'sweetalert2'; // Importar Swal

@Component({
  selector: 'app-pago',
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css']
})
export class PagoComponent implements OnInit {
  myControl = new FormControl<Persona | null>(null); 
  options: Persona[] = [];
  filteredOptions: Observable<Persona[]> = of([]);

  columnasTabla: string[] = ['nombreCompleto', 'edad', 'altura', 'peso', 'masamuscular', 'fecha', 'rolDescripcion', 'estado', 'acciones'];
  dataInicio: Persona[] = [];
  dataListaPersonas = new MatTableDataSource<Persona>(this.dataInicio);


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
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      mes: ['', Validators.required],
      monto: ['', Validators.required],
      //checkout: [''] // Asegúrate de que el campo checkout esté definido
    });

    // Obtén el valor de la cookie y actualiza el formulario
    let tokenurl: string = this.cookie.get('cookie_checkout');
    console.log('URL guardada en la cookie:', tokenurl);
    if (tokenurl) {
      this.formularioPago.patchValue({
        checkout: tokenurl
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
    this.obtenerPersonas();

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.nombreCompleto || ''),
      map(nombre => this._filter(nombre))
    );
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

  private _filter(nombre: string): Persona[] {
    const filterValue = nombre.toLowerCase();
    return this.options.filter(option => option.nombreCompleto.toLowerCase().includes(filterValue));
  }

  displayFn(persona: Persona): string {
    return persona && persona.nombreCompleto ? persona.nombreCompleto : '';
  }

  onOptionSelected(event: any) {
    const persona = event.option.value;
    console.log('Persona seleccionada:', persona);
    this.formularioPago.patchValue({ idPersona: persona.idPersona });
  }

  guardarEditar_Pago(): void {
    const _pago: Pago = {
      idPago: 0,  // Nuevo pago, por lo que ID es 0
      idPersona: this.formularioPago.value.idPersona,
      descripcionPersona: "",
      descripcionDireccion: "",
      descripcionNit: "",
      idTipoPago: this.formularioPago.value.idTipoPago,
      descripcionTipoPago: "",
      fechaInicio: this.formularioPago.value.fechaInicio,
      fechaFin: this.formularioPago.value.fechaFin,
      mes: this.formularioPago.value.mes,
      monto: this.formularioPago.value.monto.toString(),
      checkout: this.formularioPago.value.checkout,
    };
  
    console.log('Datos del pago a enviar:', _pago);
  
    this._pagoServicio.PagosenEfectivo(_pago).subscribe({
      next: (data: any) => {
        console.log('Respuesta del servidor:', data);
  
        if (data.status) {
          Swal.fire('Éxito', 'El pago en Efectivo fue registrado correctamente.', 'success');
        } else {
          Swal.fire('Error', 'No se pudo registrar el pago.', 'error');
          console.error('Detalles del error del servidor:', data);
        }
      },
      error: (e) => {
        Swal.fire('Error', 'Ocurrió un error en la red o en el servidor.', 'error');
        console.error('Error en la solicitud:', e);
      }
    });
  }
  
  
}
