import { Component, OnInit, Inject } from '@angular/core';  
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { Tipopago } from 'src/app/Interfaces/tipopago';
import { Pago } from 'src/app/Interfaces/pago';
import { TipoPagoService } from 'src/app/Services/tipopago.service';
import { PagoService } from 'src/app/Services/pago.service';
import { UtilidadService } from 'src/app/Reutilizable/shared/utilidad.service';
import { PersonaService } from 'src/app/Services/persona.service';
import { Persona } from 'src/app/Interfaces/persona';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-modal-pagos',
  templateUrl: './modal-pagos.component.html',
  styleUrls: ['./modal-pagos.component.css']
})
export class ModalPagosComponent implements OnInit {

  myControl = new FormControl<Persona | null>(null);
  options: Persona[] = [];
  filteredOptions: Observable<Persona[]> = of([]);

  dataInicio: Persona[] = [];
  dataListaPersonas = new MatTableDataSource<Persona>(this.dataInicio);

  formularioPago: FormGroup;
  ocultarPassword: boolean = true;
  tituloAccion: string = "Editar Pago";
  botonAccion: string = "Actualizar";
  listatipospagos: Tipopago[] = [];

  constructor(
    private modalActual: MatDialogRef<ModalPagosComponent>,
    @Inject(MAT_DIALOG_DATA) public datosPago: Pago,
    private fb: FormBuilder,
    private _tipoPagoServicio: TipoPagoService,
    private _pagoServicio: PagoService,
    private _utilidadServicio: UtilidadService,
    private _personaServicio: PersonaService
  ) { 
    // Inicializa el formulario
    this.formularioPago = this.fb.group({
      idPersona: [this.datosPago?.idPersona ?? '', Validators.required],
      fechaInicio: [this.datosPago?.fechaInicio ?? '', Validators.required],
      fechaFin: [this.datosPago?.fechaFin ?? '', Validators.required],
      mes: [this.datosPago?.mes ?? '', Validators.required],
      monto: [this.datosPago?.monto ?? '', Validators.required],
      checkout: [this.datosPago?.checkout ?? ''],
      descripcionPersona: [this.datosPago?.descripcionPersona ?? ''],
      descripcionDireccion: [this.datosPago?.descripcionDireccion ?? ''],
      descripcionNit: [this.datosPago?.descripcionNit ?? ''],
      idTipoPago: [this.datosPago?.idTipoPago ?? ''],
      idPago: [this.datosPago?.idPago ?? ''],
      descripcionTipoPago: [this.datosPago?.descripcionTipoPago ?? '']
    });
    
    // Carga los tipos de pago
    this._tipoPagoServicio.lista().subscribe({
      next: (data) => {
        if (data.status) this.listatipospagos = data.value;
      },
      error: (e) => {
        console.error("Error al cargar tipos de pago:", e);
      }
    });

    // Si hay datos de pago, actualiza el título y el botón de acción
    if (this.datosPago) {
      this.tituloAccion = "Editar Pago";
      this.botonAccion = "Actualizar";
    }
  }

  ngOnInit(): void {
    this.obtenerPersonas(); 
  
    if (this.datosPago) {
      console.log('Datos de pago en ngOnInit:', this.datosPago);
  
   
        const fechaFin = new Date(this.datosPago.fechaFin);
        const fechaInicio = new Date(this.datosPago.fechaInicio);

        this.formularioPago.patchValue({
          idPersona: this.datosPago.idPersona,
          fechaInicio: fechaInicio.toISOString().substring(0, 10),
          fechaFin: fechaFin.toISOString().substring(0, 10),
          mes: this.datosPago.mes,
          monto: this.datosPago.monto,
          idPago: this.datosPago.idPago,
          descripcionPersona: this.datosPago.descripcionPersona || '',
          descripcionDireccion: this.datosPago.descripcionDireccion || '',
          descripcionNit: this.datosPago.descripcionNit || '',
          idTipoPago: this.datosPago.idTipoPago || 0,
          descripcionTipoPago: this.datosPago.descripcionTipoPago || ''
        });
  
        const persona = this.options.find(option => option.idPersona === this.datosPago.idPersona);
        if (persona) {
          this.myControl.setValue(persona);
        } else {
          console.warn('No se encontró la persona en las opciones para el idPersona:', this.datosPago.idPersona);
        }
      
    }
  }
  
  obtenerPersonas() {
    this._personaServicio.lista().subscribe({
      next: (data) => {
        if (data.status) {
          const clientes = data.value.filter((persona: Persona) => persona.rolDescripcion === 'Cliente');
          this.dataListaPersonas.data = clientes;
          this.options = clientes;
          console.log('Clientes obtenidos:', clientes);
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron datos", "Revisar");
        }
      },
      error: (e) => {
        console.error('Error al obtener personas:', e);
      }
    });
  }

  onOptionSelected(event: any) {
    const persona = event.option.value;
    this.formularioPago.patchValue({ idPersona: persona.idPersona });
  }

  guardarEditar_Pago() {
    const idPago = this.datosPago ? this.datosPago.idPago ?? 0 : 0; // Usa 0 si idpago es undefined
    const _pago: Pago = {
      idPago,
      idPersona: this.formularioPago.value.idPersona,
      descripcionPersona: this.formularioPago.value.descripcionPersona || "",
      descripcionNit: this.formularioPago.value.descripcionNit || "",
      descripcionDireccion: this.formularioPago.value.descripcionDireccion || "",
      fechaInicio: this.formularioPago.value.fechaInicio,
      fechaFin: this.formularioPago.value.fechaFin,
      mes: this.formularioPago.value.mes,
      monto: this.formularioPago.value.monto,
      checkout: this.formularioPago.value.checkout || "",
      idTipoPago: this.formularioPago.value.idTipoPago,
      descripcionTipoPago: this.formularioPago.value.descripcionTipoPago || ""
    };
  
    this._pagoServicio.editar(_pago).subscribe({
      next: (data) => {
        console.log("Respuesta del servidor al editar:", data);
        this._utilidadServicio.mostrarAlerta("El pago fue editado", "Éxito");
        this.modalActual.close("true");
      },
      error: (e) => {
        console.error("Error al editar el pago:", e);
      }
    });
  }
  
  
  cerrarModal() {
    this.modalActual.close("");
    
  }
}


