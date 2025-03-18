const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// 🔹 Conectar a MongoDB Local
mongoose.connect("mongodb://localhost:27017/simulador_medico", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const simulacionSchema = new mongoose.Schema({
    codigo_estudiante: { type: String, required: true }, // 🔹 Identificación del estudiante
    nivel_complejidad: { type: Number, required: true }, // 🔹 Nivel de la simulación
    fecha: { type: Date, default: Date.now }, // 🔹 Se guarda automáticamente si no se envía

    // 🔥 Permitir múltiples imágenes por simulación (como un array de URLs)
    imagenes: { type: [String], default: undefined }, 

    // 🔥 Datos opcionales, solo se almacenan si se envían
    metrica_interfaz_usuario: { type: Object, default: undefined },
    metrica_comandos_voz: { type: Object, default: undefined },
    metrica_imagenes: { type: Object, default: undefined },
    metrica_tiempos: { type: Object, default: undefined },
    metrica_signos_vitales: { type: Array, default: undefined } 
});

const Simulacion = mongoose.model("Simulacion", simulacionSchema, "simulaciones");

module.exports = Simulacion;


// 🔹 Obtener todas las simulaciones
app.get("/simulaciones", async (req, res) => {
    try {
        const data = await Simulacion.find();
        console.log("Datos obtenidos desde MongoDB:", data); // 👈 Agregado para ver qué devuelve
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 🔹 Agregar una nueva simulación
app.post("/simulaciones", async (req, res) => {
    try {
        // 🔥 Filtrar los datos para eliminar campos vacíos antes de guardarlos
        const datosFiltrados = Object.fromEntries(
            Object.entries(req.body).filter(([_, v]) => v !== null && v !== undefined && v !== "")
        );

        // 🔥 Crear nueva simulación con datos limpios
        const nuevaSimulacion = new Simulacion(datosFiltrados);
        await nuevaSimulacion.save();
        res.json({ mensaje: "Simulación guardada con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al guardar en MongoDB: " + error.message });
    }
});


// 🔹 Actualizar una simulación por ID
app.put("/simulaciones/:id", async (req, res) => {
    await Simulacion.findByIdAndUpdate(req.params.id, req.body);
    res.json({ mensaje: "Simulación actualizada" });
});

// 🔹 Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
