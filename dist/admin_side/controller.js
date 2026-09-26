"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_product_by_id = exports.get_products = exports.product_items = exports.get_category_items = exports.store_category_items = void 0;
const category_1 = __importDefault(require("../mongo_db/Schemas/category"));
const product_1 = __importDefault(require("../mongo_db/Schemas/product"));
const store_category_items = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryData = req.body;
        const category = new category_1.default({
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
            image: categoryData.image,
        });
        const data = yield category.save();
        res.status(201).json({
            message: "Category saved",
            data,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to save category",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.store_category_items = store_category_items;
const get_category_items = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_1.default.find().sort({ name: 1 });
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch categories",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.get_category_items = get_category_items;
const product_items = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = req.body;
    // let product_data = req.body;
    // let _data = req.body;
    // let add_products = new Product({
    // title: product_data.title,
    // slug: product_data.slug,
    // description: product_data.description,
    // category: product_data.category,
    // brand: product_data.brand,
    // images: product_data.images,
    // minPrice: product_data.mainPrice,
    // maxPrice: product_data.maxPrice,
    // variants: product_data.variants,
    // });
    // console.log(add_products);
    // let data = await add_products.save();
    console.log(data);
    if (data) {
        const categoryId = "6ab6bfab430403a9f63fd687";
        const productsData = [
            {
                _id: "6ab6e101430403a9f63f0001",
                title: "Classic Cotton Crewneck T-Shirt",
                slug: "classic-cotton-crewneck-tshirt-6ab6bfab",
                description: "Breathable 100% organic cotton t-shirt designed for everyday comfort.",
                category: categoryId,
                brand: "UrbanWear",
                images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"],
                minPrice: 15,
                maxPrice: 22,
                isActive: true,
                variants: [
                    { _id: "6ab6e101430403a9f63f0101", sku: "TSH-S-WHT", size: "S", colour: "White", price: 15, stock: 40, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500" },
                    { _id: "6ab6e101430403a9f63f0102", sku: "TSH-M-WHT", size: "M", colour: "White", price: 15, stock: 35, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500" },
                    { _id: "6ab6e101430403a9f63f0103", sku: "TSH-L-BLK", size: "L", colour: "Black", price: 18, stock: 25, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500" },
                    { _id: "6ab6e101430403a9f63f0104", sku: "TSH-XL-BLK", size: "XL", colour: "Black", price: 22, stock: 15, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500" }
                ]
            },
            {
                _id: "6ab6e101430403a9f63f0002",
                title: "Slim-Fit Stretch Denim Jeans",
                slug: "slim-fit-stretch-denim-jeans-6ab6bfab",
                description: "Modern slim-fit jeans crafted with durable stretch cotton denim.",
                category: categoryId,
                brand: "DenimCo",
                images: ["https://images.unsplash.com/photo-1542272604-780c36856d66?w=500"],
                minPrice: 45,
                maxPrice: 65,
                isActive: true,
                variants: [
                    { _id: "6ab6e101430403a9f63f0105", sku: "JNS-30-BLU", size: "30x32", colour: "Blue", price: 45, stock: 20, image: "https://images.unsplash.com/photo-1542272604-780c36856d66?w=500" },
                    { _id: "6ab6e101430403a9f63f0106", sku: "JNS-32-BLU", size: "32x32", colour: "Blue", price: 45, stock: 30, image: "https://images.unsplash.com/photo-1542272604-780c36856d66?w=500" },
                    { _id: "6ab6e101430403a9f63f0107", sku: "JNS-34-BLK", size: "34x32", colour: "Black", price: 55, stock: 18, image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500" },
                    { _id: "6ab6e101430403a9f63f0108", sku: "JNS-36-BLK", size: "36x32", colour: "Black", price: 65, stock: 10, image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500" }
                ]
            },
            {
                _id: "6ab6e101430403a9f63f0003",
                title: "Lightweight Waterproof Windbreaker",
                slug: "lightweight-waterproof-windbreaker-6ab6bfab",
                description: "All-weather hooded windbreaker jacket with zip closure and deep pockets.",
                category: categoryId,
                brand: "OutdoorsPro",
                images: ["https://images.unsplash.com/photo-1544441893-675973e31985?w=500"],
                minPrice: 50,
                maxPrice: 80,
                isActive: true,
                variants: [
                    { _id: "6ab6e101430403a9f63f0109", sku: "JKT-M-RED", size: "M", colour: "Red", price: 50, stock: 15, image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=500" },
                    { _id: "6ab6e101430403a9f63f0110", sku: "JKT-L-RED", size: "L", colour: "Red", price: 55, stock: 22, image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=500" },
                    { _id: "6ab6e101430403a9f63f0111", sku: "JKT-L-BLK", size: "L", colour: "Black", price: 65, stock: 20, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500" },
                    { _id: "6ab6e101430403a9f63f0112", sku: "JKT-XL-BLK", size: "XL", colour: "Black", price: 80, stock: 12, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500" }
                ]
            },
            {
                _id: "6ab6e101430403a9f63f0004",
                title: "Fleece Pullover Hoodie",
                slug: "fleece-pullover-hoodie-6ab6bfab",
                description: "Cozy fleece-lined pullover hoodie with adjustable drawstring hood.",
                category: categoryId,
                brand: "UrbanWear",
                images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500"],
                minPrice: 35,
                maxPrice: 50,
                isActive: true,
                variants: [
                    { _id: "6ab6e101430403a9f63f0113", sku: "HD-S-GRY", size: "S", colour: "Grey", price: 35, stock: 25, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500" },
                    { _id: "6ab6e101430403a9f63f0114", sku: "HD-M-GRY", size: "M", colour: "Grey", price: 38, stock: 30, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500" },
                    { _id: "6ab6e101430403a9f63f0115", sku: "HD-L-NVY", size: "L", colour: "Navy", price: 45, stock: 18, image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500" },
                    { _id: "6ab6e101430403a9f63f0116", sku: "HD-XL-NVY", size: "XL", colour: "Navy", price: 50, stock: 10, image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500" }
                ]
            },
            {
                _id: "6ab6e101430403a9f63f0005",
                title: "Casual Button-Down Linen Shirt",
                slug: "casual-button-down-linen-shirt-6ab6bfab",
                description: "Breathable pure linen shirt for warm weather and smart casual styles.",
                category: categoryId,
                brand: "StyleStudio",
                images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500"],
                minPrice: 30,
                maxPrice: 48,
                isActive: true,
                variants: [
                    { _id: "6ab6e101430403a9f63f0117", sku: "LNN-S-WHT", size: "S", colour: "White", price: 30, stock: 20, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500" },
                    { _id: "6ab6e101430403a9f63f0118", sku: "LNN-M-WHT", size: "M", colour: "White", price: 35, stock: 25, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500" },
                    { _id: "6ab6e101430403a9f63f0119", sku: "LNN-L-BLU", size: "L", colour: "Light Blue", price: 42, stock: 15, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500" },
                    { _id: "6ab6e101430403a9f63f0120", sku: "LNN-XL-BLU", size: "XL", colour: "Light Blue", price: 48, stock: 8, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500" }
                ]
            },
            {
                _id: "6ab6e101430403a9f63f0006",
                title: "Athletic Running Shorts",
                slug: "athletic-running-shorts-6ab6bfab",
                description: "Quick-drying moisture-wicking shorts with an elastic drawstring waist.",
                category: categoryId,
                brand: "FitGear",
                images: ["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500"],
                minPrice: 18,
                maxPrice: 28,
                isActive: true,
                variants: [
                    { _id: "6ab6e101430403a9f63f0121", sku: "SRT-S-BLK", size: "S", colour: "Black", price: 18, stock: 30, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500" },
                    { _id: "6ab6e101430403a9f63f0122", sku: "SRT-M-BLK", size: "M", colour: "Black", price: 20, stock: 35, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500" },
                    { _id: "6ab6e101430403a9f63f0123", sku: "SRT-L-GRY", size: "L", colour: "Grey", price: 24, stock: 20, image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500" },
                    { _id: "6ab6e101430403a9f63f0124", sku: "SRT-XL-GRY", size: "XL", colour: "Grey", price: 28, stock: 12, image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500" }
                ]
            },
            {
                _id: "6ab6e101430403a9f63f0007",
                title: "Classic Leather Bomber Jacket",
                slug: "classic-leather-bomber-jacket-6ab6bfab",
                description: "Genuine leather jacket featuring ribbed cuffs, collar, and side zip pockets.",
                category: categoryId,
                brand: "StyleStudio",
                images: ["https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=500"],
                minPrice: 120,
                maxPrice: 180,
                isActive: true,
                variants: [
                    { _id: "6ab6e101430403a9f63f0125", sku: "LTH-M-BRN", size: "M", colour: "Brown", price: 120, stock: 10, image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=500" },
                    { _id: "6ab6e101430403a9f63f0126", sku: "LTH-L-BRN", size: "L", colour: "Brown", price: 140, stock: 8, image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=500" },
                    { _id: "6ab6e101430403a9f63f0127", sku: "LTH-L-BLK", size: "L", colour: "Black", price: 160, stock: 7, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500" },
                    { _id: "6ab6e101430403a9f63f0128", sku: "LTH-XL-BLK", size: "XL", colour: "Black", price: 180, stock: 5, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500" }
                ]
            },
            {
                _id: "6ab6e101430403a9f63f0008",
                title: "Slim Stretch Chino Pants",
                slug: "slim-stretch-chino-pants-6ab6bfab",
                description: "Versatile stretch chinos tailored for work, weekend outings, and daily wear.",
                category: categoryId,
                brand: "DenimCo",
                images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500"],
                minPrice: 38,
                maxPrice: 52,
                isActive: true,
                variants: [
                    { _id: "6ab6e101430403a9f63f0129", sku: "CHN-30-KHK", size: "30x30", colour: "Khaki", price: 38, stock: 25, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500" },
                    { _id: "6ab6e101430403a9f63f0130", sku: "CHN-32-KHK", size: "32x32", colour: "Khaki", price: 42, stock: 30, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500" },
                    { _id: "6ab6e101430403a9f63f0131", sku: "CHN-34-NVY", size: "34x32", colour: "Navy", price: 48, stock: 15, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500" },
                    { _id: "6ab6e101430403a9f63f0132", sku: "CHN-36-NVY", size: "36x32", colour: "Navy", price: 52, stock: 10, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500" }
                ]
            },
            {
                _id: "6ab6e101430403a9f63f0009",
                title: "Thermal Long Sleeve Henley",
                slug: "thermal-long-sleeve-henley-6ab6bfab",
                description: "Soft waffle-weave thermal top with a classic three-button placket.",
                category: categoryId,
                brand: "UrbanWear",
                images: ["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500"],
                minPrice: 25,
                maxPrice: 35,
                isActive: true,
                variants: [
                    { _id: "6ab6e101430403a9f63f0133", sku: "HNL-S-OLV", size: "S", colour: "Olive", price: 25, stock: 20, image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500" },
                    { _id: "6ab6e101430403a9f63f0134", sku: "HNL-M-OLV", size: "M", colour: "Olive", price: 28, stock: 22, image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500" },
                    { _id: "6ab6e101430403a9f63f0135", sku: "HNL-L-GRY", size: "L", colour: "Grey", price: 32, stock: 18, image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500" },
                    { _id: "6ab6e101430403a9f63f0136", sku: "HNL-XL-GRY", size: "XL", colour: "Grey", price: 35, stock: 10, image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500" }
                ]
            },
            {
                _id: "6ab6e101430403a9f63f0010",
                title: "Performance Sweatpants",
                slug: "performance-sweatpants-6ab6bfab",
                description: "Tapered workout joggers with zippered pockets and adjustable drawstring.",
                category: categoryId,
                brand: "FitGear",
                images: ["https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500"],
                minPrice: 28,
                maxPrice: 40,
                isActive: true,
                variants: [
                    { _id: "6ab6e101430403a9f63f0137", sku: "SWT-S-CHR", size: "S", colour: "Charcoal", price: 28, stock: 30, image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500" },
                    { _id: "6ab6e101430403a9f63f0138", sku: "SWT-M-CHR", size: "M", colour: "Charcoal", price: 32, stock: 25, image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500" },
                    { _id: "6ab6e101430403a9f63f0139", sku: "SWT-L-BLK", size: "L", colour: "Black", price: 36, stock: 20, image: "https://images.unsplash.com/photo-1506629082925-23914529188d?w=500" },
                    { _id: "6ab6e101430403a9f63f0140", sku: "SWT-XL-BLK", size: "XL", colour: "Black", price: 40, stock: 12, image: "https://images.unsplash.com/photo-1506629082925-23914529188d?w=500" }
                ]
            }
        ];
        yield product_1.default.insertMany(productsData);
    }
    res.status(201).json({
        message: "Product received",
        data: req.body,
    });
});
exports.product_items = product_items;
const get_products = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryParam = String(req.query.category || "").trim();
        const searchParam = String(req.query.search || "").trim();
        const sizeParam = String(req.query.size || "").trim();
        const minPriceParam = String(req.query.minPrice || "").trim();
        const maxPriceParam = String(req.query.maxPrice || "").trim();
        const priceParam = String(req.query.price || "").trim();
        const filter = {};
        if (categoryParam) {
            const escaped = categoryParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const category = yield category_1.default.findOne({
                $or: [
                    { slug: categoryParam.toLowerCase() },
                    { name: new RegExp(`^${escaped}$`, "i") },
                    ...(categoryParam.match(/^[0-9a-fA-F]{24}$/)
                        ? [{ _id: categoryParam }]
                        : []),
                ],
            });
            if (!category) {
                return res.status(200).json([]);
            }
            filter.category = category._id;
        }
        if (searchParam) {
            const escapedSearch = searchParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const searchRegex = new RegExp(escapedSearch, "i");
            filter.$or = [
                { title: searchRegex },
                { brand: searchRegex },
                { description: searchRegex },
                { "variants.sku": searchRegex },
            ];
        }
        if (priceParam !== "") {
            const price = Number(priceParam);
            if (Number.isFinite(price)) {
                filter.minPrice = { $lte: price };
                filter.maxPrice = { $gte: price };
            }
        }
        else {
            if (minPriceParam !== "") {
                const minPrice = Number(minPriceParam);
                if (Number.isFinite(minPrice)) {
                    filter.minPrice = { $gte: minPrice };
                }
            }
            if (maxPriceParam !== "") {
                const maxPrice = Number(maxPriceParam);
                if (Number.isFinite(maxPrice)) {
                    filter.maxPrice = { $lte: maxPrice };
                }
            }
        }
        if (sizeParam) {
            const escapedSize = sizeParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter["variants.size"] = new RegExp(`^${escapedSize}$`, "i");
        }
        const data = yield product_1.default.find(filter).populate("category", "name slug");
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch products",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.get_products = get_products;
const get_product_by_id = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }
        const product = yield product_1.default.findById(id).populate("category", "name slug");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch product",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.get_product_by_id = get_product_by_id;
