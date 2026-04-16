import { supabase } from './supabase';
import { OrderRow, ProductData, AdSpendRow } from './sheets'; // Import interfaces to keep compatibility

export async function fetchAllProducts(): Promise<ProductData[]> {
    try {
        // Query products and left join with orders so we get products even with 0 orders
        const { data: products, error } = await supabase
            .from('products')
            .select(`
                id,
                name,
                orders (
                    id,
                    ref,
                    date,
                    client,
                    num,
                    wilaya,
                    qtt,
                    prix_de_vente,
                    benefice_net,
                    status
                )
            `);

        if (error) {
            console.error('Error fetching products from Supabase:', error);
            return [];
        }

        if (!products) return [];

        // Format data to match our existing ProductData[] type
        const formattedProducts: ProductData[] = products.map((product) => {
            const mappedOrders: OrderRow[] = (product.orders || []).map((order) => ({
                id: order.id || '',
                productId: product.id,
                ref: order.ref || '',
                date: order.date ? new Date(order.date).toISOString().split('T')[0] : '', // YYYY-MM-DD
                client: order.client || '',
                num: order.num || '',
                wilaya: order.wilaya || '',
                qtt: Number(order.qtt) || 0,
                prixDeVente: Number(order.prix_de_vente) || 0,
                benficeNet: Number(order.benefice_net) || 0,
                status: order.status || '',
            }));

            return {
                id: product.id,
                name: product.name,
                orders: mappedOrders,
            };
        });

        return formattedProducts;

    } catch (error) {
        console.error('Unexpected error fetching products from Supabase:', error);
        return [];
    }
}

export async function fetchAdSpend(): Promise<AdSpendRow[]> {
    try {
        const { data: adSpends, error } = await supabase
            .from('ad_spend')
            .select(`
                id,
                product_id,
                from_date,
                to_date,
                amount_dzd,
                products ( name )
            `);

        if (error) {
            console.error('Error fetching ad spend from Supabase:', error);
            return [];
        }

        if (!adSpends) return [];

        const formattedAdSpend: AdSpendRow[] = adSpends.map((spend) => ({
            id: spend.id,
            productId: spend.product_id,
            product: spend.products?.name || 'Unknown Product',
            from: spend.from_date ? new Date(spend.from_date).toISOString().split('T')[0] : '', // YYYY-MM-DD
            to: spend.to_date ? new Date(spend.to_date).toISOString().split('T')[0] : '', // YYYY-MM-DD
            amountDZD: Number(spend.amount_dzd) || 0,
        }));

        return formattedAdSpend;
    } catch (error) {
        console.error('Unexpected error fetching ad spend from Supabase:', error);
        return [];
    }
}
