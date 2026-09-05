import bufferGenerator from "../utils/bufferGenerator.js";
import cloudinary from "cloudinary";
import { Product } from "../models/Product.js";

export const createProduct = async (req, res) => {
    try {
      
      if(req.user.role !== "admin"){
        return res.status(403).json({ message: "You are not authorized to create a product" });
      }

      const { title, about, price, category, stock } = req.body;

      const files = req.files;  // for uploadedFiles in multer middleware, we can access the uploaded files using req.files. This will give us an array of file objects, each containing information about the uploaded file.

      if(!files || files.length === 0){
        return res.status(400).json({ message: "Please upload at least one image" });
      }

      const imageUploadPromises = files.map(async(file) => {
        const fileBuffer =  bufferGenerator(file);

        const result = await cloudinary.v2.uploader.upload(fileBuffer.content);

        return {
            id: result.public_id,
            url: result.secure_url,
        };
      });

      const uploadedImages = await Promise.all(imageUploadPromises);  //Wait until all the image uploads to Cloudinary are finished, then collect all their results into one array.

        const product = await Product.create({
           title,
           about,
           price,
           category,
           stock,
           images: uploadedImages,
        });

        res.status(201).json({ message: "Product created successfully", product });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//Gets products from MongoDB
//Searches by title
//Filters by category
//Sorts by price or newest
//Uses pagination
//Gets all available categories
//Gets the 4 newest products
//Calculates total pages


export const getAllProducts = async (req, res) => {
    try {
       
        const { search, category, page, sortByPrice } = req.query; //req.query contains values after the ? in the URL.

        const filter = {}; // filter object to hold the search and category filters. // if empty: Give me all products.
      // Search by product title : This creates a MongoDB regex search. 
      // Suppose: search = "macbook", then the filter will be: { title: { $regex: "macbook", $options: "i" } }, which means find all products whose title contains "macbook" (case-insensitive): without caring about uppercase/lowercase.
        if(search){ 
            filter.title = { 
                $regex: search,
                $options: "i",
            }
        }

        if(category){
            filter.category = category;
        }

        const limit = 8; // the number of products per page

        const skip = (page - 1) * limit;  // the number of products to skip based on the current page. For example, if page = 2, then skip = (2 - 1) * 8 = 8, which means skip the first 8 products and show the next 8 products.

        let sortOption = {createdAt: -1};  // Newest products first.

        if(sortByPrice){
            if(sortByPrice === "lowToHigh"){
              sortOption = { price: 1 };  
        } else if(sortByPrice === "highToLow"){
                sortOption = { price: -1 };
        }

       }

        const products = await Product.find(filter).sort(sortOption).limit(limit).skip(skip);

        const categories = await Product.distinct("category"); // Get all unique categories from the products collection.

        const newProduct = await Product.find().sort("-createdAt").limit(4); //This gets the 4 newest products.

        const countProduct = await Product.countDocuments(filter); //This counts the total number of products that match the filter. This is used to calculate the total number of pages.

        const totalPages = Math.ceil(countProduct / limit);

        res.status(200).json({ products, categories, newProduct, totalPages });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSingleProduct = async (req, res) => {
    try { 
      
        const product = await Product.findById(req.params.id);

        const relatedProducts = await Product.find({
              category: product.category,
              _id: { $ne: product._id }
             }).limit(4); //This finds 4 products that are in the same category as the current product, but not the current product itself.      

        res.status(200).json({product, relatedProducts});

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
       if(req.user.role !== "admin"){
        return res.status(403).json({message: "you are not admin"})
       }
       
    const {title, about, category, price, stock} = req.body;

    const updatedFields = {}

    if(title) updatedFields.title = title
    if(about) updatedFields.about = about
    if(stock) updatedFields.stock = stock
    if(price) updatedFields.price = price
    if(category) updatedFields.category = category

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedFields, {returnDocument: "after", runValidators: true});

    if(!updatedProduct){
         return res.status(404).json({message: "product not found"})
    }

    res.status(200).json({message: "product updated successfully", updatedProduct })


    } catch(error){
         res.status(500).json({ message: error.message });
    }
};

export const updateProductImage = async (req, res) => {
    try {

      if(req.user.role !== "admin"){
        return res.status(403).json({message: "you are not admin"})
       }

      const {id} = req.params //product id
      const files = req.files

      if(!files || files.length === 0){
        return res.status(400).json({ message: "Please upload at least one image" });
      }

      const product = await Product.findById(id)

      if(!product){
        return res.status(404).json({message: "product not found"})
      }

      const oldImages = product.images || [];
      
      for(const img of oldImages) { //delete old Images
        if(img.id) {
            await cloudinary.v2.uploader.destroy(img.id);
        }
      }

      const imageUploadPromises = files.map(async(file) => {
        const fileBuffer =  bufferGenerator(file);

        const result = await cloudinary.v2.uploader.upload(fileBuffer.content);

        return {
            id: result.public_id,
            url: result.secure_url,
        };
      });

      const uploadedImages = await Promise.all(imageUploadPromises);

      product.images = uploadedImages;

      await product.save();

       res.status(200).json({ message:"image updated", product });
       
    } catch(error){
         res.status(500).json({ message: error.message });
    }
};