export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image?: string;
  isNew?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
        {product.isNew && (
          <div className="absolute top-3 left-3 z-10 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-wider">
            Nuevo
          </div>
        )}
        <div className="w-full h-full flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-500">
          <span className="material-icons text-6xl text-gray-300 dark:text-gray-700">settings</span>
        </div>
        
        {/* Quick Actions Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent flex justify-center space-x-2">
          <button className="bg-white hover:bg-primary hover:text-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors">
            <span className="material-icons text-xl">favorite_border</span>
          </button>
          <button className="bg-white hover:bg-primary hover:text-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors">
            <span className="material-icons text-xl">visibility</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col items-center text-center">
        <span className="imbra-label mb-1">
          {product.category}
        </span>
        <h3 className="imbra-h3 !text-sm mb-2 h-10 line-clamp-2 leading-snug group-hover:text-primary transition-colors uppercase italic">
          {product.name}
        </h3>
        <div className="flex items-center space-x-2 mb-4">
          <span className="imbra-price text-lg">
            ${product.price.toLocaleString('es-CO')}
          </span>
          {/* Optional: <span className="text-gray-400 line-through text-xs">$300.000</span> */}
        </div>
        
        <button className="w-full bg-secondary hover:bg-primary text-white imbra-label !text-white py-2.5 flex items-center justify-center transition-all">
          <span className="material-icons text-sm mr-2">shopping_cart</span>
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}
