import axios from "axios";
import { server } from "@/main";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ProductContext = createContext()

export const ProductProvider = ({children}) => {
     const [products, setProducts] = useState([]);
      const [newProd, setNewProd] = useState([]);
      const [loading, setLoading] = useState(true);
      const [page, setPage] = useState(1);
      const [totalPages, setTotalPages] = useState(1);
      const [search, setSearch] = useState("");
      const [category, setCategory] = useState("");
      const [price, setPrice] = useState("");
      const [categories, setCategories] = useState([]);
      const[product, setProduct] = useState([]);
      const[relatedProduct, setRelatedProduct] = useState([]);
      
      async function fetchProducts() {
      try {
        const { data } = await axios.get(`${server}/api/product/all?search=${search}&category=${category}&sortByPrice=${price}&page=${page}`);
        setProducts(data.products);
        setNewProd(data.newProduct);
        setCategories(data.categories)
        setTotalPages(data.totalPages);
      } catch (error) {
        console.log("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, page, price]);

  const fetchProduct = useCallback(async (id) => {
  setLoading(true);

  try {
    const { data } = await axios.get(`${server}/api/product/${id}`);

    setProduct(data.product);
    setRelatedProduct(data.relatedProducts);
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
}, []);

    return (
     <ProductContext.Provider value={{loading, products, newProd, 
      search, setSearch, categories, category, setCategory, totalPages,
      price, setPrice, page, setPage, fetchProduct, fetchProducts ,product, relatedProduct }}>
        {children}
    </ProductContext.Provider>
    )
};

export const ProductData = () => useContext(ProductContext);