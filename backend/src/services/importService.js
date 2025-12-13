/**
 * Service to handle CSV Import Strategies (Adapter Pattern)
 * This allows the system to accept various CSV formats (Senior, TOTVS) 
 * and convert them into a single standard format for the database.
 */

import fs from 'fs';
import csv from 'csv-parser';

class ImportStrategy {
    normalize(data) {
        throw new Error('Method not implemented');
    }
}

/**
 * Strategy for Senior Sistemas (HCM / Senior X)
 * Typical fields: nomFun, numCpf, emaPar, sitAfa
 */
class SeniorStrategy extends ImportStrategy {
    normalize(data) {
        return {
            name: data.nomFun || data.NOME,
            email: data.emaPar || data.EMAIL,
            cpf: this.cleanDocument(data.numCpf || data.CPF),
            pis: this.cleanDocument(data.pisPasep || data.PIS),
            employeeId: data.numCad || data.MATRICULA,
            status: this.mapStatus(data.sitAfa), // 7=Active
            role: data.titCar || data.CARGO
        };
    }

    cleanDocument(doc) {
        return doc ? doc.replace(/\D/g, '') : '';
    }

    mapStatus(code) {
        // Example mapping based on Senior codes
        const seniorCodes = {
            '1': 'Ativo',
            '7': 'Ativo',
            '3': 'Férias',
            '4': 'Inativo' // Example
        };
        return seniorCodes[code] || 'Ativo';
    }
}

/**
 * Strategy for TOTVS (RM / Protheus)
 * Typical fields: NOME_FUNCIONARIO, CPF, EMAIL, SITUACAO
 */
class TotvsStrategy extends ImportStrategy {
    normalize(data) {
        return {
            name: data.NOME_FUNCIONARIO || data.NOME,
            email: data.EMAIL || data.EMAIL_CORP,
            cpf: this.cleanDocument(data.CPF),
            pis: this.cleanDocument(data.PIS_PASEP),
            employeeId: data.CHAPA || data.MATRICULA,
            status: this.mapStatus(data.COD_SITUACAO),
            role: data.FUNCAO
        };
    }

    cleanDocument(doc) {
        return doc ? doc.replace(/\D/g, '') : '';
    }

    mapStatus(code) {
        const totvsCodes = {
            'A': 'Ativo',
            'F': 'Férias',
            'D': 'Inativo'
        };
        return totvsCodes[code] || 'Ativo';
    }
}

/**
 * The Factory to choose the right strategy
 */
class ImportFactory {
    static getStrategy(type) {
        switch (type.toLowerCase()) {
            case 'senior':
                return new SeniorStrategy();
            case 'totvs':
                return new TotvsStrategy();
            default:
                throw new Error('Formato de importação desconhecido');
        }
    }
}

/**
 * Main Service Function to Process the File
 */
const processImportFile = async (filePath, type) => {
    const results = [];
    const strategy = ImportFactory.getStrategy(type);

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv({ separator: ';' })) // Most exports use semi-colon
            .on('data', (data) => {
                try {
                    const normalized = strategy.normalize(data);
                    // Basic validation
                    if (normalized.name && normalized.email) {
                        results.push(normalized);
                    }
                } catch (e) {
                    console.error('Error normalizing row:', e);
                }
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};

export { processImportFile };
