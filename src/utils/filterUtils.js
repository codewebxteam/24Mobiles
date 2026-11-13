/**
 * Utility functions for filtering, categorizing, and sorting smartphones.
 * Designed around actual Firestore database fields (274+ products).
 */

export const BUDGET_RANGES = [
    { id: 'under_10k', label: 'Under ₹10,000', shortLabel: 'Under 10K', min: 0, max: 10000, desc: 'Budget & Entry Level' },
    { id: '10k_20k', label: '₹10,000 - ₹20,000', shortLabel: '10K - 20K', min: 10000, max: 20000, desc: 'Best Value' },
    { id: '20k_35k', label: '₹20,000 - ₹35,000', shortLabel: '20K - 35K', min: 20000, max: 35000, desc: 'Mid-Range Champions' },
    { id: '35k_50k', label: '₹35,000 - ₹50,000', shortLabel: '35K - 50K', min: 35000, max: 50000, desc: 'Premium Mid-Range' },
    { id: 'above_50k', label: 'Above ₹50,000', shortLabel: '50K+', min: 50000, max: Infinity, desc: 'Ultra Flagship & Foldables' },
];

export const NETWORK_OPTIONS = [
    { id: '5g', label: '5G Smartphones', shortLabel: '5G', icon: 'Zap' },
    { id: '4g', label: '4G Smartphones', shortLabel: '4G', icon: 'Wifi' },
];

export const FEATURE_OPTIONS = [
    { id: 'best_camera', label: 'Best Camera (108MP / 200MP)', shortLabel: 'Pro Camera', desc: '108MP / 200MP / 4K', icon: 'Camera' },
    { id: 'big_battery', label: 'Monster Battery (6000mAh+)', shortLabel: '6000mAh+ Battery', desc: 'All-Day Endurance', icon: 'BatteryCharging' },
    { id: 'gaming', label: 'Gaming & Performance', shortLabel: 'Gaming Phones', desc: 'High-end Chipset & 12GB+ RAM', icon: 'Gamepad2' },
    { id: 'amoled', label: 'AMOLED & Curved Display', shortLabel: 'AMOLED Display', desc: 'Vibrant Visuals', icon: 'Smartphone' },
];

export const RAM_OPTIONS = [
    { id: '4gb', label: '4 GB RAM' },
    { id: '6gb', label: '6 GB RAM' },
    { id: '8gb', label: '8 GB RAM' },
    { id: '12gb_plus', label: '12 GB & Above' },
];

export const DEAL_OPTIONS = [
    { id: 'any_deal', label: 'On Sale / Any Discount' },
    { id: 'deal_20', label: '20% Off or More' },
    { id: 'deal_40', label: '40% Off or More (Mega Deals)' },
];

export const SORT_OPTIONS = [
    { id: 'featured', label: 'Featured / Recommended' },
    { id: 'price_asc', label: 'Price: Low to High' },
    { id: 'price_desc', label: 'Price: High to Low' },
    { id: 'discount_desc', label: 'Biggest Discount %' },
    { id: 'name_asc', label: 'Name: A to Z' },
];

/**
 * Extracts the discount percentage for a product
 */
export const getDiscountPercentage = (product) => {
    if (!product) return 0;
    if (typeof product.discount === 'number' && product.discount > 0) {
        return product.discount;
    }
    const price = Number(product.price) || 0;
    const orig = Number(product.originalPrice) || 0;
    if (orig > price && price > 0) {
        return Math.round(((orig - price) / orig) * 100);
    }
    return 0;
};

/**
 * Checks if a product supports 5G
 */
export const is5GProduct = (product) => {
    if (!product) return false;
    const textToScan = `${product.name || ''} ${product.highlights || ''} ${product.description || ''}`;
    return /\b5G\b/i.test(textToScan);
};

/**
 * Checks if a product matches a feature criteria
 */
