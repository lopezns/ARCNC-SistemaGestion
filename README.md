#  Sistema de Gestión - Simulador CNC con Realidad Aumentada

Este proyecto implementa un **sistema de gestión académico** conectado a un **simulador de torno CNC en Unity** con integración de **realidad aumentada mediante Vuforia**. La arquitectura combina un **frontend en React**, un **backend en .NET Core** y una **base de datos en SQL Server**, lo que permite administrar usuarios, prácticas, materiales, configuraciones de máquina y evaluar el rendimiento de los estudiantes en entornos virtuales.

---

## Tecnologías Utilizadas

- **Frontend**: React  
- **Backend**: .NET Core  
- **Base de Datos**: Microsoft SQL Server  
- **Simulador 3D**: Unity  
- **Realidad Aumentada**: Vuforia SDK  

---

## Estructura del Proyecto

- **Frontend (React)** → Manejo de interfaces gráficas para usuarios, estudiantes y administradores.  
- **Backend (.NET Core)** → Lógica de negocio, validaciones, control de seguridad y conexión con la base de datos.  
- **Base de Datos (SQL Server)** → Modelo relacional que gestiona usuarios, prácticas, errores, materiales, configuraciones de máquina y resultados de simulaciones.  
- **Simulador (Unity + Vuforia)** → Entorno interactivo que permite a los estudiantes realizar prácticas en CNC con soporte de realidad aumentada.  

---

## Modelo de Base de Datos

El modelo relacional está diseñado para soportar la gestión de prácticas y simulaciones, con entidades como:

- **Users / User Types / Permissions** → Control de roles y accesos.  
- **Workpieces / Materials / Difficulty Levels** → Gestión de piezas, materiales y niveles de práctica.  
- **Practices / Matches / GCodes / Machine Settings** → Registro de simulaciones con configuraciones técnicas, códigos de control y resultados.  
- **Errors & Error Types** → Seguimiento de errores cometidos por los usuarios durante la simulación.  

Esto asegura un sistema robusto para **almacenar, evaluar y retroalimentar el desempeño** de los estudiantes en el simulador CNC.  

---

## Instalación y Configuración

1. Clonar el repositorio:
   ```bash
 git clone https://github.com/lopezns/ARCNC-SistemaGestion.git

 ## Autores

Nicolás López Sánchez y Lina Mariana Pinzón Pinzón

