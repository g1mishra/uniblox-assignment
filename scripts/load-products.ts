import { supabase } from "../lib/supabase";

const products = [
  {
    name: "Product 1",
    price: 100,
  },
  {
    name: "Product 2",
    price: 200,
  },
  {
    name: "Product 3",
    price: 300,
  },
];

async function loadProducts() {
  const { data, error } = await supabase.from("products").insert(products).select();

  if (error) {
    console.error("Error loading products:", error);
    return;
  }

  console.log("Products loaded successfully:", data);
}
loadProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
