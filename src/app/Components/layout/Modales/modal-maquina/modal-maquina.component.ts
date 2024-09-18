import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Maquina } from 'src/app/Interfaces/maquina';
import { MaquinaService } from 'src/app/Services/maquina.service';
import { UtilidadService } from 'src/app/Reutilizable/shared/utilidad.service';
import { PersonaService } from 'src/app/Services/persona.service';
import { Persona } from 'src/app/Interfaces/persona';
import { Observable, map, of, startWith } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2'; // Importar Swal
@Component({
  selector: 'app-modal-maquina',
  templateUrl: './modal-maquina.component.html',
  styleUrls: ['./modal-maquina.component.css']
})
export class ModalMaquinaComponent implements OnInit {

  myControl = new FormControl('');
  options: Persona[] = [];
  filteredOptions: Observable<Persona[]> = of([]);

  dataInicio: Persona[] = [];
  dataListaPersonas = new MatTableDataSource<Persona>(this.dataInicio);

  formularioMaquina: FormGroup;

  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";

  constructor(
    private modalActual: MatDialogRef<ModalMaquinaComponent>,
    @Inject(MAT_DIALOG_DATA) public datosMaquina: Maquina,
    private fb: FormBuilder,
    private _maquinaServicio: MaquinaService,
    private _utilidadServicio: UtilidadService,
    private _personaServicio: PersonaService
  ) { 
    this.formularioMaquina = this.fb.group({
      idPersona: ['', Validators.required],
      codMaquina: ['', Validators.required],
      nombre: ['', Validators.required],
      costo: ['', Validators.required],
      fechaAdquisicion: ['', Validators.required],
      fechaSalida: [null],
      esActivo: ['1', Validators.required],
    });

    if (this.datosMaquina != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
    }

  }

  ngOnInit(): void {
    // Si se está editando una máquina (datosMaquina no es null)
    if (this.datosMaquina != null) {
        
        const fechaAdquisicion = new Date(this.datosMaquina.fechaAdquisicion);
      // Llenar el formulario con los valores de la máquina a editar
        this.formularioMaquina.patchValue({
          idPersona: this.datosMaquina.idPersona,
        codMaquina: this.datosMaquina.codMaquina,
        nombre: this.datosMaquina.nombre,
        costo: this.datosMaquina.costo,
        fechaAdquisicion: fechaAdquisicion.toISOString().substring(0, 10),
        fechaSalida: this.datosMaquina.fechaSalida,
        esActivo: this.datosMaquina.esActivo.toString(),
      });
  
      // Deshabilitar todos los campos 
      this.formularioMaquina.get('idPersona')?.disable();
      this.formularioMaquina.get('codMaquina')?.disable();
      this.formularioMaquina.get('nombre')?.disable();
      this.formularioMaquina.get('costo')?.disable();
      this.formularioMaquina.get('fechaAdquisicion')?.disable();
      this.formularioMaquina.get('fechaSalida')?.enable();
      this.formularioMaquina.get('esActivo')?.disable();
  
    } else {
      // Si es una nueva máquina, habilitar todos los campos menos fechaSalida
      this.formularioMaquina.get('fechaSalida')?.disable();
    }
  
    this.obtenerPersonas();

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    // Escuchar cambios en el campo 'fechaFin'
    this.formularioMaquina.get('fechaSalida')?.valueChanges.subscribe(value => {
      if (value) {
        this.formularioMaquina.get('esActivo')?.setValue('0'); // Cambiar a "No activo"
      }
    });
  }
  

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.formularioMaquina.get('codMaquina,costo')?.setValue(input.value, { emitEvent: false });
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
    this.formularioMaquina.patchValue({ idPersona: persona.idPersona });
  }

  guardarEditar_Maquina(): void {
    // Habilitar los campos deshabilitados temporalmente antes de la solicitud
    this.formularioMaquina.get('idPersona')?.enable();
    this.formularioMaquina.get('codMaquina')?.enable();
    this.formularioMaquina.get('nombre')?.enable();
    this.formularioMaquina.get('costo')?.enable();
    this.formularioMaquina.get('fechaAdquisicion')?.enable();
    this.formularioMaquina.get('fechaSalida')?.enable();
    this.formularioMaquina.get('esActivo')?.enable();
  
    const _maquina: Maquina = {
      idMaquina: this.datosMaquina == null ? 0 : this.datosMaquina.idMaquina,
      idPersona: this.formularioMaquina.value.idPersona,
      DescripcionPersona: "",
      codMaquina: this.formularioMaquina.value.codMaquina,
      nombre: this.formularioMaquina.value.nombre,
      costo: this.formularioMaquina.value.costo,
      fechaAdquisicion: this.formularioMaquina.value.fechaAdquisicion,
      fechaSalida: this.formularioMaquina.value.fechaSalida,
      esActivo: parseInt(this.formularioMaquina.value.esActivo),
    };
  
    if (this.datosMaquina == null) {
      this._maquinaServicio.guardar(_maquina).subscribe({
        next: (data: any) => {
          if (data.status) {
            Swal.fire('Éxito', 'La máquina fue registrada correctamente.', 'success');
            this.modalActual.close("true");
          } else {
            Swal.fire('Error', 'Código de máquina ya registrada.', 'error');
          }
        },
        error: (e) => {
          Swal.fire('Error', 'Ocurrió un error al registrar la máquina.', 'error');
          console.error('Error al guardar la máquina:', e);
        }
      });
    } else {
      this._maquinaServicio.editar(_maquina).subscribe({
        next: (data: any) => {
          if (data.status) {
            Swal.fire('Éxito', 'La máquina fue editada correctamente.', 'success');
            this.modalActual.close("true");
          } else {
            Swal.fire('Error', 'No se pudo editar la máquina.', 'error');
          }
        },
        error: (e) => {
          Swal.fire('Error', 'Ocurrió un error al editar la máquina.', 'error');
          console.error('Error al editar la máquina:', e);
        }
      });
    }
  }
  
  

  cerrarModal() {
    this.modalActual.close();
  }
}