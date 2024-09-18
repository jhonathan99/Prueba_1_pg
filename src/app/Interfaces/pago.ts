export interface Pago {
    idPago:number,
    idPersona:number,
    descripcionPersona: string,
    descripcionDireccion: string,
    descripcionNit: string,
    idTipoPago:number,
    descripcionTipoPago: string,
    fechaInicio: Date,
    fechaFin: Date,
    mes: string,
    monto: string,
    checkout: string,  
}