export const matchesFeature = (product, featureId) => {
    if (!product || !featureId) return true;
    const firstVariant = (product.variants && product.variants[0]) || {};
    const vHl = firstVariant.highlights || {};
    const fullText = `${product.name || ''} ${product.highlights || ''} ${product.description || ''} ${vHl.processor || ''} ${vHl.rearCamera || ''} ${vHl.frontCamera || ''} ${vHl.battery || ''} ${vHl.display || ''}`.toLowerCase();

    switch (featureId) {
        case 'best_camera': {
            const cam = (vHl.rearCamera || '').toLowerCase();
            return /200\s*mp|108\s*mp|64\s*mp/i.test(cam) || /200mp|108mp/i.test(fullText);
        }
        case 'big_battery': {
            const bat = (vHl.battery || '').toLowerCase();
            const match = bat.match(/(\d{4,5})\s*mah/);
            if (match) {
                return parseInt(match[1]) >= 6000;
            }
            return /6000\s*mah|7000\s*mah|8000\s*mah/i.test(fullText);
        }
        case 'gaming': {
            const proc = (vHl.processor || '').toLowerCase();
            const hasGoodProc = proc.includes('snapdragon') || proc.includes('dimensity 8') || proc.includes('dimensity 9') || proc.includes('bionic');
            const ram = (vHl.storage || firstVariant.name || '').toLowerCase();
            const hasHighRam = /12\s*gb|16\s*gb/i.test(ram);
            return hasGoodProc || hasHighRam || /gaming/i.test(fullText);
        }
        case 'amoled': {
            const disp = (vHl.display || '').toLowerCase();
            return disp.includes('amoled') || disp.includes('oled') || disp.includes('curv') || /amoled|oled|curved/i.test(fullText);
        }
        default:
            return true;
    }
};

/**
 * Checks RAM size of a product
 */
export const matchesRam = (product, ramId) => {
    if (!product || !ramId) return true;
    const firstVariant = (product.variants && product.variants[0]) || {};
    const vHl = firstVariant.highlights || {};
    const storageText = `${vHl.storage || ''} ${firstVariant.name || ''} ${product.name || ''}`.toLowerCase();

    const ramMatch = storageText.match(/(\d{1,2})\s*gb\s*ram/);
    const ramVal = ramMatch ? parseInt(ramMatch[1]) : null;

    switch (ramId) {
        case '4gb':
            return ramVal === 4 || /\b4\s*gb\b/i.test(storageText);
        case '6gb':
            return ramVal === 6 || /\b6\s*gb\b/i.test(storageText);
        case '8gb':
            return ramVal === 8 || /\b8\s*gb\b/i.test(storageText);
        case '12gb_plus':
            return (ramVal !== null && ramVal >= 12) || /\b12\s*gb\b|\b16\s*gb\b/i.test(storageText);
        default:
            return true;
    }
};

/**
 * Filter an array of products based on comprehensive filter state
 */
export const filterProducts = (products, filters = {}) => {
    if (!Array.isArray(products)) return [];

    return products.filter((product) => {
        const price = Number(product.price) || 0;

        // 1. Budget / Price Range
        if (filters.budget) {
            const budgetConfig = BUDGET_RANGES.find(b => b.id === filters.budget);
            if (budgetConfig) {
                if (price < budgetConfig.min || price > budgetConfig.max) return false;
            }
        }
        if (typeof filters.minPrice === 'number' && price < filters.minPrice) return false;
        if (typeof filters.maxPrice === 'number' && price > filters.maxPrice) return false;

        // 2. Network (5G / 4G)
        if (filters.network) {
            const is5G = is5GProduct(product);
            if (filters.network === '5g' && !is5G) return false;
            if (filters.network === '4g' && is5G) return false;
        }

        // 3. Feature / Use-Case
        if (filters.feature && !matchesFeature(product, filters.feature)) {
            return false;
        }

        // 4. Series / Highlights
        if (filters.series) {
            const productHl = (product.highlights || '').toLowerCase();
            const targetSeries = filters.series.toLowerCase();
            if (!productHl.includes(targetSeries) && !(product.name || '').toLowerCase().includes(targetSeries)) {
                return false;
            }
        }

        // 5. Deals & Discounts
        if (filters.deal) {
            const discount = getDiscountPercentage(product);
            if (filters.deal === 'any_deal' && discount <= 0) return false;
            if (filters.deal === 'deal_20' && discount < 20) return false;
            if (filters.deal === 'deal_40' && discount < 40) return false;
        }

        // 6. RAM
        if (filters.ram && !matchesRam(product, filters.ram)) {
            return false;
        }

        // 7. Brand / Category (if specified)
        if (filters.brand) {
            const prodBrand = (product.brand || product.category || '').toLowerCase();
            if (prodBrand !== filters.brand.toLowerCase()) return false;
        }

        return true;
    });
};

/**
 * Sorts an array of products based on sort criteria
 */
export const sortProducts = (products, sortOption = 'featured') => {
    if (!Array.isArray(products)) return [];
    const copy = [...products];

    switch (sortOption) {
        case 'price_asc':
            return copy.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        case 'price_desc':
            return copy.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        case 'discount_desc':
            return copy.sort((a, b) => getDiscountPercentage(b) - getDiscountPercentage(a));
        case 'name_asc':
            return copy.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        case 'featured':
        default:
            // Default sort: if has createdAt sort desc, otherwise preserve
            return copy.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
    }
};

