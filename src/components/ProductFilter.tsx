'use client';

import { Check } from 'lucide-react';

interface ProductFilterProps {
    products: { id: string; name: string }[];
    selectedProducts: string[]; // Now holds product IDs
    onChange: (selected: string[]) => void;
}

export default function ProductFilter({ products, selectedProducts, onChange }: ProductFilterProps) {

    const toggleProduct = (product: string) => {
        if (selectedProducts.includes(product)) {
            onChange(selectedProducts.filter(p => p !== product));
        } else {
            onChange([...selectedProducts, product]);
        }
    };

    const toggleAll = () => {
        if (selectedProducts.length === products.length) {
            onChange([]); 
        } else {
            onChange(products.map(p => p.id));
        }
    };

    // Helper: empty selected means "show none" or "show all"?
    // Usually in filters, if I uncheck everything, I see nothing.
    // But strictly, let's follow: "When unchecked: Exclude product".
    // So we will maintain a list of *selected* products.

    return (
        <div className="flex flex-wrap gap-2 items-center mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">
                Products:
            </span>

            {/* Select All / None */}
            <button
                onClick={toggleAll}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
                {selectedProducts.length === products.length ? 'Unselect All' : 'Select All'}
            </button>

            {products.map((product) => {
                const isSelected = selectedProducts.includes(product.id);
                return (
                    <button
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
              ${isSelected
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                            }
            `}
                    >
                        {isSelected && <Check className="w-3 h-3" />}
                        {product.name}
                    </button>
                );
            })}
        </div>
    );
}
