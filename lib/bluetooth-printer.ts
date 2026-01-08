/**
 * Bluetooth Thermal Printer Utility
 * Supports ESC/POS commands for 58mm/80mm thermal printers
 */

// ESC/POS Commands
const ESC = 0x1B;
const GS = 0x1D;
const LF = 0x0A;

const COMMANDS = {
    // Initialize printer
    INIT: [ESC, 0x40],
    // Text alignment
    ALIGN_LEFT: [ESC, 0x61, 0x00],
    ALIGN_CENTER: [ESC, 0x61, 0x01],
    ALIGN_RIGHT: [ESC, 0x61, 0x02],
    // Text size
    TEXT_NORMAL: [GS, 0x21, 0x00],
    TEXT_DOUBLE_HEIGHT: [GS, 0x21, 0x01],
    TEXT_DOUBLE_WIDTH: [GS, 0x21, 0x10],
    TEXT_DOUBLE: [GS, 0x21, 0x11],
    // Bold
    BOLD_ON: [ESC, 0x45, 0x01],
    BOLD_OFF: [ESC, 0x45, 0x00],
    // Underline
    UNDERLINE_ON: [ESC, 0x2D, 0x01],
    UNDERLINE_OFF: [ESC, 0x2D, 0x00],
    // Cut paper
    CUT_PARTIAL: [GS, 0x56, 0x01],
    CUT_FULL: [GS, 0x56, 0x00],
    // Feed
    FEED_LINE: [LF],
    FEED_LINES: (n: number) => [ESC, 0x64, n],
};

interface BluetoothPrinterDevice {
    device: BluetoothDevice;
    server: BluetoothRemoteGATTServer | null;
    characteristic: BluetoothRemoteGATTCharacteristic | null;
}

class BluetoothThermalPrinter {
    private printer: BluetoothPrinterDevice | null = null;
    private paperWidth: number = 32; // Characters per line for 58mm

    // Check if Web Bluetooth is supported
    isSupported(): boolean {
        return 'bluetooth' in navigator;
    }

