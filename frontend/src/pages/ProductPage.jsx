import Loading from "@/components/Loading";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CartData } from "@/context/CartContext";
import { ProductData } from "@/context/ProductContext"
import { UserData } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { server, categories } from "@/main";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Edit, Loader, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function ProductPage() {
  const { fetchProduct, product, relatedProduct, loading } = ProductData();
  const { id } = useParams();

  const { isAuth, user } = UserData();
  const { addToCart } = CartData();

  // Product

  useEffect(() => {
    fetchProduct(id);
  }, [id, fetchProduct]);

  const addToCartHandler = () => {
    addToCart(id);
  };

  // Update Product

  const [show, setShow] = useState(false);

  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");

  const [btnLoading, setBtnLoading] = useState(false);

  const updateHandler = () => {

      setShow(!show);

      setCategory(product.category);
      setTitle(product.title);
      setAbout(product.about);
      setStock(product.stock);
      setPrice(product.price);

  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      const { data } = await axios.put(
        `${server}/api/product/${id}`,
        {
          title,
          about,
          stock,
          price,
          category,
        },
        {
          headers: {
            token: Cookies.get("token"),
          },
        }
      );

      toast.success(data.message);

      setShow(false);
      setBtnLoading(false);
      fetchProduct(id);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );

      setBtnLoading(false);
    }
  };

  // Update Images

  const [updatedImages, setUpdatedImages] = useState(null);

  const handleSubmitImages = async (e) => {
    e.preventDefault();

    setBtnLoading(true);

    if (!updatedImages || updatedImages.length === 0) {
      toast.error("Please select images to update");
      setBtnLoading(false);
      return;
    }

    const formData = new FormData();

    for (let i = 0; i < updatedImages.length; i++) {
      formData.append("files", updatedImages[i]);
    }

    try {
      const { data } = await axios.post(
        `${server}/api/product/${id}`,
        formData,
        {
          headers: {
            token: Cookies.get("token"),
          },
        }
      );

      toast.success(data.message);

      setBtnLoading(false);
      setUpdatedImages(null);
      fetchProduct(id);
    } catch (error) {
      toast.error(error.response?.data?.message);
      setBtnLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="container mx-auto px-4 py-8">
          {product && (
            <>
              <div className="flex flex-col lg:flex-row items-start gap-14">
                
                <div className="w-full lg:w-1/2">
                  <Carousel>
                    <CarouselContent>
                      {product.images?.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="h-96 w-full flex items-center justify-center bg-gray-50 rounded-md">
                            <img
                              src={image.url}
                              alt={`${product.title} ${index + 1}`}
                              className="h-full w-full object-contain rounded-md"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>

                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>

                  {user && user.role === "admin" && (
                    <form onSubmit={handleSubmitImages} className="flex flex-col gap-4 mt-4">
                      <div>
                        <Label>Upload New Images:</Label>
                        <Input
                          type="file"
                          name="files"
                          id="files"
                          multiple
                          accept="image/*"
                          onChange={(e) =>
                            setUpdatedImages(e.target.files)
                          }
                          className="block w-full mt-1 text-sm"
                        />
                      </div>

                      <Button type="submit" disabled={btnLoading} className="mt-2">
                        {btnLoading ? <Loader /> : "Update Image"}
                      </Button>
                    </form>
                  )}
                </div>

                <div className="w-full lg:w-1/2 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold">
                        {product.title}
                      </h1>

                      <p className="text-lg mt-3 text-gray-700 dark:text-gray-300">
                        {product.about}
                      </p>

                      <p className="text-xl font-semibold mt-4">
                        EGP {product.price}
                      </p>

                      {isAuth ? (
                        <>
                          {product.stock <= 0 ? (
                            <p className="text-red-600 text-2xl mt-4">
                              Out of Stock
                            </p>
                          ) : (
                            <Button onClick={addToCartHandler} className="mt-4">
                              Add To Cart
                            </Button>
                          )}
                        </>
                      ) : (
                        <p className="text-blue-500 mt-4">
                          Please Login to add something in cart
                        </p>
                      )}
                    </div>
                    
                       {/* ADMIN - EDIT BUTTON */}
                    
                    {user && user.role === "admin" && (
                      <Button
                        onClick={updateHandler}
                        variant="outline"
                        className="shrink-0"
                      >
                        {show ? <X size={18} /> : <Edit size={18} />}
                      </Button>
                    )}
                  </div>

                  {show && (
                    <form
                      onSubmit={submitHandler}
                      className="space-y-4 mt-6 p-5 border rounded-lg bg-gray-50 dark:bg-gray-900">

                      <h2 className="text-lg font-semibold">
                        Update Product
                      </h2>

                      <div>
                        <Label className="mb-2"> Title </Label>
                        <Input
                          placeholder="Product Title"
                          value={title}
                          onChange={(e) =>
                            setTitle(e.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <Label className="mb-2"> About </Label>
                        <Input
                          placeholder="About Product"
                          value={about}
                          onChange={(e) =>
                            setAbout(e.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <Label className="mb-2"> Category</Label>

                        <select
                          value={category}
                          onChange={(e) =>
                            setCategory(e.target.value)
                          }
                          required
                          className="w-full p-2 border rounded-md dark:bg-gray-900 dark:text-white"
                        >
                          {categories.map((e) => (
                            <option key={e} value={e}>
                              {e}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="mb-2"> Price </Label>
                        <Input
                          placeholder="Product Price"
                          type="number"
                          value={price}
                          onChange={(e) =>
                            setPrice(e.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <Label className="mb-2">Stock</Label>
                        <Input
                          placeholder="Product Stock"
                          type="number"
                          value={stock}
                          onChange={(e) =>
                            setStock(e.target.value)
                          }
                          required
                        />
                      </div>

                      <Button type="submit" disabled={btnLoading} className="w-full">
                        {btnLoading ? (
                          <Loader className="animate-spin" />
                        ) : (
                          "Update Product"
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              {relatedProduct?.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-xl font-bold">
                    Related Products
                  </h2>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {relatedProduct.map((e) => (
                      <ProductCard
                        key={e._id}
                        product={e}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductPage;
