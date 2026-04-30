const axios = require('axios');

// Simula la estructura de datos que Meta envía cuando un cliente escribe un mensaje de texto
const simularMensajeTexto = async (texto) => {
    const payload = {
        object: "whatsapp_business_account",
        entry: [{
            changes: [{
                value: {
                    messages: [{
                        from: "573001234567", // Número falso de cliente
                        id: "wamid.HBgLNTczMT...", // ID falso de mensaje
                        type: "text",
                        text: {
                            body: texto
                        }
                    }]
                }
            }]
        }]
    };

    try {
        await axios.post('http://localhost:3000/webhook', payload);
        console.log(`✅ Mensaje "${texto}" enviado al bot exitosamente.`);
    } catch (error) {
        console.error("❌ Error conectando con el servidor local. ¿Está encendido?", error.message);
    }
};

// Simula cuando el cliente hace clic en un Botón Interactivo
const simularClickBoton = async (buttonId) => {
    const payload = {
        object: "whatsapp_business_account",
        entry: [{
            changes: [{
                value: {
                    messages: [{
                        from: "573001234567",
                        id: "wamid.HBgLNTczMT...",
                        type: "interactive",
                        interactive: {
                            type: "button_reply",
                            button_reply: {
                                id: buttonId
                            }
                        }
                    }]
                }
            }]
        }]
    };

    try {
        await axios.post('http://localhost:3000/webhook', payload);
        console.log(`✅ Clic en el botón [${buttonId}] enviado al bot exitosamente.`);
    } catch (error) {
        console.error("❌ Error conectando con el servidor local.", error.message);
    }
};

// Ejecutar prueba básica
console.log("🚀 Iniciando prueba local del Bot...");
// Simulamos que el cliente dice "Hola"
simularMensajeTexto("Hola bot");

// Descomenta la siguiente línea para simular que el cliente hizo clic en "Hacer un pedido"
// setTimeout(() => simularClickBoton("btn_pedir"), 2000);
