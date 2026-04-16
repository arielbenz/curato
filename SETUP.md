# Setup de Base de Datos

## Nuevas Features Implementadas

Se han agregado tres nuevas funcionalidades al proyecto:

1. **Reacciones Múltiples** 🔥🤯😂💩
   - Los usuarios pueden reaccionar con emojis a las recomendaciones
   - Cada usuario puede tener solo una reacción activa por recomendación

2. **Comentarios** 💬
   - Los usuarios pueden comentar en las recomendaciones
   - Máximo 500 caracteres por comentario

3. **"Ya lo vi"** 👁️
   - Marca las recomendaciones que ya consumiste
   - Muestra contador de cuántas personas lo vieron

## Configuración de la Base de Datos

Para crear las nuevas tablas en tu base de datos:

### Opción 1: Via API (Recomendado)

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Visita en tu navegador:
   ```
   http://localhost:3000/api/setup
   ```

3. Deberías ver un mensaje de éxito

### Opción 2: Via Script

Si prefieres ejecutar el script directamente:

```bash
node --experimental-strip-types scripts/setup-db.ts
```

## Tablas Creadas

- `recommendations` - Tabla principal (ya existente)
- `reactions` - Almacena las reacciones de usuarios
- `comments` - Almacena los comentarios
- `watched` - Almacena qué usuarios vieron cada recomendación

Todas las nuevas tablas tienen `ON DELETE CASCADE` para mantener integridad referencial.
