import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Rol } from 'src/app/Interfaces/rol';
import { Persona } from 'src/app/Interfaces/persona';
import { RolService } from 'src/app/Services/rol.service';
import { PersonaService } from 'src/app/Services/persona.service';
import { UtilidadService } from 'src/app/Reutilizable/shared/utilidad.service';
import Swal from 'sweetalert2'; // Importar Swal
@Component({
  selector: 'app-modal-persona',
  templateUrl: './modal-persona.component.html',
  styleUrls: ['./modal-persona.component.css']
})
export class ModalPersonaComponent implements OnInit {
  formularioPersona: FormGroup;
  ocultarPassword: boolean = true;
  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";
  listaRoles: Rol[] = [];
  usuarios: Persona[] = []; // Definición de la propiedad usuarios

  constructor(
    private modalActual: MatDialogRef<ModalPersonaComponent>,
    @Inject(MAT_DIALOG_DATA) public datosPersona: Persona,
    private fb: FormBuilder,
    private _rolServicio: RolService,
    private _personaServicio: PersonaService,
    private _utilidadServicio: UtilidadService
  ) { 
    this.formularioPersona = this.fb.group({
      nombreCompleto: ['', Validators.required],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      dpi: ['', Validators.required],
      nit: ['', Validators.required],
      correo: ['', Validators.required],
      idRol: [null, Validators.required],
      esActivo: ['1', Validators.required],
    });

    if (this.datosPersona != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
    }

    // Obtener la lista de roles
    this._rolServicio.lista().subscribe({
      next: (data) => {
        if (data.status) this.listaRoles = data.value;
      },
      error: (e) => {
        console.error('Error al obtener la lista de roles:', e);
      }
    });

    // Obtener la lista de usuarios
    this._personaServicio.lista().subscribe({
      next: (data) => {
        if (data.status) this.usuarios = data.value;
      },
      error: (e) => {
        console.error('Error al obtener la lista de usuarios:', e);
      }
    });
  }

  ngOnInit(): void {
    if (this.datosPersona != null) {
      const fechaNacimiento = new Date(this.datosPersona.fechaNacimiento);

      this.formularioPersona.patchValue({
        nombreCompleto: this.datosPersona.nombreCompleto,
        telefono: this.datosPersona.telefono,
        direccion: this.datosPersona.direccion,
        fechaNacimiento: fechaNacimiento.toISOString().substring(0, 10),
        dpi: this.datosPersona.dpi,
        nit: this.datosPersona.nit,
        correo: this.datosPersona.correo,
        idRol: this.datosPersona.idRol,
        esActivo: this.datosPersona.esActivo.toString()
      });
    }
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const controlName = (input.name || input.id).toLowerCase(); // Identificar el nombre o ID del control
  
    if (controlName === 'nit') {
      // Permitir letras y números para el campo NIT
      input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
    } else if (controlName === 'telefono' || controlName === 'dpi') {
      // Permitir solo números para los campos Teléfono y DPI
      input.value = input.value.replace(/[^0-9]/g, '');
    }
  
    // Actualizar el valor en el formulario, considerando que el campo NIT, Teléfono o DPI puede estar en el formulario
    this.formularioPersona.get(controlName)?.setValue(input.value, { emitEvent: false });
  }


  guardarEditar_Persona() {
    console.log("Formulario enviado. Estado de validez:", this.formularioPersona.valid);

    if (!this.formularioPersona.valid) {
        this._utilidadServicio.mostrarAlerta("Debe completar todos los campos obligatorios.", "Error");
        return;
    }

    if (!this.formularioPersona.value.idRol) {
        this._utilidadServicio.mostrarAlerta("Debe seleccionar un rol.", "Error");
        return;
    }

    const _persona: Persona = {
        idPersona: this.datosPersona == null ? 0 : this.datosPersona.idPersona,
        nombreCompleto: this.formularioPersona.value.nombreCompleto,
        telefono: this.formularioPersona.value.telefono,
        direccion: this.formularioPersona.value.direccion,
        fechaNacimiento: this.formularioPersona.value.fechaNacimiento,
        dpi: this.formularioPersona.value.dpi,
        nit: this.formularioPersona.value.nit,
        correo: this.formularioPersona.value.correo,
        idRol: this.formularioPersona.value.idRol,
        rolDescripcion: "",
        esActivo: parseInt(this.formularioPersona.value.esActivo),
    };

    // Verificar si el correo ya existe antes de intentar guardar
    const usuarioExistente = this.usuarios.find(usuario => usuario.correo === _persona.correo && usuario.idPersona !== _persona.idPersona);
    
    if (usuarioExistente) {
        this._utilidadServicio.mostrarAlerta("Usuario ya registrado. Verifique los datos.", "Error");
        return;
    }

    if (this.datosPersona == null) {
        // Guardar nueva persona
        this._personaServicio.guardar(_persona).subscribe({
            next: (data) => {
                console.log("Respuesta del servidor al guardar:", data);
                if (data.status) {
                    this._utilidadServicio.mostrarAlerta("El usuario fue registrado", "Éxito");
                    this.modalActual.close("true");
                } else {
                    this._utilidadServicio.mostrarAlerta("No se pudo registrar el usuario. Verifique los datos.", "Error");
                }
            },
            error: (e) => {
                console.error("Error al guardar la persona:", e);
            }
        });
    } else {
        // Editar persona existente
        this._personaServicio.editar(_persona).subscribe({
            next: (data) => {
                console.log("Respuesta del servidor al editar:", data);
                this._utilidadServicio.mostrarAlerta("El usuario fue editado", "Éxito");
                this.modalActual.close("true");
            },
            error: (e) => {
                console.error("Error al editar la persona:", e);
            }
        });
    }
}

  cerrarModal() {
    this.modalActual.close();
  }
}
