// Types for Google Sheets data
export interface OrderRow {
    ref: string;
    date: string;
    client: string;
    num: string;
    wilaya: string;
    qtt: number;
    prixDeVente: number;
    benficeNet: number;
    status: string;
}

export interface ProductData {
    name: string;
    orders: OrderRow[];
}

export interface AdSpendData {
    [productName: string]: number;
}

// Sheet GIDs - we'll fetch these dynamically
const SPREADSHEET_ID = '1o53MO3wXbs5-9RcsjW-VcEcFIXT9sgkQ8D-fIC_FIEU';

// Known sheet names (product sheets)
const PRODUCT_SHEETS = ['Gant', 'Tenu De Travail', 'Gilet de securite', 'Gilet de travail'];

// Parse CSV text into array of rows
function parseCSV(csvText: string): string[][] {
    const lines = csvText.trim().split('\n');
    return lines.map(line => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    });
}

// Parse a row into OrderRow object
function parseOrderRow(row: string[]): OrderRow | null {
    if (row.length < 9) return null;

    const [ref, date, client, num, wilaya, qtt, prixDeVente, benficeNet, status] = row;

    // Skip if no ref (empty row)
    if (!ref || ref === 'Ref') return null;

    return {
        ref,
        date,
        client,
        num,
        wilaya,
        qtt: parseFloat(qtt) || 0,
        prixDeVente: parseFloat(prixDeVente) || 0,
        benficeNet: parseFloat(benficeNet) || 0,
        status: status?.toLowerCase().trim() || '',
    };
}

// Fetch a single sheet's data
async function fetchSheetCSV(sheetName: string): Promise<string> {
    const encodedName = encodeURIComponent(sheetName);
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodedName}`;

    const response = await fetch(url, {
        cache: 'no-store',
        headers: {
            'Accept': 'text/csv',
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch sheet ${sheetName}: ${response.statusText}`);
    }

    return response.text();
}

// Fetch all product data
export async function fetchAllProducts(): Promise<ProductData[]> {
    const products: ProductData[] = [];

    for (const sheetName of PRODUCT_SHEETS) {
        try {
            const csvText = await fetchSheetCSV(sheetName);
            const rows = parseCSV(csvText);

            // Skip header row (index 0)
            const orders: OrderRow[] = [];
            for (let i = 1; i < rows.length; i++) {
                const order = parseOrderRow(rows[i]);
                if (order) {
                    orders.push(order);
                }
            }

            products.push({
                name: sheetName,
                orders,
            });
        } catch (error) {
            console.error(`Error fetching ${sheetName}:`, error);
            // Continue with other sheets even if one fails
        }
    }

    return products;
}

// Fetch ad spend data from DASH sheet
export async function fetchAdSpend(): Promise<AdSpendData> {
    try {
        const csvText = await fetchSheetCSV('DASH');
        const rows = parseCSV(csvText);

        const adSpend: AdSpendData = {};

        // Look for ad spend values - checking if columns K and L exist
        // Column K = Product Name, Column L = Ad Spend
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            // Check columns K (index 10) and L (index 11)
            if (row.length > 11 && row[10] && row[11]) {
                const productName = row[10].trim();
                const spend = parseFloat(row[11]) || 0;
                if (productName) {
                    adSpend[productName] = spend;
                }
            }
        }

        // Default to 0 for products not found
        for (const product of PRODUCT_SHEETS) {
            if (!(product in adSpend)) {
                adSpend[product] = 0;
            }
        }

        return adSpend;
    } catch (error) {
        console.error('Error fetching ad spend:', error);
        // Return zeros for all products
        const adSpend: AdSpendData = {};
        for (const product of PRODUCT_SHEETS) {
            adSpend[product] = 0;
        }
        return adSpend;
    }
}

// Parse date string to Date object (handle various formats)
export function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // Try common formats
    // DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, MM/DD/YYYY
    const formats = [
        // DD/MM/YYYY or DD-MM-YYYY
        /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
        // YYYY-MM-DD
        /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,
    ];

    for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
            if (format === formats[0]) {
                // DD/MM/YYYY
                const [, day, month, year] = match;
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            } else {
                // YYYY-MM-DD
                const [, year, month, day] = match;
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
        }
    }

    // Try native parsing as fallback
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
}

// Filter orders by date range
export function filterOrdersByDate(
    orders: OrderRow[],
    startDate: Date | null,
    endDate: Date | null
): OrderRow[] {
    if (!startDate && !endDate) return orders;

    return orders.filter(order => {
        const orderDate = parseDate(order.date);
        if (!orderDate) return false;

        if (startDate && orderDate < startDate) return false;
        if (endDate && orderDate > endDate) return false;

        return true;
    });
}