    // Connect to Bluetooth printer
    async connect(): Promise<boolean> {
        if (!this.isSupported()) {
            throw new Error('Web Bluetooth tidak didukung di browser ini');
        }

        try {
            // Request Bluetooth device - common thermal printer services
            const device = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Common thermal printer service
                    { namePrefix: 'PT-' }, // Common thermal printer prefix
                    { namePrefix: 'MTP-' },
                    { namePrefix: 'RPP' },
                    { namePrefix: 'BlueTooth Printer' },
                    { namePrefix: 'Printer' },
                ],
                optionalServices: [
                    '000018f0-0000-1000-8000-00805f9b34fb',
                    '49535343-fe7d-4ae5-8fa9-9fafd205e455',
                    'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
                ]
            });

            if (!device.gatt) {
                throw new Error('GATT tidak tersedia');
            }

            // Connect to GATT server
            const server = await device.gatt.connect();

            // Find the print characteristic
            let characteristic: BluetoothRemoteGATTCharacteristic | null = null;

            const services = await server.getPrimaryServices();
            for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const char of characteristics) {
                    if (char.properties.write || char.properties.writeWithoutResponse) {
                        characteristic = char;
                        break;
                    }
                }
                if (characteristic) break;
            }

            if (!characteristic) {
                throw new Error('Karakteristik print tidak ditemukan');
            }

            this.printer = { device, server, characteristic };
            return true;
        } catch (error: any) {
            if (error.name === 'NotFoundError') {
                throw new Error('Tidak ada printer yang dipilih');
            }
            throw error;
        }
    }

    // Disconnect from printer
    disconnect(): void {
        if (this.printer?.server?.connected) {
            this.printer.server.disconnect();
        }
        this.printer = null;
    }

    // Check if connected
    isConnected(): boolean {
        return this.printer?.server?.connected ?? false;
    }

    // Get connected device name
    getDeviceName(): string | null {
        return this.printer?.device.name ?? null;
    }

    // Write raw bytes to printer
    private async writeRaw(data: number[]): Promise<void> {
        if (!this.printer?.characteristic) {
            throw new Error('Printer tidak terhubung');
        }

        const bytes = new Uint8Array(data);

        // Split into chunks (Bluetooth has max packet size)
        const chunkSize = 100;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.slice(i, i + chunkSize);
            await this.printer.characteristic.writeValueWithoutResponse(chunk);
            // Small delay between chunks
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    // Convert text to bytes
    private textToBytes(text: string): number[] {
        const encoder = new TextEncoder();
        return Array.from(encoder.encode(text));
    }

    // Initialize printer
    async init(): Promise<void> {
        await this.writeRaw(COMMANDS.INIT);
    }

    // Print text
    async printText(text: string): Promise<void> {
        await this.writeRaw(this.textToBytes(text));
    }

    // Print line with newline
    async printLine(text: string = ''): Promise<void> {
        await this.printText(text);
        await this.writeRaw(COMMANDS.FEED_LINE);
    }

    // Print centered text
    async printCentered(text: string): Promise<void> {
        await this.writeRaw(COMMANDS.ALIGN_CENTER);
        await this.printLine(text);
        await this.writeRaw(COMMANDS.ALIGN_LEFT);
    }

    // Print bold text
    async printBold(text: string): Promise<void> {
        await this.writeRaw(COMMANDS.BOLD_ON);
        await this.printText(text);
        await this.writeRaw(COMMANDS.BOLD_OFF);
    }

    // Print double size text
    async printLarge(text: string): Promise<void> {
        await this.writeRaw(COMMANDS.TEXT_DOUBLE);
        await this.printText(text);
        await this.writeRaw(COMMANDS.TEXT_NORMAL);
    }

    // Print separator line
    async printSeparator(char: string = '-'): Promise<void> {
        await this.printLine(char.repeat(this.paperWidth));
    }

    // Print two columns (left and right aligned)
    async printTwoColumns(left: string, right: string): Promise<void> {
        const spaces = this.paperWidth - left.length - right.length;
        const line = left + ' '.repeat(Math.max(1, spaces)) + right;
        await this.printLine(line.substring(0, this.paperWidth));
    }

    // Feed paper
    async feed(lines: number = 3): Promise<void> {
        await this.writeRaw(COMMANDS.FEED_LINES(lines));
    }

    // Cut paper (if supported)
    async cut(): Promise<void> {
        await this.feed(3);
        await this.writeRaw(COMMANDS.CUT_PARTIAL);
    }

    // Set paper width (32 for 58mm, 48 for 80mm)
    setPaperWidth(width: 58 | 80): void {
        this.paperWidth = width === 58 ? 32 : 48;
    }

    // Print receipt from mutasi data
    async printMutasiReceipt(data: {
        title: string;
        dateRange?: string;
        items: Array<{
            type: string;
            amount: number;
            date: string;
            description?: string;
        }>;
        summary: {
            totalIn: number;
            totalOut: number;
            count: number;
        };
    }): Promise<void> {
        const formatCurrency = (amount: number) => {
            return 'Rp ' + amount.toLocaleString('id-ID');
        };

        await this.init();

        // Header
        await this.writeRaw(COMMANDS.ALIGN_CENTER);
        await this.writeRaw(COMMANDS.TEXT_DOUBLE);
        await this.printLine('PICISPAY');
        await this.writeRaw(COMMANDS.TEXT_NORMAL);
        await this.printLine('Laporan Mutasi Saldo');
        if (data.dateRange) {
            await this.printLine(data.dateRange);
        }
        await this.writeRaw(COMMANDS.ALIGN_LEFT);
        await this.printSeparator('=');

        // Items
        for (const item of data.items) {
            const typeLabel = item.type === 'topup' ? 'Isi Saldo' :
                item.type === 'refund' ? 'Refund' : 'Pembelian';
            const sign = (item.type === 'topup' || item.type === 'refund') ? '+' : '-';

            await this.printTwoColumns(typeLabel, sign + formatCurrency(item.amount));
            await this.printLine('  ' + item.date);
            if (item.description) {
                await this.printLine('  ' + item.description.substring(0, 30));
            }
            await this.printSeparator('-');
        }

        // Summary
        await this.printSeparator('=');
        await this.writeRaw(COMMANDS.BOLD_ON);
        await this.printTwoColumns('Total Masuk', '+' + formatCurrency(data.summary.totalIn));
        await this.printTwoColumns('Total Keluar', '-' + formatCurrency(data.summary.totalOut));
        await this.printTwoColumns('Jumlah Trx', data.summary.count.toString());
        await this.writeRaw(COMMANDS.BOLD_OFF);

        // Footer
        await this.printSeparator('=');
        await this.writeRaw(COMMANDS.ALIGN_CENTER);
        await this.printLine('Dicetak: ' + new Date().toLocaleString('id-ID'));
        await this.printLine('Terima Kasih');
        await this.writeRaw(COMMANDS.ALIGN_LEFT);

        // Feed and cut
        await this.cut();
    }
}

// Singleton instance
export const bluetoothPrinter = new BluetoothThermalPrinter();
export type { BluetoothPrinterDevice };
