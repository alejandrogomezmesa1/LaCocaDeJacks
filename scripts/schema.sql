CREATE DATABASE IF NOT EXISTS lacocadejacks;
USE lacocadejacks;

-- ==========================================
-- Tabla de Configuraciones Globales
-- ==========================================
CREATE TABLE IF NOT EXISTS configs (
    `key` VARCHAR(255) NOT NULL,
    `value` JSON NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`key`)
);

-- ==========================================
-- Tabla de Clientes
-- ==========================================
CREATE TABLE IF NOT EXISTS clientes (
    `cedula` VARCHAR(255) NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `celular` VARCHAR(255) NOT NULL,
    `is_active` TINYINT(1) DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`cedula`)
);

-- ==========================================
-- Tabla de Suscripciones (Pedidos)
-- ==========================================
CREATE TABLE IF NOT EXISTS subscriptions (
    `id` INT NOT NULL AUTO_INCREMENT,
    `cliente_cedula` VARCHAR(255) NOT NULL,
    `plan` ENUM('Semanal', 'Quincenal', 'Mensual') NOT NULL,
    `needs_cocas` TINYINT(1) DEFAULT 0,
    `delivery_type` ENUM('Fija', 'Hibrida') NOT NULL,
    `address_1` VARCHAR(255) NOT NULL,
    `barrio_1` VARCHAR(255) NOT NULL,
    `days_address_1` VARCHAR(255) NOT NULL,
    `address_2` VARCHAR(255) DEFAULT NULL,
    `barrio_2` VARCHAR(255) DEFAULT NULL,
    `days_address_2` VARCHAR(255) DEFAULT NULL,
    `facturacion_electronica` ENUM('Si', 'No') DEFAULT 'No',
    `total_price` DECIMAL(10,2) NOT NULL,
    `status` ENUM('Pendiente', 'Activo', 'Cancelado') DEFAULT 'Pendiente',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`cliente_cedula`) REFERENCES clientes(`cedula`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ==========================================
-- Tabla de Comprobantes de Pago
-- ==========================================
CREATE TABLE IF NOT EXISTS comprobantes (
    `id` INT NOT NULL AUTO_INCREMENT,
    `subscription_id` INT NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `status` ENUM('Pendiente', 'Aprobado', 'Rechazado') DEFAULT 'Pendiente',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`subscription_id`) REFERENCES subscriptions(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ==========================================
-- Datos por Defecto (Opcional)
-- ==========================================
-- Limita los cupos disponibles a 50
INSERT IGNORE INTO configs (`key`, `value`, `createdAt`, `updatedAt`) 
VALUES ('max_cupos', '50', NOW(), NOW());
