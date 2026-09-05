import { Link, useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const ProductCard = ({ product, latest }) => {
    const navigate = useNavigate();
  return (
    <div className="w-full">
      {product && (
        <div className="overflow-hidden shadow-md rounded-lg border border-gray-200"> 
        <Link to={`/product/${product._id}`}>
          <div className="relative h-52 w-full bg-gray-100 rounded-md flex justify-center items-center p-2 overflow-hidden">
            <img
              src={product.images[0].url}
              alt={product.title}
              className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-110"
            />

            {latest === "yes" && (
             <Badge className="absolute top-1 left-2 bg-green-500 text-white hover:bg-gray-400">
              New
            </Badge>
            )}
          </div>
        </Link>
        <div className="p-4">
            <h3 className="text-lg font-semibold truncate">
                {product.title.slice(0,30)}
            </h3>
            <p className="text-sm mt-1 truncate">
                {product.about.slice(0,30)}
            </p>
             <p className="text-sm mt-1 truncate">
                EGP {product.price}
             </p>
              <div className="flex items-center justify-center mt-4">
                <Button onClick={() => navigate(`/product/${product._id}`)}>
                    View Product
                </Button>
             </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;