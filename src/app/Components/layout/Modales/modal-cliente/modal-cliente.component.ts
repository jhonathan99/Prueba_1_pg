
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, map, of, startWith } from 'rxjs';
import { Membresia } from 'src/app/Interfaces/membresia';
import { Cliente } from 'src/app/Interfaces/cliente';
import { MembresiaService } from 'src/app/Services/membresia.service';
import { ClienteService } from 'src/app/Services/cliente.service';
import { UtilidadService } from 'src/app/Reutilizable/shared/utilidad.service';
import { PersonaService } from 'src/app/Services/persona.service';
import { Persona } from 'src/app/Interfaces/persona';
import { MatTableDataSource } from '@angular/material/table';

import Swal from 'sweetalert2'; // Importar Swal

@Component({
  selector: 'app-modal-cliente',
  templateUrl: './modal-cliente.component.html',
  styleUrls: ['./modal-cliente.component.css']
})
export class ModalClienteComponent implements OnInit {

  myControl = new FormControl<Persona | null>(null); 
  options: Persona[] = [];
  filteredOptions: Observable<Persona[]> = of([]);

  columnasTabla: string[] = ['nombreCompleto', 'edad', 'altura', 'peso', 'masamuscular', 'fecha', 'rolDescripcion', 'acciones'];
  dataInicio: Persona[] = [];
  dataListaPersonas = new MatTableDataSource<Persona>(this.dataInicio);

  formularioCliente: FormGroup;
  ocultarPassword: boolean = true;
  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";
  listaMembresias: Membresia[] = [];

  constructor(
    private modalActual: MatDialogRef<ModalClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public datosCliente: Cliente,
    private fb: FormBuilder,
    private _membresiaServicio: MembresiaService,
    private _clienteServicio: ClienteService,
    private _utilidadServicio: UtilidadService,
    private _personaServicio: PersonaService
  ) {
    
    this.formularioCliente = this.fb.group({
      idPersona: ['', Validators.required],
      idMembresia: ['', Validators.required],
      Edad: ['', Validators.required],
      Altura: ['', Validators.required],
      Peso: ['', Validators.required],
      MasaMuscular: ['', Validators.required],

    });

    if (this.datosCliente != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
    }

    this._membresiaServicio.lista().subscribe({
      next: (data) => {
        if (data.status) this.listaMembresias = data.value;
      },
      error: (e) => {}
    });
  }

  ngOnInit(): void {
    this.obtenerPersonas();

    if (this.datosCliente != null) {
      setTimeout(() => {
        this.formularioCliente.patchValue({
          idPersona: this.datosCliente.idPersona,
          idMembresia: this.datosCliente.idMembresia,
          Edad: this.datosCliente.Edad,
          Altura: this.datosCliente.Altura,
          Peso: this.datosCliente.Peso,
          MasaMuscular: this.datosCliente.MasaMuscular,
        });

        const persona = this.options.find(option => option.idPersona === this.datosCliente.idPersona);
        if (persona) {
          this.myControl.setValue(persona);
        }
      }, 500);
    }

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.nombreCompleto || ''),
      map(nombre => this._filter(nombre))
    );
  }

    
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    // Actualiza el valor del formulario
    this.formularioCliente.get('edad')?.setValue(input.value, { emitEvent: false });
  }

  obtenerPersonas() {
    this._personaServicio.lista().subscribe({
      next: (data) => {
        if (data.status) {
          const clientes = data.value.filter((persona: Persona) => persona.rolDescripcion === 'Cliente');
          this.dataListaPersonas.data = clientes;
          this.options = clientes;

          if (clientes.length === 0) {
            this._utilidadServicio.mostrarAlerta("No se encontraron clientes", "Revisar");
          }
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
    this.formularioCliente.patchValue({ idPersona: persona.idPersona });
  }

  guardarEditar_Cliente(): void {
    const _cliente: Cliente = {
      idCliente: this.datosCliente == null ? 0 : this.datosCliente.idCliente,
      idPersona: this.formularioCliente.value.idPersona,
      DescripcionPersona: "",
      DescripcionFechaNacimiento: new Date(),
      DescripcionDpi: "",
      DescripcionNit: "",
      Edad: this.formularioCliente.value.Edad,
      Altura: this.formularioCliente.value.Altura,
      Peso: this.formularioCliente.value.Peso,
      MasaMuscular: this.formularioCliente.value.MasaMuscular,
      idMembresia: this.formularioCliente.value.idMembresia,
      DescripcionMembresia: "",
    };
  
    if (this.datosCliente == null) {
      this._clienteServicio.guardar(_cliente).subscribe({
        next: (data: any) => {
          if (data.status) {
            Swal.fire('Éxito', 'El cliente fue registrado correctamente.', 'success');
            this.modalActual.close("true");
          } else {
            Swal.fire('Error', 'No se pudo registrar el cliente.', 'error');
          }
        },
        error: (e) => {
          Swal.fire('Error', 'Ocurrió un error al registrar el cliente.', 'error');
          console.error('Error en la solicitud:', e);
        }
      });
    } else {
      this._clienteServicio.editar(_cliente).subscribe({
        next: (data: any) => {
          Swal.fire('Éxito', 'El cliente fue editado correctamente.', 'success');
          this.modalActual.close("true");
        },
        error: (e) => {
          Swal.fire('Error', 'Ocurrió un error al editar el cliente.', 'error');
          console.error('Error en la solicitud:', e);
        }
      });
    }
  }
  

  cerrarModal() {
    this.modalActual.close();
  }
}
