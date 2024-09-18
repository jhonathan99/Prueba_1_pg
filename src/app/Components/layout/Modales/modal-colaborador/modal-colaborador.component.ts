import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, map, of, startWith } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { Colaborador } from 'src/app/Interfaces/colaborador';
import { ColaboradorService } from 'src/app/Services/colaborador.service';
import { UtilidadService } from 'src/app/Reutilizable/shared/utilidad.service';
import { PersonaService } from 'src/app/Services/persona.service';
import { Persona } from 'src/app/Interfaces/persona';

import Swal from 'sweetalert2'; // Importar Swal

@Component({
  selector: 'app-modal-colaborador',
  templateUrl: './modal-colaborador.component.html',
  styleUrls: ['./modal-colaborador.component.css']
})
export class ModalColaboradorComponent implements OnInit {

  myControl = new FormControl('');
  options: Persona[] = [];
  filteredOptions: Observable<Persona[]> = of([]);

  //columnasTabla: string[] = ['nombreCompleto', 'salario', 'fechaInicio', 'fechaFin', 'estado', 'acciones'];
  dataInicio: Persona[] = [];
  dataListaPersonas = new MatTableDataSource<Persona>(this.dataInicio);

  formularioColaborador: FormGroup;
  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";

  constructor(
    private modalActual: MatDialogRef<ModalColaboradorComponent>,
    @Inject(MAT_DIALOG_DATA) public datosColaborador: Colaborador,
    private fb: FormBuilder,
    private _colaboradorServicio: ColaboradorService,
    private _utilidadServicio: UtilidadService,
    private _personaServicio: PersonaService 
  ) {
    this.formularioColaborador = this.fb.group({
      idPersona: ['', Validators.required],
      salario: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: [null],
      esActivo: ['1', Validators.required],
    });

    if (this.datosColaborador != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
    }
  }

  ngOnInit(): void {
    if (this.datosColaborador != null) {
      
      const fechaInicio = new Date(this.datosColaborador.fechaInicio);

      this.formularioColaborador.patchValue({
        idPersona: this.datosColaborador.idPersona,
        salario: this.datosColaborador.salario,
        fechaInicio: fechaInicio.toISOString().substring(0, 10),
        fechaFin: this.datosColaborador.fechaFin,
        esActivo: this.datosColaborador.esActivo.toString()
      });

      this.formularioColaborador.get('idPersona')?.disable();
      this.formularioColaborador.get('salario')?.enable();
      this.formularioColaborador.get('fechaInicio')?.disable();
      this.formularioColaborador.get('fechaFin')?.enable();
      this.formularioColaborador.get('esActivo')?.disable();

    }else {
      // Si es una nueva máquina, habilitar todos los campos menos fechaSalida
      this.formularioColaborador.get('fechaFin')?.disable();
    }

    this.obtenerPersonas();

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    // Escuchar cambios en el campo 'esActivo'
    this.formularioColaborador.get('esActivo')?.valueChanges.subscribe((valor) => {
      if (valor === '1') { // Si el estado es 'Activo'
        this.formularioColaborador.patchValue({ fechaFin: null }); // Limpiar la fecha de baja
      }
    });

    // Escuchar cambios en el campo 'fechaFin'
    this.formularioColaborador.get('fechaFin')?.valueChanges.subscribe(value => {
      if (value) {
        this.formularioColaborador.get('esActivo')?.setValue('0'); // Cambiar a "No activo"
      }
    });
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.formularioColaborador.get('salario')?.setValue(input.value, { emitEvent: false });
  }

  obtenerPersonas() {
    this._personaServicio.lista().subscribe({
      next: (data) => {
        if (data.status) {
          const rolesPermitidos = ['Empleado', 'Administrador'];
          const colaboradores = data.value.filter((persona: Persona) => rolesPermitidos.includes(persona.rolDescripcion));
          
          this.dataListaPersonas.data = colaboradores;
          this.options = colaboradores;

          if (colaboradores.length === 0) {
            this._utilidadServicio.mostrarAlerta("No se encontraron colaboradores", "Revisar");
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

  private _filter(value: any): Persona[] {
    let filterValue = '';
  
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (typeof value === 'object' && value !== null) {
      filterValue = value.nombreCompleto.toLowerCase();
    }
  
    return this.options.filter(option => option.nombreCompleto.toLowerCase().includes(filterValue));
  }

  displayFn(persona: Persona): string {
    return persona && persona.nombreCompleto ? persona.nombreCompleto : '';
  }

  onOptionSelected(event: any) {
    const persona = event.option.value;
    this.formularioColaborador.patchValue({ idPersona: persona.idPersona });
  }

  guardarEditar_Colaborador(): void {

    this.formularioColaborador.get('idPersona')?.enable();
    this.formularioColaborador.get('salario')?.enable();
    this.formularioColaborador.get('fechaInicio')?.enable();
    this.formularioColaborador.get('fechaFin')?.enable();
    this.formularioColaborador.get('esActivo')?.enable();
  
    const _colaborador: Colaborador = {
      idColaborador: this.datosColaborador == null ? 0 : this.datosColaborador.idColaborador,
      idPersona: this.formularioColaborador.value.idPersona,
      DescripcionPersona: "",
      DescripcionFechaNacimiento: new Date(),
      salario: this.formularioColaborador.value.salario,
      fechaInicio: this.formularioColaborador.value.fechaInicio,
      fechaFin: this.formularioColaborador.value.fechaFin,
      esActivo: parseInt(this.formularioColaborador.value.esActivo),
    };
  
    if (this.datosColaborador == null) {
      this._colaboradorServicio.guardar(_colaborador).subscribe({
        next: (data: any) => {
          if (data.status) {
            Swal.fire('Éxito', 'El colaborador fue registrado correctamente.', 'success');
            this.modalActual.close("true");
          } else {
            Swal.fire('Error', 'No se pudo registrar el colaborador.', 'error');
          }
        },
        error: (e) => {
          Swal.fire('Error', 'Ocurrió un error al registrar el colaborador.', 'error');
          console.error('Error al guardar el colaborador:', e);
        }
      });
    } else {
      console.log('Editando colaborador existente...');
  
      this._colaboradorServicio.editar(_colaborador).subscribe({
        next: (data: any) => {
          if (data.status) {
            Swal.fire('Éxito', 'El colaborador fue editado correctamente.', 'success');
            this.modalActual.close("true");
          } else {
            Swal.fire('Error', 'No se pudo editar el colaborador.', 'error');
          }
        },
        error: (e) => {
          Swal.fire('Error', 'Ocurrió un error al editar el colaborador.', 'error');
          console.error('Error al editar el colaborador:', e);
        }
      });
    }
  }
  
  cerrarModal() {
    this.modalActual.close();
  }
}
